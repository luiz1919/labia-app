import { useEffect, useRef, useState } from 'react'
import type { ChangeEvent, FormEvent, ReactNode } from 'react'
import { Camera, ClipboardPaste, ExternalLink, LoaderCircle, Play, X } from 'lucide-react'
import type { AiSettings } from 'firebase-app-kit/ai'
import { askJson, errorMessage } from '../askAssistant'
import { parseLines, photoTextRequest } from '../assistant'
import ConfusableCard from '../components/ConfusableCard'
import EngineAnswerCard from '../components/EngineAnswerCard'
import FavoritesSection from '../components/FavoritesSection'
import FalseFriendCard from '../components/FalseFriendCard'
import IdiomCard from '../components/IdiomCard'
import PhrasalVerbCard from '../components/PhrasalVerbCard'
import SpeakButton from '../components/SpeakButton'
import { photoToJpegBase64 } from '../image'
import { languageName } from '../languages'
import type { LanguagePair } from '../languages'
import { fetchPronunciations, isSingleEnglishWord } from '../pronunciation'
import type { Pronunciation } from '../pronunciation'
import { answersWhileTyping, engineName, engineUnavailable } from '../engines'
import type { EngineContext } from '../engines'
import type { EngineAnswer, EngineId } from '../engines/types'
import { useEnginePreferences } from '../preferencesContext'
import { MIN_QUERY_LENGTH, normalize, phrasalVerbPartner, searchContent } from '../search'
import { accentVariety } from '../speech'
import { useSpeech } from '../speechContext'
import { sourceLinks } from '../sources'
import type { Favorite } from '../favorites'
import type { OwnIdiom } from '../ownIdioms.ts'
import useFavorites from '../useFavorites'

function Results({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="result-group" aria-label={title}>
      <h2 className="eyebrow">{title}</h2>
      <div className="card-list">{children}</div>
    </section>
  )
}

/** IPA and recordings of a single English word (Free Dictionary API), after a short pause in typing. */
function usePronunciations(word: string, enabled: boolean): Pronunciation[] {
  const [found, setFound] = useState<{ word: string; list: Pronunciation[] }>({ word: '', list: [] })
  const key = word.trim().toLowerCase()
  const active = enabled && isSingleEnglishWord(key)

  useEffect(() => {
    if (!active) return
    let current = true
    const timer = window.setTimeout(() => {
      void fetchPronunciations(key).then(list => { if (current) setFound({ word: key, list }) })
    }, 500)
    return () => {
      current = false
      window.clearTimeout(timer)
    }
  }, [key, active])

  return active && found.word === key ? found.list : []
}

function PronunciationCard({ word, list }: { word: string; list: Pronunciation[] }) {
  return (
    <article className="card">
      <div className="card-heading"><h3 className="speakable"><span lang="en">{word}</span><SpeakButton text={word} lang="en" /></h3></div>
      <ul className="pronunciations">
        {list.map(item => (
          <li key={item.audio || item.ipa}>
            {item.accent && <span className="badge badge-region">{item.accent}</span>}
            {item.ipa && <span className="ipa">{item.ipa}</span>}
            {item.audio && <button className="speak-button" type="button" onClick={() => void new Audio(item.audio).play().catch(() => {})} aria-label={`Escuchar la grabación${item.accent ? ` (${item.accent})` : ''}`} title="Escuchar la grabación"><Play size={16} aria-hidden="true" /></button>}
          </li>
        ))}
      </ul>
      <p className="card-source">Grabaciones de Wikimedia Commons vía Free Dictionary API.</p>
    </article>
  )
}

/** "Pegar" and "Foto": bring text from the clipboard or from a photo (read by the AI). */
function TextSources({ settings, onText }: { settings: AiSettings; onText: (text: string) => void }) {
  const input = useRef<HTMLInputElement>(null)
  const [lines, setLines] = useState<string[] | null>(null)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const canPaste = typeof navigator !== 'undefined' && Boolean(navigator.clipboard?.readText)

  async function paste() {
    setError('')
    try {
      const text = (await navigator.clipboard.readText()).replace(/\s+/g, ' ').trim()
      if (text) onText(text.slice(0, 200))
      else setError('El portapapeles está vacío.')
    } catch {
      setError('No se ha podido leer el portapapeles. Mantén pulsado el campo de búsqueda y elige «Pegar».')
    }
  }

  async function readPhoto(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    event.target.value = ''
    if (!file) return
    setBusy(true)
    setError('')
    setLines(null)
    try {
      const data = await photoToJpegBase64(file)
      const found = parseLines(await askJson(settings, { ...photoTextRequest(), images: [{ mediaType: 'image/jpeg', data }] }, 'low'))
      if (found.length === 1) onText(found[0])
      else if (found.length === 0) setError('No he encontrado texto en la foto.')
      else setLines(found)
    } catch (failure) {
      setError(errorMessage(failure))
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="text-sources">
      <div className="text-source-buttons">
        {canPaste && <button className="secondary-button" type="button" onClick={() => void paste()}><ClipboardPaste size={16} aria-hidden="true" />Pegar</button>}
        <button className="secondary-button" type="button" onClick={() => input.current?.click()} disabled={busy}>{busy ? <LoaderCircle className="spin" size={16} aria-hidden="true" /> : <Camera size={16} aria-hidden="true" />}{busy ? 'Leyendo la foto…' : 'Foto'}</button>
        <input ref={input} className="sr-only" type="file" accept="image/*" capture="environment" tabIndex={-1} aria-hidden="true" onChange={event => void readPhoto(event)} />
      </div>
      {error && <p className="error-message" role="alert">{error}</p>}
      {lines && (
        <div className="photo-lines" role="group" aria-label="Texto de la foto">
          <div className="photo-lines-heading"><span className="chip-filter-label">Texto de la foto: elige qué buscar</span><button className="icon-button" type="button" onClick={() => setLines(null)} aria-label="Cerrar" title="Cerrar"><X size={18} /></button></div>
          <div className="photo-line-list">
            {lines.map(line => <button key={line} type="button" className="chip photo-line" onClick={() => { onText(line); setLines(null) }}>{line}</button>)}
          </div>
        </div>
      )}
    </div>
  )
}

/** The query the engines use: the text after a pause in typing (or right away on Enter). */
function useSettledTerm(term: string, delay = 900): [string, (value?: string) => void] {
  const [settled, setSettled] = useState(term)
  useEffect(() => {
    const timer = window.setTimeout(() => setSettled(term), delay)
    return () => window.clearTimeout(timer)
  }, [term, delay])
  return [settled, (value = term) => setSettled(value)]
}

/** First usable engine answers; the others can be asked from the chips below it. */
function EngineAnswers({ term, submitted, context, favorites }: { term: string; submitted: string; context: EngineContext; favorites: ReturnType<typeof useFavorites> }) {
  const { engineOrder } = useEnginePreferences()
  const [opened, setOpened] = useState<{ term: string; ids: EngineId[] }>({ term: '', ids: [] })
  const usable = engineOrder.filter(id => !engineUnavailable(id, context))
  const primary = usable[0]
  const others = usable.slice(1)
  const extra = opened.term === term ? opened.ids : []
  if (!primary) return <p className="card-note">No hay ningún motor de búsqueda disponible. Revisa el orden y la IA en <a href="#/ajustes">Ajustes</a>.</p>
  const autoRun = (id: EngineId) => answersWhileTyping(id) || normalize(submitted) === normalize(term)

  function toggle(id: EngineId) {
    setOpened({ term, ids: extra.includes(id) ? extra.filter(other => other !== id) : [...extra, id] })
  }

  // Every card's star saves the query; the translations come from the card that was starred.
  const star = (id: EngineId) => ({ active: favorites.isFavorite(term, context.pair), onToggle: (answer: EngineAnswer) => favorites.toggle(term, context.pair, id, answer) })

  return (
    <section className="result-group" aria-label="Traducción">
      <h2 className="eyebrow">Traducción</h2>
      <div className="card-list">
        <EngineAnswerCard id={primary} term={term} context={context} autoRun={autoRun(primary)} primary favorite={star(primary)} />
        {others.length > 0 && (
          <div className="chip-filter" role="group" aria-label="Ver también la respuesta de otros motores">
            <span className="chip-filter-label">Ver también en</span>
            <div className="chip-row">
              {others.map(id => <button key={id} type="button" className="chip" aria-pressed={extra.includes(id)} onClick={() => toggle(id)}>{engineName(id)}</button>)}
            </div>
          </div>
        )}
        {extra.map(id => <EngineAnswerCard key={id} id={id} term={term} context={context} autoRun favorite={star(id)} />)}
      </div>
    </section>
  )
}

export default function SearchScreen({ uid, pair, term, onTermChange, onPairChange, settings, ownIdioms }: { uid: string; pair: LanguagePair; term: string; onTermChange: (term: string) => void; onPairChange: (pair: LanguagePair) => void; settings: AiSettings; ownIdioms: readonly OwnIdiom[] }) {
  const favorites = useFavorites(uid)
  const results = searchContent(term, pair, ownIdioms)
  const links = sourceLinks(term, pair)
  const partner = phrasalVerbPartner(pair)
  const pronunciations = usePronunciations(term, pair.source === 'en')
  const sourceName = languageName(pair.source).toLowerCase()
  const { accents } = useSpeech()
  const [settled, settleNow] = useSettledTerm(term)
  const [submitted, setSubmitted] = useState('')
  const engineContext: EngineContext = { pair, aiSettings: settings, variety: accentVariety(pair.target, accents[pair.target]) }
  const engineTerm = normalize(settled).length >= MIN_QUERY_LENGTH ? settled.trim() : ''

  // Labia's own results update while typing; Enter asks the engines right away (the AI only
  // answers on Enter) and closes the phone keyboard so the results are visible.
  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    settleNow()
    setSubmitted(term)
    if (document.activeElement instanceof HTMLElement) document.activeElement.blur()
  }

  // A favorite searches again, in its own direction, as if typed and sent with Enter.
  function openFavorite(favorite: Favorite) {
    if (favorite.pair.source !== pair.source || favorite.pair.target !== pair.target) onPairChange(favorite.pair)
    onTermChange(favorite.term)
    settleNow(favorite.term)
    setSubmitted(favorite.term)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <section className="screen" aria-labelledby="search-title">
      <h1 id="search-title">¿Cómo se dice?</h1>
      <form className="search-form" role="search" onSubmit={submit}>
        <label className="sr-only" htmlFor="search-term">Palabra, verbo o expresión en {sourceName}</label>
        <input id="search-term" type="search" lang={pair.source} value={term} onChange={event => onTermChange(event.target.value)} placeholder={`Palabra, verbo o expresión en ${sourceName}`} autoComplete="off" autoCapitalize="none" spellCheck={false} enterKeyHint="search" maxLength={200} />
      </form>
      <TextSources settings={settings} onText={onTermChange} />
      {links.length === 0 ? (
        <div className="empty-state">
          <img src="/icons/labia.svg" width="56" height="56" alt="" />
          <p>Escribe una palabra, un verbo o una expresión hecha, pégala o hazle una foto. También puedes compartir texto desde otra app con «Compartir» › Labia.</p>
        </div>
      ) : (
        <>
          {results.falseFriends.length > 0 && <Results title="Ojo: falso amigo">{results.falseFriends.map(match => <FalseFriendCard key={match.entry.id} match={match} pair={pair} />)}</Results>}
          {engineTerm && <EngineAnswers term={engineTerm} submitted={submitted} context={engineContext} favorites={favorites} />}
          {pronunciations.length > 0 && <Results title="Pronunciación"><PronunciationCard word={term.trim().toLowerCase()} list={pronunciations} /></Results>}
          {results.idioms.length > 0 && <Results title="Expresiones">{results.idioms.map(match => <IdiomCard key={`${match.own ? 'own' : 'app'}-${match.idiom.id}`} idiom={match.idiom} expression={match.expression} pair={pair} own={match.own} />)}</Results>}
          {partner && results.phrasalVerbs.length > 0 && <Results title="Phrasal verbs">{results.phrasalVerbs.map(phrasal => <PhrasalVerbCard key={phrasal.id} phrasal={phrasal} partner={partner} />)}</Results>}
          {results.confusables.length > 0 && <Results title="Diferencias">{results.confusables.map(entry => <ConfusableCard key={entry.id} entry={entry} pair={pair} />)}</Results>}
          <details className="more-sources">
            <summary>Más diccionarios (se abren fuera de Labia)</summary>
            <ul className="source-links">
              {links.map(({ source, url }) => (
                <li key={source.id}>
                  <a className="source-link" href={url} target="_blank" rel="noopener noreferrer">
                    <span className="source-text"><strong>{source.name}</strong><span>{source.description}</span></span>
                    <ExternalLink size={18} aria-hidden="true" />
                  </a>
                </li>
              ))}
            </ul>
          </details>
        </>
      )}
      <FavoritesSection favorites={favorites} pair={pair} onOpen={openFavorite} />
    </section>
  )
}
