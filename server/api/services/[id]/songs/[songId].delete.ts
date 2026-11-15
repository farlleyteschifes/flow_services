import { servicesCollection } from '../../../../database/collections'
import { notFound } from '../../../../utils/api-error'
import { apiError, apiSuccess } from '../../../../utils/api-response'
import { getAuthenticatedChurch } from '../../../../utils/auth'
import { objectId } from '../../../../utils/service-content'
import { serializeService } from '../../../../utils/services'

export default defineEventHandler(async (event) => {
  try {
    const { church } = await getAuthenticatedChurch(event)
    const serviceId = objectId(event.context.params?.id, 'culto')
    const songId = objectId(event.context.params?.songId, 'louvor')
    const services = await servicesCollection()
    const result = await services.updateOne(
      { _id: serviceId, churchId: church._id!, 'songs.songId': songId },
      { $pull: { songs: { songId } }, $set: { updatedAt: new Date() } }
    )
    const service = await services.findOne({ _id: serviceId, churchId: church._id! })

    if (!service) {
      return apiError(event, notFound('Culto não encontrado.'))
    }

    return apiSuccess({
      service: serializeService(service),
      removed: result.modifiedCount === 1
    })
  } catch (error) {
    return apiError(event, error)
  }
})
