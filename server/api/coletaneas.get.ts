import { getQuery } from 'h3'
import { songCollectionsCollection } from '../database/collections'
import { apiError, apiSuccess } from '../utils/api-response'
import { getAuthenticatedChurch } from '../utils/auth'
import { normalizeText } from '../utils/normalization'
import { searchPattern } from '../utils/mongo-validation'

export default defineEventHandler(async (event) => {
  try {
    await getAuthenticatedChurch(event)
    const query = getQuery(event)
    const search = typeof query.search === 'string' ? query.search.trim() : ''
    searchPattern(search)
    const limit = Math.min(Math.max(Number(query.limit) || 10, 1), 50)

    if (!search) {
      return apiSuccess({ songs: [] })
    }

    const normalizedSearch = normalizeText(search)
    const searchTokens = normalizedSearch.split(' ').filter(Boolean)
    const numberSearch = /^\d+$/.test(search) ? Number(search) : undefined
    const records = await (await songCollectionsCollection()).find({}).toArray()
    const ranked = records
      .map((record) => {
        const normalizedName = normalizeText(record.songName)
        const normalizedCollection = normalizeText(record.collectionName)
        const searchableText = `${normalizedName} ${normalizedCollection}`
        const score = scoreMatch({
          normalizedName,
          searchableText,
          normalizedSearch,
          searchTokens,
          numberSearch,
          songNumber: record.songNumber
        })

        return score > 0 ? { record, score } : null
      })
      .filter((item): item is { record: (typeof records)[number], score: number } => Boolean(item))
      .sort((left, right) => right.score - left.score || left.record.songNumber - right.record.songNumber || left.record.songName.localeCompare(right.record.songName, 'pt-BR'))
      .slice(0, limit)

    return apiSuccess({
      songs: ranked.map(({ record }) => ({
        id: record._id?.toHexString(),
        number: record.songNumber,
        isLoose: false,
        name: record.songName,
        collectionName: record.collectionName,
        source: 'coletanea' as const
      }))
    })
  } catch (error) {
    return apiError(event, error)
  }
})

function scoreMatch({
  normalizedName,
  searchableText,
  normalizedSearch,
  searchTokens,
  numberSearch,
  songNumber
}: {
  normalizedName: string
  searchableText: string
  normalizedSearch: string
  searchTokens: string[]
  numberSearch: number | undefined
  songNumber: number
}) {
  let score = 0

  if (numberSearch !== undefined && songNumber === numberSearch) score += 1000
  if (normalizedName === normalizedSearch) score += 500
  if (normalizedName.includes(normalizedSearch)) score += 250

  const allTokensMatch = searchTokens.every((token) => searchableText.includes(token))
  if (!allTokensMatch) return score

  score += 100
  for (const token of searchTokens) {
    if (normalizedName.startsWith(token)) score += 30
    else if (normalizedName.includes(token)) score += 15
    else score += 5
  }

  return score
}
