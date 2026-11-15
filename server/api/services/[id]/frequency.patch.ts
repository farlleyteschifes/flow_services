import { readBody } from 'h3'
import { servicesCollection } from '../../../database/collections'
import { apiError, apiSuccess } from '../../../utils/api-response'
import { getAuthenticatedChurch } from '../../../utils/auth'
import { objectIdFromParam } from '../../../utils/mongo-validation'
import {
  serializeService,
  validateFrequencyDelta,
  validateFrequencyKey
} from '../../../utils/services'
import { notFound } from '../../../utils/api-error'

type FrequencyBody = {
  category?: unknown
  delta?: unknown
}

export default defineEventHandler(async (event) => {
  try {
    const { church } = await getAuthenticatedChurch(event)
    const id = objectIdFromParam(event.context.params?.id, 'culto')
    const body = await readBody<FrequencyBody>(event)
    const category = validateFrequencyKey(body?.category)
    const delta = validateFrequencyDelta(body?.delta)
    const collection = await servicesCollection()
    const filter = {
      _id: id,
      churchId: church._id!,
      ...(delta < 0 ? { [`frequency.${category}`]: { $gte: Math.abs(delta) } } : {})
    }
    const result = await collection.updateOne(
      filter,
      {
        $inc: { [`frequency.${category}`]: delta },
        $set: { updatedAt: new Date() }
      }
    )

    if (result.matchedCount === 0) {
      const service = await collection.findOne({ _id: id, churchId: church._id! })

      if (!service) {
        return apiError(event, notFound('Culto não encontrado.'))
      }

      return apiSuccess({
        service: serializeService(service),
        changed: false
      })
    }

    const service = await collection.findOne({ _id: id, churchId: church._id! })

    if (!service) {
      return apiError(event, notFound('Culto não encontrado.'))
    }

    return apiSuccess({
      service: serializeService(service),
      changed: true
    })
  } catch (error) {
    return apiError(event, error)
  }
})
