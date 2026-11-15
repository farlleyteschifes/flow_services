import { badRequest } from './api-error'
import { isStrongPassword } from './password'

export function requiredText(value: unknown, field: string, label: string, maxLength: number) {
  if (typeof value !== 'string') {
    throw badRequest(`${label} é obrigatório.`, { [field]: [`${label} é obrigatório.`] })
  }

  const normalizedValue = value.trim()

  if (!normalizedValue) {
    throw badRequest(`${label} é obrigatório.`, { [field]: [`${label} é obrigatório.`] })
  }

  if (normalizedValue.length > maxLength) {
    throw badRequest(`${label} deve ter no máximo ${maxLength} caracteres.`, {
      [field]: [`${label} deve ter no máximo ${maxLength} caracteres.`]
    })
  }

  return normalizedValue
}

export function sixDigitUsername(value: unknown) {
  const username = requiredText(value, 'username', 'O usuário', 6)

  if (!/^\d{6}$/.test(username)) {
    throw badRequest('O usuário deve conter exatamente seis dígitos.', {
      username: ['O usuário deve conter exatamente seis dígitos.']
    })
  }

  return username
}

export function strongPassword(value: unknown) {
  if (typeof value !== 'string' || !isStrongPassword(value)) {
    throw badRequest('A senha deve ter entre 8 e 128 caracteres, incluindo letras, números e caracteres especiais.', {
      password: ['A senha deve ter entre 8 e 128 caracteres, incluindo letras, números e caracteres especiais.']
    })
  }

  return value
}
