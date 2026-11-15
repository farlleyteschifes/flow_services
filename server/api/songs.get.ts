import { getQuery } from 'h3'
import { songsCollection } from '../database/collections'
import { apiError, apiSuccess } from '../utils/api-response'
import { getAuthenticatedChurch } from '../utils/auth'
import { searchPattern } from '../utils/mongo-validation'

export default defineEventHandler(async (event) => {
  try {
    await getAuthenticatedChurch(event)
    const query = getQuery(event)
    const search = typeof query.search === 'string' ? query.search : undefined
    const pattern = searchPattern(search)
    const limit = Math.min(Math.max(Number(query.limit) || 50, 1), 100)
    const filter = pattern
      ? { $or: [{ name: pattern }, { number: Number.isNaN(Number(search)) ? -1 : Number(search) }] }
      : {}
    const songs = await (await songsCollection())
      .find(filter)
      .sort({ number: 1 })
      .limit(limit)
      .toArray()

    return apiSuccess({
      songs: songs.map((song) => ({
        id: song._id?.toHexString(),
        number: song.number,
        isLoose: song.isLoose,
        name: song.name,
        createdAt: song.createdAt,
        updatedAt: song.updatedAt
      }))
    })
  } catch (error) {
    return apiError(event, error)
  }
})
