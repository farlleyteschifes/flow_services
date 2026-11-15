import {
  createHmac,
  randomBytes,
  timingSafeEqual
} from 'node:crypto'
import type { H3Event } from 'h3'
import { deleteCookie, getCookie, getHeader, setCookie } from 'h3'
import { ObjectId } from 'mongodb'
import { churchesCollection } from '../database/collections'
import type { ChurchDocument } from '../database/models'
import { unauthorized, ApiError } from './api-error'
import { secretsMatch } from './password'

const SESSION_COOKIE = 'flow_session'
const CSRF_COOKIE = 'flow_csrf'
const SESSION_MAX_AGE = 60 * 60 * 24 * 30

type SessionPayload = {
  churchId: string
  sessionVersion: number
  expiresAt: number
}

export type AuthenticatedChurch = {
  church: ChurchDocument
  session: SessionPayload
}

function sessionSecret() {
  const config = useRuntimeConfig()

  if (!config.sessionSecret) {
    throw new ApiError(503, 'SESSION_NOT_CONFIGURED', 'As sessões não estão configuradas.')
  }

  return config.sessionSecret
}

function sign(value: string) {
  return createHmac('sha256', sessionSecret()).update(value).digest('base64url')
}

function encodeSession(payload: SessionPayload) {
  const encodedPayload = Buffer.from(JSON.stringify(payload)).toString('base64url')
  return `${encodedPayload}.${sign(encodedPayload)}`
}

function decodeSession(value: string): SessionPayload | undefined {
  const [encodedPayload, signature] = value.split('.')

  if (!encodedPayload || !signature || !secretsMatch(signature, sign(encodedPayload))) {
    return undefined
  }

  try {
    const payload = JSON.parse(Buffer.from(encodedPayload, 'base64url').toString('utf8')) as SessionPayload

    if (
      typeof payload.churchId !== 'string'
      || typeof payload.sessionVersion !== 'number'
      || typeof payload.expiresAt !== 'number'
      || payload.expiresAt <= Date.now()
      || !ObjectId.isValid(payload.churchId)
    ) {
      return undefined
    }

    return payload
  } catch {
    return undefined
  }
}

function cookieOptions(maxAge = SESSION_MAX_AGE) {
  const isProduction = process.env.NODE_ENV === 'production'

  return {
    httpOnly: true,
    secure: isProduction,
    sameSite: 'lax' as const,
    path: '/',
    maxAge
  }
}

export function createSession(event: H3Event, church: ChurchDocument) {
  if (!church._id) {
    throw new ApiError(500, 'INVALID_CHURCH', 'Não foi possível iniciar a sessão.')
  }

  const payload: SessionPayload = {
    churchId: church._id.toHexString(),
    sessionVersion: church.sessionVersion,
    expiresAt: Date.now() + SESSION_MAX_AGE * 1000
  }
  const csrfToken = randomBytes(32).toString('base64url')

  setCookie(event, SESSION_COOKIE, encodeSession(payload), cookieOptions())
  setCookie(event, CSRF_COOKIE, csrfToken, {
    ...cookieOptions(),
    httpOnly: false
  })

  return { csrfToken }
}

export function clearAuthSession(event: H3Event) {
  deleteCookie(event, SESSION_COOKIE, { path: '/' })
  deleteCookie(event, CSRF_COOKIE, { path: '/' })
}

export async function getAuthenticatedChurch(event: H3Event): Promise<AuthenticatedChurch> {
  const rawSession = getCookie(event, SESSION_COOKIE)
  const session = rawSession ? decodeSession(rawSession) : undefined

  if (!session) {
    throw unauthorized()
  }

  const church = await (await churchesCollection()).findOne({ _id: new ObjectId(session.churchId) })

  if (!church || church.sessionVersion !== session.sessionVersion) {
    clearAuthSession(event)
    throw unauthorized()
  }

  return { church, session }
}

export function requireCsrfToken(event: H3Event) {
  const cookieToken = getCookie(event, CSRF_COOKIE)
  const headerToken = getHeader(event, 'x-csrf-token')

  if (!cookieToken || !headerToken || !secretsMatch(cookieToken, headerToken)) {
    throw new ApiError(403, 'CSRF_INVALID', 'Token de segurança inválido.')
  }
}

export function getCsrfToken(event: H3Event) {
  return getCookie(event, CSRF_COOKIE)
}
