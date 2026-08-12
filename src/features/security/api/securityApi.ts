import { apiClient } from '@/shared/api/apiClient'

export const securityApi = {
  requestOtp: async (email: string) => {
    const { data } = await apiClient.post<{ sent: boolean; demoCode?: string }>(
      '/security/otp/request',
      { email },
    )
    return data
  },
  verifyOtp: async (email: string, code: string) => {
    const { data } = await apiClient.post<{ verified: boolean }>('/security/otp/verify', {
      email,
      code,
    })
    return data
  },
  enable2fa: async () => {
    const { data } = await apiClient.post<{ enabled: boolean; secret: string; qrPayload: string }>(
      '/security/2fa/enable',
    )
    return data
  },
  disable2fa: async () => {
    const { data } = await apiClient.post<{ enabled: boolean }>('/security/2fa/disable')
    return data
  },
  sessions: async () => {
    const { data } = await apiClient.get<{
      items: Array<{
        id: string
        deviceLabel: string
        ip: string
        userAgent: string
        lastActiveAt: string
      }>
    }>('/security/sessions')
    return data.items
  },
  registerSession: async (deviceLabel: string) => {
    const { data } = await apiClient.post('/security/sessions/register', { deviceLabel })
    return data
  },
  revokeSession: async (id: string) => {
    const { data } = await apiClient.post(`/security/sessions/${id}/revoke`)
    return data
  },
  audit: async () => {
    const { data } = await apiClient.get<{
      items: Array<{ id: string; action: string; resource: string; createdAt: string }>
    }>('/security/audit')
    return data.items
  },
  permissions: async () => {
    const { data } = await apiClient.get<{ role: string; permissions: string[] }>(
      '/security/permissions',
    )
    return data
  },
  captchaChallenge: async () => {
    const { data } = await apiClient.get<{ question: string; token: string }>(
      '/security/captcha/challenge',
    )
    return data
  },
  captchaVerify: async (token: string, answer: number) => {
    const { data } = await apiClient.post<{ ok: boolean }>('/security/captcha/verify', {
      token,
      answer,
    })
    return data
  },
  oauth: async (provider: 'google' | 'apple', email: string, fullName: string) => {
    const { data } = await apiClient.post(`/security/oauth/${provider}`, { email, fullName })
    return data
  },
}
