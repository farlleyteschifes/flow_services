import { ObjectId } from 'mongodb'
import { readBody } from 'h3'
import { servicesCollection } from '../../../database/collections'
import { notFound } from '../../../utils/api-error'
import { apiError, apiSuccess } from '../../../utils/api-response'
import { getAuthenticatedChurch } from '../../../utils/auth'
import { objectIdFromParam } from '../../../utils/mongo-validation'
import { serializeService, validateVisitorName, validateVisitorObservation, validateVisitorPhone } from '../../../utils/services'

type VisitorBody = { name?: unknown; phone?: unknown; observation?: unknown; watchedYoutube?: unknown }

export default defineEventHandler(async (event) => {
  try {
    const { church } = await getAuthenticatedChurch(event)
    const serviceId = objectIdFromParam(event.context.params?.id, 'culto')
    const body = await readBody<VisitorBody>(event)
    const visitor = {
      visitorId: new ObjectId(),
      name: validateVisitorName(body?.name),
      phone: validateVisitorPhone(body?.phone),
      observation: validateVisitorObservation(body?.observation),
      watchedYoutube: body?.watchedYoutube === true
    }
    const services = await servicesCollection()
    const result = await services.updateOne(
      { _id: serviceId, churchId: church._id! },
      { $push: { visitors: visitor }, $set: { updatedAt: new Date() } }
    )

    if (!result.matchedCount) {
      return apiError(event, notFound('Culto não encontrado.'))
    }

    const service = await services.findOne({ _id: serviceId, churchId: church._id! })
    return apiSuccess({
      service: serializeService(service!),
      visitor: { id: visitor.visitorId.toHexString(), name: visitor.name, phone: visitor.phone, observation: visitor.observation, watchedYoutube: visitor.watchedYoutube }
    })
  } catch (error) {
    return apiError(event, error)
  }
})
