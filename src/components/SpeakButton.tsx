import { Volume2 } from 'lucide-react'
import type { LanguageCode } from '../languages'
import { canSpeak, speak } from '../speech'
import { useSpeech } from '../speechContext'

/** Reads a text aloud with the device's voice for that language and the chosen accent. */
export default function SpeakButton({ text, lang, size = 18 }: { text: string; lang: LanguageCode; size?: number }) {
  const { accents } = useSpeech()
  if (!canSpeak()) return null
  return (
    <button className="speak-button" type="button" onClick={() => speak(text, accents[lang])} aria-label={`Escuchar: ${text}`} title="Escuchar">
      <Volume2 size={size} aria-hidden="true" />
    </button>
  )
}
