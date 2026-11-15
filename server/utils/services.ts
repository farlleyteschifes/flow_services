import type { ObjectId } from 'mongodb'
import { badRequest } from './api-error'
import { isCalendarDate, isServiceType } from './normalization'
import type { Frequency, ServiceDocument, ServiceType } from '../database/models'

export const FREQUENCY_KEYS = ['adults', 'visitors', 'children', 'visitingChildren'] as const
export type FrequencyKey = (typeof FREQUENCY_KEYS)[number]

export function validateServiceDate(value: unknown) {
  if (typeof value !== 'string' || !isCalendarDate(value)) {
    throw badRequest('A data do culto deve estar no formato AAAA-MM-DD e ser válida.', {
      date: ['A data do culto deve estar no formato AAAA-MM-DD e ser válida.']
    })
  }

  return value
}

export function validateServiceType(value: unknown): ServiceType {
  if (typeof value !== 'string' || !isServiceType(value)) {
    throw badRequest('O tipo de culto informado é inválido.', {
      type: ['Escolha Madrugada, Culto ao meio-dia, Culto à Noite ou EBD.']
    })
  }

  return value as ServiceType
}

export function validateFrequencyKey(value: unknown): FrequencyKey {
  if (typeof value !== 'string' || !FREQUENCY_KEYS.includes(value as FrequencyKey)) {
    throw badRequest('A categoria de frequência informada é inválida.', {
      category: ['Escolha uma categoria de frequência válida.']
    })
  }

  return value as FrequencyKey
}

export function validateFrequencyDelta(value: unknown) {
  const delta = typeof value === 'number' ? value : Number(value)

  if (!Number.isInteger(delta) || delta === 0 || Math.abs(delta) > 1000) {
    throw badRequest('A alteração deve ser um número inteiro entre -1000 e 1000, diferente de zero.', {
      delta: ['A alteração deve ser um número inteiro entre -1000 e 1000, diferente de zero.']
    })
  }

  return delta
}

export function validateFrequencyValue(value: unknown) {
  const number = typeof value === 'number' ? value : Number(value)

  if (!Number.isInteger(number) || number < 0) {
    throw badRequest('A frequência deve ser um número inteiro não negativo.', {
      value: ['A frequência deve ser um número inteiro não negativo.']
    })
  }

  return number
}

export function emptyFrequency(): Frequency {
  return {
    adults: 0,
    visitors: 0,
    children: 0,
    visitingChildren: 0
  }
}

export function emptyParticipants() {
  return {
    worship: [],
    word: [],
    gate: []
  }
}

export function serializeService(service: ServiceDocument) {
  return {
    id: service._id?.toHexString(),
    date: service.dateKey,
    type: service.type,
    frequency: service.frequency,
    songs: service.songs.map((song) => ({
      id: song.songId?.toHexString(),
      number: song.number,
      name: song.name
    })),
    participants: {
      worship: service.participants.worship.map((member) => ({
        id: member.memberId?.toHexString(),
        name: member.name
      })),
      word: service.participants.word.map((member) => ({
        id: member.memberId?.toHexString(),
        name: member.name
      })),
      gate: service.participants.gate.map((member) => ({
        id: member.memberId?.toHexString(),
        name: member.name
      }))
    },
    createdAt: service.createdAt,
    updatedAt: service.updatedAt
  }
}

export function serviceFilter(churchId: ObjectId, date: string, type: ServiceType) {
  return { churchId, dateKey: date, type }
}
