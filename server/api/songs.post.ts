import { MongoServerError } from 'mongodb'
import { readBody } from 'h3'
import { songsCollection } from '../database/collections'
import { conflict, badRequest } from '../utils/api-error'
import { getAuthenticatedChurch } from '../utils/auth'
import { apiError, apiSuccess } from '../utils/api-response'
import { requiredText } from '../utils/validation'

type SongBody = {
  number?: unknown
  name?: unknown
}

export default defineEventHandler(async (event) => {
  try {
    await getAuthenticatedChurch(event)
    const body = await readBody<SongBody>(event)
    const number = parseSongNumber(body?.number)
    const name = requiredText(body?.name, 'name', 'O nome do louvor', 160)
    const collection = await songsCollection()
    const existing = await collection.findOne({ number })

    if (existing) {
      return apiSuccess({
        song: serializeSong(existing),
        reused: true
      })
    }

    const now = new Date()

    try {
      const result = await collection.insertOne({ number, name, createdAt: now, updatedAt: now })

      return apiSuccess({
        song: {
          id: result.insertedId.toHexString(),
          number,
          name,
          createdAt: now,
          updatedAt: now
        },
        reused: false
      })
    } catch (error) {
      if (error instanceof MongoServerError && error.code === 11000) {
        const concurrentSong = await collection.findOne({ number })

        if (concurrentSong) {
          return apiSuccess({ song: serializeSong(concurrentSong), reused: true })
        }

        throw conflict('Não foi possível cadastrar o louvor.')
      }

      throw error
    }
  } catch (error) {
    return apiError(event, error)
  }
})

function parseSongNumber(value: unknown) {
  const number = typeof value === 'number' ? value : Number(value)

  if (!Number.isInteger(number) || number < 0) {
    throw badRequest('O número do louvor deve ser um número inteiro não negativo.', {
      number: ['O número do louvor deve ser um número inteiro não negativo.']
    })
  }

  return number
}

function serializeSong(song: { _id?: { toHexString(): string }, number: number, name: string, createdAt: Date, updatedAt: Date }) {
  return {
    id: song._id?.toHexString(),
    number: song.number,
    name: song.name,
    createdAt: song.createdAt,
    updatedAt: song.updatedAt
  }
}
