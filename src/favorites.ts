// Favorite searches: the star on an answer of "¿Cómo se dice?" saves the query, its direction
// and the translations of that answer, so the list under "Favoritos" shows them without
// searching again. Each one is a Firestore document in users/{uid}/favorites/{id}, with an id
// made from the direction and the query: the same query is one favorite on every device.
import type { EngineAnswer } from './engines/types'
import type { LanguageCode, LanguagePair } from './languages'
import { normalize } from './search.ts'

export const MAX_FAVORITE_TRANSLATIONS = 8
export const MAX_FAVORITE_TERM = 200
const MAX_TRANSLATION_LENGTH = 200

export interface Favorite {
  id: string
  term: string
  pair: LanguagePair
  /** The first translations of the answer that was starred. */
  translations: string[]
  /** The engine that gave that answer. */
  engine: string
  /** Milliseconds; 0 while the server has not set it yet. */
  createdAt: number
}

/** Same query and direction, same id (case, accents and punctuation ignored). */
export function favoriteId(term: string, { source, target }: LanguagePair): string {
  const key = normalize(term).slice(0, MAX_FAVORITE_TERM) || term.trim().toLowerCase()
  return `${source}-${target}-${encodeURIComponent(key)}`
}

/** The translations kept from an answer: the first items of its groups, each once. */
export function favoriteTranslations(answer: EngineAnswer): string[] {
  const texts = answer.groups.flatMap(group => group.items.map(item => item.text.trim().slice(0, MAX_TRANSLATION_LENGTH)))
  return [...new Set(texts.filter(Boolean))].slice(0, MAX_FAVORITE_TRANSLATIONS)
}

/** Reads a stored favorite; null when malformed or in a language the app no longer has. */
export function parseFavorite(id: string, data: unknown, languages: readonly string[]): Favorite | null {
  if (typeof data !== 'object' || data === null) return null
  const { term, source, target, translations, engine, createdAt } = data as Record<string, unknown>
  if (typeof term !== 'string' || !term.trim()) return null
  if (typeof source !== 'string' || typeof target !== 'string' || source === target || !languages.includes(source) || !languages.includes(target)) return null
  const millis = typeof (createdAt as { toMillis?: unknown } | null)?.toMillis === 'function' ? (createdAt as { toMillis: () => number }).toMillis() : 0
  return {
    id,
    term: term.trim(),
    pair: { source: source as LanguageCode, target: target as LanguageCode },
    translations: Array.isArray(translations) ? translations.filter((text): text is string => typeof text === 'string' && text.trim() !== '').map(text => text.trim()) : [],
    engine: typeof engine === 'string' ? engine : '',
    createdAt: millis,
  }
}

export type FavoriteOrder = 'recent' | 'alphabetical'

/**
 * Favorites matching a filter (in the query or its translations, ignoring case and accents),
 * newest first or alphabetically.
 */
export function filterFavorites(favorites: readonly Favorite[], filter: string, order: FavoriteOrder): Favorite[] {
  const wanted = normalize(filter)
  const found = wanted ? favorites.filter(favorite => [favorite.term, ...favorite.translations].some(text => normalize(text).includes(wanted))) : [...favorites]
  if (order === 'alphabetical') {
    const collator = new Intl.Collator('es', { sensitivity: 'base' })
    return found.sort((first, second) => collator.compare(first.term, second.term))
  }
  const time = (favorite: Favorite) => favorite.createdAt || Number.MAX_SAFE_INTEGER
  return found.sort((first, second) => time(second) - time(first))
}
