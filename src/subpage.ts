// Pages that open over a section (#/expresiones/nueva) get their own history entry, so the phone's
// back button closes them. Opening one from inside the app marks that entry; closing it then goes
// back to wherever it was opened from (the list, or "Buscar"). Opened from outside (a reload, a
// link), it has nothing of the app behind it, so closing replaces it with the section instead.
import type { MouseEvent } from 'react'

const MARK = 'labiaSubpage'

/** onClick of a link to a subpage. */
export function openSubpage(event: MouseEvent<HTMLAnchorElement>) {
  if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return
  event.preventDefault()
  window.history.pushState({ [MARK]: true }, '', event.currentTarget.href)
  // pushState does not fire hashchange, which is what the app listens to.
  window.dispatchEvent(new HashChangeEvent('hashchange'))
}

export function closeSubpage(fallbackHash: string) {
  const state: unknown = window.history.state
  if (typeof state === 'object' && state !== null && MARK in state) window.history.back()
  else window.location.replace(fallbackHash)
}

export const NEW_IDIOM_HASH = '#/expresiones/nueva'

export function editIdiomHash(id: string): string {
  return `#/expresiones/editar/${encodeURIComponent(id)}`
}

export type IdiomRoute = { page: 'list' } | { page: 'new' } | { page: 'edit'; id: string }

/** The page of "Expresiones" for the rest of its hash (see hashDetail in screens.ts). */
export function idiomRoute(detail: readonly string[]): IdiomRoute {
  if (detail[0] === 'nueva') return { page: 'new' }
  if (detail[0] === 'editar' && detail[1]) return { page: 'edit', id: detail[1] }
  return { page: 'list' }
}
