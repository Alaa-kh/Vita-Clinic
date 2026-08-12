import { useEffect, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { useAuth } from '@/features/auth/hooks/useAuth'
import { securityApi } from '@/features/security/api/securityApi'
import { Button } from '@/shared/components/Button/Button'
import { Spinner } from '@/shared/components/Spinner/Spinner'
import { QUERY_KEYS } from '@/shared/constants/queryKeys'
import styles from '@/features/platform/pages/Platform.module.scss'

export function SecurityPage() {
  const { t } = useTranslation()
  const { user } = useAuth()
  const queryClient = useQueryClient()
  const [otpCode, setOtpCode] = useState('')
  const [otpDemo, setOtpDemo] = useState('')
  const [captcha, setCaptcha] = useState<{ question: string; token: string } | null>(null)
  const [captchaAnswer, setCaptchaAnswer] = useState('')
  const [captchaOk, setCaptchaOk] = useState<boolean | null>(null)
  const [twoFaSecret, setTwoFaSecret] = useState('')

  const sessionsQuery = useQuery({
    queryKey: QUERY_KEYS.security.sessions,
    queryFn: securityApi.sessions,
  })
  const auditQuery = useQuery({
    queryKey: QUERY_KEYS.security.audit,
    queryFn: securityApi.audit,
  })
  const permissionsQuery = useQuery({
    queryKey: QUERY_KEYS.security.permissions,
    queryFn: securityApi.permissions,
  })

  useEffect(() => {
    void securityApi.registerSession(`${navigator.platform} · ${navigator.language}`)
    void securityApi.captchaChallenge().then(setCaptcha)
  }, [])

  const otpMutation = useMutation({
    mutationFn: async () => {
      if (!user?.email) throw new Error('No email')
      return securityApi.requestOtp(user.email)
    },
    onSuccess: (data) => setOtpDemo(data.demoCode ?? ''),
  })

  const verifyMutation = useMutation({
    mutationFn: async () => {
      if (!user?.email) throw new Error('No email')
      return securityApi.verifyOtp(user.email, otpCode)
    },
  })

  const enable2fa = useMutation({
    mutationFn: () => securityApi.enable2fa(),
    onSuccess: (data) => setTwoFaSecret(data.secret),
  })

  const revokeMutation = useMutation({
    mutationFn: (id: string) => securityApi.revokeSession(id),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: QUERY_KEYS.security.sessions })
    },
  })

  return (
    <div className={`container ${styles.page}`}>
      <header className={styles.hero}>
        <p className={styles.eyebrow}>{t('platform.security')}</p>
        <h1>{t('security.title')}</h1>
        <p>{t('security.subtitle')}</p>
      </header>

      <div className={styles.grid2}>
        <div className={styles.panel}>
          <h2>{t('security.otp2fa')}</h2>
          <div className={styles.actions}>
            <Button type="button" onClick={() => otpMutation.mutate()}>
              {t('security.sendOtp')}
            </Button>
            <Button type="button" variant="secondary" onClick={() => enable2fa.mutate()}>
              {t('security.enable2fa')}
            </Button>
          </div>
          {otpDemo ? <p className={styles.muted}>{t('security.demoOtp', { code: otpDemo })}</p> : null}
          <div className={styles.composer} style={{ marginTop: '1rem' }}>
            <input
              className={styles.input}
              value={otpCode}
              onChange={(e) => setOtpCode(e.target.value)}
              placeholder={t('security.otpPlaceholder')}
            />
            <Button type="button" onClick={() => verifyMutation.mutate()}>
              {t('security.verifyOtp')}
            </Button>
          </div>
          {verifyMutation.data?.verified ? <p>{t('security.otpOk')}</p> : null}
          {twoFaSecret ? <p className={styles.muted}>2FA secret: {twoFaSecret}</p> : null}

          <h3 style={{ marginTop: '1.5rem' }}>{t('security.captcha')}</h3>
          {captcha ? <p>{captcha.question}</p> : null}
          <div className={styles.composer}>
            <input
              className={styles.input}
              value={captchaAnswer}
              onChange={(e) => setCaptchaAnswer(e.target.value)}
            />
            <Button
              type="button"
              variant="secondary"
              onClick={async () => {
                if (!captcha) return
                const result = await securityApi.captchaVerify(captcha.token, Number(captchaAnswer))
                setCaptchaOk(result.ok)
              }}
            >
              {t('security.verifyCaptcha')}
            </Button>
          </div>
          {captchaOk !== null ? <p>{captchaOk ? t('security.captchaOk') : t('security.captchaFail')}</p> : null}
        </div>

        <div className={styles.grid}>
          <div className={styles.panel}>
            <h3>{t('security.rbac')}</h3>
            {permissionsQuery.isLoading ? <Spinner /> : null}
            <p className={styles.muted}>{permissionsQuery.data?.role}</p>
            <ul className={styles.list}>
              {permissionsQuery.data?.permissions.map((p) => (
                <li key={p} className={styles.listItem}>
                  <span>{p}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className={styles.panel}>
            <h3>{t('security.sessions')}</h3>
            <ul className={styles.list}>
              {sessionsQuery.data?.map((s) => (
                <li key={s.id} className={styles.listItem}>
                  <div>
                    <strong>{s.deviceLabel}</strong>
                    <div className={styles.muted}>
                      {s.ip} · {new Date(s.lastActiveAt).toLocaleString()}
                    </div>
                  </div>
                  <Button type="button" size="sm" variant="danger" onClick={() => revokeMutation.mutate(s.id)}>
                    {t('security.revoke')}
                  </Button>
                </li>
              ))}
            </ul>
          </div>

          <div className={styles.panel}>
            <h3>{t('security.audit')}</h3>
            <ul className={styles.list}>
              {auditQuery.data?.slice(0, 8).map((log) => (
                <li key={log.id} className={styles.listItem}>
                  <span>{log.action}</span>
                  <span className={styles.muted}>{new Date(log.createdAt).toLocaleString()}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}
