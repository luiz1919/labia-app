// Chrome's built-in Translator API: translation models that run on the device (free, private,
// offline once the language pack is downloaded). Only in Chrome versions that ship it; the app
// feature-detects it and hides it elsewhere.
import type { LanguagePair } from '../languages'
import type { EngineAnswer } from './types'

export type TranslatorAvailability = 'unavailable' | 'downloadable' | 'downloading' | 'available'

interface TranslatorOptions { sourceLanguage: string; targetLanguage: string }
interface TranslatorInstance { translate(text: string): Promise<string> }
interface DownloadMonitor { addEventListener(type: 'downloadprogress', listener: (event: { loaded: number }) => void): void }
interface TranslatorFactory {
  availability(options: TranslatorOptions): Promise<TranslatorAvailability>
  create(options: TranslatorOptions & { monitor?: (monitor: DownloadMonitor) => void }): Promise<TranslatorInstance>
}

function factory(): TranslatorFactory | null {
  return (globalThis as { Translator?: TranslatorFactory }).Translator ?? null
}

export function hasChromeTranslator(): boolean {
  return factory() !== null
}

function options(pair: LanguagePair): TranslatorOptions {
  return { sourceLanguage: pair.source, targetLanguage: pair.target }
}

export async function chromeAvailability(pair: LanguagePair): Promise<TranslatorAvailability> {
  const Translator = factory()
  if (!Translator) return 'unavailable'
  try {
    return await Translator.availability(options(pair))
  } catch {
    return 'unavailable'
  }
}

const instances = new Map<string, Promise<TranslatorInstance>>()

/**
 * Translates on the device. Creating a translator that still has to download its language pack
 * must happen right after a tap; `onProgress` gets 0..1 while it downloads.
 */
export async function translateWithChrome(term: string, pair: LanguagePair, onProgress?: (loaded: number) => void): Promise<EngineAnswer> {
  const Translator = factory()
  if (!Translator) throw new Error('Este navegador no tiene el traductor de Chrome.')
  const key = `${pair.source}-${pair.target}`
  let instance = instances.get(key)
  if (!instance) {
    instance = Translator.create({ ...options(pair), monitor: monitor => monitor.addEventListener('downloadprogress', event => onProgress?.(event.loaded)) })
    instances.set(key, instance)
    instance.catch(() => instances.delete(key))
  }
  const text = (await (await instance).translate(term.trim())).trim()
  return {
    groups: text ? [{ label: 'Traducción', items: [{ text, lang: pair.target }] }] : [],
    notes: ['Traducido en tu dispositivo, sin enviar el texto a ningún servidor.'],
    source: { label: 'Traductor de Chrome' },
  }
}
