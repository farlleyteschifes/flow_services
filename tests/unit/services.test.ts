import { describe, expect, it } from 'vitest'
import { ApiError } from '../../server/utils/api-error'
import {
  emptyFrequency,
  validateFrequencyDelta,
  validateFrequencyKey,
  validateServiceDate,
  validateServiceType,
  validateObservation,
  validateVisitorName,
  validateVisitorPhone
} from '../../server/utils/services'

describe('regras de cultos e frequência', () => {
  it('cria frequência inicial zerada', () => {
    expect(emptyFrequency()).toEqual({ adults: 0, visitors: 0, children: 0, visitingChildren: 0 })
  })

  it('valida data e tipo de culto', () => {
    expect(validateServiceDate('2026-11-15')).toBe('2026-11-15')
    expect(validateServiceType('ebd')).toBe('ebd')
    expect(() => validateServiceDate('15/11/2026')).toThrow(ApiError)
    expect(() => validateServiceType('culto-especial')).toThrow(ApiError)
  })

  it('aceita somente categorias e alterações atômicas permitidas', () => {
    expect(validateFrequencyKey('adults')).toBe('adults')
    expect(validateFrequencyDelta(1)).toBe(1)
    expect(validateFrequencyDelta(5)).toBe(5)
    expect(validateFrequencyDelta(-5)).toBe(-5)
    expect(() => validateFrequencyKey('total')).toThrow(ApiError)
    expect(() => validateFrequencyDelta(0)).toThrow(ApiError)
    expect(() => validateFrequencyDelta(1001)).toThrow(ApiError)
  })

  it('aceita observação opcional e limita seu tamanho', () => {
    expect(validateObservation(undefined)).toBe('')
    expect(validateObservation('  Aviso importante  ')).toBe('Aviso importante')
    expect(() => validateObservation('x'.repeat(5001))).toThrow(ApiError)
  })

  it('valida e formata o celular do visitante', () => {
    expect(validateVisitorName('  Ana  ')).toBe('Ana')
    expect(validateVisitorPhone('11987654321')).toBe('(11) 98765-4321')
    expect(validateVisitorPhone('(11) 98765-4321')).toBe('(11) 98765-4321')
    expect(() => validateVisitorName('')).toThrow(ApiError)
    expect(() => validateVisitorPhone('1198765432')).toThrow(ApiError)
    expect(() => validateVisitorPhone('11abc987654321')).toThrow(ApiError)
  })
})
