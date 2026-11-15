import type { H3Event } from 'h3'
import { createError, setResponseHeader } from 'h3'
import { ApiError } from './api-error'

export type ApiSuccess<T> = {
  data: T
}

export function apiSuccess<T>(data: T): ApiSuccess<T> {
  return { data }
}

export function apiError(event: H3Event, error: unknown) {
  if (error instanceof ApiError) {
    setResponseHeader(event, 'cache-control', 'no-store')
    throw createError({
      statusCode: error.statusCode,
      statusMessage: error.message,
      data: {
        code: error.code,
        message: error.message,
        ...(error.fieldErrors ? { fieldErrors: error.fieldErrors } : {})
      }
    })
  }

  setResponseHeader(event, 'cache-control', 'no-store')
  throw createError({
    statusCode: 500,
    statusMessage: 'Não foi possível concluir a solicitação.',
    data: {
      code: 'INTERNAL_ERROR',
      message: 'Não foi possível concluir a solicitação.'
    }
  })
}
