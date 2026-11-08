// The app's sections. The current one lives in the URL hash (#/expresiones), so the phone's back
// button and links work without a router. The bottom bar has four tabs; the content sections
// hang from "Aprender" (Learn) and "Ajustes" (Settings) from the header.

export const TABS = [
  { id: 'buscar', label: 'Buscar' },
  { id: 'aprender', label: 'Aprender' },
  { id: 'pronunciar', label: 'Pronunciar' },
  { id: 'asistente', label: 'Asistente' },
] as const

export type TabId = (typeof TABS)[number]['id']

export const SCREENS = [
  { id: 'buscar', label: 'Buscar', tab: 'buscar' },
  { id: 'aprender', label: 'Aprender', tab: 'aprender' },
  { id: 'expresiones', label: 'Expresiones', tab: 'aprender' },
  { id: 'falsos-amigos', label: 'Falsos amigos', tab: 'aprender' },
  { id: 'diferencias', label: 'Diferencias', tab: 'aprender' },
  { id: 'phrasal-verbs', label: 'Phrasal verbs', tab: 'aprender' },
  { id: 'pronunciar', label: 'Pronunciar', tab: 'pronunciar' },
  { id: 'asistente', label: 'Asistente', tab: 'asistente' },
  { id: 'ajustes', label: 'Ajustes', tab: null },
] as const satisfies readonly { id: string; label: string; tab: TabId | null }[]

export type ScreenId = (typeof SCREENS)[number]['id']

export const DEFAULT_SCREEN: ScreenId = 'buscar'

export function screenFromHash(hash: string): ScreenId {
  const id = hash.replace(/^#\/?/, '').split(/[/?]/)[0]
  return SCREENS.find(screen => screen.id === id)?.id ?? DEFAULT_SCREEN
}

export function screenHash(id: ScreenId): string {
  return id === DEFAULT_SCREEN ? '#/' : `#/${id}`
}

/** Tab highlighted in the bottom bar for a screen (none for settings). */
export function tabOf(id: ScreenId): TabId | null {
  return SCREENS.find(screen => screen.id === id)?.tab ?? null
}
