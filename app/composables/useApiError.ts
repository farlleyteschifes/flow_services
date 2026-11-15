export type ApiErrorPayload = {
  statusCode?: number
  statusMessage?: string
  message?: string
  data?: {
    code?: string
    message?: string
    fieldErrors?: Record<string, string[]>
  }
}

export function useApiError() {
  const messageFor = (error: unknown, fallback = 'Não foi possível concluir a operação.') => {
    const payload = error as ApiErrorPayload | undefined
    return payload?.data?.message || payload?.statusMessage || payload?.message || fallback
  }

  return { messageFor }
}
