// Text to speech and speech recognition with the browser's own engines (Web Speech API): free,
// no keys. Voices depend on the device; recognition usually needs a connection (Chrome sends
// the audio to its own service) and is not available in every browser.
import type { LanguageCode } from './languages'
import { normalize } from './search.ts'

/** Accent used for each language when speaking and listening (BCP 47). */
export type Accents = Record<LanguageCode, string>

export interface AccentOption {
  locale: string
  label: string
  /** How the AI is told which regional usage to prefer ("el inglés británico"). */
  variety: string
}

export const ACCENT_OPTIONS: Readonly<Record<LanguageCode, readonly AccentOption[]>> = {
  es: [{ locale: 'es-ES', label: 'España', variety: 'de España' }, { locale: 'es-MX', label: 'México', variety: 'de México' }],
  en: [{ locale: 'en-GB', label: 'Británico', variety: 'británico' }, { locale: 'en-US', label: 'Americano', variety: 'americano' }],
}

export function accentVariety(lang: LanguageCode, locale: string): string {
  return ACCENT_OPTIONS[lang].find(option => option.locale === locale)?.variety ?? ''
}

export const DEFAULT_ACCENTS: Readonly<Accents> = { es: 'es-ES', en: 'en-GB' }

/** Reads accents saved on the device; anything unknown falls back to the default. */
export function parseAccents(stored: string | null): Accents {
  let data: Record<string, unknown> = {}
  try {
    data = stored ? JSON.parse(stored) : {}
  } catch {
    // Corrupt value: use the defaults.
  }
  const accents = { ...DEFAULT_ACCENTS }
  for (const lang of Object.keys(ACCENT_OPTIONS) as LanguageCode[]) {
    const value = data?.[lang]
    if (ACCENT_OPTIONS[lang].some(option => option.locale === value)) accents[lang] = value as string
  }
  return accents
}

export interface VoiceLike {
  lang: string
  name: string
  localService?: boolean
  default?: boolean
}

/**
 * Best voice for a locale: same locale first, then same language; within each group, voices
 * installed on the device (they work offline), then the default one.
 */
export function pickVoice<T extends VoiceLike>(voices: readonly T[], locale: string): T | null {
  const wanted = locale.toLowerCase().replace('_', '-')
  const language = wanted.split('-')[0]
  const rank = (voice: T) => {
    const lang = voice.lang.toLowerCase().replace('_', '-')
    const match = lang === wanted ? 0 : lang.split('-')[0] === language ? 1 : 2
    return match * 4 + (voice.localService ? 0 : 2) + (voice.default ? 0 : 1)
  }
  const candidates = voices.filter(voice => rank(voice) < 8)
  return candidates.sort((first, second) => rank(first) - rank(second))[0] ?? null
}

/** Whether something the recognizer heard is the expected text (accents and punctuation ignored). */
export function heardAs(expected: string, alternatives: readonly string[]): boolean {
  const target = normalize(expected)
  return alternatives.some(alternative => normalize(alternative) === target)
}

// Browser side ---------------------------------------------------------------------------------

export function canSpeak(): boolean {
  return typeof window !== 'undefined' && 'speechSynthesis' in window
}

export function speak(text: string, locale: string, rate = 0.9): void {
  if (!canSpeak() || !text.trim()) return
  const synth = window.speechSynthesis
  synth.cancel()
  const utterance = new SpeechSynthesisUtterance(text)
  utterance.lang = locale
  utterance.rate = rate
  const voice = pickVoice(synth.getVoices(), locale)
  if (voice) utterance.voice = voice
  synth.speak(utterance)
}

interface RecognitionResultEvent { results: ArrayLike<ArrayLike<{ transcript: string }>> }
interface RecognitionErrorEvent { error: string }
interface Recognition {
  lang: string
  maxAlternatives: number
  interimResults: boolean
  onresult: ((event: RecognitionResultEvent) => void) | null
  onerror: ((event: RecognitionErrorEvent) => void) | null
  onend: (() => void) | null
  start(): void
  abort(): void
}
type RecognitionConstructor = new () => Recognition

function recognitionConstructor(): RecognitionConstructor | null {
  if (typeof window === 'undefined') return null
  const scope = window as unknown as { SpeechRecognition?: RecognitionConstructor; webkitSpeechRecognition?: RecognitionConstructor }
  return scope.SpeechRecognition ?? scope.webkitSpeechRecognition ?? null
}

export function canRecognize(): boolean {
  return recognitionConstructor() !== null
}

const RECOGNITION_ERRORS: Record<string, string> = {
  'not-allowed': 'No hay permiso para usar el micrófono. Actívalo en los ajustes del navegador.',
  'service-not-allowed': 'El navegador no permite el reconocimiento de voz.',
  'no-speech': 'No he oído nada. Inténtalo de nuevo.',
  'audio-capture': 'No se encuentra el micrófono.',
  network: 'El reconocimiento de voz necesita conexión.',
}

/** Listens once and returns what the recognizer understood (several guesses, best first). */
export function listen(locale: string): { result: Promise<string[]>; stop: () => void } {
  const Constructor = recognitionConstructor()
  if (!Constructor) return { result: Promise.reject(new Error('Este navegador no reconoce la voz.')), stop: () => {} }
  const recognition = new Constructor()
  recognition.lang = locale
  recognition.maxAlternatives = 5
  recognition.interimResults = false
  const result = new Promise<string[]>((resolve, reject) => {
    let heard: string[] = []
    recognition.onresult = event => {
      const first = event.results[0]
      heard = Array.from({ length: first?.length ?? 0 }, (_, index) => first[index].transcript)
    }
    recognition.onerror = event => reject(new Error(RECOGNITION_ERRORS[event.error] ?? 'No se ha podido reconocer la voz.'))
    recognition.onend = () => (heard.length ? resolve(heard) : reject(new Error(RECOGNITION_ERRORS['no-speech'])))
  })
  recognition.start()
  return { result, stop: () => recognition.abort() }
}
