export type AppErrorCode =
  | 'UNAUTHORIZED'
  | 'FORBIDDEN'
  | 'NOT_FOUND'
  | 'VALIDATION_ERROR'
  | 'EMAIL_TAKEN'
  | 'INVALID_CREDENTIALS'
  | 'NETWORK_ERROR'
  | 'INTERNAL_ERROR'
  | 'UNKNOWN'

export class AppError extends Error {
  readonly code: AppErrorCode
  readonly status?: number
  readonly details?: unknown

  constructor(message: string, code: AppErrorCode, status?: number, details?: unknown) {
    super(message)
    this.name = 'AppError'
    this.code = code
    this.status = status
    this.details = details
  }
}

export function isAppError(error: unknown): error is AppError {
  return error instanceof AppError
}
