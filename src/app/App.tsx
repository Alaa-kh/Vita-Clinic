import { AppProviders } from '@/app/providers/AppProviders'
import { AppRouter } from '@/app/router/routes'
import '@/app/styles/global.scss'

export function App() {
  return (
    <AppProviders>
      <AppRouter />
    </AppProviders>
  )
}
