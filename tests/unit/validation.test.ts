import { describe, expect, it } from 'vitest'
import { ApiError } from '../../server/utils/api-error'
import { requiredText, sixDigitUsername, strongPassword } from '../../server/utils/validation'

describe('validações de entrada', () => {
  it('valida textos obrigatórios e limite de tamanho', () => {
    expect(requiredText('  Igreja Central ', 'name', 'Nome', 50)).toBe('Igreja Central')
    expect(() => requiredText('   ', 'name', 'Nome', 50)).toThrow(ApiError)
    expect(() => requiredText('a'.repeat(51), 'name', 'Nome', 50)).toThrow(ApiError)
  })

  it('valida usuário numérico de seis dígitos', () => {
    expect(sixDigitUsername('123456')).toBe('123456')
    expect(() => sixDigitUsername('12345')).toThrow(ApiError)
    expect(() => sixDigitUsername('12345a')).toThrow(ApiError)
  })

  it('aplica a política de senha no servidor', () => {
    expect(strongPassword('Senha@123')).toBe('Senha@123')
    expect(() => strongPassword('senha123')).toThrow(ApiError)
  })
})
