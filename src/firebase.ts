import { firebaseConfigFromEnv, initFirebase } from 'firebase-app-kit'

// VITE_FIREBASE_* variables from .env.local and, for anything missing, the firebaseConfig file
// (read by the firebaseAppKit plugin in vite.config.ts). The same for the dev project with test
// data ("Pruebas", chosen in "Acerca de"): VITE_FIREBASE_DEV_* and firebaseConfig.dev.
export const { isConfigured: isFirebaseConfigured, auth, db, environment } = initFirebase(
  firebaseConfigFromEnv(import.meta.env, __FIREBASE_CONFIG__),
  { dev: firebaseConfigFromEnv(import.meta.env, __FIREBASE_DEV_CONFIG__, 'dev') },
)
