// Test data for "Pruebas" (the dev Firebase project): words for the pantry ("Despensa") and starred
// searches ("Favoritos"), taken from the app's own content (idioms, phrasal verbs, false friends).
// No Firebase here (src/testData.ts writes them): tested in Node.
import { FALSE_FRIENDS } from './data/falseFriends.ts'
import { IDIOMS } from './data/idioms.ts'
import { PHRASAL_VERBS } from './data/phrasalVerbs.ts'
import { favoriteId, MAX_FAVORITE_TRANSLATIONS } from './favorites.ts'
import type { LanguageCode } from './languages'
import { MAX_ENTRY_LENGTH, pantryKey } from './pantry.ts'

export type TestDataSizeId = 'pocos' | 'bastantes' | 'muchos'

export const TEST_DATA_SIZES: Readonly<Record<TestDataSizeId, { label: string; pantry: number; favorites: number }>> = {
  pocos: { label: 'Pocos (20 palabras)', pantry: 10, favorites: 10 },
  bastantes: { label: 'Bastantes (120 palabras)', pantry: 60, favorites: 60 },
  muchos: { label: 'Muchos (500 palabras)', pantry: 250, favorites: 250 },
}

/** Engines a favorite may come from (src/engines/index.ts). */
const ENGINES = ['wiktionary', 'mymemory', 'ai', 'chrome']

export interface PlannedFavorite {
  id: string
  term: string
  source: LanguageCode
  target: LanguageCode
  translations: string[]
  engine: string
}

export interface PlannedPantryItem {
  text: string
  lang: LanguageCode
  reviewed: boolean
}

export interface TestDataPlan {
  favorites: PlannedFavorite[]
  pantry: PlannedPantryItem[]
}

/** Mulberry32: the same seed gives the same data (tests); the app seeds it with the time. */
export function seededRandom(seed: number): () => number {
  let state = seed >>> 0
  return () => {
    state = (state + 0x6d2b79f5) >>> 0
    let t = state
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

const other = (lang: LanguageCode): LanguageCode => (lang === 'es' ? 'en' : 'es')
const unique = (values: readonly string[]) => [...new Set(values.map(value => value.trim()).filter(Boolean))].slice(0, MAX_FAVORITE_TRANSLATIONS)

/** Every query with its translations the content offers, in both directions. */
export function testEntries(): Omit<PlannedFavorite, 'id' | 'engine'>[] {
  const entries: Omit<PlannedFavorite, 'id' | 'engine'>[] = []
  const add = (term: string, source: LanguageCode, translations: readonly string[]) => {
    const clean = unique(translations)
    if (term.trim() && clean.length) entries.push({ term: term.trim(), source, target: other(source), translations: clean })
  }
  for (const idiom of IDIOMS) {
    for (const expression of idiom.expressions) {
      add(expression.text, expression.lang, idiom.expressions.filter(item => item.lang !== expression.lang).map(item => item.text))
    }
  }
  for (const phrasal of PHRASAL_VERBS) {
    const text = `${phrasal.verb} ${phrasal.particle}`
    const spanish = phrasal.senses.flatMap(sense => sense.translations.es ?? [])
    add(text, 'en', spanish)
    if (spanish[0]) add(spanish[0], 'es', [text])
  }
  for (const pair of FALSE_FRIENDS) for (const word of pair.words) add(word.word, word.lang, word.means)
  return entries
}

function shuffled<T>(random: () => number, values: readonly T[]): T[] {
  const copy = [...values]
  for (let index = copy.length - 1; index > 0; index--) {
    const swap = Math.floor(random() * (index + 1))
    ;[copy[index], copy[swap]] = [copy[swap], copy[index]]
  }
  return copy
}

/**
 * Favorites and pantry words for a size, leaving out those the user already has (`existing`:
 * favorite ids and pantryKey()s), so generating twice never repeats a word. There may be fewer
 * than asked once the content runs out.
 */
export function planTestData(sizeId: TestDataSizeId, random: () => number, existing: { favorites: ReadonlySet<string>; pantry: ReadonlySet<string> }): TestDataPlan {
  const size = TEST_DATA_SIZES[sizeId]
  const entries = shuffled(random, testEntries())
  const favorites: PlannedFavorite[] = []
  const favoriteIds = new Set(existing.favorites)
  for (const entry of entries) {
    if (favorites.length === size.favorites) break
    const id = favoriteId(entry.term, entry)
    if (favoriteIds.has(id)) continue
    favoriteIds.add(id)
    favorites.push({ ...entry, id, engine: ENGINES[Math.floor(random() * ENGINES.length)] })
  }
  const pantry: PlannedPantryItem[] = []
  const pantryKeys = new Set(existing.pantry)
  for (const entry of shuffled(random, entries)) {
    if (pantry.length === size.pantry) break
    const key = pantryKey(entry.term, entry.source)
    if (pantryKeys.has(key) || entry.term.length > MAX_ENTRY_LENGTH) continue
    pantryKeys.add(key)
    pantry.push({ text: entry.term, lang: entry.source, reviewed: random() < 0.4 })
  }
  return { favorites, pantry }
}

/** "Creadas 10 palabras en la Despensa y 10 favoritos.", for the user. */
export function testDataSummary(plan: TestDataPlan): string {
  const words = plan.pantry.length === 1 ? '1 palabra' : `${plan.pantry.length.toLocaleString('es')} palabras`
  const favorites = plan.favorites.length === 1 ? '1 favorito' : `${plan.favorites.length.toLocaleString('es')} favoritos`
  return `Creadas ${words} en la Despensa y ${favorites}.`
}
