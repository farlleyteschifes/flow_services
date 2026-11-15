import { describe, expect, it } from 'vitest'
import { ApiError } from '../../server/utils/api-error'
import {
  emptyFrequency,
  validateFrequencyDelta,
  validateFrequencyKey,
  validateServiceDate,
  validateServiceType
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
    expect(validateFrequencyDelta(-1)).toBe(-1)
    expect(() => validateFrequencyKey('total')).toThrow(ApiError)
    expect(() => validateFrequencyDelta(2)).toThrow(ApiError)
  })
})
