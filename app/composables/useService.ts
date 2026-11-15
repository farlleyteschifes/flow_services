export const serviceTypes = [
  { value: 'madrugada', label: 'Madrugada' },
  { value: 'meio-dia', label: 'Culto ao meio-dia' },
  { value: 'noite', label: 'Culto à Noite' },
  { value: 'ebd', label: 'EBD' }
] as const

export const frequencyItems = [
  { key: 'adults', label: 'Membros Adultos' },
  { key: 'visitors', label: 'Adultos Visitantes' },
  { key: 'children', label: 'Membros Crianças' },
  { key: 'visitingChildren', label: 'Crianças Visitantes' }
] as const

export const participantRoles = [
  { key: 'worship', label: 'Louvor' },
  { key: 'word', label: 'Palavra' },
  { key: 'gate', label: 'Portão' }
] as const

export type ServiceType = typeof serviceTypes[number]['value']
export type FrequencyKey = typeof frequencyItems[number]['key']
export type ParticipantRole = typeof participantRoles[number]['key']

export type Song = { id: string; number: number | null; isLoose: boolean; name: string }
export type Participant = { id: string; name: string }
export type Service = {
  id: string
  date: string
  type: ServiceType
  frequency: Record<FrequencyKey, number>
  songs: Song[]
  participants: Record<ParticipantRole, Participant[]>
}
export type Member = { id: string; name: string; active: boolean }

export function serviceTypeLabel(type: ServiceType) {
  return serviceTypes.find((item) => item.value === type)?.label ?? type
}

export function formatServiceDate(date: string) {
  const [year, month, day] = date.split('-')
  return `${day}/${month}/${year}`
}

export function buildServiceShareText(service: Service, churchName: string) {
  const totalPresent = Object.values(service.frequency).reduce((total, value) => total + value, 0)
  const lines = [
    `*${churchName} — Registro de culto*`,
    `*Data:* ${formatServiceDate(service.date)}`,
    `*Tipo:* ${serviceTypeLabel(service.type)}`,
    '',
    '*Frequência*',
    ...frequencyItems.map((item) => `• ${item.label}: ${service.frequency[item.key]}`),
    `*Total de presentes: ${totalPresent}*`,
    '',
    '*Louvores*',
    ...(service.songs.length
      ? service.songs.map((song) => `• ${song.isLoose ? 'Avulso' : song.number} — ${song.name}`)
      : ['• Nenhum louvor registrado']),
    '',
    '*Responsáveis*',
    ...participantRoles.map((role) => {
      const names = service.participants[role.key].map((member) => member.name)
      return `${role.label}: ${names.length ? names.join(', ') : 'Nenhum responsável'}`
    })
  ]

  return lines.join('\n')
}

export function buildSongListShareText(service: Service, churchName: string) {
  const lines = [
    `*${churchName} — Registro de culto*`,
    `*Data:* ${formatServiceDate(service.date)}`,
    `*Tipo:* ${serviceTypeLabel(service.type)}`,
    '',
    'Lista de Louvores',
    ...(service.songs.length
      ? service.songs.map((song) => `${song.isLoose ? 'Avulso' : song.number}:${song.name}`)
      : ['Nenhum louvor registrado'])
  ]

  return lines.join('\n')
}

type ApiEnvelope<T> = { data: T }

export function useService() {
  const { csrfToken } = useAuth()
  const mutationHeaders = () => csrfToken.value ? { 'x-csrf-token': csrfToken.value } : undefined

  const getService = (date: string, type: ServiceType) => $fetch<ApiEnvelope<{ service: Service | null }>>(
    '/api/services', { query: { date, type } }
  )
  const createService = (date: string, type: ServiceType) => $fetch<ApiEnvelope<{ service: Service }>>(
    '/api/services', { method: 'POST', body: { date, type }, headers: mutationHeaders() }
  )
  const changeFrequency = (serviceId: string, category: FrequencyKey, delta: number) => $fetch<ApiEnvelope<{ service: Service, changed: boolean }>>(
    `/api/services/${serviceId}/frequency`, { method: 'PATCH', body: { category, delta }, headers: mutationHeaders() }
  )
  const setFrequency = (serviceId: string, category: FrequencyKey, value: number) => $fetch<ApiEnvelope<{ service: Service, changed: boolean }>>(
    `/api/services/${serviceId}/frequency`, { method: 'PUT', body: { category, value }, headers: mutationHeaders() }
  )
  const addSong = (serviceId: string, songId: string) => $fetch<ApiEnvelope<{ service: Service, added: boolean }>>(
    `/api/services/${serviceId}/songs`, { method: 'POST', body: { songId }, headers: mutationHeaders() }
  )
  const removeSong = (serviceId: string, songId: string) => $fetch<ApiEnvelope<{ service: Service, removed: boolean }>>(
    `/api/services/${serviceId}/songs/${songId}`, { method: 'DELETE', headers: mutationHeaders() }
  )
  const addParticipant = (serviceId: string, role: ParticipantRole, memberId: string) => $fetch<ApiEnvelope<{ service: Service, added: boolean }>>(
    `/api/services/${serviceId}/participants`, { method: 'POST', body: { role, memberId }, headers: mutationHeaders() }
  )
  const removeParticipant = (serviceId: string, role: ParticipantRole, memberId: string) => $fetch<ApiEnvelope<{ service: Service, removed: boolean }>>(
    `/api/services/${serviceId}/participants/${role}/${memberId}`, { method: 'DELETE', headers: mutationHeaders() }
  )
  const deleteService = (serviceId: string) => $fetch<ApiEnvelope<{ serviceId: string, deleted: boolean }>>(
    `/api/services/${serviceId}`, { method: 'DELETE', headers: mutationHeaders() }
  )
  const searchSongs = (search: string) => $fetch<ApiEnvelope<{ songs: Song[] }>>('/api/songs', { query: { search, limit: 10 } })
  const createSong = (number: number | null, name: string, isLoose = false) => $fetch<ApiEnvelope<{ song: Song }>>('/api/songs', {
    method: 'POST', body: { number, name, isLoose }, headers: mutationHeaders()
  })
  const searchMembers = (search: string) => $fetch<ApiEnvelope<{ members: Member[] }>>('/api/members', { query: { search, limit: 10 } })
  const createMember = (name: string) => $fetch<ApiEnvelope<{ member: Member }>>('/api/members', {
    method: 'POST', body: { name }, headers: mutationHeaders()
  })

  return {
    getService, createService, changeFrequency, setFrequency, addSong, removeSong,
    addParticipant, removeParticipant, deleteService, searchSongs,
    createSong, searchMembers, createMember
  }
}
