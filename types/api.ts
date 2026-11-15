export type ApiSuccess<T> = {
  data: T
}

export type ApiErrorData = {
  code: string
  message: string
  fieldErrors?: Record<string, string[]>
}
