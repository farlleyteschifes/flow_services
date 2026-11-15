type AuthResponse = {
  data: {
    church: {
      id: string
      name: string
      username: string
    }
    csrfToken?: string
  }
}

export function useAuth() {
  const church = useState<AuthResponse['data']['church'] | null>('auth-church', () => null)
  const csrfToken = useCookie<string | null>('flow_csrf', { default: () => null })

  const login = async (username: string, password: string) => {
    const response = await $fetch<AuthResponse>('/api/auth/login', {
      method: 'POST',
      body: { username, password }
    })

    church.value = response.data.church
    if (response.data.csrfToken) {
      csrfToken.value = response.data.csrfToken
    }
  }

  const logout = async () => {
    await $fetch('/api/auth/logout', {
      method: 'POST',
      headers: csrfToken.value ? { 'x-csrf-token': csrfToken.value } : undefined
    }).catch(() => undefined)

    church.value = null
    csrfToken.value = null
  }

  const changePassword = async (password: string) => {
    await $fetch('/api/auth/password', {
      method: 'POST',
      body: { password },
      headers: csrfToken.value ? { 'x-csrf-token': csrfToken.value } : undefined
    })

    church.value = null
    csrfToken.value = null
  }

  return {
    church,
    csrfToken,
    login,
    logout,
    changePassword
  }
}
