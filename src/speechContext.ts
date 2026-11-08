// Accent preferences shared by every "Escuchar" (listen) button. They are stored on the device:
// the available voices depend on each device anyway.
import { createContext, useContext } from 'react'
import { DEFAULT_ACCENTS } from './speech'
import type { Accents } from './speech'
import type { LanguageCode } from './languages'

export const ACCENTS_STORAGE_KEY = 'labia.accents'

export interface SpeechSettings {
  accents: Accents
  setAccent: (lang: LanguageCode, locale: string) => void
}

export const SpeechContext = createContext<SpeechSettings>({ accents: { ...DEFAULT_ACCENTS }, setAccent: () => {} })

export function useSpeech(): SpeechSettings {
  return useContext(SpeechContext)
}
