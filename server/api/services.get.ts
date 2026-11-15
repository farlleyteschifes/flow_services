import { getQuery } from 'h3'
import { servicesCollection } from '../database/collections'
import { apiError, apiSuccess } from '../utils/api-response'
import { getAuthenticatedChurch } from '../utils/auth'
import { serializeService, serviceFilter, validateServiceDate, validateServiceType } from '../utils/services'

export default defineEventHandler(async (event) => {
  try {
    const { church } = await getAuthenticatedChurch(event)
    const query = getQuery(event)
    const date = validateServiceDate(query.date)
    const type = validateServiceType(query.type)
    const service = await (await servicesCollection()).findOne(serviceFilter(church._id!, date, type))

    return apiSuccess({
      service: service ? serializeService(service) : null
    })
  } catch (error) {
    return apiError(event, error)
  }
})
