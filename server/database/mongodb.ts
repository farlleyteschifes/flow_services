import { MongoClient, type Db } from 'mongodb'
import { ApiError } from '../utils/api-error'

let clientPromise: Promise<MongoClient> | undefined
let databasePromise: Promise<Db> | undefined

function getMongoConfig() {
  const config = useRuntimeConfig()

  if (!config.mongodbUri) {
    throw new ApiError(503, 'DATABASE_NOT_CONFIGURED', 'O banco de dados não está configurado.')
  }

  return {
    uri: config.mongodbUri,
    dbName: config.mongodbDbName || undefined
  }
}

async function getMongoClient() {
  if (!clientPromise) {
    const { uri } = getMongoConfig()
    const client = new MongoClient(uri, {
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 5000
    })

    clientPromise = client.connect().catch(() => {
      clientPromise = undefined
      throw new ApiError(503, 'DATABASE_UNAVAILABLE', 'O banco de dados está temporariamente indisponível.')
    })
  }

  return clientPromise
}

export async function getDatabase() {
  if (!databasePromise) {
    databasePromise = (async () => {
      const client = await getMongoClient()
      const { dbName } = getMongoConfig()
      const database = dbName ? client.db(dbName) : client.db()

      await ensureIndexes(database)
      return database
    })().catch((error) => {
      databasePromise = undefined

      if (error instanceof ApiError) {
        throw error
      }

      throw new ApiError(503, 'DATABASE_UNAVAILABLE', 'O banco de dados está temporariamente indisponível.')
    })
  }

  return databasePromise
}

async function ensureIndexes(database: Db) {
  await Promise.all([
    database.collection('churches').createIndex({ usernameNormalized: 1 }, { unique: true, name: 'church_username_unique' }),
    database.collection('members').createIndex(
      { churchId: 1, normalizedName: 1 },
      { unique: true, name: 'member_church_name_unique' }
    ),
    database.collection('songs').createIndex({ number: 1 }, { unique: true, name: 'song_number_unique' }),
    database.collection('services').createIndex(
      { churchId: 1, dateKey: 1, type: 1 },
      { unique: true, name: 'service_church_date_type_unique' }
    ),
    database.collection('services').createIndex(
      { churchId: 1, dateKey: 1 },
      { name: 'service_church_date_lookup' }
    )
  ])
}

export async function closeDatabaseConnection() {
  if (!clientPromise) {
    return
  }

  const client = await clientPromise
  await client.close()
  clientPromise = undefined
  databasePromise = undefined
}
