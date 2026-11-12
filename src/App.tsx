import { useEffect, useMemo, useState } from 'react'
import { signOut } from 'firebase/auth'
import type { User } from 'firebase/auth'
import { ArrowLeft, LogOut, Settings } from 'lucide-react'
import { useAuthUser, useFeedbackAdmin } from 'firebase-app-kit/react'
import { AboutPage, EnvBanner, FeedbackButton, SyncStatus } from 'firebase-app-kit/ui'
import { ABOUT } from './about'
import { BUILD_INFO } from './buildInfo'
import BottomNav from './components/BottomNav'
import EnginePreferencesProvider from './components/EnginePreferencesProvider'
import PairPicker from './components/PairPicker'
import SpeechProvider from './components/SpeechProvider'
import { auth, db, environment } from './firebase'
import type { LanguageCode } from './languages'
import LoginScreen from './LoginScreen'
import { hashDetail, screenFromHash, tabOf } from './screens'
import type { ScreenId } from './screens'
import AssistantScreen from './screens/AssistantScreen'
import ConfusablesScreen from './screens/ConfusablesScreen'
import FalseFriendsScreen from './screens/FalseFriendsScreen'
import IdiomsScreen from './screens/IdiomsScreen'
import LearnScreen from './screens/LearnScreen'
import PantryScreen from './screens/PantryScreen'
import PhrasalVerbsScreen from './screens/PhrasalVerbsScreen'
import PronounceScreen from './screens/PronounceScreen'
import SearchScreen from './screens/SearchScreen'
import SettingsScreen from './screens/SettingsScreen'
import { sharedQuery } from './share'
import { idiomRoute } from './subpage'
import { testDataActions } from './testData'
import useAiSettings from './useAiSettings'
import useOwnIdioms from './useOwnIdioms'
import useUserSettings from './useUserSettings'

const SYNC_DETAILS = {
  synced: 'Tus preferencias están guardadas en Firebase.',
  offline: 'Sin conexión: los cambios se guardan en este dispositivo y se subirán al volver la conexión.',
}

function currentRoute(): { screen: ScreenId; detail: string[] } {
  return { screen: screenFromHash(window.location.hash), detail: hashDetail(window.location.hash) }
}

/** Current section and the page below it, from the URL hash (#/expresiones/nueva). */
function useScreen() {
  const [route, setRoute] = useState(currentRoute)
  useEffect(() => {
    const update = () => {
      setRoute(currentRoute())
      window.scrollTo(0, 0)
    }
    window.addEventListener('hashchange', update)
    return () => window.removeEventListener('hashchange', update)
  }, [])
  return route
}

function Home({ user, loggingOut, onLogout }: { user: User; loggingOut: boolean; onLogout: () => void }) {
  const settings = useUserSettings(user.uid)
  const ai = useAiSettings(user.uid)
  // Read here because "Buscar", "Aprender" and "Expresiones" all show them.
  const ownIdioms = useOwnIdioms(user.uid)
  const { screen, detail } = useScreen()
  // The expression form brings its own way back and keeps the pair it was opened with.
  const subpage = screen === 'expresiones' && idiomRoute(detail).page !== 'list'
  // "Pruebas" (dev project): admins may switch to it in "Acerca de", where the test data tools live.
  const isAdmin = useFeedbackAdmin(db, user.uid)
  const testData = useMemo(
    () => (db && environment.current === 'dev' ? testDataActions(db, user.uid, environment) : undefined),
    [user.uid],
  )
  const { pair } = settings
  // Text shared from another app (Android "Share" > Labia) arrives as ?text=... and goes to the search.
  const [term, setTerm] = useState(() => sharedQuery(window.location.search))
  const tab = tabOf(screen)

  useEffect(() => {
    if (window.location.search) window.history.replaceState(null, '', `${window.location.pathname}${window.location.hash || '#/'}`)
  }, [])

  function searchFor(text: string, lang: LanguageCode) {
    if (lang !== pair.source) settings.changePair({ source: lang, target: pair.source })
    setTerm(text)
    window.location.hash = '#/'
  }

  return (
    <div className="app-shell">
      <EnvBanner environment={environment} />
      <header className="app-header">
        <div className="header-brand"><a className="brand" href="#/" aria-label="Labia, inicio"><img src="/icons/labia.svg" width="36" height="36" alt="" /><span>Labia</span></a></div>
        <div className="account-actions">
          <span className="account-email" title={user.email ?? ''}>{user.email}</span>
          <FeedbackButton db={db} user={user} appName="Labia" build={BUILD_INFO} githubRepo="luiz1919/labia-app" environment={environment} />
          <SyncStatus state={settings.syncState} error={settings.error} details={SYNC_DETAILS} />
          <a className="icon-button" href="#/ajustes" aria-label="Ajustes" title="Ajustes" aria-current={screen === 'ajustes' || screen === 'acerca' ? 'page' : undefined}><Settings size={20} /></a>
          <button className="icon-button" type="button" onClick={onLogout} disabled={loggingOut} aria-label="Cerrar sesión" title="Cerrar sesión"><LogOut size={20} /></button>
        </div>
      </header>
      <main>
        {settings.error && <p className="error-message" role="alert">{settings.error}</p>}
        {tab === 'aprender' && screen !== 'aprender' && !subpage && <a className="back-link" href="#/aprender"><ArrowLeft size={18} aria-hidden="true" />Aprender</a>}
        {screen !== 'ajustes' && screen !== 'acerca' && !subpage && <PairPicker pair={pair} onChange={settings.changePair} />}
        {screen === 'buscar' && <SearchScreen uid={user.uid} pair={pair} term={term} onTermChange={setTerm} onPairChange={settings.changePair} settings={ai.settings} ownIdioms={ownIdioms.idioms} />}
        {screen === 'aprender' && <LearnScreen pair={pair} ownIdioms={ownIdioms.idioms} />}
        {screen === 'expresiones' && <IdiomsScreen pair={pair} detail={detail} ownIdioms={ownIdioms} />}
        {screen === 'falsos-amigos' && <FalseFriendsScreen pair={pair} />}
        {screen === 'diferencias' && <ConfusablesScreen pair={pair} />}
        {screen === 'phrasal-verbs' && <PhrasalVerbsScreen pair={pair} />}
        {screen === 'pronunciar' && <PronounceScreen pair={pair} />}
        {screen === 'despensa' && <PantryScreen uid={user.uid} pair={pair} settings={ai.settings} onSearch={searchFor} />}
        {screen === 'asistente' && <AssistantScreen pair={pair} settings={ai.settings} ready={ai.ready} onSearch={searchFor} />}
        {screen === 'ajustes' && <SettingsScreen pair={pair} settings={ai.settings} actions={ai.actions} error={ai.error} />}
        {screen === 'acerca' && <AboutPage {...ABOUT} environment={environment} canSwitchEnvironment={isAdmin} testData={testData} back={{ label: 'Ajustes', href: '#/ajustes' }} />}
      </main>
      <BottomNav current={tab} />
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
  return (
    <SpeechProvider>
      <EnginePreferencesProvider>
        {logoutError && <p className="error-message session-error" role="alert">{logoutError}</p>}
        <Home key={user.uid} user={user} loggingOut={loggingOut} onLogout={() => { void logout() }} />
      </EnginePreferencesProvider>
    </SpeechProvider>
  )
}
