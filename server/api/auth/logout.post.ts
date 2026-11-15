import { apiError, apiSuccess } from '../../utils/api-response'
import { clearAuthSession, getAuthenticatedChurch, requireCsrfToken } from '../../utils/auth'

export default defineEventHandler(async (event) => {
  try {
    await getAuthenticatedChurch(event)
    requireCsrfToken(event)
  } catch (error) {
    clearAuthSession(event)

    if (error instanceof Error && 'statusCode' in error && (error as { statusCode?: number }).statusCode === 401) {
      return apiSuccess({ loggedOut: true })
    }

    return apiError(event, error)
  }

  clearAuthSession(event)
  return apiSuccess({ loggedOut: true })
})
