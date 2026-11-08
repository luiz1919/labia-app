import { useState } from 'react'
import type { FormEvent } from 'react'
import { Lightbulb, LoaderCircle, Search, SpellCheck2 } from 'lucide-react'
import { activeAi, providerName } from 'firebase-app-kit/ai'
import type { AiSettings } from 'firebase-app-kit/ai'
import { askJson, errorMessage, NO_AI_MESSAGE } from '../askAssistant'
import { naturalnessRequest, parseCandidates, parseNaturalness, tipOfTongueRequest, VERDICT_LABELS } from '../assistant'
import type { Candidate, Naturalness } from '../assistant'
import { Badges } from '../components/bits'
import SpeakButton from '../components/SpeakButton'
import { languageName } from '../languages'
import type { LanguageCode, LanguagePair } from '../languages'
import { accentVariety } from '../speech'
import { useSpeech } from '../speechContext'

type Mode = 'tip' | 'natural'

/** Two chips to choose one of the pair's languages. */
function LanguageChoice({ label, pair, value, onChange }: { label: string; pair: LanguagePair; value: LanguageCode; onChange: (lang: LanguageCode) => void }) {
  return (
    <div className="chip-filter" role="group" aria-label={label}>
      <span className="chip-filter-label">{label}</span>
      <div className="chip-row">
        {[pair.target, pair.source].map(lang => <button key={lang} type="button" className="chip" aria-pressed={value === lang} onClick={() => onChange(lang)}>{languageName(lang)}</button>)}
      </div>
    </div>
  )
}

function useAsk<T>() {
  const [result, setResult] = useState<T | null>(null)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  async function run(task: () => Promise<T>) {
    setBusy(true)
    setError('')
    setResult(null)
    try {
      setResult(await task())
    } catch (failure) {
      setError(errorMessage(failure))
    } finally {
      setBusy(false)
    }
  }

  return { result, busy, error, run }
}

function TipOfTongue({ pair, settings, onSearch }: { pair: LanguagePair; settings: AiSettings; onSearch: (term: string, lang: LanguageCode) => void }) {
  const [lang, setLang] = useState<LanguageCode>(pair.target)
  const [description, setDescription] = useState('')
  const ask = useAsk<Candidate[]>()
  const other = lang === pair.target ? pair.source : pair.target

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!description.trim() || ask.busy) return
    void ask.run(async () => parseCandidates(await askJson(settings, tipOfTongueRequest(description, lang, other), 'low')))
  }

  return (
    <>
      <form className="assistant-form" onSubmit={submit}>
        <LanguageChoice label="La palabra que busco está en" pair={pair} value={lang} onChange={setLang} />
        <label htmlFor="tip-description">Descríbela como puedas</label>
        <textarea id="tip-description" className="text-area" rows={3} value={description} onChange={event => setDescription(event.target.value)} placeholder="Eso que se pone debajo de la puerta para que no entre el aire" maxLength={600} />
        <button className="primary-action" type="submit" disabled={!description.trim() || ask.busy}>{ask.busy ? <LoaderCircle className="spin" size={18} aria-hidden="true" /> : <Lightbulb size={18} aria-hidden="true" />}{ask.busy ? 'Pensando…' : 'Encontrar la palabra'}</button>
      </form>
      {ask.error && <p className="error-message" role="alert">{ask.error}</p>}
      {ask.result && (ask.result.length === 0
        ? <p className="card-note" role="status">No se me ocurre ninguna. Prueba a describirla de otra forma.</p>
        : (
          <div className="card-list" role="status">
            {ask.result.map(candidate => (
              <article key={candidate.word} className="card">
                <div className="card-heading">
                  <h3 className="speakable"><span lang={lang}>{candidate.word}</span><SpeakButton text={candidate.word} lang={lang} /></h3>
                  <button className="text-button" type="button" onClick={() => onSearch(candidate.word, lang)}><Search size={16} aria-hidden="true" />Buscar</button>
                </div>
                {candidate.translation && <p className="card-also">En {languageName(other).toLowerCase()}: <span lang={other}>{candidate.translation}</span></p>}
                {candidate.explanation && <p className="card-meaning">{candidate.explanation}</p>}
                {candidate.example && <p className="example"><span className="example-original"><span lang={lang}>{candidate.example}</span><SpeakButton text={candidate.example} lang={lang} size={16} /></span></p>}
              </article>
            ))}
          </div>
        ))}
    </>
  )
}

function SoundsNatural({ pair, settings }: { pair: LanguagePair; settings: AiSettings }) {
  const { accents } = useSpeech()
  const [lang, setLang] = useState<LanguageCode>(pair.target)
  const [sentence, setSentence] = useState('')
  const ask = useAsk<Naturalness>()
  const review = ask.result

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!sentence.trim() || ask.busy) return
    void ask.run(async () => parseNaturalness(await askJson(settings, naturalnessRequest(sentence, lang, accentVariety(lang, accents[lang])))))
  }

  return (
    <>
      <form className="assistant-form" onSubmit={submit}>
        <LanguageChoice label="Mi frase está en" pair={pair} value={lang} onChange={setLang} />
        <label htmlFor="natural-sentence">Escribe la frase</label>
        <textarea id="natural-sentence" className="text-area" lang={lang} rows={3} value={sentence} onChange={event => setSentence(event.target.value)} placeholder={lang === 'en' ? 'I am agree with you' : 'Estoy muy excitado por el viaje'} maxLength={1000} />
        <button className="primary-action" type="submit" disabled={!sentence.trim() || ask.busy}>{ask.busy ? <LoaderCircle className="spin" size={18} aria-hidden="true" /> : <SpellCheck2 size={18} aria-hidden="true" />}{ask.busy ? 'Revisando…' : '¿Suena natural?'}</button>
      </form>
      {ask.error && <p className="error-message" role="alert">{ask.error}</p>}
      {review && (
        <article className={`card verdict-card verdict-${review.verdict}`} role="status">
          <p className="verdict-label">{VERDICT_LABELS[review.verdict]}</p>
          {review.verdict !== 'natural' && <p className="card-label">Mejor así</p>}
          <div className="card-heading">
            <h3 className="speakable"><span lang={lang}>{review.corrected}</span><SpeakButton text={review.corrected} lang={lang} /></h3>
            <Badges register={review.register} />
          </div>
          {review.explanation && <p className="card-meaning">{review.explanation}</p>}
          {review.alternatives.length > 0 && (
            <>
              <p className="card-label">Otras formas de decirlo</p>
              <ul className="equivalents">
                {review.alternatives.map(alternative => (
                  <li key={alternative.text}>
                    <span className="equivalent-text"><strong lang={lang}>{alternative.text}</strong><SpeakButton text={alternative.text} lang={lang} size={16} /></span>
                    {alternative.nuance && <span className="literal">{alternative.nuance}</span>}
                  </li>
                ))}
              </ul>
            </>
          )}
        </article>
      )}
    </>
  )
}

/** "Asistente": the features that need an AI (the user's own key, set up in Ajustes). */
export default function AssistantScreen({ pair, settings, ready, onSearch }: { pair: LanguagePair; settings: AiSettings; ready: boolean; onSearch: (term: string, lang: LanguageCode) => void }) {
  const [mode, setMode] = useState<Mode>('tip')
  const ai = activeAi(settings)

  return (
    <section className="screen" aria-labelledby="assistant-title">
      <h1 id="assistant-title">Asistente</h1>
      <div className="segmented" role="tablist" aria-label="Herramienta">
        <button type="button" role="tab" aria-selected={mode === 'tip'} onClick={() => setMode('tip')}>Punta de la lengua</button>
        <button type="button" role="tab" aria-selected={mode === 'natural'} onClick={() => setMode('natural')}>¿Suena natural?</button>
      </div>
      <p className="screen-intro">{mode === 'tip' ? 'Describe la palabra que no te sale y te propongo las más probables.' : 'Escribe una frase y te digo si un nativo la diría así, con alternativas.'}</p>
      {!ready ? <p role="status">Cargando los ajustes de IA…</p> : !ai ? (
        <div className="card-note">{NO_AI_MESSAGE} <a href="#/ajustes">Ir a Ajustes</a></div>
      ) : (
        <>
          {mode === 'tip' ? <TipOfTongue key={`${pair.source}-${pair.target}`} pair={pair} settings={settings} onSearch={onSearch} /> : <SoundsNatural key={`${pair.source}-${pair.target}`} pair={pair} settings={settings} />}
          <p className="ai-footer">Responde {providerName(ai.provider)} ({ai.model}) con tu clave. Revisa lo importante: la IA puede equivocarse.</p>
        </>
      )}
    </section>
  )
}
