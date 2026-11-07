import { AboutButton, LoginForm } from 'firebase-app-kit/ui'
import { BUILD_INFO } from './buildInfo'
import { auth } from './firebase'

export default function LoginScreen({ sessionError }: { sessionError: string }) {
  return (
    <div className="app-shell login-shell">
      <header className="app-header"><div className="header-brand"><div className="brand"><img src="/icons/labia.svg" width="36" height="36" alt="" /><span>Labia</span></div><AboutButton appName="Labia" build={BUILD_INFO} /></div></header>
      <main className="login-main">
        <div className="login-heading"><img src="/icons/labia.svg" width="52" height="52" alt="" /><h1>Iniciar sesión</h1></div>
        <LoginForm auth={auth} sessionError={sessionError} />
      </main>
    </div>
  )
}
