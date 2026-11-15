import { MongoServerError, ObjectId } from 'mongodb'
import { readBody } from 'h3'
import { membersCollection } from '../database/collections'
import { conflict } from '../utils/api-error'
import { apiError, apiSuccess } from '../utils/api-response'
import { getAuthenticatedChurch } from '../utils/auth'
import { normalizeText } from '../utils/normalization'
import { requiredText } from '../utils/validation'

type MemberBody = {
  name?: unknown
}

export default defineEventHandler(async (event) => {
  try {
    const { church } = await getAuthenticatedChurch(event)
    const body = await readBody<MemberBody>(event)
    const name = requiredText(body?.name, 'name', 'O nome do membro', 120)
    const normalizedName = normalizeText(name)
    const collection = await membersCollection()
    const existing = await collection.findOne({ churchId: church._id!, normalizedName })

    if (existing) {
      if (existing.active) {
        throw conflict('Este membro já está cadastrado nesta igreja.')
      }

      const now = new Date()
      await collection.updateOne(
        { _id: existing._id, churchId: church._id! },
        { $set: { active: true, name, updatedAt: now }, $unset: { deactivatedAt: '' } }
      )

      return apiSuccess({
        member: {
          id: existing._id?.toHexString(),
          name,
          active: true,
          createdAt: existing.createdAt,
          updatedAt: now
        },
        reactivated: true
      })
    }

    const now = new Date()

    try {
      const result = await collection.insertOne({
        _id: new ObjectId(),
        churchId: church._id!,
        name,
        normalizedName,
        active: true,
        createdAt: now,
        updatedAt: now
      })

      return apiSuccess({
        member: {
          id: result.insertedId.toHexString(),
          name,
          active: true,
          createdAt: now,
          updatedAt: now
        },
        reactivated: false
      })
    } catch (error) {
      if (error instanceof MongoServerError && error.code === 11000) {
        throw conflict('Este membro já está cadastrado nesta igreja.')
      }

      throw error
    }
  } catch (error) {
    return apiError(event, error)
  }
})
