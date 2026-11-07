import type { BuildInfo } from 'firebase-app-kit/ui'

// Build constants defined by the firebaseAppKit() plugin, for "Acerca de" (About).
export const BUILD_INFO: BuildInfo = { version: __APP_VERSION__, commit: __APP_COMMIT__, buildTime: __BUILD_TIME__ }
