import { servicesCollection } from '../../../../../database/collections'
import { notFound } from '../../../../../utils/api-error'
import { apiError, apiSuccess } from '../../../../../utils/api-response'
import { getAuthenticatedChurch } from '../../../../../utils/auth'
import { objectId, validateParticipantRole } from '../../../../../utils/service-content'
import { serializeService } from '../../../../../utils/services'

export default defineEventHandler(async (event) => {
  try {
    const { church } = await getAuthenticatedChurch(event)
    const serviceId = objectId(event.context.params?.id, 'culto')
    const role = validateParticipantRole(event.context.params?.role)
    const memberId = objectId(event.context.params?.memberId, 'membro')
    const services = await servicesCollection()
    const result = await services.updateOne(
      {
        _id: serviceId,
        churchId: church._id!,
        [`participants.${role}.memberId`]: memberId
      },
      {
        $pull: { [`participants.${role}`]: { memberId } },
        $set: { updatedAt: new Date() }
      }
    )
    const service = await services.findOne({ _id: serviceId, churchId: church._id! })

    if (!service) {
      return apiError(event, notFound('Culto não encontrado.'))
    }

    return apiSuccess({
      service: serializeService(service),
      role,
      removed: result.modifiedCount === 1
    })
  } catch (error) {
    return apiError(event, error)
  }
})
