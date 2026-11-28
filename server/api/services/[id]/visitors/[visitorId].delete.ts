import { servicesCollection } from '../../../../database/collections'
import { notFound } from '../../../../utils/api-error'
import { apiError, apiSuccess } from '../../../../utils/api-response'
import { getAuthenticatedChurch } from '../../../../utils/auth'
import { objectIdFromParam } from '../../../../utils/mongo-validation'
import { serializeService } from '../../../../utils/services'

export default defineEventHandler(async (event) => {
  try {
    const { church } = await getAuthenticatedChurch(event)
    const serviceId = objectIdFromParam(event.context.params?.id, 'culto')
    const visitorId = objectIdFromParam(event.context.params?.visitorId, 'visitante')
    const services = await servicesCollection()
    const result = await services.updateOne(
      { _id: serviceId, churchId: church._id!, 'visitors.visitorId': visitorId },
      { $pull: { visitors: { visitorId } }, $set: { updatedAt: new Date() } }
    )
    const service = await services.findOne({ _id: serviceId, churchId: church._id! })

    if (!service) return apiError(event, notFound('Culto não encontrado.'))

    return apiSuccess({ service: serializeService(service), removed: result.modifiedCount === 1 })
  } catch (error) {
    return apiError(event, error)
  }
})
