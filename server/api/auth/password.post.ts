import { MongoServerError } from 'mongodb'
import { readBody } from 'h3'
import { churchesCollection } from '../../database/collections'
import { apiError, apiSuccess } from '../../utils/api-response'
import { clearAuthSession, getAuthenticatedChurch, requireCsrfToken } from '../../utils/auth'
import { hashPassword } from '../../utils/password'
import { strongPassword } from '../../utils/validation'
import { conflict } from '../../utils/api-error'

type PasswordBody = {
  password?: unknown
}

export default defineEventHandler(async (event) => {
  try {
    const { church } = await getAuthenticatedChurch(event)
    requireCsrfToken(event)
    const body = await readBody<PasswordBody>(event)
    const password = strongPassword(body?.password)

    if (!church._id) {
      throw new Error('Church id is missing')
    }

    const result = await (await churchesCollection()).updateOne(
      { _id: church._id, sessionVersion: church.sessionVersion },
      {
        $set: {
          passwordHash: await hashPassword(password),
          updatedAt: new Date()
        },
        $inc: { sessionVersion: 1 }
      }
    )

    if (result.matchedCount !== 1) {
      throw conflict('A sessão foi alterada. Faça login novamente.')
    }

    clearAuthSession(event)
    return apiSuccess({ passwordChanged: true, requiresLogin: true })
  } catch (error) {
    if (error instanceof MongoServerError) {
      return apiError(event, new Error('PASSWORD_CHANGE_FAILED'))
    }

    return apiError(event, error)
  }
})
