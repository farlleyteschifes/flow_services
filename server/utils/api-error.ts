export type ApiFieldErrors = Record<string, string[]>

export class ApiError extends Error {
  readonly statusCode: number
  readonly code: string
  readonly fieldErrors?: ApiFieldErrors

  constructor(
    statusCode: number,
    code: string,
    message: string,
    fieldErrors?: ApiFieldErrors
  ) {
    super(message)
    this.name = 'ApiError'
    this.statusCode = statusCode
    this.code = code
    this.fieldErrors = fieldErrors
  }
}

export function badRequest(message: string, fieldErrors?: ApiFieldErrors) {
  return new ApiError(400, 'BAD_REQUEST', message, fieldErrors)
}

export function unauthorized(message = 'Autenticação necessária.') {
  return new ApiError(401, 'UNAUTHORIZED', message)
}

export function forbidden(message = 'Você não tem permissão para esta operação.') {
  return new ApiError(403, 'FORBIDDEN', message)
}

export function notFound(message = 'Registro não encontrado.') {
  return new ApiError(404, 'NOT_FOUND', message)
}

export function conflict(message: string) {
  return new ApiError(409, 'CONFLICT', message)
}
