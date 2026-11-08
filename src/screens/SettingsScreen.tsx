import { ArrowDown, ArrowUp, Volume2 } from 'lucide-react'
import type { AiSettings, AiSettingsActions } from 'firebase-app-kit/ai'
import { AiSettingsPanel } from 'firebase-app-kit/ui'
import { ENGINES, engineUnavailable } from '../engines'
import { moveEngine } from '../engines/order'
import { LANGUAGES } from '../languages'
import type { LanguageCode, LanguagePair } from '../languages'
import { useEnginePreferences } from '../preferencesContext'
import { ACCENT_OPTIONS, canSpeak, speak } from '../speech'
import { useSpeech } from '../speechContext'

const SAMPLES: Readonly<Record<LanguageCode, string>> = {
  es: 'Hola, así suena mi voz.',
  en: 'Hello, this is how my voice sounds.',
}

/** Order of the search engines of "¿Cómo se dice?": the first usable one answers. */
function EngineOrder({ pair, settings }: { pair: LanguagePair; settings: AiSettings }) {
  const { engineOrder, setEngineOrder } = useEnginePreferences()
  const context = { pair, aiSettings: settings }
  const firstUsable = engineOrder.find(id => !engineUnavailable(id, context))

  return (
    <ol className="engine-order">
      {engineOrder.map((id, index) => {
        const engine = ENGINES.find(candidate => candidate.id === id)
        if (!engine) return null
        const reason = engineUnavailable(id, context)
        return (
          <li key={id} className={reason ? 'engine-unusable' : undefined}>
            <span className="engine-position" aria-hidden="true">{index + 1}</span>
            <span className="engine-text">
              <strong>{engine.name}{id === firstUsable && <span className="badge badge-default">Responde primero</span>}</strong>
              <span>{engine.description}</span>
              {reason && <small>{reason}</small>}
            </span>
            <span className="engine-moves">
              <button className="icon-button" type="button" onClick={() => setEngineOrder(moveEngine(engineOrder, id, -1))} disabled={index === 0} aria-label={`Subir ${engine.name}`} title="Subir"><ArrowUp size={18} /></button>
              <button className="icon-button" type="button" onClick={() => setEngineOrder(moveEngine(engineOrder, id, 1))} disabled={index === engineOrder.length - 1} aria-label={`Bajar ${engine.name}`} title="Bajar"><ArrowDown size={18} /></button>
            </span>
          </li>
        )
      })}
    </ol>
  )
}

/** "Ajustes": search engines and voices (this device) and the AI keys (the account). */
export default function SettingsScreen({ pair, settings, actions, error }: { pair: LanguagePair; settings: AiSettings; actions: AiSettingsActions; error: string }) {
  const { accents, setAccent } = useSpeech()

  return (
    <section className="screen" aria-labelledby="settings-title">
      <h1 id="settings-title">Ajustes</h1>

      <section className="settings-group" aria-labelledby="engines-title">
        <h2 id="engines-title">Motores de búsqueda</h2>
        <p className="screen-intro">En «¿Cómo se dice?» responde el primero disponible; debajo puedes ver la respuesta de los demás. Ordénalos a tu gusto (se guarda en este dispositivo).</p>
        <EngineOrder pair={pair} settings={settings} />
      </section>

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
