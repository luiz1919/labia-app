import { useEffect, useRef, useState } from 'react'
import type { RefObject } from 'react'
import type { LanguageCode } from './languages'
import { captureEntries } from './pantry.ts'
import { listenContinuously } from './speech.ts'
import type { AddResult } from './usePantry'

/** After a lone keyword ("apunta…"), the next phrase within this time is the word. */
const ARMED_MS = 8000

export interface Captured {
  text: string
  result: AddResult
}

type Session = ReturnType<typeof listenContinuously>

/** Short beeps (Web Audio) so the user knows a word was saved without looking at the screen. */
function beep(context: AudioContext | null, frequencies: readonly number[]) {
  if (!context || context.state !== 'running') return
  frequencies.forEach((frequency, index) => {
    const at = context.currentTime + index * 0.12
    const oscillator = context.createOscillator()
    const gain = context.createGain()
    oscillator.frequency.value = frequency
    gain.gain.setValueAtTime(0.0001, at)
    gain.gain.exponentialRampToValueAtTime(0.2, at + 0.02)
    gain.gain.exponentialRampToValueAtTime(0.0001, at + 0.2)
    oscillator.connect(gain).connect(context.destination)
    oscillator.start(at)
    oscillator.stop(at + 0.25)
  })
}

/** Keeps the screen on while listening: phones stop the microphone of a page when it turns off. */
function keepScreenOn(lock: RefObject<WakeLockSentinel | null>, active: () => boolean) {
  if (!('wakeLock' in navigator)) return
  navigator.wakeLock.request('screen').then(sentinel => {
    if (active()) lock.current = sentinel
    else void sentinel.release()
  }, () => {
    // Battery saver or not allowed: listening still works while the screen stays on.
  })
}

/**
 * Hands-free capture: listens until stopped and saves what follows the keyword in `lang`.
 * The component using it should be keyed by language and accent, so a change starts afresh.
 */
export default function useHandsFree(lang: LanguageCode, locale: string, onEntry: (text: string) => AddResult, onActiveChange?: (active: boolean) => void) {
  const [active, setActive] = useState(false)
  const [micOn, setMicOn] = useState(false)
  const [armed, setArmed] = useState(false)
  const [heard, setHeard] = useState('')
  const [captured, setCaptured] = useState<Captured[]>([])
  const [error, setError] = useState('')
  const session = useRef<Session | null>(null)
  const lock = useRef<WakeLockSentinel | null>(null)
  const audio = useRef<AudioContext | null>(null)
  const armedAt = useRef(0)
  const save = useRef(onEntry)
  const notify = useRef(onActiveChange)
  useEffect(() => {
    save.current = onEntry
    notify.current = onActiveChange
  })

  function phrase(alternatives: string[]) {
    setHeard(alternatives[0])
    const wasArmed = armedAt.current > 0 && Date.now() - armedAt.current < ARMED_MS
    // The best guess may have missed the keyword ("a punta"): use the first guess that has it.
    const captures = alternatives.map(text => captureEntries(text, lang, wasArmed))
    const capture = captures.find(found => found.entries.length || found.armed) ?? captures[0]
    armedAt.current = capture.armed ? Date.now() : 0
    setArmed(capture.armed)
    if (!capture.entries.length) return
    const results = capture.entries.map(text => ({ text, result: save.current(text) }))
    const added = results.some(item => item.result === 'added')
    beep(audio.current, added ? [660, 990] : [660])
    navigator.vibrate?.(added ? 80 : [40, 60, 40])
    setCaptured(previous => [...results.reverse(), ...previous].slice(0, 5))
  }

  function release() {
    session.current?.stop()
    session.current = null
    void lock.current?.release().catch(() => {})
    lock.current = null
  }

  function stop() {
    release()
    notify.current?.(false)
    setActive(false)
    setMicOn(false)
    setArmed(false)
  }

  /** From a tap: the audio for the beeps can only start inside a user gesture. */
  function start() {
    setError('')
    setHeard('')
    setCaptured([])
    armedAt.current = 0
    try {
      audio.current ??= new AudioContext()
      void audio.current.resume().catch(() => {})
    } catch {
      // No Web Audio: words are still saved, without the beep.
    }
    let failed = false
    const next = listenContinuously(locale, {
      onPhrase: phrase,
      onListening: setMicOn,
      onError: message => {
        failed = true
        setError(message)
        stop()
      },
    })
    if (failed) return
    session.current = next
    notify.current?.(true)
    setActive(true)
    keepScreenOn(lock, () => session.current === next)
  }

  // Coming back to the app (or turning the screen on) resumes listening.
  useEffect(() => {
    if (!active) return
    const resume = () => {
      const current = session.current
      if (document.visibilityState !== 'visible' || !current) return
      keepScreenOn(lock, () => session.current === current)
      current.resume()
    }
    document.addEventListener('visibilitychange', resume)
    return () => document.removeEventListener('visibilitychange', resume)
  }, [active])

  // Leaving the screen stops the microphone and frees the screen lock and the audio.
  useEffect(() => () => {
    if (session.current) notify.current?.(false)
    session.current?.stop()
    session.current = null
    void lock.current?.release().catch(() => {})
    lock.current = null
    void audio.current?.close().catch(() => {})
    audio.current = null
  }, [])

  return { active, micOn, armed, heard, captured, error, start, stop }
}
