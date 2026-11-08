import { useCallback, useEffect, useRef, useState } from 'react'
import { Download, ExternalLink, LoaderCircle, RotateCcw, Sparkles } from 'lucide-react'
import { askEngine, engineName, engineUnavailable } from '../engines'
import type { EngineContext } from '../engines'
import { chromeAvailability } from '../engines/chromeTranslator'
import type { TranslatorAvailability } from '../engines/chromeTranslator'
import type { AnswerGroup, EngineAnswer, EngineId } from '../engines/types'
import { errorMessage } from '../askAssistant'
import SpeakButton from './SpeakButton'

type State =
  | { status: 'idle' }
  | { status: 'loading'; progress?: number }
  | { status: 'done'; answer: EngineAnswer }
  | { status: 'error'; error: string }

function Group({ group }: { group: AnswerGroup }) {
  return (
    <div className="answer-group">
      {group.label && <p className="card-label">{group.label}</p>}
      {group.meaning && <p className="answer-meaning">{group.meaning}</p>}
      <ul className="answer-items">
        {group.items.map(item => (
          <li key={item.text}>
            <span className="speakable"><strong lang={item.lang}>{item.text}</strong><SpeakButton text={item.text} lang={item.lang} size={16} /></span>
            {item.note && <span className="badge">{item.note}</span>}
          </li>
        ))}
      </ul>
      {group.examples?.map(example => (
        <p key={example.text} className="example">
          <span className="example-original"><span lang={example.lang}>{example.text}</span><SpeakButton text={example.text} lang={example.lang} size={16} /></span>
          {example.translation && <span className="example-translation" lang={example.translationLang}>{example.translation}</span>}
        </p>
      ))}
    </div>
  )
}

/**
 * The answer of one search engine for the current query. `autoRun`: ask as soon as the query
 * settles; otherwise a button asks (the AI, or the Chrome translator before its download).
 */
export default function EngineAnswerCard({ id, term, context, autoRun, primary = false }: { id: EngineId; term: string; context: EngineContext; autoRun: boolean; primary?: boolean }) {
  const key = `${id}|${context.pair.source}|${context.pair.target}|${term}`
  // Results are tagged with the query they belong to: a new query starts idle without resetting state.
  const [result, setResult] = useState<{ key: string; state: State }>({ key: '', state: { status: 'idle' } })
  const [chromeCheck, setChromeCheck] = useState<{ key: string; availability: TranslatorAvailability } | null>(null)
  const chrome = chromeCheck?.key === key ? chromeCheck.availability : null
  const reason = engineUnavailable(id, context)
  // An automatic request in flight has no stored result yet: it shows as loading.
  const asking = autoRun && !reason && Boolean(term.trim()) && (id !== 'chrome' || chrome === 'available')
  const state: State = result.key === key ? result.state : asking ? { status: 'loading' } : { status: 'idle' }
  const name = engineName(id)
  const contextRef = useRef(context)
  useEffect(() => { contextRef.current = context })

  // Asks the engine; every state change happens when it answers (asynchronously).
  const latest = useRef('')
  const fetchAnswer = useCallback(() => {
    latest.current = key
    // Only the latest query of this card writes its answer: late answers to older ones are dropped.
    const update = (next: State) => { if (latest.current === key) setResult({ key, state: next }) }
    askEngine(id, term, contextRef.current, loaded => update({ status: 'loading', progress: loaded })).then(
      answer => update({ status: 'done', answer }),
      failure => update({ status: 'error', error: errorMessage(failure) }),
    )
  }, [id, term, key])

  // From a button: show "loading" right away.
  function run() {
    setResult({ key, state: { status: 'loading' } })
    fetchAnswer()
  }

  useEffect(() => {
    if (reason || !term.trim()) return
    if (id !== 'chrome') {
      if (autoRun) fetchAnswer()
      return
    }
    let current = true
    void chromeAvailability(contextRef.current.pair).then(availability => {
      if (!current) return
      setChromeCheck({ key, availability })
      if (availability === 'available' && autoRun) fetchAnswer()
    })
    return () => { current = false }
  }, [id, key, term, autoRun, reason, fetchAnswer])

  const answer = state.status === 'done' ? state.answer : null

  return (
    <article className={`card engine-card${primary ? ' engine-primary' : ''}`} aria-label={`Respuesta de ${name}`} aria-busy={state.status === 'loading'}>
      <div className="engine-heading">
        <span className="engine-name">{name}</span>
        {answer?.source?.href && <a className="engine-source" href={answer.source.href} target="_blank" rel="noopener noreferrer">{answer.source.label}<ExternalLink size={12} aria-hidden="true" /></a>}
      </div>
      {reason ? (
        <p className="card-note">{reason}{id === 'ai' && <> <a href="#/ajustes">Ir a Ajustes</a></>}</p>
      ) : state.status === 'idle' ? (
        id === 'chrome' && chrome === 'unavailable' ? <p className="card-note">El traductor de Chrome no tiene este par de idiomas.</p>
        : id === 'chrome' && chrome === null ? <p role="status">Comprobando el traductor…</p>
        : (
          <button className="secondary-button" type="button" onClick={run}>
            {id === 'chrome' && chrome !== 'available' ? <><Download size={16} aria-hidden="true" />Descargar el traductor (una vez)</> : id === 'ai' ? <><Sparkles size={16} aria-hidden="true" />Preguntar a la IA</> : <>Buscar en {name}</>}
          </button>
        )
      ) : state.status === 'loading' ? (
        <p className="engine-loading" role="status"><LoaderCircle className="spin" size={16} aria-hidden="true" />{state.progress !== undefined && state.progress < 1 ? `Descargando el idioma… ${Math.round(state.progress * 100)} %` : id === 'ai' ? 'Pensando…' : 'Buscando…'}</p>
      ) : state.status === 'error' ? (
        <div className="engine-error"><p className="error-message" role="alert">{state.error}</p><button className="secondary-button" type="button" onClick={run}><RotateCcw size={16} aria-hidden="true" />Reintentar</button></div>
      ) : answer && answer.groups.length === 0 ? (
        <p className="card-note">{answer.notes?.[0] ?? `No hay resultados en ${name}.`}</p>
      ) : answer && (
        <>
          {answer.groups.map((group, index) => <Group key={`${group.label}-${index}`} group={group} />)}
          {answer.notes?.map(note => <p key={note} className="card-note">{note}</p>)}
          {answer.source && !answer.source.href && <p className="card-source">{answer.source.label}</p>}
        </>
      )}
    </article>
  )
}
