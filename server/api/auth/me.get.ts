import { apiError, apiSuccess } from '../../utils/api-response'
import { getAuthenticatedChurch, getCsrfToken } from '../../utils/auth'

export default defineEventHandler(async (event) => {
  try {
    const { church } = await getAuthenticatedChurch(event)

    return apiSuccess({
      church: {
        id: church._id?.toHexString(),
        name: church.name,
        username: church.username
      },
      csrfToken: getCsrfToken(event)
    })
  } catch (error) {
    return apiError(event, error)
  }
})
