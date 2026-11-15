import { readBody } from 'h3'
import { songsCollection } from '../../database/collections'
import { notFound } from '../../utils/api-error'
import { apiError, apiSuccess } from '../../utils/api-response'
import { getAuthenticatedChurch } from '../../utils/auth'
import { objectIdFromParam } from '../../utils/mongo-validation'
import { normalizeText } from '../../utils/normalization'
import { requiredText } from '../../utils/validation'

type SongUpdateBody = {
  name?: unknown
}

export default defineEventHandler(async (event) => {
  try {
    await getAuthenticatedChurch(event)
    const id = objectIdFromParam(event.context.params?.id, 'louvor')
    const body = await readBody<SongUpdateBody>(event)
    const name = requiredText(body?.name, 'name', 'O nome do louvor', 160)
    const now = new Date()
    const collection = await songsCollection()
    const result = await collection.findOneAndUpdate(
      { _id: id },
      { $set: { name, normalizedName: normalizeText(name), updatedAt: now } },
      { returnDocument: 'after' }
    )

    if (!result) {
      return apiError(event, notFound('Louvor não encontrado.'))
    }

    return apiSuccess({ song: serializeSong(result) })
  } catch (error) {
    return apiError(event, error)
  }
})

function serializeSong(song: { _id?: { toHexString(): string }, number: number | null, isLoose: boolean, name: string, createdAt: Date, updatedAt: Date }) {
  return {
    id: song._id?.toHexString(),
    number: song.number,
    isLoose: song.isLoose,
    name: song.name,
    createdAt: song.createdAt,
    updatedAt: song.updatedAt
  }
}
