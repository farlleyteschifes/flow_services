import { ObjectId } from 'mongodb'
import { badRequest } from './api-error'

export const PARTICIPANT_ROLES = ['worship', 'word', 'gate'] as const
export type ParticipantRole = (typeof PARTICIPANT_ROLES)[number]

export function validateParticipantRole(value: unknown): ParticipantRole {
  if (typeof value !== 'string' || !PARTICIPANT_ROLES.includes(value as ParticipantRole)) {
    throw badRequest('A função do participante é inválida.', {
      role: ['Escolha Louvor, Palavra ou Portão.']
    })
  }

  return value as ParticipantRole
}

export function objectId(value: unknown, field: string) {
  if (typeof value !== 'string' || !ObjectId.isValid(value)) {
    throw badRequest(`O identificador de ${field} é inválido.`, {
      [field]: [`O identificador de ${field} é inválido.`]
    })
  }

  return new ObjectId(value)
}
