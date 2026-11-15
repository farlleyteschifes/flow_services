import {
  createHash,
  randomBytes,
  randomInt,
  scrypt as nodeScrypt,
  timingSafeEqual
} from 'node:crypto'
import { promisify } from 'node:util'

const scrypt = promisify(nodeScrypt)
const HASH_KEY_LENGTH = 64
const SCRYPT_COST = 16_384
const SCRYPT_BLOCK_SIZE = 8
const SCRYPT_PARALLELIZATION = 1

const LOWERCASE = 'abcdefghijkmnopqrstuvwxyz'
const UPPERCASE = 'ABCDEFGHJKLMNPQRSTUVWXYZ'
const NUMBERS = '23456789'
const SPECIALS = '!@#$%&*+-=?'
const ALL_CHARACTERS = LOWERCASE + UPPERCASE + NUMBERS + SPECIALS

export function isStrongPassword(password: string) {
  return password.length >= 8
    && /[a-zA-Z]/.test(password)
    && /\d/.test(password)
    && /[^a-zA-Z\d]/.test(password)
}

export function generateStrongPassword(length = 12) {
  const passwordCharacters = [
    randomCharacter(LOWERCASE),
    randomCharacter(UPPERCASE),
    randomCharacter(NUMBERS),
    randomCharacter(SPECIALS)
  ]

  while (passwordCharacters.length < Math.max(length, 8)) {
    passwordCharacters.push(randomCharacter(ALL_CHARACTERS))
  }

  for (let index = passwordCharacters.length - 1; index > 0; index -= 1) {
    const swapIndex = randomInt(index + 1)
    ;[passwordCharacters[index], passwordCharacters[swapIndex]] = [
      passwordCharacters[swapIndex],
      passwordCharacters[index]
    ]
  }

  return passwordCharacters.join('')
}

export async function hashPassword(password: string) {
  const salt = randomBytes(16)
  const derivedKey = await scrypt(password, salt, HASH_KEY_LENGTH, {
    N: SCRYPT_COST,
    r: SCRYPT_BLOCK_SIZE,
    p: SCRYPT_PARALLELIZATION
  }) as Buffer

  return [
    'scrypt',
    SCRYPT_COST,
    SCRYPT_BLOCK_SIZE,
    SCRYPT_PARALLELIZATION,
    salt.toString('base64url'),
    derivedKey.toString('base64url')
  ].join('$')
}

export async function verifyPassword(password: string, encodedHash: string) {
  const [algorithm, cost, blockSize, parallelization, encodedSalt, encodedKey] = encodedHash.split('$')

  if (
    algorithm !== 'scrypt'
    || !cost
    || !blockSize
    || !parallelization
    || !encodedSalt
    || !encodedKey
  ) {
    return false
  }

  try {
    const salt = Buffer.from(encodedSalt, 'base64url')
    const expectedKey = Buffer.from(encodedKey, 'base64url')
    const derivedKey = await scrypt(password, salt, expectedKey.length, {
      N: Number(cost),
      r: Number(blockSize),
      p: Number(parallelization)
    }) as Buffer

    return derivedKey.length === expectedKey.length && timingSafeEqual(derivedKey, expectedKey)
  } catch {
    return false
  }
}

function randomCharacter(characters: string) {
  return characters[randomInt(characters.length)]
}

export function secretsMatch(providedSecret: string, configuredSecret: string) {
  const providedDigest = createHash('sha256').update(providedSecret).digest()
  const configuredDigest = createHash('sha256').update(configuredSecret).digest()

  return timingSafeEqual(providedDigest, configuredDigest)
}
