// The search engines of "¿Cómo se dice?". The user orders them in "Ajustes": the first usable
// one answers each search; the others can be asked from below the answer.
import { activeAi } from 'firebase-app-kit/ai'
import type { AiSettings } from 'firebase-app-kit/ai'
import { askJson } from '../askAssistant'
import { dictionaryRequest, parseDictionaryEntry } from '../assistant'
import type { LanguagePair } from '../languages'
import { normalize } from '../search'
import { hasChromeTranslator, translateWithChrome } from './chromeTranslator'
import { searchMyMemory } from './mymemory'
import type { EngineAnswer, EngineId } from './types'
import { searchWiktionary, wiktionarySupports } from './wiktionary'

export interface EngineInfo {
  id: EngineId
  name: string
  description: string
}

export const ENGINES: readonly EngineInfo[] = [
  { id: 'wiktionary', name: 'Wiktionary', description: 'Diccionario libre: traducciones por significado y expresiones fijas. Gratis y sin clave.' },
  { id: 'ai', name: 'IA', description: 'Ficha completa con significados, ejemplos, registro y región. Con tu clave (Gemini es gratis).' },
  { id: 'mymemory', name: 'MyMemory', description: 'Traducción de frases con memorias de traducción. Gratis, con límite diario.' },
  { id: 'chrome', name: 'Traductor de Chrome', description: 'Traduce en el propio dispositivo, sin conexión y sin enviar el texto. Solo en Chrome compatible.' },
]

export function engineName(id: EngineId): string {
  return ENGINES.find(engine => engine.id === id)?.name ?? id
}

export interface EngineContext {
  pair: LanguagePair
  aiSettings: AiSettings
  /** Preferred regional usage for the AI ("británico"). */
  variety?: string
}

/** Why an engine cannot answer here (Spanish), or null if it can. */
export function engineUnavailable(id: EngineId, context: EngineContext): string | null {
  if (id === 'wiktionary' && !wiktionarySupports(context.pair)) return 'Solo traduce cuando el inglés es uno de los dos idiomas.'
  if (id === 'ai' && !activeAi(context.aiSettings)) return 'Necesita una IA configurada.'
  if (id === 'chrome' && !hasChromeTranslator()) return 'No disponible en este navegador.'
  return null
}

/** Engines that answer on their own after a pause in typing; the AI waits for Enter or a tap. */
export function answersWhileTyping(id: EngineId): boolean {
  return id !== 'ai'
}

const cache = new Map<string, Promise<EngineAnswer>>()

export function askEngine(id: EngineId, term: string, context: EngineContext, onProgress?: (loaded: number) => void): Promise<EngineAnswer> {
  const { pair } = context
  const key = [id, pair.source, pair.target, normalize(term), id === 'ai' ? context.variety ?? '' : ''].join('|')
  let pending = cache.get(key)
  if (!pending) {
    pending =
      id === 'wiktionary' ? searchWiktionary(term, pair)
      : id === 'mymemory' ? searchMyMemory(term, pair)
      : id === 'chrome' ? translateWithChrome(term, pair, onProgress)
      : askJson(context.aiSettings, dictionaryRequest(term, pair, context.variety), 'low').then(data => parseDictionaryEntry(data, pair))
    cache.set(key, pending)
    pending.catch(() => cache.delete(key))
  }
  return pending
}
