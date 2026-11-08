// Shapes of the curated content bundled with the app (idioms, false friends, confusing words and
// phrasal verbs). Every text says which language it is in, so a new language only needs new
// entries, not new types. Explanations for the user are in Spanish, the UI language.
import type { LanguageCode } from '../languages'

/** The same text in several languages: { es: '...', en: '...' }. */
export type Translations = Partial<Record<LanguageCode, string>>

export type Register = 'neutral' | 'informal' | 'vulgar' | 'formal'

/** BCP 47 tag of the place where an expression is used (es-419 = Latin America). */
export type Region = 'es-ES' | 'es-419' | 'en-GB' | 'en-US'

export const REGISTER_LABELS: Readonly<Record<Register, string>> = {
  neutral: 'Neutro',
  informal: 'Coloquial',
  vulgar: 'Vulgar',
  formal: 'Formal',
}

export const REGION_LABELS: Readonly<Record<Region, string>> = {
  'es-ES': 'España',
  'es-419': 'Latinoamérica',
  'en-GB': 'Reino Unido',
  'en-US': 'EE. UU.',
}

// Idioms -------------------------------------------------------------------------------------

export interface IdiomExpression {
  lang: LanguageCode
  text: string
  /** Word-for-word rendering into other languages: it is often funny and helps to remember it. */
  literal?: Translations
  /** Neutral when missing. */
  register?: Register
  /** Only when the expression is regional. */
  regions?: Region[]
  /** Other forms that should find it in a search (conjugated, without "alguien"...). */
  keywords?: string[]
}

/** One idea and the way each language says it. The first expression of each language is the main one. */
export interface Idiom {
  id: string
  /** What it means, in Spanish. */
  meaning: string
  expressions: IdiomExpression[]
  example?: Translations
}

// False friends ------------------------------------------------------------------------------

export interface FalseFriendWord {
  lang: LanguageCode
  word: string
  /** What it really means, in the other word's language. */
  means: string[]
  example?: Translations
}

/** Two words that look alike in two languages but mean different things. */
export interface FalseFriend {
  id: string
  words: [FalseFriendWord, FalseFriendWord]
  /** Extra remark in Spanish (partial false friends, regional uses...). */
  note?: string
}

// Confusing words ("what is the difference between X and Y?") --------------------------------

export interface ConfusableUsage {
  word: string
  /** When to use it, in Spanish. */
  use: string
  examples: Translations[]
}

export interface QuizQuestion {
  /** Sentence with ___ where the word goes. */
  sentence: string
  /** One of the set's words. */
  answer: string
  /** Text that fills the gap when it is not the word itself (a conjugated form: "es" for "ser"). */
  fill?: string
  /** Why, in Spanish. */
  why: string
}

export interface Confusable {
  id: string
  /** Language of the words. */
  lang: LanguageCode
  words: string[]
  /** Words in other languages that lead here: "hacer" -> make / do. */
  hints?: Partial<Record<LanguageCode, string[]>>
  /** The short rule, in Spanish. */
  rule: string
  usages: ConfusableUsage[]
  quiz: QuizQuestion[]
}

// Phrasal verbs ------------------------------------------------------------------------------

/** separable: the object can go in the middle (turn it off); inseparable: after the particle (look after her); none: no object. */
export type PhrasalObject = 'separable' | 'inseparable' | 'none'

export const PHRASAL_OBJECT_LABELS: Readonly<Record<PhrasalObject, string>> = {
  separable: 'Separable',
  inseparable: 'Inseparable',
  none: 'Sin complemento',
}

export interface PhrasalVerbSense {
  translations: Partial<Record<LanguageCode, string[]>>
  object: PhrasalObject
  example: Translations
}

export interface PhrasalVerb {
  id: string
  verb: string
  /** One or more words: "over", "up with". */
  particle: string
  register?: Register
  senses: PhrasalVerbSense[]
}

// Minimal pairs ------------------------------------------------------------------------------

/** Two words that differ in a single sound. */
export interface MinimalPair {
  id: string
  lang: LanguageCode
  words: [string, string]
  /** Broad IPA transcription of each word. */
  ipa: [string, string]
  /** What changes and how to make the sound, in Spanish. */
  hint: string
  /** Only told apart in these regions. */
  regions?: Region[]
}
