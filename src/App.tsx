import { useEffect, useState } from 'react'
import { signOut } from 'firebase/auth'
import type { User } from 'firebase/auth'
import { LogOut } from 'lucide-react'
import { useAuthUser } from 'firebase-app-kit/react'
import { AboutButton, SyncStatus } from 'firebase-app-kit/ui'
import { BUILD_INFO } from './buildInfo'
import BottomNav from './components/BottomNav'
import PairPicker from './components/PairPicker'
import { auth } from './firebase'
import LoginScreen from './LoginScreen'
import { screenFromHash } from './screens'
import type { ScreenId } from './screens'
import ConfusablesScreen from './screens/ConfusablesScreen'
import FalseFriendsScreen from './screens/FalseFriendsScreen'
import IdiomsScreen from './screens/IdiomsScreen'
import PhrasalVerbsScreen from './screens/PhrasalVerbsScreen'
import SearchScreen from './screens/SearchScreen'
import useUserSettings from './useUserSettings'

const SYNC_DETAILS = {
  synced: 'Tus preferencias están guardadas en Firebase.',
  offline: 'Sin conexión: los cambios se guardan en este dispositivo y se subirán al volver la conexión.',
}

/** Current section, from the URL hash (#/expresiones). */
function useScreen(): ScreenId {
  const [screen, setScreen] = useState(() => screenFromHash(window.location.hash))
  useEffect(() => {
    const update = () => {
      setScreen(screenFromHash(window.location.hash))
      window.scrollTo(0, 0)
    }
    window.addEventListener('hashchange', update)
    return () => window.removeEventListener('hashchange', update)
  }, [])
  return screen
}

function Home({ user, loggingOut, onLogout }: { user: User; loggingOut: boolean; onLogout: () => void }) {
  const settings = useUserSettings(user.uid)
  const screen = useScreen()
  const { pair } = settings

  return (
    <div className="app-shell">
      <header className="app-header">
        <div className="header-brand"><a className="brand" href="#/" aria-label="Labia, inicio"><img src="/icons/labia.svg" width="36" height="36" alt="" /><span>Labia</span></a><AboutButton appName="Labia" build={BUILD_INFO} /></div>
        <div className="account-actions">
          <span className="account-email" title={user.email ?? ''}>{user.email}</span>
          <SyncStatus state={settings.syncState} error={settings.error} details={SYNC_DETAILS} />
          <button className="icon-button" type="button" onClick={onLogout} disabled={loggingOut} aria-label="Cerrar sesión" title="Cerrar sesión"><LogOut size={20} /></button>
        </div>
      </header>
      <main>
        {settings.error && <p className="error-message" role="alert">{settings.error}</p>}
        <PairPicker pair={pair} onChange={settings.changePair} />
        {screen === 'buscar' && <SearchScreen pair={pair} />}
        {screen === 'expresiones' && <IdiomsScreen pair={pair} />}
        {screen === 'falsos-amigos' && <FalseFriendsScreen pair={pair} />}
        {screen === 'diferencias' && <ConfusablesScreen pair={pair} />}
        {screen === 'phrasal-verbs' && <PhrasalVerbsScreen pair={pair} />}
      </main>
      <BottomNav current={screen} />
    </div>
  )
}

export default function App() {
  const { user, ready, error: sessionError } = useAuthUser(auth)
  const [loggingOut, setLoggingOut] = useState(false)
  const [logoutError, setLogoutError] = useState('')

  async function logout() {
    if (!auth || loggingOut) return
    setLoggingOut(true)
    setLogoutError('')
    try {
      await signOut(auth)
    } catch {
      setLogoutError('No se ha podido cerrar la sesión. Inténtalo de nuevo.')
    } finally {
      setLoggingOut(false)
    }
  }

  if (!ready) return <div className="session-loading" role="status">Comprobando sesión...</div>
  if (!user) return <LoginScreen sessionError={sessionError} />
  return <>{logoutError && <p className="error-message session-error" role="alert">{logoutError}</p>}<Home key={user.uid} user={user} loggingOut={loggingOut} onLogout={() => { void logout() }} /></>
}
