import type { H3Event } from 'h3'
import { getHeader } from 'h3'
import { ApiError } from './api-error'
import { secretsMatch } from './password'

export function requireAdminSecret(event: H3Event) {
  const config = useRuntimeConfig()
  const configuredSecret = config.adminSecret
  const providedSecret = getHeader(event, 'x-admin-secret')

  if (!configuredSecret) {
    throw new ApiError(503, 'ADMIN_NOT_CONFIGURED', 'O acesso administrativo não está configurado.')
  }

  if (!providedSecret || !secretsMatch(providedSecret, configuredSecret)) {
    throw new ApiError(401, 'ADMIN_UNAUTHORIZED', 'Acesso administrativo não autorizado.')
  }
}
