import { Fragment, useMemo, useState } from 'react'
import type { FormEvent } from 'react'
import { LoaderCircle, Mic, RefreshCw, Sparkles, Square, Snail, Volume2 } from 'lucide-react'
import { activeAi, providerName } from 'firebase-app-kit/ai'
import type { AiSettings } from 'firebase-app-kit/ai'
import { askJson, errorMessage, NO_AI_MESSAGE } from '../askAssistant'
import { parseReadingText, readingTextRequest } from '../assistant'
import type { ReadingExercise } from '../assistant'
import SpeakButton from '../components/SpeakButton'
import { READING_LEVELS, READING_TEXTS } from '../data/readingTexts'
import type { ReadingLevel } from '../data/readingTexts'
import { GRADE_LABELS, gradeReading, readingTokens, spokenWords, summarize, troubleWords, verdictFor } from '../reading'
import type { GradedWord } from '../reading'
import { accentVariety, canRecognize, canSpeak, speak } from '../speech'
import { useSpeech } from '../speechContext'
import useReadAloud from '../useReadAloud'

type Source = 'texts' | 'own' | 'ai'

const MAX_OWN_TEXT = 600
const MIN_OWN_WORDS = 3
const LEVELS = Object.keys(READING_LEVELS) as ReadingLevel[]

function LevelChips({ value, onChange, all = false }: { value: ReadingLevel | 'all'; onChange: (level: ReadingLevel | 'all') => void; all?: boolean }) {
  return (
    <div className="chip-row" role="group" aria-label="Nivel">
      {(all ? (['all', ...LEVELS] as const) : LEVELS).map(level => (
        <button key={level} type="button" className="chip" aria-pressed={value === level} onClick={() => onChange(level)}>{level === 'all' ? 'Todos' : READING_LEVELS[level]}</button>
      ))}
    </div>
  )
}

function BundledTexts({ onChoose }: { onChoose: (exercise: ReadingExercise) => void }) {
  const [level, setLevel] = useState<ReadingLevel | 'all'>('all')
  const texts = READING_TEXTS.filter(entry => level === 'all' || entry.level === level)
  return (
    <>
      <LevelChips value={level} onChange={setLevel} all />
      <ul className="tiles">
        {texts.map(entry => (
          <li key={entry.id}>
            <button className="text-choice" type="button" onClick={() => onChoose({ title: entry.title, text: entry.text })}>
              <span className="text-choice-heading"><strong>{entry.title}</strong><span className="badge">{READING_LEVELS[entry.level]}</span></span>
              <span className="text-choice-focus">{entry.focus}</span>
              <span className="text-choice-snippet" lang="en">{entry.text.slice(0, 70)}…</span>
            </button>
          </li>
        ))}
      </ul>
    </>
  )
}

function OwnText({ onChoose }: { onChoose: (exercise: ReadingExercise) => void }) {
  const [text, setText] = useState('')
  const words = readingTokens(text).length

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (words >= MIN_OWN_WORDS) onChoose({ title: 'Mi texto', text: text.trim() })
  }

  return (
    <form className="assistant-form" onSubmit={submit}>
      <label htmlFor="own-reading">Pega o escribe un texto en inglés</label>
      <textarea id="own-reading" className="text-area" lang="en" rows={6} value={text} onChange={event => setText(event.target.value)} maxLength={MAX_OWN_TEXT} placeholder="Mejor si es corto: unas 60 palabras." />
      <p className="card-note">Escribe los números con letras («twenty», no «20»): el reconocedor los escribe con cifras y no se pueden comparar.</p>
      <button className="primary-action" type="submit" disabled={words < MIN_OWN_WORDS}>Leer este texto</button>
    </form>
  )
}

function AiText({ settings, ready, locale, onChoose }: { settings: AiSettings; ready: boolean; locale: string; onChoose: (exercise: ReadingExercise) => void }) {
  const [level, setLevel] = useState<ReadingLevel>('medium')
  const [topic, setTopic] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const ai = activeAi(settings)

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (busy) return
    setBusy(true)
    setError('')
    try {
      onChoose(parseReadingText(await askJson(settings, readingTextRequest(level, topic, accentVariety('en', locale)), 'low')))
    } catch (failure) {
      setError(errorMessage(failure))
      setBusy(false)
    }
  }

  if (!ready) return <p role="status">Cargando los ajustes de IA…</p>
  if (!ai) return <div className="card-note">{NO_AI_MESSAGE} <a href="#/ajustes">Ir a Ajustes</a></div>
  return (
    <form className="assistant-form" onSubmit={submit}>
      <div className="chip-filter">
        <span className="chip-filter-label">Nivel</span>
        <LevelChips value={level} onChange={next => next !== 'all' && setLevel(next)} />
      </div>
      <label htmlFor="reading-topic">Tema (opcional)</label>
      <input id="reading-topic" className="text-input" value={topic} onChange={event => setTopic(event.target.value)} maxLength={80} placeholder="Viajes, trabajo, cocina…" />
      <button className="primary-action" type="submit" disabled={busy}>{busy ? <LoaderCircle className="spin" size={18} aria-hidden="true" /> : <Sparkles size={18} aria-hidden="true" />}{busy ? 'Escribiendo…' : 'Generar un texto'}</button>
      {error && <p className="error-message" role="alert">{error}</p>}
      <p className="ai-footer">Lo escribe {providerName(ai.provider)} ({ai.model}) con tu clave.</p>
    </form>
  )
}

/** The text with each word shaded by its grade, or (while listening) by whether it was reached. */
function ReadingText({ words, live = false }: { words: readonly GradedWord[]; live?: boolean }) {
  return (
    <p className="reading-text" lang="en">
      {words.map((word, index) => {
        const grade = word.grade
        const className = !grade ? '' : live ? (grade === 'unread' ? '' : ' word-done') : ` word-${grade}`
        return (
          <Fragment key={index}>
            {index > 0 && ' '}
            <span className={`word${className}`}>
              {word.text}
              {!live && (grade === 'good' || grade === 'bad' || grade === 'horrible') && <span className="sr-only"> ({GRADE_LABELS[grade]})</span>}
            </span>
          </Fragment>
        )
      })}
    </p>
  )
}

function Results({ exercise, words, heard, locale, onAgain, onOther }: { exercise: ReadingExercise; words: readonly GradedWord[]; heard: string; locale: string; onAgain: () => void; onOther: () => void }) {
  const summary = summarize(words)
  const trouble = troubleWords(words)
  return (
    <>
      <article className="card" role="status">
        <p className="card-label">{exercise.title}</p>
        <p className="reading-score"><strong>{summary.percent}</strong> / 100</p>
        <p className="card-meaning">{verdictFor(summary.percent)}</p>
        <div className="badges">
          <span className="badge grade-good">{summary.good} {GRADE_LABELS.good.toLowerCase()}</span>
          <span className="badge grade-bad">{summary.bad} {GRADE_LABELS.bad.toLowerCase()}</span>
          <span className="badge grade-horrible">{summary.horrible} {GRADE_LABELS.horrible.toLowerCase()}</span>
        </div>
        {summary.unread > 0 && <p className="card-note">Te has parado antes del final: {summary.unread} {summary.unread === 1 ? 'palabra' : 'palabras'} sin leer, que no cuentan.</p>}
      </article>
      <div className="card">
        <ReadingText words={words} />
        <div className="practice-actions">
          <button className="secondary-button" type="button" onClick={() => speak(exercise.text, locale)}><Volume2 size={16} aria-hidden="true" />Escuchar el texto</button>
        </div>
      </div>
      {trouble.length > 0 && (
        <div className="card">
          <h2 className="card-label">Para practicar</h2>
          <ul className="trouble-list">
            {trouble.map(item => (
              <li key={item.word}>
                <span className={`badge grade-${item.grade}`}>{GRADE_LABELS[item.grade]}</span>
                <strong lang="en">{item.word}</strong>
                <SpeakButton text={item.word} lang="en" />
                <span className="trouble-heard">{item.heard ? <>He oído «<span lang="en">{item.heard}</span>»</> : 'No se ha oído'}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
      <details className="card-details">
        <summary>Lo que he entendido</summary>
        <p lang="en" className="card-meaning">{heard}</p>
      </details>
      <p className="card-note">Mide lo que entiende el reconocedor de voz de tu móvil: una palabra marcada puede ser tu pronunciación o un fallo suyo. Si dudas, escúchala y repítela.</p>
      <div className="practice-actions">
        <button className="primary-action" type="button" onClick={onAgain}><RefreshCw size={18} aria-hidden="true" />Intentarlo otra vez</button>
        <button className="secondary-button" type="button" onClick={onOther}>Otro texto</button>
      </div>
    </>
  )
}

function Reader({ exercise, locale, onOther }: { exercise: ReadingExercise; locale: string; onOther: () => void }) {
  const reader = useReadAloud(locale)
  const [result, setResult] = useState<{ words: GradedWord[]; heard: string } | null>(null)
  const [finishing, setFinishing] = useState(false)
  const [message, setMessage] = useState('')
  const live = useMemo(() => (reader.active ? gradeReading(exercise.text, reader.phrases) : null), [reader.active, reader.phrases, exercise.text])
  const total = readingTokens(exercise.text).length
  const reached = live?.filter(word => word.grade && word.grade !== 'unread').length ?? 0
  const recognizable = canRecognize()

  function start() {
    // The device's own voice would be picked up by the microphone.
    if (canSpeak()) window.speechSynthesis.cancel()
    setMessage('')
    setResult(null)
    reader.start()
  }

  async function finish() {
    setFinishing(true)
    const phrases = await reader.finish()
    setFinishing(false)
    if (!spokenWords(phrases).length) {
      setMessage('No he oído nada. Acerca el móvil y lee en voz alta.')
      return
    }
    setResult({ words: gradeReading(exercise.text, phrases), heard: phrases.join(' ') })
  }

  if (result) return <Results exercise={exercise} words={result.words} heard={result.heard} locale={locale} onAgain={() => setResult(null)} onOther={onOther} />

  return (
    <>
      <article className="card">
        <p className="card-label">{exercise.title}</p>
        <ReadingText words={live ?? readingTokens(exercise.text).map(text => ({ text, grade: null }))} live />
        {reader.active && <p className="listen-status" role="status">{finishing ? 'Terminando…' : reader.micOn ? `Escuchando… ${reached} de ${total} palabras` : 'Reconectando el micrófono…'}</p>}
      </article>
      {!recognizable && <p className="error-message">Este navegador no reconoce la voz. Prueba con Chrome en tu móvil.</p>}
      {(reader.error || message) && <p className="error-message" role="alert">{reader.error || message}</p>}
      {reader.active ? (
        <div className="practice-actions">
          <button className="primary-action stop-action" type="button" onClick={() => void finish()} disabled={finishing}><Square size={18} aria-hidden="true" />He terminado</button>
          <button className="secondary-button" type="button" onClick={reader.cancel} disabled={finishing}>Cancelar</button>
        </div>
      ) : (
        <>
          <button className="primary-action" type="button" onClick={start} disabled={!recognizable}><Mic size={20} aria-hidden="true" />Empezar a leer</button>
          <div className="practice-actions">
            <button className="secondary-button" type="button" onClick={() => speak(exercise.text, locale)} disabled={!canSpeak()}><Volume2 size={16} aria-hidden="true" />Escuchar</button>
            <button className="secondary-button" type="button" onClick={() => speak(exercise.text, locale, 0.6)} disabled={!canSpeak()}><Snail size={16} aria-hidden="true" />Despacio</button>
            <button className="secondary-button" type="button" onClick={onOther}>Otro texto</button>
          </div>
          <p className="card-note">Lee con calma, en voz alta y con el móvil cerca. Al terminar pulsa «He terminado».</p>
        </>
      )}
    </>
  )
}

/** "Leer en voz alta": read an English text and see which words came out good, bad or horrible. */
export default function ReadAloudScreen({ settings, ready }: { settings: AiSettings; ready: boolean }) {
  const { accents } = useSpeech()
  const locale = accents.en
  const [source, setSource] = useState<Source>('texts')
  const [exercise, setExercise] = useState<ReadingExercise | null>(null)

  return (
    <section className="screen" aria-labelledby="read-title">
      <h1 id="read-title">Leer en voz alta</h1>
      {exercise ? (
        <Reader key={exercise.text} exercise={exercise} locale={locale} onOther={() => setExercise(null)} />
      ) : (
        <>
          <p className="screen-intro">Lee un texto en inglés en voz alta y te digo qué palabras se han entendido bien, mal o fatal.</p>
          <div className="segmented" role="tablist" aria-label="Texto">
            <button type="button" role="tab" aria-selected={source === 'texts'} onClick={() => setSource('texts')}>Textos</button>
            <button type="button" role="tab" aria-selected={source === 'own'} onClick={() => setSource('own')}>El mío</button>
            <button type="button" role="tab" aria-selected={source === 'ai'} onClick={() => setSource('ai')}>Con IA</button>
          </div>
          {source === 'texts' && <BundledTexts onChoose={setExercise} />}
          {source === 'own' && <OwnText onChoose={setExercise} />}
          {source === 'ai' && <AiText settings={settings} ready={ready} locale={locale} onChoose={setExercise} />}
        </>
      )}
    </section>
  )
}
