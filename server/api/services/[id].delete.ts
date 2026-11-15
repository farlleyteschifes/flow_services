import { servicesCollection } from '../../database/collections'
import { notFound } from '../../utils/api-error'
import { apiError, apiSuccess } from '../../utils/api-response'
import { getAuthenticatedChurch } from '../../utils/auth'
import { objectIdFromParam } from '../../utils/mongo-validation'

export default defineEventHandler(async (event) => {
  try {
    const { church } = await getAuthenticatedChurch(event)
    const id = objectIdFromParam(event.context.params?.id, 'culto')
    const result = await (await servicesCollection()).deleteOne({ _id: id, churchId: church._id! })

    if (result.deletedCount !== 1) {
      return apiError(event, notFound('Culto não encontrado.'))
    }

    return apiSuccess({ serviceId: id.toHexString(), deleted: true })
  } catch (error) {
    return apiError(event, error)
  }
})
