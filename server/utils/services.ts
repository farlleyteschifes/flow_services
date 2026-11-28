import type { ObjectId } from 'mongodb'
import { badRequest } from './api-error'
import { isCalendarDate, isServiceType } from './normalization'
import { WORSHIP_GROUPS, type Frequency, type ServiceDocument, type ServiceType, type WorshipGroup } from '../database/models'

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

export function validateWorshipGroup(value: unknown): WorshipGroup {
  if (typeof value !== 'string' || !WORSHIP_GROUPS.includes(value as WorshipGroup)) {
    throw badRequest('O grupo do louvor é inválido.', {
      group: ['Escolha Grupo de Louvor, Senhoras ou Jovens.']
    })
  }

  return value as WorshipGroup
}

export function validateObservation(value: unknown) {
  if (value === undefined || value === null) return ''

  if (typeof value !== 'string' || value.length > 5000) {
    throw badRequest('A observação deve ser um texto de até 5000 caracteres.', {
      observation: ['Informe uma observação com até 5000 caracteres.']
    })
  }

  return value.trim()
}

export function validateVisitorName(value: unknown) {
  if (typeof value !== 'string' || !value.trim() || value.trim().length > 120) {
    throw badRequest('Informe o nome do visitante com até 120 caracteres.', {
      name: ['O nome do visitante é obrigatório e deve ter até 120 caracteres.']
    })
  }

  return value.trim()
}

export function validateVisitorPhone(value: unknown) {
  if (value === undefined || value === null || value === '') return ''

  if (typeof value !== 'string' || !/^[\d\s()+-]+$/.test(value)) {
    throw badRequest('O celular deve conter somente números.', {
      phone: ['Informe somente números no celular.']
    })
  }

  const digits = value.replace(/\D/g, '')
  if (digits.length !== 11) {
    throw badRequest('Informe um celular com DDD no formato (99) 99999-9999.', {
      phone: ['O celular deve ter 11 números, incluindo o DDD.']
    })
  }

  return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`
}

export function validateVisitorObservation(value: unknown) {
  if (value === undefined || value === null) return ''

  if (typeof value !== 'string' || value.length > 5000) {
    throw badRequest('A observação do visitante deve ter até 5000 caracteres.', {
      observation: ['Informe uma observação com até 5000 caracteres.']
    })
  }

  return value.trim()
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
    observation: service.observation ?? '',
    frequency: service.frequency,
    songs: service.songs.map((song) => song.kind === 'group'
      ? {
          id: song.entryId.toHexString(),
          kind: 'group' as const,
          group: song.group
        }
      : {
          id: (song.songId ?? song.entryId)?.toHexString(),
          number: song.number,
          isLoose: song.isLoose,
          name: song.name,
          ...(song.collectionName ? { collectionName: song.collectionName } : {}),
          ...(song.group ? { group: song.group } : {})
        }),
    visitors: (service.visitors ?? []).map((visitor) => ({
      id: visitor.visitorId.toHexString(),
      name: visitor.name,
      ...(visitor.phone ? { phone: visitor.phone } : {}),
      ...(visitor.observation ? { observation: visitor.observation } : {})
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
