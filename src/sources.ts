// External dictionaries under "Más diccionarios": plain links opened in a new tab (no API, no
// key, no scraping). The answers inside the app come from src/engines/. Each source says which
// language pairs it supports, so adding a language only needs its codes here.
import type { LanguageCode, LanguagePair } from './languages'

export interface LinkSource {
  id: string
  name: string
  /** What the site is good for (Spanish, shown in the UI). */
  description: string
  /** Link for the query, or null if the site does not support the pair. */
  url: (term: string, pair: LanguagePair) => string | null
}

export interface SourceLink {
  source: LinkSource
  url: string
}

// WordReference has one dictionary per pair: wordreference.com/esen/..., /enes/...
const WORDREFERENCE_PAIRS = new Set(['esen', 'enes'])

// Reverso Context names languages in English in its links: /translation/spanish-english/...
const REVERSO_NAMES: Readonly<Record<LanguageCode, string>> = { es: 'spanish', en: 'english' }

export const LINK_SOURCES: readonly LinkSource[] = [
  {
    id: 'wordreference',
    name: 'WordReference',
    description: 'Diccionario con expresiones y foros',
    url: (term, { source, target }) => WORDREFERENCE_PAIRS.has(source + target)
      ? `https://www.wordreference.com/${source}${target}/${encodeURIComponent(term)}`
      : null,
  },
  {
    id: 'reverso-context',
    name: 'Reverso Context',
    description: 'Ejemplos reales en contexto',
    url: (term, { source, target }) => `https://context.reverso.net/translation/${REVERSO_NAMES[source]}-${REVERSO_NAMES[target]}/${encodeURIComponent(term)}`,
  },
  {
    id: 'google-translate',
    name: 'Google Traductor',
    description: 'Traducción automática de frases',
    url: (term, { source, target }) => `https://translate.google.com/?${new URLSearchParams({ sl: source, tl: target, text: term, op: 'translate' })}`,
  },
]

/** Links for a query, in LINK_SOURCES order. Empty for a blank query. */
export function sourceLinks(term: string, pair: LanguagePair, sources: readonly LinkSource[] = LINK_SOURCES): SourceLink[] {
  const query = term.trim().replace(/\s+/g, ' ')
  if (!query) return []
  return sources.flatMap(source => {
    const url = source.url(query, pair)
    return url ? [{ source, url }] : []
  })
}
