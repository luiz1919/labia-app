import react from '@vitejs/plugin-react'
import { firebaseAppKit } from 'firebase-app-kit/vite'
import { defineConfig } from 'vite'

// firebaseAppKit defines the version, commit and build date ("Acerca de" / About), reads the
// firebaseConfig file (copied from the Firebase console) for anything missing from .env.local,
// and firebaseConfig.dev for the dev project with test data ("Pruebas"), and generates the
// offline service worker (/sw.js).
export default defineConfig({
  plugins: [
    react(),
    firebaseAppKit({
      firebaseConfigFile: 'firebaseConfig',
      devFirebaseConfigFile: 'firebaseConfig.dev',
      serviceWorker: {
        cacheName: 'labia-v1',
        staticFiles: ['/manifest.webmanifest', '/icons/labia.svg', '/icons/icon-192.png', '/icons/icon-512.png'],
      },
    }),
  ],
})
