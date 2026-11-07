// The app's sections. The current one lives in the URL hash (#/expresiones), so the phone's back
// button and links work without a router.

export const SCREENS = [
  { id: 'buscar', label: 'Buscar' },
  { id: 'expresiones', label: 'Expresiones' },
  { id: 'falsos-amigos', label: 'Falsos amigos' },
  { id: 'diferencias', label: 'Diferencias' },
  { id: 'phrasal-verbs', label: 'Phrasal verbs' },
] as const

export type ScreenId = (typeof SCREENS)[number]['id']

export const DEFAULT_SCREEN: ScreenId = 'buscar'

export function screenFromHash(hash: string): ScreenId {
  const id = hash.replace(/^#\/?/, '').split(/[/?]/)[0]
  return SCREENS.find(screen => screen.id === id)?.id ?? DEFAULT_SCREEN
}

export function screenHash(id: ScreenId): string {
  return id === DEFAULT_SCREEN ? '#/' : `#/${id}`
}
