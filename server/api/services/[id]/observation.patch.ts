import { readBody } from 'h3'
import { servicesCollection } from '../../../database/collections'
import { apiError, apiSuccess } from '../../../utils/api-response'
import { getAuthenticatedChurch } from '../../../utils/auth'
import { notFound } from '../../../utils/api-error'
import { objectIdFromParam } from '../../../utils/mongo-validation'
import { serializeService, validateObservation } from '../../../utils/services'

type ObservationBody = { observation?: unknown }

export default defineEventHandler(async (event) => {
  try {
    const { church } = await getAuthenticatedChurch(event)
    const id = objectIdFromParam(event.context.params?.id, 'culto')
    const body = await readBody<ObservationBody>(event)
    const observation = validateObservation(body?.observation)
    const services = await servicesCollection()
    const result = await services.updateOne(
      { _id: id, churchId: church._id! },
      { $set: { observation, updatedAt: new Date() } }
    )

    if (!result.matchedCount) {
      return apiError(event, notFound('Culto não encontrado.'))
    }

    const service = await services.findOne({ _id: id, churchId: church._id! })
    return apiSuccess({ service: serializeService(service!) })
  } catch (error) {
    return apiError(event, error)
  }
})
