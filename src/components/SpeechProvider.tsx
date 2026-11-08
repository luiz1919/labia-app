import { useState } from 'react'
import type { ReactNode } from 'react'
import { parseAccents } from '../speech'
import type { Accents } from '../speech'
import { ACCENTS_STORAGE_KEY, SpeechContext } from '../speechContext'
import type { LanguageCode } from '../languages'

function storedAccents(): Accents {
  try {
    return parseAccents(localStorage.getItem(ACCENTS_STORAGE_KEY))
  } catch {
    return parseAccents(null)
  }
}

export default function SpeechProvider({ children }: { children: ReactNode }) {
  const [accents, setAccents] = useState(storedAccents)

  function setAccent(lang: LanguageCode, locale: string) {
    const next = { ...accents, [lang]: locale }
    setAccents(next)
    try {
      localStorage.setItem(ACCENTS_STORAGE_KEY, JSON.stringify(next))
    } catch {
      // Private mode or full storage: the choice lasts until the page is closed.
    }
  }

  return <SpeechContext.Provider value={{ accents, setAccent }}>{children}</SpeechContext.Provider>
}
