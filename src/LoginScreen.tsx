import { AboutButton, EnvBanner, LoginForm } from 'firebase-app-kit/ui'
import { ABOUT } from './about'
import { auth, environment } from './firebase'

export default function LoginScreen({ sessionError }: { sessionError: string }) {
  return (
    <div className="app-shell login-shell">
      <EnvBanner environment={environment} />
      {/* Nobody is signed in yet: only "Volver a Real" while in Pruebas. */}
      <header className="app-header"><div className="header-brand"><div className="brand"><img src="/icons/labia.svg" width="36" height="36" alt="" /><span>Labia</span></div><AboutButton {...ABOUT} environment={environment} /></div></header>
      <main className="login-main">
        <div className="login-heading"><img src="/icons/labia.svg" width="52" height="52" alt="" /><h1>Iniciar sesión</h1></div>
        <LoginForm auth={auth} sessionError={sessionError} />
      </main>
    </div>
  )
}
