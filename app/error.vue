<script setup lang="ts">
import type { NuxtError } from '#app'

const props = defineProps<{
  error: NuxtError
}>()

const statusCode = computed(() => props.error.statusCode || 500)
const message = computed(() => {
  if (statusCode.value === 404) {
    return 'A página que você procura não foi encontrada.'
  }

  return 'Não foi possível concluir esta solicitação. Tente novamente.'
})

const clearApplicationError = async () => {
  await clearError({ redirect: '/' })
}
</script>

<template>
  <div class="container page-section error-page">
    <p class="eyebrow">Erro {{ statusCode }}</p>
    <h1>Algo não saiu como esperado.</h1>
    <p>{{ message }}</p>
    <button class="button button--primary" type="button" @click="clearApplicationError">
      Voltar ao início
    </button>
  </div>
</template>
