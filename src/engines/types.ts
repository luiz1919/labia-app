// The answer every search engine returns, so one card can show any of them.
import type { LanguageCode } from '../languages'

export type EngineId = 'wiktionary' | 'ai' | 'mymemory' | 'chrome'

export interface AnswerItem {
  text: string
  lang: LanguageCode
  /** Gender, register, region, quality... (Spanish). */
  note?: string
}

export interface AnswerExample {
  text: string
  lang: LanguageCode
  translation?: string
  translationLang?: LanguageCode
}

/** One meaning or part of speech with its translations. */
export interface AnswerGroup {
  label?: string
  /** What this meaning is, in Spanish (AI only). */
  meaning?: string
  items: AnswerItem[]
  examples?: AnswerExample[]
}

export interface EngineAnswer {
  groups: AnswerGroup[]
  notes?: string[]
  source?: { label: string; href?: string }
}
