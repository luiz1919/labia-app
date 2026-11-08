import { Volume2 } from 'lucide-react'
import type { AiSettings, AiSettingsActions } from 'firebase-app-kit/ai'
import { AiSettingsPanel } from 'firebase-app-kit/ui'
import { LANGUAGES } from '../languages'
import type { LanguageCode } from '../languages'
import { ACCENT_OPTIONS, canSpeak, speak } from '../speech'
import { useSpeech } from '../speechContext'

const SAMPLES: Readonly<Record<LanguageCode, string>> = {
  es: 'Hola, así suena mi voz.',
  en: 'Hello, this is how my voice sounds.',
}

/** "Ajustes": accents for the voices (this device) and the AI keys (the account). */
export default function SettingsScreen({ settings, actions, error }: { settings: AiSettings; actions: AiSettingsActions; error: string }) {
  const { accents, setAccent } = useSpeech()

  return (
    <section className="screen" aria-labelledby="settings-title">
      <h1 id="settings-title">Ajustes</h1>

      <section className="settings-group" aria-labelledby="voices-title">
        <h2 id="voices-title">Voces</h2>
        <p className="screen-intro">El acento para escuchar y para reconocer lo que dices. Se guarda en este dispositivo: las voces disponibles dependen de cada uno.</p>
        {LANGUAGES.map(language => (
          <div key={language.code} className="chip-filter" role="group" aria-label={`Acento del ${language.name.toLowerCase()}`}>
            <span className="chip-filter-label">{language.name}</span>
            <div className="chip-row">
              {ACCENT_OPTIONS[language.code].map(option => (
                <button key={option.locale} type="button" className="chip" aria-pressed={accents[language.code] === option.locale} onClick={() => setAccent(language.code, option.locale)}>{option.label}</button>
              ))}
              {canSpeak() && <button type="button" className="chip chip-icon" onClick={() => speak(SAMPLES[language.code], accents[language.code])} aria-label={`Probar la voz en ${language.name.toLowerCase()}`}><Volume2 size={16} aria-hidden="true" />Probar</button>}
            </div>
          </div>
        ))}
      </section>

      <section className="settings-group" aria-labelledby="ai-title">
        <h2 id="ai-title">Inteligencia artificial</h2>
        <p className="screen-intro">
          Para el «Asistente» y para leer el texto de una foto en «Buscar». Usas tu propia clave: se guarda en tu cuenta y solo tú puedes leerla.
          Gemini tiene un nivel gratuito; OpenAI y Claude son de pago por uso.
        </p>
        {error && <p className="error-message" role="alert">{error}</p>}
        <AiSettingsPanel settings={settings} actions={actions} />
      </section>
    </section>
  )
}
