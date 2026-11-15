<script setup lang="ts">
const username = ref('')
const password = ref('')
const pending = ref(false)
const errorMessage = ref('')
const { login } = useAuth()

const submit = async () => {
  pending.value = true
  errorMessage.value = ''

  try {
    await login(username.value, password.value)
    await navigateTo('/cultos')
  } catch (error) {
    errorMessage.value = useApiError().messageFor(error, 'Não foi possível entrar. Verifique seus dados.')
  } finally {
    pending.value = false
  }
}
</script>

<template>
  <section class="container page-section auth-page">
    <div class="auth-card">
      <p class="eyebrow">Acesso da igreja</p>
      <h1>Entrar no Flow Services</h1>
      <p class="auth-card__description">Use o código e a senha compartilhados pelos responsáveis da igreja.</p>

      <form class="auth-form" @submit.prevent="submit">
        <div class="field">
          <label for="username">Usuário</label>
          <input
            id="username"
            v-model="username"
            inputmode="numeric"
            maxlength="6"
            autocomplete="username"
            placeholder="123456"
            required
          >
        </div>

        <div class="field">
          <label for="password">Senha</label>
          <input
            id="password"
            v-model="password"
            type="password"
            autocomplete="current-password"
            required
          >
        </div>

        <p v-if="errorMessage" class="form-error" role="alert">{{ errorMessage }}</p>
        <button class="button button--primary auth-form__submit" type="submit" :disabled="pending">
          {{ pending ? 'Entrando...' : 'Entrar' }}
        </button>
      </form>
    </div>
  </section>
</template>
