import { getQuery } from 'h3'
import { membersCollection } from '../database/collections'
import { apiError, apiSuccess } from '../utils/api-response'
import { getAuthenticatedChurch } from '../utils/auth'
import { searchPattern } from '../utils/mongo-validation'

export default defineEventHandler(async (event) => {
  try {
    const { church } = await getAuthenticatedChurch(event)
    const query = getQuery(event)
    const pattern = searchPattern(typeof query.search === 'string' ? query.search : undefined)
    const includeInactive = query.includeInactive === 'true'
    const limit = Math.min(Math.max(Number(query.limit) || 50, 1), 100)
    const filter = {
      churchId: church._id!,
      ...(includeInactive ? {} : { active: true }),
      ...(pattern ? { name: pattern } : {})
    }
    const members = await (await membersCollection())
      .find(filter)
      .sort({ normalizedName: 1 })
      .limit(limit)
      .toArray()

    return apiSuccess({
      members: members.map((member) => ({
        id: member._id?.toHexString(),
        name: member.name,
        active: member.active,
        createdAt: member.createdAt,
        updatedAt: member.updatedAt
      }))
    })
  } catch (error) {
    return apiError(event, error)
  }
})
