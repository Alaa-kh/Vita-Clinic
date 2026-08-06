import axios from 'axios'
import { AppError, type AppErrorCode } from '@/shared/errors/AppError'

interface ApiErrorBody {
  message?: string
  code?: string
}

const CODE_MAP: Record<string, AppErrorCode> = {
  UNAUTHORIZED: 'UNAUTHORIZED',
  FORBIDDEN: 'FORBIDDEN',
  NOT_FOUND: 'NOT_FOUND',
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  EMAIL_TAKEN: 'EMAIL_TAKEN',
  INVALID_CREDENTIALS: 'INVALID_CREDENTIALS',
  INTERNAL_ERROR: 'INTERNAL_ERROR',
}

export function mapApiError(error: unknown): AppError {
  if (error instanceof AppError) {
    return error
  }

  if (!axios.isAxiosError(error)) {
    return new AppError('Something went wrong', 'UNKNOWN')
  }

  if (!error.response) {
    return new AppError('Unable to reach the server', 'NETWORK_ERROR')
  }

  const body = error.response.data as ApiErrorBody | undefined
  const code: AppErrorCode =
    body?.code && CODE_MAP[body.code] ? CODE_MAP[body.code]! : 'UNKNOWN'
  const message = body?.message ?? 'Request failed'

  return new AppError(message, code, error.response.status, body)
}
