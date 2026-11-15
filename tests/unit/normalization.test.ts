import { describe, expect, it } from 'vitest'
import { isCalendarDate, isServiceType, normalizeText, normalizeUsername } from '../../server/utils/normalization'

describe('normalização de dados', () => {
  it('normaliza acentos, espaços e capitalização de nomes', () => {
    expect(normalizeText('  João  da   Silva  ')).toBe('joao da silva')
  })

  it('mantém o código de usuário como texto sem alterar seus dígitos', () => {
    expect(normalizeUsername(' 123456 ')).toBe('123456')
  })

  it('valida datas de calendário sem deslocamento de fuso', () => {
    expect(isCalendarDate('2024-02-29')).toBe(true)
    expect(isCalendarDate('2023-02-29')).toBe(false)
    expect(isCalendarDate('2024-2-09')).toBe(false)
  })

  it('reconhece somente os tipos de culto suportados', () => {
    expect(isServiceType('noite')).toBe(true)
    expect(isServiceType('domingo')).toBe(false)
  })
})
