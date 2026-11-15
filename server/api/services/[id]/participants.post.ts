import { readBody } from 'h3'
import { membersCollection, servicesCollection } from '../../../database/collections'
import { notFound } from '../../../utils/api-error'
import { apiError, apiSuccess } from '../../../utils/api-response'
import { getAuthenticatedChurch } from '../../../utils/auth'
import { objectId, validateParticipantRole, type ParticipantRole } from '../../../utils/service-content'
import { serializeService } from '../../../utils/services'

type AddParticipantBody = {
  role?: unknown
  memberId?: unknown
}

export default defineEventHandler(async (event) => {
  try {
    const { church } = await getAuthenticatedChurch(event)
    const serviceId = objectId(event.context.params?.id, 'culto')
    const body = await readBody<AddParticipantBody>(event)
    const role = validateParticipantRole(body?.role)
    const memberId = objectId(body?.memberId, 'membro')
    const member = await (await membersCollection()).findOne({
      _id: memberId,
      churchId: church._id!,
      active: true
    })

    if (!member) {
      return apiError(event, notFound('Membro ativo não encontrado.'))
    }

    const services = await servicesCollection()
    const result = await services.updateOne(
      {
        _id: serviceId,
        churchId: church._id!,
        [`participants.${role}`]: { $not: { $elemMatch: { memberId } } }
      },
      {
        $push: {
          [`participants.${role}`]: {
            memberId: member._id,
            name: member.name
          }
        },
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
      added: result.modifiedCount === 1
    })
  } catch (error) {
    return apiError(event, error)
  }
})
