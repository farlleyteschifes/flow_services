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
  buildServiceShareText,
  buildSongListShareText
} from '~/composables/useService'

definePageMeta({ middleware: 'auth' })

const { church, logout } = useAuth()
const {
  getService, createService, changeFrequency, setFrequency, addSong, removeSong,
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
const newSongIsLoose = ref(false)
const songPending = ref(false)

const memberDrafts = reactive<Record<ParticipantRole, string>>({ worship: '', word: '', gate: '' })
const memberOptions = reactive<Record<ParticipantRole, Member[]>>({ worship: [], word: [], gate: [] })
const selectedMemberIds = reactive<Record<ParticipantRole, string | null>>({ worship: null, word: null, gate: null })
const memberPending = reactive<Record<ParticipantRole, boolean>>({ worship: false, word: false, gate: false })
const frequencyDrafts = reactive<Record<FrequencyKey, number>>({ adults: 0, visitors: 0, children: 0, visitingChildren: 0 })
const frequencySteps = reactive<Record<FrequencyKey, number>>({ adults: 1, visitors: 1, children: 1, visitingChildren: 1 })

const serviceTypeLabel = computed(() => serviceTypes.find((item) => item.value === selectedType.value)?.label)
const showSaved = (message = 'Alteração salva.') => {
  savedMessage.value = message
  window.setTimeout(() => { savedMessage.value = '' }, 2500)
}
const handleError = (error: unknown) => { errorMessage.value = messageFor(error) }
const syncFrequencyDrafts = (currentService: Service) => {
  for (const item of frequencyItems) frequencyDrafts[item.key] = currentService.frequency[item.key]
}

const loadService = async (createIfMissing = true) => {
  if (!selectedDate.value) return
  loading.value = true
  errorMessage.value = ''
  service.value = null
  try {
    const response = await getService(selectedDate.value, selectedType.value)
    if (response.data.service) {
      service.value = response.data.service
      syncFrequencyDrafts(response.data.service)
    } else if (createIfMissing) {
      const created = await createService(selectedDate.value, selectedType.value)
      service.value = created.data.service
      syncFrequencyDrafts(created.data.service)
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

const updateFrequency = async (category: FrequencyKey, direction: 1 | -1) => {
  if (!service.value || actionPending.value) return
  const step = Number(frequencySteps[category])

  if (!Number.isInteger(step) || step < 1 || step > 1000) {
    errorMessage.value = 'A quantidade deve ser um número inteiro entre 1 e 1000.'
    frequencySteps[category] = 1
    return
  }

  const delta = direction * step
  actionPending.value = true
  errorMessage.value = ''
  try {
    const response = await changeFrequency(service.value.id, category, delta)
    service.value = response.data.service
    syncFrequencyDrafts(response.data.service)
    showSaved()
  } catch (error) { handleError(error) } finally { actionPending.value = false }
}

const setFrequencyValue = async (category: FrequencyKey) => {
  if (!service.value || actionPending.value) return
  const value = Number(frequencyDrafts[category])

  if (!Number.isInteger(value) || value < 0) {
    frequencyDrafts[category] = service.value.frequency[category]
    errorMessage.value = 'Informe um número inteiro igual ou maior que zero.'
    return
  }

  if (value === service.value.frequency[category]) return
  actionPending.value = true
  errorMessage.value = ''
  try {
    const response = await setFrequency(service.value.id, category, value)
    service.value = response.data.service
    syncFrequencyDrafts(response.data.service)
    showSaved()
  } catch (error) {
    frequencyDrafts[category] = service.value.frequency[category]
    handleError(error)
  } finally {
    actionPending.value = false
  }
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
  if ((!newSongIsLoose.value && newSongNumber.value === undefined) || !newSongName.value.trim() || !service.value || songPending.value) return
  songPending.value = true
  try {
    const created = await createSong(newSongIsLoose.value ? null : newSongNumber.value!, newSongName.value, newSongIsLoose.value)
    const response = await addSong(service.value.id, created.data.song.id)
    service.value = response.data.service
    newSongNumber.value = undefined
    newSongName.value = ''
    newSongIsLoose.value = false
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

  const message = encodeURIComponent(buildServiceShareText(service.value, church.value?.name ?? 'Igreja'))
  window.open(`https://wa.me/?text=${message}`, '_blank', 'noopener,noreferrer')
}

const shareSongListOnWhatsApp = () => {
  if (!service.value) return

  const message = encodeURIComponent(buildSongListShareText(service.value, church.value?.name ?? 'Igreja'))
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
      <div class="field field--compact"><label for="service-date">Data do culto</label><input id="service-date" v-model="selectedDate" type="date" aria-label="Data do culto" required></div>
      <div class="field field--compact"><label for="service-type">Tipo de culto</label><select id="service-type" v-model="selectedType" aria-label="Tipo de culto"><option v-for="item in serviceTypes" :key="item.value" :value="item.value">{{ item.label }}</option></select></div>
      <button class="button button--primary" type="submit" :disabled="loading">{{ loading ? 'Carregando...' : 'Abrir culto' }}</button>
    </form>

    <p v-if="errorMessage" class="form-error page-message" role="alert">{{ errorMessage }}</p>
    <p v-if="savedMessage" class="form-success page-message" role="status">{{ savedMessage }}</p>

    <template v-if="service">
      <div class="service-heading">
        <div><p class="eyebrow">{{ service.date }}</p><h2>{{ serviceTypeLabel }}</h2></div>
        <div class="service-heading__actions">
          <button class="button button--whatsapp" type="button" @click="shareServiceOnWhatsApp">Compartilhar no WhatsApp</button>
          <button class="button button--whatsapp button--whatsapp-secondary" type="button" @click="shareSongListOnWhatsApp">Compartilhar louvores</button>
          <button class="danger-button" type="button" :disabled="actionPending" @click="removeCurrentService">Excluir culto</button>
        </div>
      </div>

      <details class="service-section service-accordion" open>
        <summary class="accordion-summary"><span><strong>Frequência</strong><small>Contagem do culto</small></span><span class="accordion-icon" aria-hidden="true">⌄</span></summary>
        <div class="accordion-content">
          <div class="frequency-grid">
          <article v-for="item in frequencyItems" :key="item.key" class="frequency-card">
            <span>{{ item.label }}</span>
            <input v-model.number="frequencyDrafts[item.key]" class="frequency-input" type="number" min="0" step="1" :aria-label="`Informar ${item.label}`" @change="setFrequencyValue(item.key)">
            <div class="counter-actions">
              <input v-model.number="frequencySteps[item.key]" class="frequency-step-input" type="number" min="1" max="1000" step="1" :aria-label="`Quantidade para alterar ${item.label}`">
              <button type="button" :aria-label="`Diminuir ${item.label}`" :disabled="actionPending || service.frequency[item.key] === 0" @click="updateFrequency(item.key, -1)">−</button>
              <button type="button" :aria-label="`Aumentar ${item.label}`" :disabled="actionPending" @click="updateFrequency(item.key, 1)">+</button>
            </div>
          </article>
          </div>
        </div>
      </details>

      <details class="service-section service-accordion">
        <summary class="accordion-summary"><span><strong>Lista de Louvores</strong><small>{{ service.songs.length }} registrado(s)</small></span><span class="accordion-icon" aria-hidden="true">⌄</span></summary>
        <div class="accordion-content">
        <p class="section-helper">Busque um louvor existente ou cadastre um novo.</p>
        <div class="inline-form autocomplete-field">
          <input v-model="songSearch" type="search" placeholder="Buscar por número ou nome" @input="findSongs">
          <div v-if="songOptions.length" class="suggestions"><button v-for="song in songOptions" :key="song.id" type="button" @click="addSongToService(song)"><strong>{{ song.isLoose ? 'Avulso' : song.number }}</strong><span>{{ song.name }}</span></button></div>
        </div>
        <div class="new-record-form"><input v-model.number="newSongNumber" type="number" min="0" placeholder="Número" :disabled="newSongIsLoose"><input v-model="newSongName" type="text" placeholder="Nome do louvor"><label class="loose-toggle"><input v-model="newSongIsLoose" type="checkbox"> Avulso</label><button class="button button--primary" type="button" :disabled="songPending" @click="createAndAddSong">Cadastrar e adicionar</button></div>
        <ul v-if="service.songs.length" class="record-list"><li v-for="song in service.songs" :key="song.id"><span><strong>{{ song.isLoose ? 'Avulso' : song.number }}</strong> — {{ song.name }}</span><button class="icon-button" type="button" :aria-label="`Remover ${song.name}`" @click="removeSongFromService(song)">×</button></li></ul>
        <p v-else class="empty-state">Nenhum louvor registrado neste culto.</p>
        </div>
      </details>

      <details class="service-section service-accordion">
        <summary class="accordion-summary"><span><strong>Responsáveis</strong><small>{{ service.participants.worship.length + service.participants.word.length + service.participants.gate.length }} registrado(s)</small></span><span class="accordion-icon" aria-hidden="true">⌄</span></summary>
        <div class="accordion-content">
        <p class="section-helper">O mesmo membro pode participar de mais de uma função.</p>
        <div class="participant-grid">
          <article v-for="role in participantRoles" :key="role.key" class="participant-card">
            <h3>{{ role.label }}</h3>
            <div class="inline-form autocomplete-field"><input v-model="memberDrafts[role.key]" type="text" :placeholder="`Nome no ${role.label.toLowerCase()}`" @input="findMembers(role.key)"><div v-if="memberOptions[role.key].length" class="suggestions"><button v-for="member in memberOptions[role.key]" :key="member.id" type="button" @click="selectMember(role.key, member)">{{ member.name }}</button></div></div>
            <button class="button button--primary add-member-button" type="button" :disabled="memberPending[role.key]" @click="addMemberToRole(role.key)">{{ memberPending[role.key] ? 'Adicionando...' : 'Adicionar participante' }}</button>
            <ul v-if="service.participants[role.key].length" class="record-list compact-list"><li v-for="member in service.participants[role.key]" :key="member.id"><span>{{ member.name }}</span><button class="icon-button" type="button" :aria-label="`Remover ${member.name}`" @click="removeMemberFromRole(role.key, member)">×</button></li></ul>
            <p v-else class="empty-state">Nenhum participante.</p>
          </article>
        </div>
        </div>
      </details>
    </template>
  </section>
</template>
