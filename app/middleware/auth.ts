export default defineNuxtRouteMiddleware(async () => {
  const { church } = useAuth()
  const headers = import.meta.server ? useRequestHeaders(['cookie']) : undefined

  try {
    const response = await $fetch<{
      data: {
        church: {
          id: string
          name: string
          username: string
        }
        csrfToken?: string
      }
    }>('/api/auth/me', { headers })

    church.value = response.data.church
  } catch {
    return navigateTo('/login')
  }
})
