import { readBody } from 'h3'
import { ObjectId } from 'mongodb'
import { songsCollection, servicesCollection } from '../../../database/collections'
import { notFound } from '../../../utils/api-error'
import { apiError, apiSuccess } from '../../../utils/api-response'
import { getAuthenticatedChurch } from '../../../utils/auth'
import { objectId } from '../../../utils/service-content'
import { serializeService, validateWorshipGroup } from '../../../utils/services'

type AddSongBody = {
  songId?: unknown
  collectionName?: unknown
  group?: unknown
}

export default defineEventHandler(async (event) => {
  try {
    const { church } = await getAuthenticatedChurch(event)
    const serviceId = objectId(event.context.params?.id, 'culto')
    const body = await readBody<AddSongBody>(event)
    const group = validateWorshipGroup(body?.group)
    const collectionName = typeof body?.collectionName === 'string' ? body.collectionName.trim() : undefined
    const services = await servicesCollection()
    const songId = body?.songId ? objectId(body.songId, 'louvor') : undefined
    let result

    if (!songId) {
      result = await services.updateOne(
        { _id: serviceId, churchId: church._id! },
        {
          $push: { songs: { entryId: new ObjectId(), kind: 'group', group } },
          $set: { updatedAt: new Date() }
        }
      )
    } else {
      const songs = await songsCollection()
      const song = await songs.findOne({ _id: songId })

      if (!song) {
        return apiError(event, notFound('Louvor não encontrado.'))
      }

      result = await services.updateOne(
        {
          _id: serviceId,
          churchId: church._id!,
          songs: { $not: { $elemMatch: { songId } } }
        },
        {
          $push: {
            songs: {
              songId: song._id,
              number: song.number,
              isLoose: song.isLoose,
              name: song.name,
              group,
              ...(collectionName ? { collectionName } : {})
            }
          },
          $set: { updatedAt: new Date() }
        }
      )
    }
    const service = await services.findOne({ _id: serviceId, churchId: church._id! })

    if (!service) {
      return apiError(event, notFound('Culto não encontrado.'))
    }

    return apiSuccess({
      service: serializeService(service),
      added: result.modifiedCount === 1
    })
  } catch (error) {
    return apiError(event, error)
  }
})
