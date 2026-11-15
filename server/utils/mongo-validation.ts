import { ObjectId } from 'mongodb'
import { badRequest, notFound } from './api-error'

export function objectIdFromParam(value: string | undefined, field = 'id') {
  if (!value || !ObjectId.isValid(value)) {
    throw badRequest(`O identificador de ${field} é inválido.`, {
      [field]: [`O identificador de ${field} é inválido.`]
    })
  }

  return new ObjectId(value)
}

export function ensureUpdated(found: boolean, message = 'Registro não encontrado.') {
  if (!found) {
    throw notFound(message)
  }
}

export function searchPattern(value: string | undefined) {
  if (!value?.trim()) {
    return undefined
  }

  if (value.trim().length > 80) {
    throw badRequest('O termo de busca deve ter no máximo 80 caracteres.', {
      search: ['O termo de busca deve ter no máximo 80 caracteres.']
    })
  }

  return new RegExp(escapeRegExp(value.trim()), 'i')
}

function escapeRegExp(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}
