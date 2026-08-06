import type { AppErrorCode } from '@/shared/errors/AppError'

const ERROR_KEY_MAP: Record<AppErrorCode, string> = {
  UNAUTHORIZED: 'errors.unauthorized',
  FORBIDDEN: 'errors.forbidden',
  NOT_FOUND: 'errors.notFound',
  VALIDATION_ERROR: 'errors.validation',
  EMAIL_TAKEN: 'errors.emailTaken',
  INVALID_CREDENTIALS: 'errors.invalidCredentials',
  NETWORK_ERROR: 'errors.network',
  INTERNAL_ERROR: 'errors.generic',
  UNKNOWN: 'errors.generic',
}

export function errorMessageKey(code: AppErrorCode): string {
  return ERROR_KEY_MAP[code]
}
