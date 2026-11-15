<script setup lang="ts">
const isOnline = ref(true)
const hasChecked = ref(false)

const updateStatus = () => {
  isOnline.value = navigator.onLine
  hasChecked.value = true
}

onMounted(() => {
  updateStatus()
  window.addEventListener('online', updateStatus)
  window.addEventListener('offline', updateStatus)
})

onBeforeUnmount(() => {
  window.removeEventListener('online', updateStatus)
  window.removeEventListener('offline', updateStatus)
})
</script>

<template>
  <div v-if="hasChecked && !isOnline" class="network-status" role="status">
    Sem conexão. O Flow Services precisa de internet para consultar e salvar dados.
  </div>
</template>
