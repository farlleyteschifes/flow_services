import { describe, expect, it } from 'vitest'
import { generateStrongPassword, hashPassword, isStrongPassword, verifyPassword } from '../../server/utils/password'

describe('senhas', () => {
  it('aceita somente senhas dentro da política definida', () => {
    expect(isStrongPassword('Senha@123')).toBe(true)
    expect(isStrongPassword('senha123')).toBe(false)
    expect(isStrongPassword('S@1')).toBe(false)
    expect(isStrongPassword(`A@1${'a'.repeat(126)}`)).toBe(false)
  })

  it('gera senha que atende à política', () => {
    const password = generateStrongPassword()
    expect(password).toHaveLength(12)
    expect(isStrongPassword(password)).toBe(true)
  })

  it('armazena hash e verifica a senha sem armazenar o valor original', async () => {
    const password = 'Senha@123'
    const encodedHash = await hashPassword(password)

    expect(encodedHash).toMatch(/^scrypt\$/)
    expect(encodedHash).not.toContain(password)
    await expect(verifyPassword(password, encodedHash)).resolves.toBe(true)
    await expect(verifyPassword('Outra@123', encodedHash)).resolves.toBe(false)
  })
})
