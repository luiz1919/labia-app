import { firebaseConfigFromEnv, initFirebase } from 'firebase-app-kit'

// VITE_FIREBASE_* variables from .env.local and, for anything missing, the firebaseConfig file
// (read by the firebaseAppKit plugin in vite.config.ts).
export const { isConfigured: isFirebaseConfigured, auth, db } = initFirebase(
  firebaseConfigFromEnv(import.meta.env, __FIREBASE_CONFIG__),
)
