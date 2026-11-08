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

// Apple's novelty voices (sound effects, robots, singing) are listed as normal English voices on
// macOS and iOS: never pick them for teaching pronunciation.
const NOVELTY_VOICES = /^(Albert|Bad News|Bahh|Bells|Boing|Bubbles|Cellos|Deranged|Good News|Hysterical|Jester|Organ|Pipe Organ|Superstar|Trinoids|Whisper|Wobble|Zarvox)\b/i

// Better-sounding voices when several match equally well, and Apple's older or character voices
// (they work, but sound robotic or like a cartoon), used only when nothing else fits.
const QUALITY_VOICES = /(Google|Enhanced|Premium|Natural|Neural|Siri)/i
const PLAIN_VOICES = /^(Eddy|Flo|Fred|Grandma|Grandpa|Junior|Kathy|Ralph|Reed|Rocko|Sandy|Shelley)\b/i

/**
 * Best voice for a locale: same locale first, then same language; within each group, voices
 * installed on the device (they work offline), the default one, then the better-sounding ones.
 * Null when nothing fits: the browser then picks one from the utterance's language.
 */
export function pickVoice<T extends VoiceLike>(voices: readonly T[], locale: string): T | null {
  const wanted = locale.toLowerCase().replace('_', '-')
  const language = wanted.split('-')[0]
  const rank = (voice: T) => {
    const lang = voice.lang.toLowerCase().replace('_', '-')
    const match = lang === wanted ? 0 : lang.split('-')[0] === language ? 1 : 2
    const quality = QUALITY_VOICES.test(voice.name) ? 0 : PLAIN_VOICES.test(voice.name) ? 2 : 1
    return match * 16 + (voice.localService ? 0 : 8) + (voice.default ? 0 : 4) + quality
  }
  const candidates = voices.filter(voice => !NOVELTY_VOICES.test(voice.name) && rank(voice) < 32)
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

/** The utterance being spoken: Chrome may garbage-collect one that nothing references and cut it off. */
let current: SpeechSynthesisUtterance | null = null
/** A start delayed after cancel(): a newer tap replaces it. */
let delayedStart: number | undefined

export function speak(text: string, locale: string, rate = 0.9): void {
  if (!canSpeak() || !text.trim()) return
  const synth = window.speechSynthesis
  const utterance = new SpeechSynthesisUtterance(text)
  utterance.lang = locale
  utterance.rate = rate
  const voice = pickVoice(synth.getVoices(), locale)
  if (voice) utterance.voice = voice
  current = utterance
  utterance.onend = utterance.onerror = () => {
    if (current === utterance) current = null
  }
  const start = () => {
    // Chrome on Android can stay paused after the app has been in the background.
    if (synth.paused) synth.resume()
    synth.speak(utterance)
  }
  // Safari and Chrome on Android drop an utterance queued right after cancel(): only cancel when
  // something is playing, and give it a moment. Otherwise speak at once, inside the tap (iOS
  // only lets a page start speaking from a user gesture).
  window.clearTimeout(delayedStart)
  if (synth.speaking || synth.pending) {
    synth.cancel()
    delayedStart = window.setTimeout(start, 150)
  } else {
    start()
  }
}

interface RecognitionResult extends ArrayLike<{ transcript: string }> { isFinal?: boolean }
interface RecognitionResultEvent { resultIndex?: number; results: ArrayLike<RecognitionResult> }
interface RecognitionErrorEvent { error: string }
export interface Recognition {
  lang: string
  continuous?: boolean
  maxAlternatives: number
  interimResults: boolean
  onresult: ((event: RecognitionResultEvent) => void) | null
  onerror: ((event: RecognitionErrorEvent) => void) | null
  onend: (() => void) | null
  start(): void
  /** Stops listening and still delivers what was heard (abort() drops it). */
  stop(): void
  abort(): void
}
export type RecognitionConstructor = new () => Recognition

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
  'language-not-supported': 'El reconocimiento de voz de este navegador no tiene este idioma.',
  aborted: 'El reconocimiento de voz se ha cortado antes de oír nada. Inténtalo de nuevo.',
  // Not a browser code: start() itself failed.
  start: 'No se ha podido encender el micrófono. Inténtalo de nuevo.',
}

/** The message for a recognizer error; unknown ones keep their code, to know what happened. */
export function recognitionError(code: string): string {
  return RECOGNITION_ERRORS[code] ?? `No se ha podido reconocer la voz (error «${code}»).`
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
    let error = 'no-speech'
    recognition.onerror = event => { error = event.error }
    recognition.onend = () => (heard.length ? resolve(heard) : reject(new Error(recognitionError(error))))
  })
  recognition.start()
  // stop(), not abort(): what was said before the tap still counts.
  return { result, stop: () => recognition.stop() }
}

// Errors after which continuous listening stops for good; the others are retried.
const FATAL_ERRORS = new Set(['not-allowed', 'service-not-allowed', 'audio-capture', 'language-not-supported'])
const MAX_FAILURES = 3
/** A session that ends sooner than this without hearing anything counts as a failure. */
const MIN_SESSION_MS = 1000
const RESTART_MS = 300

export interface ContinuousHandlers {
  /** A finished phrase: several guesses, best first. */
  onPhrase: (alternatives: string[]) => void
  /** The microphone turned on or off: it pauses between sessions and while the page is hidden. */
  onListening?: (listening: boolean) => void
  /** Listening has stopped for good. */
  onError: (message: string) => void
}

export interface ContinuousOptions {
  /** The recognizer (tests pass a fake one); by default the browser's. */
  Recognition?: RecognitionConstructor | null
  /** Whether the page is hidden: the browser stops the microphone then, and resume() restarts it. */
  hidden?: () => boolean
  later?: (callback: () => void, ms: number) => void
  now?: () => number
}

/**
 * Keeps listening until stop(). Browsers end a recognition session after a silence or a minute
 * or so, so a new one starts as soon as the last one ends. Silence is normal; other errors are
 * retried with a growing pause, and listening stops after a few in a row or a fatal one (no
 * permission, no microphone).
 */
export function listenContinuously(locale: string, handlers: ContinuousHandlers, options: ContinuousOptions = {}): { stop: () => void; resume: () => void } {
  const Constructor = options.Recognition === undefined ? recognitionConstructor() : options.Recognition
  const hidden = options.hidden ?? (() => typeof document !== 'undefined' && document.hidden)
  const later = options.later ?? ((callback: () => void, ms: number) => { window.setTimeout(callback, ms) })
  const now = options.now ?? Date.now
  let stopped = false
  let running: Recognition | null = null
  let failures = 0

  function fail(message: string) {
    stopped = true
    handlers.onError(message)
  }

  function retry(error: string, heard: boolean, startedAt: number) {
    const quiet = error === '' || error === 'no-speech' || error === 'aborted'
    failures = heard || (quiet && now() - startedAt >= MIN_SESSION_MS) ? 0 : failures + 1
    if (failures >= MAX_FAILURES) {
      fail(quiet ? 'El reconocimiento de voz se corta todo el rato. Inténtalo más tarde.' : recognitionError(error))
      return
    }
    later(start, failures ? 1000 * 2 ** failures : RESTART_MS)
  }

  function start() {
    if (stopped || running || hidden() || !Constructor) return
    const recognition = new Constructor()
    recognition.lang = locale
    recognition.continuous = true
    recognition.interimResults = false
    recognition.maxAlternatives = 3
    const startedAt = now()
    let heard = false
    let error = ''
    recognition.onresult = event => {
      for (let index = event.resultIndex ?? 0; index < event.results.length; index++) {
        const result = event.results[index]
        if (result.isFinal === false) continue
        const alternatives = Array.from({ length: result.length }, (_, option) => result[option].transcript).filter(text => text.trim())
        if (!alternatives.length) continue
        heard = true
        handlers.onPhrase(alternatives)
      }
    }
    recognition.onerror = event => { error = event.error }
    recognition.onend = () => {
      if (running !== recognition) return
      running = null
      handlers.onListening?.(false)
      if (stopped) return
      if (FATAL_ERRORS.has(error)) fail(recognitionError(error))
      else retry(error, heard, startedAt)
    }
    running = recognition
    try {
      recognition.start()
    } catch {
      // Still closing the previous session, for example: try again shortly.
      running = null
      retry('start', false, startedAt)
      return
    }
    handlers.onListening?.(true)
  }

  if (!Constructor) {
    fail('Este navegador no reconoce la voz.')
    return { stop: () => {}, resume: () => {} }
  }
  start()
  return {
    stop() {
      if (stopped) return
      stopped = true
      const recognition = running
      running = null
      recognition?.abort()
      if (recognition) handlers.onListening?.(false)
    },
    resume: () => start(),
  }
}

/** Pauses while the button is held start a new session; this many at most. */
const MAX_HELD_SESSIONS = 10
/** Sessions in a row cut off ("aborted") without hearing anything before giving up. */
const MAX_EMPTY_ABORTS = 2
/** After release, the browser gets this long to deliver the last words. */
const FINISH_TIMEOUT_MS = 4000

export interface HeldListening {
  /** Everything understood, several guesses (best first); empty if nothing was heard. */
  result: Promise<string[]>
  /** The button was released: stop listening and transcribe. */
  finish: () => void
  /** Drop it all (leaving the screen). */
  cancel: () => void
}

/**
 * Listens while a button is held ("push to talk"). `onLive` gets the text understood so far.
 * A pause while still holding ends the browser's session, so a new one starts and the words
 * add up. Some phones cut the session on release ("aborted") before the last words become
 * final: the live text shown on screen counts then.
 */
export function listenWhileHeld(locale: string, onLive?: (text: string) => void, options: Pick<ContinuousOptions, 'Recognition' | 'later'> = {}): HeldListening {
  const Constructor = options.Recognition === undefined ? recognitionConstructor() : options.Recognition
  const later = options.later ?? ((callback: () => void, ms: number) => { window.setTimeout(callback, ms) })
  if (!Constructor) return { result: Promise.reject(new Error('Este navegador no reconoce la voz.')), finish: () => {}, cancel: () => {} }
  const Recognizer: RecognitionConstructor = Constructor

  const segments: string[][] = []
  /** Words heard but not final yet. */
  let pending = ''
  let current: Recognition | null = null
  let released = false
  let settled = false
  let sessions = 0
  let emptyAborts = 0
  let settle: { resolve: (value: string[]) => void; reject: (error: Error) => void } = { resolve: () => {}, reject: () => {} }
  const result = new Promise<string[]>((resolve, reject) => { settle = { resolve, reject } })

  // Guesses for the whole thing: the earlier segments as heard, then each guess of the last one
  // (or the words that never became final).
  function guesses(): string[] {
    const finals = segments.map(segment => segment[0])
    if (pending) return [[...finals, pending].join(' ')]
    const last = segments.at(-1)
    if (!last) return []
    const before = finals.slice(0, -1).join(' ')
    return [...new Set(last.map(guess => `${before} ${guess}`.trim()))]
  }

  function done(error = '') {
    if (settled) return
    settled = true
    const recognition = current
    current = null
    recognition?.abort()
    const found = guesses()
    if (found.length || error === '' || error === 'no-speech') settle.resolve(found)
    else settle.reject(new Error(recognitionError(error)))
  }

  function begin() {
    const recognition = new Recognizer()
    recognition.lang = locale
    recognition.continuous = false
    recognition.interimResults = true
    recognition.maxAlternatives = 5
    sessions++
    let error = ''
    let heard = false
    recognition.onresult = event => {
      let interim = ''
      for (let index = event.resultIndex ?? 0; index < event.results.length; index++) {
        const item = event.results[index]
        const texts = Array.from({ length: item.length }, (_, option) => item[option].transcript.trim()).filter(Boolean)
        if (!texts.length) continue
        heard = true
        if (item.isFinal === false) interim = texts[0]
        else segments.push(texts)
      }
      pending = interim
      onLive?.([...segments.map(segment => segment[0]), pending].filter(Boolean).join(' '))
    }
    recognition.onerror = event => { error = event.error }
    recognition.onend = () => {
      if (current !== recognition) return
      current = null
      if (settled) return
      emptyAborts = error === 'aborted' && !heard ? emptyAborts + 1 : heard ? 0 : emptyAborts
      const quiet = error === '' || error === 'no-speech' || (error === 'aborted' && emptyAborts < MAX_EMPTY_ABORTS)
      if (quiet && !released && sessions < MAX_HELD_SESSIONS) begin()
      else done(error)
    }
    current = recognition
    try {
      recognition.start()
    } catch {
      current = null
      done('start')
    }
  }

  begin()
  return {
    result,
    finish() {
      if (released || settled) return
      released = true
      if (!current) {
        done()
        return
      }
      current.stop()
      later(() => done(), FINISH_TIMEOUT_MS)
    },
    cancel() {
      if (settled) return
      settled = true
      const recognition = current
      current = null
      recognition?.abort()
      settle.resolve([])
    },
  }
}
