import { Outlet } from 'react-router-dom'
import { useAuthBootstrap } from '@/features/auth/hooks/useAuthBootstrap'
import { useAuth } from '@/features/auth/hooks/useAuth'
import { Spinner } from '@/shared/components/Spinner/Spinner'
import { ThemeToggle } from '@/shared/components/ThemeToggle/ThemeToggle'
import styles from '@/app/layouts/AuthLayout.module.scss'

export function AuthLayout() {
  const { bootstrapped, status } = useAuth()
  useAuthBootstrap()

  if (!bootstrapped || status === 'hydrating') {
    return <Spinner />
  }

  return (
    <div className={styles.shell}>
      <div className={styles.themeSlot}>
        <ThemeToggle />
      </div>
      <Outlet />
    </div>
  )
}
