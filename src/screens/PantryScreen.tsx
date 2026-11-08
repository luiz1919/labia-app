import { useEffect, useRef, useState } from 'react'
import type { FormEvent, KeyboardEvent, PointerEvent } from 'react'
import { Check, ChevronDown, ChevronRight, LoaderCircle, Mic, Pencil, Plus, Search, Square, Trash2, Undo2, X } from 'lucide-react'
import type { AiSettings } from 'firebase-app-kit/ai'
import EngineAnswerCard from '../components/EngineAnswerCard'
import SpeakButton from '../components/SpeakButton'
import { engineUnavailable } from '../engines'
import type { EngineContext } from '../engines'
import { languageName } from '../languages'
import type { LanguageCode, LanguagePair } from '../languages'
import { MAX_ENTRY_LENGTH, PANTRY_EXAMPLES, pantryPair, spokenEntry } from '../pantry'
import type { PantryItem } from '../pantry'
import { useEnginePreferences } from '../preferencesContext'
import { accentVariety, canRecognize, listenWhileHeld } from '../speech'
import type { HeldListening } from '../speech'
import { useSpeech } from '../speechContext'
import useHandsFree from '../useHandsFree'
import usePantry from '../usePantry'
import type { AddResult } from '../usePantry'

type Pantry = ReturnType<typeof usePantry>

function addedMessage(text: string, result: AddResult): string {
  return result === 'duplicate' ? `«${text}» ya estaba en la despensa.` : `Apuntado: «${text}».`
}

/** Listens until stopped and saves every word said after the keyword. */
function HandsFree({ lang, locale, onEntry, onActiveChange }: { lang: LanguageCode; locale: string; onEntry: (text: string) => AddResult; onActiveChange: (active: boolean) => void }) {
  const listening = useHandsFree(lang, locale, onEntry, onActiveChange)
  const { keyword, example } = PANTRY_EXAMPLES[lang]

  return (
    <div className="card hands-free">
      <div className="card-heading">
        <h2>Manos libres</h2>
        {listening.active && <span className="badge badge-live">Escuchando</span>}
      </div>
      <p className="card-meaning">
        Pulsa una vez y deja el móvil cerca. Cuando no sepas una palabra, di «<strong lang={lang}>{keyword}</strong>» y la palabra, en {languageName(lang).toLowerCase()}: «<em lang={lang}>{example}</em>». Suena un pitido cuando la guarda.
      </p>
      {listening.active
        ? <button className="primary-action stop-action" type="button" onClick={listening.stop}><Square size={18} aria-hidden="true" />Parar</button>
        : <button className="primary-action" type="button" onClick={listening.start}><Mic size={20} aria-hidden="true" />Empezar a escuchar</button>}
      {listening.active && (
        <p className="hands-free-status" role="status">
          <span className={`live-dot${listening.micOn ? ' live-dot-on' : ''}`} aria-hidden="true" />
          {listening.armed ? 'Te escucho: di la palabra.' : listening.micOn ? `Esperando «${keyword}»…` : 'Conectando el micrófono…'}
        </p>
      )}
      {listening.captured.length > 0 && (
        <ul className="captured-list" aria-label="Apuntadas ahora" aria-live="polite">
          {listening.captured.map((item, index) => (
            <li key={`${item.text}-${index}`}><Check size={16} aria-hidden="true" /><span lang={lang}>{item.text}</span>{item.result === 'duplicate' && <span className="badge">ya estaba</span>}</li>
          ))}
        </ul>
      )}
      {listening.active && listening.heard && <p className="card-source">Lo último que he oído: «<span lang={lang}>{listening.heard}</span>»</p>}
      {listening.error && <p className="error-message" role="alert">{listening.error}</p>}
      <p className="card-source">La pantalla se queda encendida mientras escucha. El reconocimiento de voz del navegador envía el audio a su servicio (en Chrome, el de Google), igual que el micrófono del teclado.</p>
    </div>
  )
}

const TAP_MS = 600
const HOLD_HINT = 'Mantén pulsado el botón mientras hablas y suéltalo al acabar.'

/** Speaks while the button is held; on release, proposes what it understood. */
function HoldToTalk({ lang, locale, disabled, onAdd }: { lang: LanguageCode; locale: string; disabled: boolean; onAdd: (text: string) => AddResult }) {
  const [phase, setPhase] = useState<'idle' | 'holding' | 'transcribing'>('idle')
  const [live, setLive] = useState('')
  const [proposal, setProposal] = useState<{ text: string; options: string[] } | null>(null)
  const [message, setMessage] = useState('')
  const session = useRef<HeldListening | null>(null)
  // A press shorter than this was a tap: the button has to be held while speaking.
  const held = useRef({ pressedAt: 0, releasedAt: 0 })

  useEffect(() => () => session.current?.cancel(), [])

  function tapped() {
    const { pressedAt, releasedAt } = held.current
    return releasedAt >= pressedAt && releasedAt - pressedAt < TAP_MS
  }

  function begin() {
    if (session.current || disabled) return
    setMessage('')
    setLive('')
    setProposal(null)
    setPhase('holding')
    held.current = { pressedAt: Date.now(), releasedAt: 0 }
    const listening = listenWhileHeld(locale, setLive)
    session.current = listening
    listening.result.then(guesses => {
      if (session.current !== listening) return
      const options = [...new Set(guesses.map(guess => spokenEntry(guess, lang)).filter(Boolean))]
      if (options.length) setProposal({ text: options[0], options })
      else setMessage(tapped() ? HOLD_HINT : `No he oído nada. ${HOLD_HINT}`)
    }, failure => {
      if (session.current === listening) setMessage(tapped() ? HOLD_HINT : failure instanceof Error ? failure.message : 'No se ha podido reconocer la voz.')
    }).finally(() => {
      if (session.current !== listening) return
      session.current = null
      setPhase('idle')
    })
  }

  function release() {
    if (!session.current) return
    held.current.releasedAt = Date.now()
    setPhase('transcribing')
    session.current.finish()
  }

  function press(event: PointerEvent<HTMLButtonElement>) {
    if (event.pointerType === 'mouse' && event.button !== 0) return
    // Keeps the release on this button even if the finger slides off it.
    try {
      event.currentTarget.setPointerCapture(event.pointerId)
    } catch {
      // Pointer already gone: the release still arrives as pointerup or pointercancel.
    }
    begin()
  }

  function key(event: KeyboardEvent<HTMLButtonElement>, down: boolean) {
    if (event.key !== ' ' && event.key !== 'Enter') return
    event.preventDefault()
    if (!down) release()
    else if (!event.repeat) begin()
  }

  function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const text = proposal?.text.trim()
    if (!text) return
    setMessage(addedMessage(text, onAdd(text)))
    setProposal(null)
  }

  function discard() {
    setProposal(null)
    setMessage('Descartado.')
  }

  return (
    <div className="hold-to-talk">
      <button
        className={`hold-button${phase === 'holding' ? ' hold-button-on' : ''}`}
        type="button"
        disabled={disabled || phase === 'transcribing'}
        aria-pressed={phase === 'holding'}
        onPointerDown={press}
        onPointerUp={release}
        onPointerCancel={release}
        onKeyDown={event => key(event, true)}
        onKeyUp={event => key(event, false)}
        onContextMenu={event => event.preventDefault()}
      >
        {phase === 'transcribing' ? <LoaderCircle className="spin" size={22} aria-hidden="true" /> : <Mic size={22} aria-hidden="true" />}
        {phase === 'holding' ? 'Suelta para terminar' : phase === 'transcribing' ? 'Transcribiendo…' : 'Mantén pulsado y habla'}
      </button>
      {disabled && <p className="card-source">Para usar este botón, para antes «Manos libres».</p>}
      {phase !== 'idle' && (
        <p className="live-text" lang={lang} role="status">
          {live || (phase === 'holding' ? <span className="hands-free-status"><span className="live-dot live-dot-on" aria-hidden="true" />Te escucho…</span> : '')}
        </p>
      )}
      {proposal && phase === 'idle' && (
        <form className="proposal" onSubmit={save}>
          <label className="card-label" htmlFor="spoken-word">¿Lo guardo en la despensa?</label>
          <div className="add-word-row">
            <input id="spoken-word" type="text" lang={lang} value={proposal.text} onChange={event => setProposal({ ...proposal, text: event.target.value })} autoComplete="off" autoCapitalize="none" maxLength={MAX_ENTRY_LENGTH} />
            <SpeakButton text={proposal.text} lang={lang} />
          </div>
          {proposal.options.length > 1 && (
            <div className="chip-filter" role="group" aria-label="Otras cosas que ha podido entender">
              <span className="chip-filter-label">¿O era…?</span>
              <div className="chip-wrap">
                {proposal.options.filter(option => option !== proposal.text).map(option => (
                  <button key={option} className="chip" type="button" lang={lang} onClick={() => setProposal({ ...proposal, text: option })}>{option}</button>
                ))}
              </div>
            </div>
          )}
          <div className="practice-actions">
            <button className="primary-action" type="submit" disabled={!proposal.text.trim()}><Check size={18} aria-hidden="true" />Guardar</button>
            <button className="secondary-button" type="button" onClick={discard}><X size={16} aria-hidden="true" />Descartar</button>
          </div>
        </form>
      )}
      {message && phase === 'idle' && !proposal && <p className="card-source" role="status">{message}</p>}
    </div>
  )
}

/** Push to talk, or typing. */
function AddWord({ lang, locale, handsFreeOn, onAdd }: { lang: LanguageCode; locale: string; handsFreeOn: boolean; onAdd: (text: string) => AddResult }) {
  const [text, setText] = useState('')
  const [message, setMessage] = useState('')

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const value = text.trim()
    if (!value) return
    setMessage(addedMessage(value, onAdd(value)))
    setText('')
  }

  return (
    <div className="card add-word">
      <h2>Añadir una palabra</h2>
      {canRecognize() && <HoldToTalk lang={lang} locale={locale} disabled={handsFreeOn} onAdd={onAdd} />}
      <form className="add-word-form" onSubmit={submit}>
        <label className="card-label" htmlFor="pantry-word">{canRecognize() ? 'O escríbela' : 'Escríbela'}, en {languageName(lang).toLowerCase()}</label>
        <div className="add-word-row">
          <input id="pantry-word" type="text" lang={lang} value={text} onChange={event => setText(event.target.value)} placeholder="Escribe una palabra" autoComplete="off" autoCapitalize="none" enterKeyHint="done" maxLength={MAX_ENTRY_LENGTH} />
          <button className="icon-button add-button" type="submit" disabled={!text.trim()} aria-label="Añadir" title="Añadir"><Plus size={20} /></button>
        </div>
        {message && <p className="card-source" role="status">{message}</p>}
      </form>
    </div>
  )
}

function PantryRow({ item, pair, settings, pantry, onSearch }: { item: PantryItem; pair: LanguagePair; settings: AiSettings; pantry: Pantry; onSearch: (text: string, lang: LanguageCode) => void }) {
  const { engineOrder } = useEnginePreferences()
  const { accents } = useSpeech()
  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState<string | null>(null)
  const itemPair = pantryPair(item.lang, pair)
  const context: EngineContext = { pair: itemPair, aiSettings: settings, variety: accentVariety(itemPair.target, accents[itemPair.target]) }
  const engine = engineOrder.find(id => !engineUnavailable(id, context))

  function saveEdit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (editing?.trim()) pantry.rename(item, editing)
    setEditing(null)
  }

  return (
    <li className={`pantry-item${item.reviewed ? ' pantry-reviewed' : ''}`}>
      <div className="pantry-row">
        <button className="pantry-word" type="button" aria-expanded={open} onClick={() => setOpen(!open)}>
          {open ? <ChevronDown size={18} aria-hidden="true" /> : <ChevronRight size={18} aria-hidden="true" />}
          <span lang={item.lang}>{item.text}</span>
        </button>
        <SpeakButton text={item.text} lang={item.lang} />
        {item.reviewed
          ? <button className="icon-button" type="button" onClick={() => pantry.setReviewed(item, false)} aria-label={`Volver a poner «${item.text}» por consultar`} title="Volver a la lista"><Undo2 size={18} /></button>
          : <button className="icon-button" type="button" onClick={() => pantry.setReviewed(item, true)} aria-label={`Marcar «${item.text}» como consultada`} title="Ya la he consultado"><Check size={20} /></button>}
      </div>
      {open && (
        <div className="pantry-details">
          {editing !== null && (
            <form className="add-word-row" onSubmit={saveEdit}>
              <label className="sr-only" htmlFor={`edit-${item.id}`}>Corregir la palabra</label>
              <input id={`edit-${item.id}`} type="text" lang={item.lang} value={editing} onChange={event => setEditing(event.target.value)} autoComplete="off" autoCapitalize="none" maxLength={MAX_ENTRY_LENGTH} autoFocus />
              <button className="secondary-button" type="submit">Guardar</button>
              <button className="secondary-button" type="button" onClick={() => setEditing(null)}>Cancelar</button>
            </form>
          )}
          {engine
            ? <EngineAnswerCard key={`${engine}-${item.text}`} id={engine} term={item.text} context={context} autoRun primary />
            : <p className="card-note">No hay ningún motor de búsqueda disponible. Revisa el orden y la IA en <a href="#/ajustes">Ajustes</a>.</p>}
          <div className="practice-actions">
            <button className="secondary-button" type="button" onClick={() => onSearch(item.text, item.lang)}><Search size={16} aria-hidden="true" />Abrir en Buscar</button>
            <button className="secondary-button" type="button" onClick={() => setEditing(item.text)}><Pencil size={16} aria-hidden="true" />Corregir</button>
            <button className="secondary-button danger-button" type="button" onClick={() => pantry.remove(item)}><Trash2 size={16} aria-hidden="true" />Borrar</button>
          </div>
        </div>
      )}
    </li>
  )
}

export default function PantryScreen({ uid, pair, settings, onSearch }: { uid: string; pair: LanguagePair; settings: AiSettings; onSearch: (text: string, lang: LanguageCode) => void }) {
  const pantry = usePantry(uid)
  const { accents } = useSpeech()
  const [handsFreeOn, setHandsFreeOn] = useState(false)
  const lang = pair.source
  const locale = accents[lang]
  const pending = pantry.items.filter(item => !item.reviewed)
  const reviewed = pantry.items.filter(item => item.reviewed)
  const add = (text: string) => pantry.add(text, lang)
  const row = (item: PantryItem) => <PantryRow key={item.id} item={item} pair={pair} settings={settings} pantry={pantry} onSearch={onSearch} />

  return (
    <section className="screen" aria-labelledby="pantry-title">
      <h1 id="pantry-title">Despensa</h1>
      <p className="screen-intro">Guarda las palabras que no te salen, por ejemplo mientras lees en voz alta, y consúltalas luego con calma.</p>
      {canRecognize()
        ? <HandsFree key={`${lang}|${locale}`} lang={lang} locale={locale} onEntry={add} onActiveChange={setHandsFreeOn} />
        : <p className="card-note">Este navegador no reconoce la voz, así que no puede apuntar palabras sin manos. En Android funciona con Chrome; en iPhone, con Safari.</p>}
      <AddWord key={`${lang}|${locale}`} lang={lang} locale={locale} handsFreeOn={handsFreeOn} onAdd={add} />
      {pantry.error && <p className="error-message" role="alert">{pantry.error}</p>}
      {!pantry.ready ? (
        <p className="engine-loading" role="status"><LoaderCircle className="spin" size={16} aria-hidden="true" />Abriendo la despensa…</p>
      ) : pantry.items.length === 0 ? (
        <div className="empty-state">
          <img src="/icons/labia.svg" width="56" height="56" alt="" />
          <p>La despensa está vacía. Las palabras que apuntes aparecerán aquí; tócalas para ver su traducción.</p>
        </div>
      ) : (
        <>
          <section className="result-group" aria-labelledby="pantry-pending">
            <h2 id="pantry-pending" className="eyebrow">Por consultar · {pending.length}</h2>
            {pending.length ? <ul className="pantry-list">{pending.map(row)}</ul> : <p className="card-note">¡Todo consultado!</p>}
          </section>
          {reviewed.length > 0 && (
            <details className="more-sources">
              <summary>Consultadas · {reviewed.length}</summary>
              <ul className="pantry-list">{reviewed.map(row)}</ul>
              <button className="text-button danger-text" type="button" onClick={() => { if (window.confirm(`¿Borrar las ${reviewed.length} palabras consultadas?`)) pantry.removeAll(reviewed) }}><Trash2 size={16} aria-hidden="true" />Vaciar las consultadas</button>
            </details>
          )}
        </>
      )}
    </section>
  )
}
