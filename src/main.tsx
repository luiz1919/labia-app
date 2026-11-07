import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
// Kit styles first, so the app's own rules can override them.
import 'firebase-app-kit/ui.css'
import './index.css'
import App from './App.tsx'

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
