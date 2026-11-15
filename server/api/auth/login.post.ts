import { readBody } from 'h3'
import { churchesCollection } from '../../database/collections'
import { apiError, apiSuccess } from '../../utils/api-response'
import { createSession } from '../../utils/auth'
import { normalizeUsername } from '../../utils/normalization'
import { verifyPassword } from '../../utils/password'
import { unauthorized } from '../../utils/api-error'

type LoginBody = {
  username?: unknown
  password?: unknown
}

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody<LoginBody>(event)
    const username = typeof body?.username === 'string' ? normalizeUsername(body.username) : ''
    const password = typeof body?.password === 'string' ? body.password : ''

    if (!/^\d{6}$/.test(username) || !password) {
      throw unauthorized('Usuário ou senha inválidos.')
    }

    const church = await (await churchesCollection()).findOne({ usernameNormalized: username })
    const validPassword = church ? await verifyPassword(password, church.passwordHash) : false

    if (!church || !validPassword) {
      throw unauthorized('Usuário ou senha inválidos.')
    }

    const { csrfToken } = createSession(event, church)

    return apiSuccess({
      church: {
        id: church._id?.toHexString(),
        name: church.name,
        username: church.username
      },
      csrfToken
    })
  } catch (error) {
    return apiError(event, error)
  }
})
