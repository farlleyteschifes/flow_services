<script setup lang="ts">
import {
  frequencyItems,
  participantRoles,
  serviceTypes,
  type FrequencyKey,
  type Member,
  type ParticipantRole,
  type Service,
  type ServiceType,
  type Song,
  buildServiceShareText
} from '~/composables/useService'

definePageMeta({ middleware: 'auth' })

const { church, logout } = useAuth()
const {
  getService, createService, changeFrequency, addSong, removeSong,
  addParticipant, removeParticipant, deleteService, searchSongs,
  createSong, searchMembers, createMember
} = useService()
const { messageFor } = useApiError()

const today = new Intl.DateTimeFormat('en-CA', {
  timeZone: 'America/Sao_Paulo', year: 'numeric', month: '2-digit', day: '2-digit'
}).format(new Date())
const selectedDate = ref(today)
const selectedType = ref<ServiceType>('noite')
const service = ref<Service | null>(null)
const loading = ref(false)
const actionPending = ref(false)
const errorMessage = ref('')
const savedMessage = ref('')

const songSearch = ref('')
const songOptions = ref<Song[]>([])
const newSongNumber = ref<number | undefined>()
const newSongName = ref('')
const songPending = ref(false)

const memberDrafts = reactive<Record<ParticipantRole, string>>({ worship: '', word: '', gate: '' })
const memberOptions = reactive<Record<ParticipantRole, Member[]>>({ worship: [], word: [], gate: [] })
const selectedMemberIds = reactive<Record<ParticipantRole, string | null>>({ worship: null, word: null, gate: null })
const memberPending = reactive<Record<ParticipantRole, boolean>>({ worship: false, word: false, gate: false })

const serviceTypeLabel = computed(() => serviceTypes.find((item) => item.value === selectedType.value)?.label)
const showSaved = (message = 'Alteração salva.') => {
  savedMessage.value = message
  window.setTimeout(() => { savedMessage.value = '' }, 2500)
}
const handleError = (error: unknown) => { errorMessage.value = messageFor(error) }

const loadService = async (createIfMissing = true) => {
  if (!selectedDate.value) return
  loading.value = true
  errorMessage.value = ''
  service.value = null
  try {
    const response = await getService(selectedDate.value, selectedType.value)
    if (response.data.service) {
      service.value = response.data.service
    } else if (createIfMissing) {
      const created = await createService(selectedDate.value, selectedType.value)
      service.value = created.data.service
      showSaved('Culto iniciado.')
    }
  } catch (error) {
    handleError(error)
  } finally {
    loading.value = false
  }
}

const refreshService = async () => {
  await loadService(false)
  showSaved('Dados atualizados.')
}

const updateFrequency = async (category: FrequencyKey, delta: 1 | -1) => {
  if (!service.value || actionPending.value) return
  actionPending.value = true
  errorMessage.value = ''
  try {
    const response = await changeFrequency(service.value.id, category, delta)
    service.value = response.data.service
    showSaved()
  } catch (error) { handleError(error) } finally { actionPending.value = false }
}

let songSearchSequence = 0
const findSongs = async () => {
  const search = songSearch.value.trim()
  if (!search) { songOptions.value = []; return }
  const sequence = ++songSearchSequence
  try {
    const response = await searchSongs(search)
    if (sequence === songSearchSequence) songOptions.value = response.data.songs
  } catch (error) { handleError(error) }
}

const addSongToService = async (song: Song) => {
  if (!service.value || songPending.value) return
  songPending.value = true
  try {
    const response = await addSong(service.value.id, song.id)
    service.value = response.data.service
    songSearch.value = ''
    songOptions.value = []
    showSaved(response.data.added ? 'Louvor adicionado.' : 'Louvor já estava no culto.')
  } catch (error) { handleError(error) } finally { songPending.value = false }
}

const createAndAddSong = async () => {
  if (newSongNumber.value === undefined || !newSongName.value.trim() || !service.value || songPending.value) return
  songPending.value = true
  try {
    const created = await createSong(newSongNumber.value, newSongName.value)
    const response = await addSong(service.value.id, created.data.song.id)
    service.value = response.data.service
    newSongNumber.value = undefined
    newSongName.value = ''
    showSaved('Louvor cadastrado e adicionado.')
  } catch (error) { handleError(error) } finally { songPending.value = false }
}

const removeSongFromService = async (song: Song) => {
  if (!service.value || songPending.value) return
  songPending.value = true
  try {
    const response = await removeSong(service.value.id, song.id)
    service.value = response.data.service
    showSaved('Louvor removido.')
  } catch (error) { handleError(error) } finally { songPending.value = false }
}

const findMembers = async (role: ParticipantRole) => {
  const search = memberDrafts[role].trim()
  selectedMemberIds[role] = null
  if (!search) { memberOptions[role] = []; return }
  try {
    const response = await searchMembers(search)
    memberOptions[role] = response.data.members
  } catch (error) { handleError(error) }
}

const selectMember = (role: ParticipantRole, member: Member) => {
  memberDrafts[role] = member.name
  selectedMemberIds[role] = member.id
  memberOptions[role] = []
}

const addMemberToRole = async (role: ParticipantRole) => {
  if (!service.value || !memberDrafts[role].trim() || memberPending[role]) return
  memberPending[role] = true
  try {
    let memberId = selectedMemberIds[role]
    if (!memberId) memberId = (await createMember(memberDrafts[role])).data.member.id
    const response = await addParticipant(service.value.id, role, memberId)
    service.value = response.data.service
    memberDrafts[role] = ''
    selectedMemberIds[role] = null
    memberOptions[role] = []
    showSaved(response.data.added ? 'Participante adicionado.' : 'Participante já estava nesta função.')
  } catch (error) { handleError(error) } finally { memberPending[role] = false }
}

const removeMemberFromRole = async (role: ParticipantRole, member: { id: string }) => {
  if (!service.value || memberPending[role]) return
  memberPending[role] = true
  try {
    const response = await removeParticipant(service.value.id, role, member.id)
    service.value = response.data.service
    showSaved('Participante removido.')
  } catch (error) { handleError(error) } finally { memberPending[role] = false }
}

const removeCurrentService = async () => {
  if (!service.value || !window.confirm('Excluir este culto e todos os dados registrados nele?')) return
  actionPending.value = true
  try {
    await deleteService(service.value.id)
    service.value = null
    showSaved('Culto excluído.')
  } catch (error) { handleError(error) } finally { actionPending.value = false }
}

const shareServiceOnWhatsApp = () => {
  if (!service.value) return

  const message = encodeURIComponent(buildServiceShareText(service.value))
  window.open(`https://wa.me/?text=${message}`, '_blank', 'noopener,noreferrer')
}

const logoutAndRedirect = async () => {
  await logout()
  await navigateTo('/login')
}

onMounted(() => loadService())
</script>

<template>
  <section class="container page-section service-page">
    <div class="service-toolbar">
      <div><p class="eyebrow">{{ church?.name }}</p><h1>Registro de culto</h1></div>
      <div class="toolbar-actions">
        <button class="button button--secondary" type="button" :disabled="loading" @click="refreshService">Atualizar</button>
        <button class="button button--secondary" type="button" @click="logoutAndRedirect">Sair</button>
      </div>
    </div>

    <form class="service-selector" @submit.prevent="loadService()">
      <div class="field"><label for="service-date">Data do culto</label><input id="service-date" v-model="selectedDate" type="date" required></div>
      <div class="field"><label for="service-type">Tipo de culto</label><select id="service-type" v-model="selectedType"><option v-for="item in serviceTypes" :key="item.value" :value="item.value">{{ item.label }}</option></select></div>
      <button class="button button--primary" type="submit" :disabled="loading">{{ loading ? 'Carregando...' : 'Abrir culto' }}</button>
    </form>

    <p v-if="errorMessage" class="form-error page-message" role="alert">{{ errorMessage }}</p>
    <p v-if="savedMessage" class="form-success page-message" role="status">{{ savedMessage }}</p>

    <template v-if="service">
      <div class="service-heading">
        <div><p class="eyebrow">{{ service.date }}</p><h2>{{ serviceTypeLabel }}</h2></div>
        <div class="service-heading__actions">
          <button class="button button--whatsapp" type="button" @click="shareServiceOnWhatsApp">Compartilhar no WhatsApp</button>
          <button class="danger-button" type="button" :disabled="actionPending" @click="removeCurrentService">Excluir culto</button>
        </div>
      </div>

      <section class="service-section">
        <div class="section-heading"><div><h2>Frequência</h2><p>Atualizada imediatamente a cada toque.</p></div></div>
        <div class="frequency-grid">
          <article v-for="item in frequencyItems" :key="item.key" class="frequency-card">
            <span>{{ item.label }}</span><strong>{{ service.frequency[item.key] }}</strong>
            <div class="counter-actions">
              <button type="button" :aria-label="`Diminuir ${item.label}`" :disabled="actionPending || service.frequency[item.key] === 0" @click="updateFrequency(item.key, -1)">−</button>
              <button type="button" :aria-label="`Aumentar ${item.label}`" :disabled="actionPending" @click="updateFrequency(item.key, 1)">+</button>
            </div>
          </article>
        </div>
      </section>

      <section class="service-section">
        <div class="section-heading"><div><h2>Lista de louvores</h2><p>Busque um louvor existente ou cadastre um novo.</p></div></div>
        <div class="inline-form autocomplete-field">
          <input v-model="songSearch" type="search" placeholder="Buscar por número ou nome" @input="findSongs">
          <div v-if="songOptions.length" class="suggestions"><button v-for="song in songOptions" :key="song.id" type="button" @click="addSongToService(song)"><strong>{{ song.number }}</strong><span>{{ song.name }}</span></button></div>
        </div>
        <div class="new-record-form"><input v-model.number="newSongNumber" type="number" min="0" placeholder="Número"><input v-model="newSongName" type="text" placeholder="Nome do louvor"><button class="button button--primary" type="button" :disabled="songPending" @click="createAndAddSong">Cadastrar e adicionar</button></div>
        <ul v-if="service.songs.length" class="record-list"><li v-for="song in service.songs" :key="song.id"><span><strong>{{ song.number }}</strong> — {{ song.name }}</span><button class="icon-button" type="button" :aria-label="`Remover ${song.name}`" @click="removeSongFromService(song)">×</button></li></ul>
        <p v-else class="empty-state">Nenhum louvor registrado neste culto.</p>
      </section>

      <section class="service-section">
        <div class="section-heading"><div><h2>Participantes</h2><p>O mesmo membro pode participar de mais de uma função.</p></div></div>
        <div class="participant-grid">
          <article v-for="role in participantRoles" :key="role.key" class="participant-card">
            <h3>{{ role.label }}</h3>
            <div class="inline-form autocomplete-field"><input v-model="memberDrafts[role.key]" type="text" :placeholder="`Nome no ${role.label.toLowerCase()}`" @input="findMembers(role.key)"><div v-if="memberOptions[role.key].length" class="suggestions"><button v-for="member in memberOptions[role.key]" :key="member.id" type="button" @click="selectMember(role.key, member)">{{ member.name }}</button></div></div>
            <button class="button button--primary add-member-button" type="button" :disabled="memberPending[role.key]" @click="addMemberToRole(role.key)">{{ memberPending[role.key] ? 'Adicionando...' : 'Adicionar participante' }}</button>
            <ul v-if="service.participants[role.key].length" class="record-list compact-list"><li v-for="member in service.participants[role.key]" :key="member.id"><span>{{ member.name }}</span><button class="icon-button" type="button" :aria-label="`Remover ${member.name}`" @click="removeMemberFromRole(role.key, member)">×</button></li></ul>
            <p v-else class="empty-state">Nenhum participante.</p>
          </article>
        </div>
      </section>
    </template>
  </section>
</template>
