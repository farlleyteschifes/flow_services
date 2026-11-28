<script setup lang="ts">
import {
  frequencyItems,
  participantRoles,
  serviceTypes,
  worshipGroups,
  type FrequencyKey,
  type Member,
  type ParticipantRole,
  type Service,
  type ServiceType,
  type Song,
  type WorshipGroup,
  buildServiceShareText,
  buildSongListShareText,
  formatServiceDate,
  serviceTypeLabel
} from '~/composables/useService'

definePageMeta({ middleware: 'auth' })

const { church, logout } = useAuth()
const {
  getService, createService, changeFrequency, setFrequency, addSong, removeSong,
  updateObservation,
  addParticipant, removeParticipant, deleteService, searchSongs, searchCollectionSongs, addGroup,
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
const frequencyMonitorOpen = ref(false)
const frequencyMonitorPending = ref(false)
let frequencyMonitorInterval: ReturnType<typeof setInterval> | undefined

const songSearch = ref('')
const songOptions = ref<Song[]>([])
const songPending = ref(false)
const selectedSongGroup = ref<WorshipGroup>('louvor')

const memberDrafts = reactive<Record<ParticipantRole, string>>({ worship: '', word: '', gate: '' })
const memberOptions = reactive<Record<ParticipantRole, Member[]>>({ worship: [], word: [], gate: [] })
const selectedMemberIds = reactive<Record<ParticipantRole, string | null>>({ worship: null, word: null, gate: null })
const memberPending = reactive<Record<ParticipantRole, boolean>>({ worship: false, word: false, gate: false })
const frequencyDrafts = reactive<Record<FrequencyKey, number>>({ adults: 0, visitors: 0, children: 0, visitingChildren: 0 })
const frequencySteps = reactive<Record<FrequencyKey, number>>({ adults: 1, visitors: 1, children: 1, visitingChildren: 1 })
const observationPending = ref(false)

const showSaved = (message = 'Alteração salva.') => {
  savedMessage.value = message
  window.setTimeout(() => { savedMessage.value = '' }, 2500)
}
const handleError = (error: unknown) => { errorMessage.value = messageFor(error) }
const syncFrequencyDrafts = (currentService: Service) => {
  for (const item of frequencyItems) frequencyDrafts[item.key] = currentService.frequency[item.key]
}

const frequencyMonitorTotals = computed(() => {
  const frequency = service.value?.frequency
  const adultVisitors = frequency?.visitors ?? 0
  const visitingChildren = frequency?.visitingChildren ?? 0
  const adultMembers = frequency?.adults ?? 0
  const memberChildren = frequency?.children ?? 0

  return {
    visitors: adultVisitors + visitingChildren,
    members: adultMembers + memberChildren,
    general: adultVisitors + visitingChildren + adultMembers + memberChildren
  }
})

const refreshFrequencyMonitor = async () => {
  if (!frequencyMonitorOpen.value || frequencyMonitorPending.value) return
  frequencyMonitorPending.value = true
  try {
    const response = await getService(selectedDate.value, selectedType.value)
    if (response.data.service) {
      service.value = response.data.service
      syncFrequencyDrafts(response.data.service)
    }
  } catch (error) {
    handleError(error)
  } finally {
    frequencyMonitorPending.value = false
  }
}

const closeFrequencyMonitor = () => {
  frequencyMonitorOpen.value = false
  if (frequencyMonitorInterval) {
    clearInterval(frequencyMonitorInterval)
    frequencyMonitorInterval = undefined
  }
}

const openFrequencyMonitor = async () => {
  frequencyMonitorOpen.value = true
  await refreshFrequencyMonitor()
  frequencyMonitorInterval = setInterval(() => { void refreshFrequencyMonitor() }, 5000)
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

const saveObservation = async () => {
  if (!service.value || observationPending.value) return
  const observation = service.value.observation.trim()

  observationPending.value = true
  errorMessage.value = ''
  try {
    const response = await updateObservation(service.value.id, observation)
    service.value = response.data.service
    showSaved()
  } catch (error) {
    handleError(error)
  } finally {
    observationPending.value = false
  }
}

let songSearchSequence = 0
const findSongs = async () => {
  const search = songSearch.value.trim()
  if (!search) { songOptions.value = []; return }
  const sequence = ++songSearchSequence
  try {
    const [catalogResponse, collectionResponse] = await Promise.all([
      searchSongs(search),
      searchCollectionSongs(search)
    ])
    if (sequence === songSearchSequence) {
      const results = [...collectionResponse.data.songs, ...catalogResponse.data.songs]
      const seen = new Set<string>()
      songOptions.value = results.filter((song) => {
        const key = `${song.number ?? 'avulso'}:${song.name.toLocaleLowerCase('pt-BR')}`
        if (seen.has(key)) return false
        seen.add(key)
        return true
      })
    }
  } catch (error) { handleError(error) }
}

const addSongToService = async (song: Song) => {
  if (!service.value || songPending.value || song.kind === 'group') return
  songPending.value = true
  try {
    const songId = song.source === 'coletanea'
      ? (await createSong(song.number, song.name, false, song.collectionName)).data.song.id
      : song.id
    const response = await addSong(service.value.id, songId, song.source === 'coletanea' ? song.collectionName : undefined, selectedSongGroup.value)
    service.value = response.data.service
    songSearch.value = ''
    songOptions.value = []
    showSaved(response.data.added ? 'Louvor adicionado.' : 'Louvor já estava no culto.')
  } catch (error) { handleError(error) } finally { songPending.value = false }
}

const addGroupToService = async () => {
  if (!service.value || songPending.value) return
  songPending.value = true
  try {
    const response = await addGroup(service.value.id, selectedSongGroup.value)
    service.value = response.data.service
    showSaved('Grupo adicionado à lista.')
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
onBeforeUnmount(closeFrequencyMonitor)
</script>

<template>
  <section class="container page-section service-page">
    <div class="service-toolbar">
      <div class="service-toolbar__title"><p class="eyebrow">{{ church?.name }}</p><h1>Registro de culto</h1></div>
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
        <div class="service-heading__info" aria-label="Informações do culto">
          <span class="service-tag service-tag--date"><small>Data</small>{{ formatServiceDate(service.date) }}</span>
          <span class="service-tag service-tag--type">
            <small>Tipo</small>
            <span v-if="service.type === 'noite'" class="service-tag__icon" aria-hidden="true">🌙</span>
            <span v-else-if="service.type === 'ebd'" class="service-tag__icon" aria-hidden="true">☀️</span>
            {{ serviceTypeLabel(service.type) }}
          </span>
        </div>
        <div class="service-heading__actions">
          <button class="button button--whatsapp" type="button" aria-label="Compartilhar no WhatsApp" title="Compartilhar no WhatsApp" @click="shareServiceOnWhatsApp"><span class="action-label action-label--full">Compartilhar no WhatsApp</span><span class="action-icon action-icon--mobile" aria-hidden="true">↗</span><span class="action-label action-label--mobile">WhatsApp</span></button>
          <button class="button button--monitor" type="button" aria-label="Monitorar frequência" title="Monitorar frequência" @click="openFrequencyMonitor"><span class="action-label action-label--full">Monitorar frequência</span><span class="action-icon action-icon--mobile" aria-hidden="true">◉</span><span class="action-label action-label--mobile">Monitorar</span></button>
          <button class="danger-button" type="button" aria-label="Excluir culto" title="Excluir culto" :disabled="actionPending" @click="removeCurrentService"><span class="action-label action-label--full">Excluir culto</span><span class="action-icon action-icon--mobile" aria-hidden="true">×</span></button>
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
              <button class="counter-button counter-button--decrease" type="button" :aria-label="`Diminuir ${item.label}`" :disabled="actionPending || service.frequency[item.key] === 0" @click="updateFrequency(item.key, -1)">−</button>
              <button class="counter-button counter-button--increase" type="button" :aria-label="`Aumentar ${item.label}`" :disabled="actionPending" @click="updateFrequency(item.key, 1)">+</button>
            </div>
          </article>
          </div>
        </div>
      </details>

      <details class="service-section service-accordion">
        <summary class="accordion-summary"><span><strong>Lista de Louvores</strong><small>{{ service.songs.length }} registrado(s)</small></span><span class="accordion-icon" aria-hidden="true">⌄</span></summary>
        <div class="accordion-content">
        <p class="section-helper">Busque por número ou por palavras do nome do louvor. Os resultados das coletâneas são ranqueados por relevância.</p>
        <div class="song-group-control">
          <label for="song-group">Grupo responsável</label>
          <select id="song-group" v-model="selectedSongGroup" class="song-group-select">
            <option v-for="group in worshipGroups" :key="group.value" :value="group.value">{{ group.label }}</option>
          </select>
          <button class="button button--secondary" type="button" :disabled="songPending" @click="addGroupToService">Adicionar grupo</button>
        </div>
        <div class="inline-form autocomplete-field">
          <input v-model="songSearch" type="search" placeholder="Número ou nome do louvor" @input="findSongs">
          <div v-if="songOptions.length" class="suggestions"><button v-for="song in songOptions" :key="`${song.source ?? 'catalog'}-${song.id}`" type="button" @click="addSongToService(song)"><strong>{{ song.isLoose ? 'Avulso' : song.number }}</strong><span>{{ song.name }}<small v-if="song.collectionName">{{ song.collectionName }}</small></span></button></div>
        </div>
        <ul v-if="service.songs.length" class="record-list">
          <li v-for="song in service.songs" :key="song.id" :class="{ 'song-group-record': song.kind === 'group' }">
            <span v-if="song.kind === 'group'" class="song-group-record__label">{{ worshipGroups.find((group) => group.value === song.group)?.label ?? song.group }}</span>
            <span v-else class="song-record-label"><span><strong>{{ song.isLoose ? 'Avulso' : song.number }}</strong> — {{ song.name }}</span><small v-if="song.collectionName">{{ song.collectionName }}</small><small v-if="song.group">{{ worshipGroups.find((group) => group.value === song.group)?.label }}</small></span>
            <button class="icon-button" type="button" :aria-label="`Remover ${song.kind === 'group' ? 'grupo' : song.name}`" @click="removeSongFromService(song)">×</button>
          </li>
        </ul>
        <p v-else class="empty-state">Nenhum louvor registrado neste culto.</p>
        <div class="section-actions">
          <button class="button button--whatsapp button--whatsapp-secondary" type="button" @click="shareSongListOnWhatsApp">Compartilhar louvores</button>
        </div>
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

      <details class="service-section service-accordion">
        <summary class="accordion-summary"><span><strong>Observação</strong><small>Campo opcional</small></span><span class="accordion-icon" aria-hidden="true">⌄</span></summary>
        <div class="accordion-content">
          <p class="section-helper">Registre qualquer informação importante sobre este culto.</p>
          <div class="field observation-field">
            <label for="service-observation">Observação</label>
            <textarea id="service-observation" v-model="service.observation" rows="5" maxlength="5000" placeholder="Digite uma observação (opcional)" :disabled="observationPending" @blur="saveObservation"></textarea>
            <small class="field-hint">{{ service.observation.length }}/5000</small>
          </div>
        </div>
      </details>
    </template>

    <Teleport to="body">
      <div v-if="frequencyMonitorOpen" class="frequency-monitor" role="dialog" aria-modal="true" aria-labelledby="frequency-monitor-title">
        <div class="frequency-monitor__content">
          <div class="frequency-monitor__header">
            <div>
              <p class="eyebrow">{{ church?.name }}</p>
              <div class="frequency-monitor__title-row">
                <h2 id="frequency-monitor-title">Frequência do culto</h2>
                <span class="frequency-monitor__live" aria-label="Monitoramento ativo"><span aria-hidden="true"></span>Monitorando</span>
              </div>
              <p class="frequency-monitor__context">
                {{ formatServiceDate(service?.date ?? selectedDate) }} · {{ serviceTypeLabel(service?.type ?? selectedType) }}
              </p>
            </div>
            <button class="frequency-monitor__close" type="button" aria-label="Fechar monitoramento" @click="closeFrequencyMonitor">×</button>
          </div>

          <div class="frequency-monitor__cards">
            <article v-for="item in frequencyItems" :key="item.key" class="frequency-monitor__card">
              <span>{{ item.label }}</span>
              <strong>{{ service?.frequency[item.key] ?? 0 }}</strong>
            </article>
          </div>

          <div class="frequency-monitor__totals">
            <article class="frequency-monitor__total-visitors">
              <span>Total de Visitantes</span>
              <strong>{{ frequencyMonitorTotals.visitors }}</strong>
            </article>
            <article class="frequency-monitor__total-members">
              <span>Total de Membros</span>
              <strong>{{ frequencyMonitorTotals.members }}</strong>
            </article>
            <article class="frequency-monitor__total-general">
              <span>Total Geral</span>
              <strong>{{ frequencyMonitorTotals.general }}</strong>
            </article>
          </div>

          <p class="frequency-monitor__status" role="status">
            Atualização automática a cada 5 segundos<span v-if="frequencyMonitorPending"> · Atualizando...</span>
          </p>
        </div>
      </div>
    </Teleport>
  </section>
</template>
