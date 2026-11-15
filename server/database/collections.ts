import type { Collection } from 'mongodb'
import type {
  ChurchDocument,
  MemberDocument,
  ServiceDocument,
  SongDocument
} from './models'
import { getDatabase } from './mongodb'

export async function churchesCollection(): Promise<Collection<ChurchDocument>> {
  return (await getDatabase()).collection<ChurchDocument>('churches')
}

export async function membersCollection(): Promise<Collection<MemberDocument>> {
  return (await getDatabase()).collection<MemberDocument>('members')
}

export async function songsCollection(): Promise<Collection<SongDocument>> {
  return (await getDatabase()).collection<SongDocument>('songs')
}

export async function servicesCollection(): Promise<Collection<ServiceDocument>> {
  return (await getDatabase()).collection<ServiceDocument>('services')
}
