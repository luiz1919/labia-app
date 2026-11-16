import { useEffect, useRef, useState } from 'react'
import { addPhrase } from './reading.ts'
import { listenContinuously } from './speech.ts'
import { keepScreenOn } from './useHandsFree'

type Session = ReturnType<typeof listenContinuously>

/**
 * Listens while the user reads a text aloud and collects what was understood. The screen stays
 * on, and listening resumes when the user comes back to the app. `finish()` waits for the last
 * words and returns everything understood.
 */
export default function useReadAloud(locale: string) {
  const [active, setActive] = useState(false)
  const [micOn, setMicOn] = useState(false)
  const [phrases, setPhrases] = useState<string[]>([])
  const [error, setError] = useState('')
  const session = useRef<Session | null>(null)
  const lock = useRef<WakeLockSentinel | null>(null)
  // The same list as `phrases`, readable right after the last words arrive.
  const collected = useRef<string[]>([])

  function release() {
    void lock.current?.release().catch(() => {})
    lock.current = null
  }

  function start() {
    setError('')
    collected.current = []
    setPhrases([])
    let failed = false
    const next = listenContinuously(locale, {
      onPhrase: alternatives => {
        collected.current = addPhrase(collected.current, alternatives[0])
        setPhrases(collected.current)
      },
      onListening: setMicOn,
      onError: message => {
        failed = true
        setError(message)
        session.current = null
        release()
        setActive(false)
        setMicOn(false)
      },
    })
    if (failed) return
    session.current = next
    setActive(true)
    keepScreenOn(lock, () => session.current === next)
  }

  /** Stops listening once the last words have been understood; resolves with all of them. */
  async function finish(): Promise<string[]> {
    const current = session.current
    session.current = null
    await current?.finish()
    release()
    setActive(false)
    setMicOn(false)
    return collected.current
  }

  /** Stops listening and drops what was heard. */
  function cancel() {
    session.current?.stop()
    session.current = null
    release()
    collected.current = []
    setPhrases([])
    setActive(false)
    setMicOn(false)
  }

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

  // Leaving the screen stops the microphone and frees the screen lock.
  useEffect(() => () => {
    session.current?.stop()
    session.current = null
    void lock.current?.release().catch(() => {})
    lock.current = null
  }, [])

  return { active, micOn, phrases, error, start, finish, cancel }
}
