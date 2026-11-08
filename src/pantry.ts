// The pantry ("Despensa"): words saved to look up later, typed or said out loud. In hands-free
// mode the microphone keeps listening (for example while reading a book aloud) and only saves
// what follows a keyword: "apunta zarzamora" saves "zarzamora". Each word is a Firestore
// document in users/{uid}/pantry/{id} ({ text, lang, createdAt, reviewed }).
import type { LanguageCode, LanguagePair } from './languages'
import { normalize } from './search.ts'

/**
 * Keywords that start a capture, in the language the recognizer listens to (the language of the
 * words being saved), normalized. The user mostly speaks the other language while translating,
 * so a keyword in this one rarely comes up by chance.
 */
export const PANTRY_KEYWORDS: Readonly<Record<LanguageCode, readonly string[]>> = {
  es: ['apunta', 'apuntame', 'anota', 'anotame'],
  en: ['note', 'jot'],
}

/** How the screen tells the user what to say. */
export const PANTRY_EXAMPLES: Readonly<Record<LanguageCode, { keyword: string; example: string }>> = {
  es: { keyword: 'apunta', example: 'apunta zarzamora' },
  en: { keyword: 'note', example: 'note bramble' },
}

// Words that may come between the keyword and the word itself ("apunta la palabra…",
// "jot down…"), and articles dropped from the start of a phrase so it can be looked up.
const FILLERS: Readonly<Record<LanguageCode, readonly (readonly string[])[]>> = {
  es: [['la', 'palabra'], ['palabra']],
  en: [['down', 'the', 'word'], ['down'], ['the', 'word'], ['word']],
}
const ARTICLES: Readonly<Record<LanguageCode, readonly string[]>> = {
  es: ['el', 'la', 'los', 'las', 'un', 'una', 'unos', 'unas'],
  en: ['the', 'a', 'an'],
}
// "apunta zarzamora y apunta escarabajo": the "y" before the next keyword is not part of the word.
const CONNECTORS: Readonly<Record<LanguageCode, readonly string[]>> = {
  es: ['y', 'e', 'o', 'u', 'ni'],
  en: ['and', 'or'],
}

/** A capture keeps at most this many words: longer means the user went on talking. */
export const MAX_ENTRY_WORDS = 4
export const MAX_ENTRY_LENGTH = 100

export interface Capture {
  /** Words or phrases to save, in the order they were said. */
  entries: string[]
  /** The phrase ended with the keyword: the next phrase is the word ("apunta… zarzamora"). */
  armed: boolean
}

const EDGE_PUNCTUATION = /^[^\p{L}\p{N}]+|[^\p{L}\p{N}]+$/gu

function startsWith(words: readonly string[], prefix: readonly string[]): boolean {
  return prefix.every((word, index) => words[index] === word)
}

/** Tidies the words after a keyword: fillers, a leading article, length and punctuation. */
function entryFrom(tokens: readonly string[], lang: LanguageCode, atStart: boolean, maxWords = MAX_ENTRY_WORDS): string {
  let words = tokens.map(token => token.replace(EDGE_PUNCTUATION, '')).filter(Boolean)
  const filler = FILLERS[lang].find(prefix => startsWith(words.map(normalize), prefix))
  if (filler) words = words.slice(filler.length)
  if (words.length > 1 && ARTICLES[lang].includes(normalize(words[0]))) words = words.slice(1)
  while (words.length > 1 && CONNECTORS[lang].includes(normalize(words[words.length - 1]))) words = words.slice(0, -1)
  let entry = words.slice(0, maxWords).join(' ').slice(0, MAX_ENTRY_LENGTH).trim()
  // Recognizers capitalize the first word of a phrase: "Zarzamora" after a pause is "zarzamora".
  if (atStart && /^\p{Lu}\p{Ll}*(\s|$)/u.test(entry)) entry = entry[0].toLowerCase() + entry.slice(1)
  return entry
}

/**
 * Words to save from something the recognizer heard. Every keyword starts a capture that runs
 * to the next keyword or the end of the phrase. `armed`: the previous phrase ended with the
 * keyword, so this one starts with the word.
 */
export function captureEntries(transcript: string, lang: LanguageCode, armed = false): Capture {
  const tokens = transcript.split(/\s+/).filter(Boolean)
  const keywords = PANTRY_KEYWORDS[lang]
  const starts = [...(armed ? [0] : []), ...tokens.flatMap((token, index) => keywords.includes(normalize(token)) ? [index + 1] : [])]
  const entries: string[] = []
  let nextArmed = false
  starts.forEach((start, position) => {
    const end = position + 1 < starts.length ? starts[position + 1] - 1 : tokens.length
    const entry = start <= end ? entryFrom(tokens.slice(start, end), lang, start === 0) : ''
    if (entry) entries.push(entry)
    else if (start === tokens.length && start > 0) nextArmed = true
  })
  return { entries, armed: nextArmed }
}

/**
 * What to propose after "push to talk": the whole phrase, tidied (punctuation, the capital the
 * recognizer adds, a leading article), without a leading keyword and not cut to a few words:
 * the user chose when to stop talking.
 */
export function spokenEntry(transcript: string, lang: LanguageCode): string {
  const tokens = transcript.split(/\s+/).filter(Boolean)
  const keyword = tokens.length > 0 && PANTRY_KEYWORDS[lang].includes(normalize(tokens[0]))
  return entryFrom(keyword ? tokens.slice(1) : tokens, lang, !keyword, Number.POSITIVE_INFINITY)
}

// Stored words ----------------------------------------------------------------------------------

export interface PantryItem {
  id: string
  text: string
  lang: LanguageCode
  /** Milliseconds; 0 while the server has not set it yet. */
  createdAt: number
  /** Already looked up: shown apart, under "Consultadas". */
  reviewed: boolean
}

/** Same word, ignoring case, accents and punctuation. */
export function pantryKey(text: string, lang: string): string {
  return `${lang}|${normalize(text)}`
}

/** Reads a stored word; null when it is malformed or in a language the app no longer has. */
export function parsePantryItem(id: string, data: unknown, languages: readonly string[]): PantryItem | null {
  if (typeof data !== 'object' || data === null) return null
  const { text, lang, createdAt, reviewed } = data as Record<string, unknown>
  if (typeof text !== 'string' || !text.trim() || typeof lang !== 'string' || !languages.includes(lang)) return null
  const millis = typeof (createdAt as { toMillis?: unknown } | null)?.toMillis === 'function' ? (createdAt as { toMillis: () => number }).toMillis() : 0
  return { id, text: text.trim(), lang: lang as LanguageCode, createdAt: millis, reviewed: reviewed === true }
}

/** Newest first; words still waiting for the server's time are the newest. */
export function sortPantry(items: readonly PantryItem[]): PantryItem[] {
  const time = (item: PantryItem) => item.createdAt || Number.MAX_SAFE_INTEGER
  return [...items].sort((first, second) => time(second) - time(first))
}

/** The pair a saved word is looked up with: from its language into the other side of the pair. */
export function pantryPair(lang: LanguageCode, pair: LanguagePair): LanguagePair {
  return { source: lang, target: lang === pair.source ? pair.target : pair.source }
}
