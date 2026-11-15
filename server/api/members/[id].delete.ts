import { membersCollection } from '../../database/collections'
import { notFound } from '../../utils/api-error'
import { apiError, apiSuccess } from '../../utils/api-response'
import { getAuthenticatedChurch } from '../../utils/auth'
import { objectIdFromParam } from '../../utils/mongo-validation'

export default defineEventHandler(async (event) => {
  try {
    const { church } = await getAuthenticatedChurch(event)
    const id = objectIdFromParam(event.context.params?.id, 'membro')
    const now = new Date()
    const result = await (await membersCollection()).updateOne(
      { _id: id, churchId: church._id, active: true },
      { $set: { active: false, deactivatedAt: now, updatedAt: now } }
    )

    if (result.matchedCount !== 1) {
      return apiError(event, notFound('Membro não encontrado.'))
    }

    return apiSuccess({ memberId: id.toHexString(), active: false })
  } catch (error) {
    return apiError(event, error)
  }
})
