import { MongoServerError, ObjectId } from 'mongodb'
import { readBody, setResponseStatus } from 'h3'
import { churchesCollection } from '../../database/collections'
import { conflict } from '../../utils/api-error'
import { apiError, apiSuccess } from '../../utils/api-response'
import { requireAdminSecret } from '../../utils/admin-auth'
import { generateStrongPassword, hashPassword } from '../../utils/password'
import { requiredText, sixDigitUsername, strongPassword } from '../../utils/validation'

type CreateChurchBody = {
  name?: unknown
  username?: unknown
  password?: unknown
}

export default defineEventHandler(async (event) => {
  try {
    requireAdminSecret(event)

    const body = await readBody<CreateChurchBody>(event)
    const name = requiredText(body?.name, 'name', 'O nome da igreja', 120)
    const username = sixDigitUsername(body?.username)
    const generatedPassword = body?.password === undefined || body.password === ''
    const password = generatedPassword ? generateStrongPassword() : strongPassword(body.password)
    const now = new Date()
    const collection = await churchesCollection()
    const result = await collection.insertOne({
      _id: new ObjectId(),
      name,
      username,
      usernameNormalized: username,
      passwordHash: await hashPassword(password),
      sessionVersion: 1,
      createdAt: now,
      updatedAt: now
    })

    setResponseStatus(event, 201)

    return apiSuccess({
      church: {
        id: result.insertedId.toHexString(),
        name,
        username,
        createdAt: now
      },
      ...(generatedPassword ? { suggestedPassword: password } : {})
    })
  } catch (error) {
    if (error instanceof MongoServerError && error.code === 11000) {
      return apiError(event, conflict('Já existe uma igreja cadastrada com este usuário.'))
    }

    return apiError(event, error)
  }
})
