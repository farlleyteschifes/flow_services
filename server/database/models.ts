import type { ObjectId } from 'mongodb'

export const SERVICE_TYPES = ['madrugada', 'meio-dia', 'noite', 'ebd'] as const
export type ServiceType = (typeof SERVICE_TYPES)[number]

export type Frequency = {
  adults: number
  visitors: number
  children: number
  visitingChildren: number
}

export type ChurchDocument = {
  _id?: ObjectId
  name: string
  username: string
  usernameNormalized: string
  passwordHash: string
  sessionVersion: number
  createdAt: Date
  updatedAt: Date
}

export type MemberDocument = {
  _id?: ObjectId
  churchId: ObjectId
  name: string
  normalizedName: string
  active: boolean
  createdAt: Date
  updatedAt: Date
  deactivatedAt?: Date
}

export type SongDocument = {
  _id?: ObjectId
  number: number | null
  isLoose: boolean
  normalizedName: string
  name: string
  createdAt: Date
  updatedAt: Date
}

export type SongCollectionDocument = {
  _id?: ObjectId
  collectionName: string
  songNumber: number
  songName: string
}

export type SongSnapshot = {
  songId?: ObjectId
  number: number | null
  isLoose: boolean
  name: string
  collectionName?: string
}

export type MemberSnapshot = {
  memberId?: ObjectId
  name: string
}

export type ServiceDocument = {
  _id?: ObjectId
  churchId: ObjectId
  dateKey: string
  type: ServiceType
  frequency: Frequency
  songs: SongSnapshot[]
  participants: {
    worship: MemberSnapshot[]
    word: MemberSnapshot[]
    gate: MemberSnapshot[]
  }
  createdAt: Date
  updatedAt: Date
}
