<script setup lang="ts">
definePageMeta({ middleware: 'auth' })

const { church, logout, changePassword } = useAuth()
const newPassword = ref('')
const passwordMessage = ref('')
const passwordError = ref('')
const changingPassword = ref(false)

const submitPassword = async () => {
  changingPassword.value = true
  passwordMessage.value = ''
  passwordError.value = ''

  try {
    await changePassword(newPassword.value)
    await navigateTo('/login')
  } catch (error) {
    passwordError.value = useApiError().messageFor(error)
  } finally {
    changingPassword.value = false
  }
}
</script>

<template>
  <section class="container page-section">
    <div class="dashboard-card">
      <div>
        <p class="eyebrow">Área da igreja</p>
        <h1>Olá, {{ church?.name }}.</h1>
        <p>O registro dos cultos será disponibilizado nesta área.</p>
      </div>
      <button class="button button--secondary" type="button" @click="logout">Sair</button>
    </div>

    <div class="password-card">
      <h2>Alterar senha</h2>
      <p>A alteração encerra todas as sessões atuais e exige novo login.</p>
      <form class="auth-form" @submit.prevent="submitPassword">
        <div class="field">
          <label for="new-password">Nova senha</label>
          <input id="new-password" v-model="newPassword" type="password" minlength="8" required>
        </div>
        <p v-if="passwordError" class="form-error" role="alert">{{ passwordError }}</p>
        <p v-if="passwordMessage" class="form-success" role="status">{{ passwordMessage }}</p>
        <button class="button button--primary" type="submit" :disabled="changingPassword">
          {{ changingPassword ? 'Alterando...' : 'Alterar senha' }}
        </button>
      </form>
    </div>
  </section>
</template>
