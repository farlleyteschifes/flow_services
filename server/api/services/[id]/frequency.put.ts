import { readBody } from 'h3'
import { servicesCollection } from '../../../database/collections'
import { notFound } from '../../../utils/api-error'
import { apiError, apiSuccess } from '../../../utils/api-response'
import { getAuthenticatedChurch } from '../../../utils/auth'
import { objectIdFromParam } from '../../../utils/mongo-validation'
import {
  serializeService,
  validateFrequencyKey,
  validateFrequencyValue
} from '../../../utils/services'

type FrequencyValueBody = {
  category?: unknown
  value?: unknown
}

export default defineEventHandler(async (event) => {
  try {
    const { church } = await getAuthenticatedChurch(event)
    const id = objectIdFromParam(event.context.params?.id, 'culto')
    const body = await readBody<FrequencyValueBody>(event)
    const category = validateFrequencyKey(body?.category)
    const value = validateFrequencyValue(body?.value)
    const services = await servicesCollection()
    const result = await services.updateOne(
      { _id: id, churchId: church._id! },
      {
        $set: {
          [`frequency.${category}`]: value,
          updatedAt: new Date()
        }
      }
    )

    if (result.matchedCount !== 1) {
      return apiError(event, notFound('Culto não encontrado.'))
    }

    const service = await services.findOne({ _id: id, churchId: church._id! })

    if (!service) {
      return apiError(event, notFound('Culto não encontrado.'))
    }

    return apiSuccess({ service: serializeService(service), changed: true })
  } catch (error) {
    return apiError(event, error)
  }
})
