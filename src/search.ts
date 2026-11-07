// Search over the bundled content. Matching ignores case, accents and punctuation, and a leading
// "to " in English verbs, so "Cantaros", "to get over" or "¿tomar el pelo?" all find their entry.
import { CONFUSABLES } from './data/confusables.ts'
import { FALSE_FRIENDS } from './data/falseFriends.ts'
import { IDIOMS } from './data/idioms.ts'
import { PHRASAL_VERB_LANG, PHRASAL_VERBS } from './data/phrasalVerbs.ts'
import type { Confusable, FalseFriend, FalseFriendWord, Idiom, IdiomExpression, PhrasalVerb } from './data/types'
import type { LanguageCode, LanguagePair } from './languages'

/** Shorter queries match too much to be useful. */
export const MIN_QUERY_LENGTH = 2

export function normalize(text: string): string {
  return text
    .normalize('NFD')
    .replace(/\p{M}/gu, '')
    .toLowerCase()
    .replace(/[‘’]/g, "'")
    .replace(/[^\p{L}\p{N}']+/gu, ' ')
    .trim()
    .replace(/^to /, '')
}

/**
 * How well a normalized query matches a text: 3 same text, 2 the text starts with the query,
 * 1 every query word starts a word of the text, 0 no match.
 */
function score(query: string, text: string): number {
  const target = normalize(text)
  if (query.length < MIN_QUERY_LENGTH || !target) return 0
  if (target === query) return 3
  if (target.startsWith(query)) return 2
  const words = target.split(' ')
  return query.split(' ').every(part => words.some(word => word.startsWith(part))) ? 1 : 0
}

export function matchScore(query: string, text: string): number {
  return score(normalize(query), text)
}

function bestScore(query: string, texts: readonly string[]): number {
  return texts.reduce((best, text) => Math.max(best, score(query, text)), 0)
}

interface Ranked<T> { item: T; score: number; label: string }

/** Best matches first, then shorter texts; without a query, everything in alphabetical order. */
function rank<T>(entries: Ranked<T>[], lang: LanguageCode, limit?: number): T[] {
  const collator = new Intl.Collator(lang, { sensitivity: 'base' })
  return entries
    .sort((first, second) => second.score - first.score || first.label.length - second.label.length || collator.compare(first.label, second.label))
    .slice(0, limit)
    .map(entry => entry.item)
}

function alphabetical<T>(entries: Ranked<T>[], lang: LanguageCode): T[] {
  const collator = new Intl.Collator(lang, { sensitivity: 'base' })
  return entries.sort((first, second) => collator.compare(normalize(first.label), normalize(second.label))).map(entry => entry.item)
}

// Idioms -------------------------------------------------------------------------------------

export interface IdiomMatch {
  idiom: Idiom
  /** The expression in the source language that matched (or the main one). */
  expression: IdiomExpression
}

/** Idioms said in both languages of the pair whose source-language form matches the query (all, without a query). */
export function findIdioms(query: string, pair: LanguagePair, limit?: number): IdiomMatch[] {
  const normalized = normalize(query)
  const entries: Ranked<IdiomMatch>[] = []
  for (const idiom of IDIOMS) {
    if (!idiom.expressions.some(expression => expression.lang === pair.target)) continue
    let best: Ranked<IdiomMatch> | null = null
    for (const expression of idiom.expressions.filter(candidate => candidate.lang === pair.source)) {
      const value = normalized ? bestScore(normalized, [expression.text, ...(expression.keywords ?? [])]) : 1
      if (value > (best?.score ?? 0)) best = { item: { idiom, expression }, score: value, label: expression.text }
    }
    if (best) entries.push(best)
  }
  return normalized ? rank(entries, pair.source, limit) : alphabetical(entries, pair.source)
}

// False friends ------------------------------------------------------------------------------

export interface FalseFriendMatch {
  entry: FalseFriend
  /** The word in the source language. */
  word: FalseFriendWord
  /** The look-alike word in the target language. */
  other: FalseFriendWord
}

export function falseFriendSides(entry: FalseFriend, pair: LanguagePair): FalseFriendMatch | null {
  const word = entry.words.find(candidate => candidate.lang === pair.source)
  const other = entry.words.find(candidate => candidate.lang === pair.target)
  return word && other ? { entry, word, other } : null
}

export function findFalseFriends(query: string, pair: LanguagePair, limit?: number): FalseFriendMatch[] {
  const normalized = normalize(query)
  const entries: Ranked<FalseFriendMatch>[] = []
  for (const entry of FALSE_FRIENDS) {
    const sides = falseFriendSides(entry, pair)
    if (!sides) continue
    const value = normalized ? score(normalized, sides.word.word) : 1
    if (value) entries.push({ item: sides, score: value, label: sides.word.word })
  }
  return normalized ? rank(entries, pair.source, limit) : alphabetical(entries, pair.source)
}

// Phrasal verbs ------------------------------------------------------------------------------

export function phrasalVerbText(phrasal: PhrasalVerb): string {
  return `${phrasal.verb} ${phrasal.particle}`
}

/** The language phrasal verbs are explained in for this pair, or null if English is not in it. */
export function phrasalVerbPartner(pair: LanguagePair): LanguageCode | null {
  if (pair.source === PHRASAL_VERB_LANG) return pair.target
  if (pair.target === PHRASAL_VERB_LANG) return pair.source
  return null
}

/** Matches the English form ("get over", "get") and the meanings in the pair's other language ("superar"). */
export function findPhrasalVerbs(query: string, pair: LanguagePair, limit?: number): PhrasalVerb[] {
  const partner = phrasalVerbPartner(pair)
  if (!partner) return []
  const normalized = normalize(query)
  const entries: Ranked<PhrasalVerb>[] = []
  for (const phrasal of PHRASAL_VERBS) {
    const text = phrasalVerbText(phrasal)
    const meanings = phrasal.senses.flatMap(sense => sense.translations[partner] ?? [])
    const value = normalized ? Math.max(score(normalized, text), bestScore(normalized, meanings)) : 1
    if (value) entries.push({ item: phrasal, score: value, label: text })
  }
  return normalized ? rank(entries, PHRASAL_VERB_LANG, limit) : alphabetical(entries, PHRASAL_VERB_LANG)
}

// Confusing words ----------------------------------------------------------------------------

/** Sets in either language of the pair whose words, or the words that lead to them ("hacer"), match. */
export function findConfusables(query: string, pair: LanguagePair, limit?: number): Confusable[] {
  const normalized = normalize(query)
  const entries: Ranked<Confusable>[] = []
  for (const entry of CONFUSABLES) {
    if (entry.lang !== pair.source && entry.lang !== pair.target) continue
    const hints = [...(entry.hints?.[pair.source] ?? []), ...(entry.hints?.[pair.target] ?? [])]
    const value = normalized ? bestScore(normalized, [...entry.words, ...hints]) : 1
    if (value) entries.push({ item: entry, score: value, label: entry.words.join(' ') })
  }
  return rank(entries, pair.source, limit)
}

// Everything ---------------------------------------------------------------------------------

export interface SearchResults {
  falseFriends: FalseFriendMatch[]
  idioms: IdiomMatch[]
  phrasalVerbs: PhrasalVerb[]
  confusables: Confusable[]
}

export function searchContent(query: string, pair: LanguagePair): SearchResults {
  if (normalize(query).length < MIN_QUERY_LENGTH) return { falseFriends: [], idioms: [], phrasalVerbs: [], confusables: [] }
  return {
    falseFriends: findFalseFriends(query, pair, 3),
    idioms: findIdioms(query, pair, 5),
    phrasalVerbs: findPhrasalVerbs(query, pair, 6),
    confusables: findConfusables(query, pair, 2),
  }
}
