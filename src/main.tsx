import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { installErrorLog } from 'firebase-app-kit/utils'
// Kit styles first, so the app's own rules can override them.
import 'firebase-app-kit/ui.css'
import './index.css'
import App from './App.tsx'

// Recent errors travel with feedback reports ("Comentarios") when the user allows it.
installErrorLog()

if (import.meta.env.PROD && 'serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    void navigator.serviceWorker.register('/sw.js').catch(console.error)
  })
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
