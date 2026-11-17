import { readFile } from 'node:fs/promises'
import { resolve } from 'node:path'
import { MongoClient } from 'mongodb'

const files = [
  'louvores_coletanea_2022.csv',
  'louvores_coletanea_cias.csv',
  'louvores_coletanea_avulsa.csv'
]

const mongodbUri = process.env.MONGODB_URI
const databaseName = process.env.MONGODB_DB_NAME

if (!mongodbUri) {
  throw new Error('MONGODB_URI não foi configurada.')
}

function parseCsv(content, fileName) {
  const lines = content.replace(/^\uFEFF/, '').split(/\r?\n/).filter((line) => line.trim())
  const header = lines.shift()

  if (header !== 'Coletanea;Numero;Louvor') {
    throw new Error(`Cabeçalho inválido em ${fileName}.`)
  }

  return lines.map((line, index) => {
    const columns = line.split(';')
    if (columns.length !== 3) {
      throw new Error(`Linha ${index + 2} inválida em ${fileName}.`)
    }

    const collectionName = columns[0].trim()
    const songNumber = Number(columns[1].trim())
    const songName = columns[2].trim()

    if (!collectionName || !Number.isInteger(songNumber) || songNumber < 0 || !songName) {
      throw new Error(`Dados inválidos na linha ${index + 2} de ${fileName}.`)
    }

    return { collectionName, songNumber, songName }
  })
}

const records = []
for (const file of files) {
  const content = await readFile(resolve('doc/coletaneas', file), 'utf8')
  records.push(...parseCsv(content, file))
}

const uniqueRecords = [...new Map(
  records.map((record) => [
    `${record.collectionName}\u0000${record.songNumber}\u0000${record.songName}`,
    record
  ])
).values()]

const client = new MongoClient(mongodbUri)

try {
  await client.connect()
  const database = databaseName ? client.db(databaseName) : client.db()
  const collection = database.collection('coletaneas')

  await collection.createIndex(
    { collectionName: 1, songNumber: 1, songName: 1 },
    { name: 'coletanea_song_lookup' }
  )

  const operations = uniqueRecords.map((record) => ({
    updateOne: {
      filter: record,
      update: { $set: record },
      upsert: true
    }
  }))

  const result = operations.length
    ? await collection.bulkWrite(operations, { ordered: false })
    : undefined

  console.log(JSON.stringify({
    collection: 'coletaneas',
    recordsRead: records.length,
    uniqueRecords: uniqueRecords.length,
    inserted: result?.upsertedCount ?? 0,
    updated: result?.modifiedCount ?? 0,
    alreadyPresent: result ? uniqueRecords.length - result.upsertedCount - result.modifiedCount : 0
  }, null, 2))
} finally {
  await client.close()
}
