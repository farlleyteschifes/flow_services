import { MongoServerError, ObjectId } from 'mongodb'
import { readBody, setResponseStatus } from 'h3'
import { servicesCollection } from '../database/collections'
import { apiError, apiSuccess } from '../utils/api-response'
import { getAuthenticatedChurch } from '../utils/auth'
import { emptyFrequency, emptyParticipants, serializeService, serviceFilter, validateServiceDate, validateServiceType } from '../utils/services'

type ServiceBody = {
  date?: unknown
  type?: unknown
}

export default defineEventHandler(async (event) => {
  try {
    const { church } = await getAuthenticatedChurch(event)
    const body = await readBody<ServiceBody>(event)
    const date = validateServiceDate(body?.date)
    const type = validateServiceType(body?.type)
    const filter = serviceFilter(church._id!, date, type)
    const collection = await servicesCollection()
    const existing = await collection.findOne(filter)

    if (existing) {
      return apiSuccess({ service: serializeService(existing), created: false })
    }

    const now = new Date()
    const service = {
      _id: new ObjectId(),
      ...filter,
      frequency: emptyFrequency(),
      songs: [],
      participants: emptyParticipants(),
      createdAt: now,
      updatedAt: now
    }

    try {
      await collection.insertOne(service)
      setResponseStatus(event, 201)
      return apiSuccess({ service: serializeService(service), created: true })
    } catch (error) {
      if (error instanceof MongoServerError && error.code === 11000) {
        const concurrentService = await collection.findOne(filter)

        if (concurrentService) {
          return apiSuccess({ service: serializeService(concurrentService), created: false })
        }
      }

      throw error
    }
  } catch (error) {
    return apiError(event, error)
  }
})
