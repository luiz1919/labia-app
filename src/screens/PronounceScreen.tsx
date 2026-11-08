import { useMemo, useRef, useState } from 'react'
import { Check, Mic, RefreshCw, Snail, Square, Volume2, X } from 'lucide-react'
import { MINIMAL_PAIRS } from '../data/minimalPairs'
import { REGION_LABELS } from '../data/types'
import type { MinimalPair } from '../data/types'
import { languageName } from '../languages'
import type { LanguageCode, LanguagePair } from '../languages'
import { canRecognize, canSpeak, heardAs, listen, speak } from '../speech'
import { useSpeech } from '../speechContext'

/** Fisher-Yates shuffle into a new array. */
function shuffled<T>(items: readonly T[]): T[] {
  const copy = [...items]
  for (let index = copy.length - 1; index > 0; index--) {
    const other = Math.floor(Math.random() * (index + 1))
    ;[copy[index], copy[other]] = [copy[other], copy[index]]
  }
  return copy
}

type Listening = { target: string; stop: () => void } | null
type Heard = { target: string; alternatives: string[]; ok: boolean } | { target: string; error: string } | null

/** Microphone: says `target`, then shows what was heard. */
function useRecognition(locale: string) {
  const [listening, setListening] = useState<Listening>(null)
  const [heard, setHeard] = useState<Heard>(null)

  async function start(target: string) {
    listening?.stop()
    setHeard(null)
    const session = listen(locale)
    setListening({ target, stop: session.stop })
    try {
      const alternatives = await session.result
      setHeard({ target, alternatives, ok: heardAs(target, alternatives) })
    } catch (failure) {
      setHeard({ target, error: failure instanceof Error ? failure.message : 'No se ha podido reconocer la voz.' })
    } finally {
      setListening(null)
    }
  }

  return { listening, heard, start, reset: () => setHeard(null) }
}

function HeardMessage({ heard, lang, other }: { heard: Heard; lang: LanguageCode; other?: string }) {
  if (!heard) return null
  if ('error' in heard) return <p className="feedback feedback-wrong" role="status"><X size={16} aria-hidden="true" />{heard.error}</p>
  const best = heard.alternatives[0]
  if (heard.ok) return <p className="feedback feedback-right" role="status"><Check size={16} aria-hidden="true" /><span>¡Bien! He oído «<span lang={lang}>{best}</span>».</span></p>
  const confused = other && heardAs(other, heard.alternatives)
  return (
    <p className="feedback feedback-wrong" role="status">
      <X size={16} aria-hidden="true" />
      <span>{confused ? <>Ha sonado a «<span lang={lang}>{other}</span>». Fíjate en la pista y prueba otra vez.</> : <>He oído «<span lang={lang}>{best}</span>». Prueba otra vez.</>}</span>
    </p>
  )
}

function MinimalPairPractice({ pairs, lang, locale }: { pairs: readonly MinimalPair[]; lang: LanguageCode; locale: string }) {
  // Shuffled once per mount (the screen remounts this component when the language or accent changes).
  const [order] = useState(() => shuffled(pairs))
  const [index, setIndex] = useState(0)
  const [secret, setSecret] = useState(() => (Math.random() < 0.5 ? 0 : 1))
  const [answer, setAnswer] = useState<number | null>(null)
  const [score, setScore] = useState({ right: 0, total: 0 })
  const recognition = useRecognition(locale)
  const current = order[index % order.length]
  const timer = useRef<number | undefined>(undefined)

  if (!current) return null
  const [first, second] = current.words

  function choose(option: number) {
    if (answer !== null) return
    setAnswer(option)
    setScore(previous => ({ right: previous.right + (option === secret ? 1 : 0), total: previous.total + 1 }))
  }

  function next() {
    window.clearTimeout(timer.current)
    setIndex(index + 1)
    setSecret(Math.random() < 0.5 ? 0 : 1)
    setAnswer(null)
    recognition.reset()
  }

  function playBoth() {
    speak(first, locale, 0.8)
    window.clearTimeout(timer.current)
    timer.current = window.setTimeout(() => speak(second, locale, 0.8), 1300)
  }

  return (
    <div className="card practice-card">
      <div className="card-heading">
        <h2>Escucha y elige</h2>
        {score.total > 0 && <span className="badge">{score.right} de {score.total}</span>}
      </div>
      <p className="card-meaning">Pulsa «Escuchar» y elige la palabra que oyes.</p>
      <button className="primary-action" type="button" onClick={() => speak(current.words[secret], locale, 0.85)}><Volume2 size={20} aria-hidden="true" />Escuchar</button>
      <div className="pair-options" role="group" aria-label="¿Qué palabra has oído?">
        {current.words.map((word, option) => {
          const state = answer === null ? '' : option === secret ? ' option-right' : option === answer ? ' option-wrong' : ''
          return (
            <button key={word} type="button" className={`pair-option${state}`} onClick={() => choose(option)} disabled={answer !== null} aria-pressed={answer === option}>
              <strong lang={lang}>{word}</strong>
              <span className="ipa">{current.ipa[option]}</span>
            </button>
          )
        })}
      </div>
      {answer !== null && (
        <>
          <p className={`feedback ${answer === secret ? 'feedback-right' : 'feedback-wrong'}`} role="status">
            {answer === secret ? <Check size={16} aria-hidden="true" /> : <X size={16} aria-hidden="true" />}
            <span><strong>{answer === secret ? '¡Correcto!' : `Era «${current.words[secret]}».`}</strong> {current.hint}</span>
          </p>
          {current.regions && <p className="card-note">Solo se distinguen en: {current.regions.map(region => REGION_LABELS[region]).join(', ')}.</p>}
          <div className="practice-actions">
            <button className="secondary-button" type="button" onClick={playBoth}><Volume2 size={16} aria-hidden="true" />Escuchar las dos</button>
            <button className="secondary-button" type="button" onClick={next}><RefreshCw size={16} aria-hidden="true" />Siguiente</button>
          </div>
          {canRecognize() && (
            <div className="say-it">
              <p className="card-label">Ahora dilo tú</p>
              <div className="practice-actions">
                {current.words.map(word => (
                  recognition.listening?.target === word
                    ? <button key={word} className="secondary-button listening" type="button" onClick={recognition.listening.stop}><Square size={14} aria-hidden="true" />Escuchando…</button>
                    : <button key={word} className="secondary-button" type="button" onClick={() => void recognition.start(word)} disabled={Boolean(recognition.listening)}><Mic size={16} aria-hidden="true" /><span>Decir «<span lang={lang}>{word}</span>»</span></button>
                ))}
              </div>
              <HeardMessage heard={recognition.heard} lang={lang} other={recognition.heard ? current.words.find(word => word !== recognition.heard?.target) : undefined} />
            </div>
          )}
        </>
      )}
    </div>
  )
}

function FreePractice({ lang, locale }: { lang: LanguageCode; locale: string }) {
  const [text, setText] = useState('')
  const recognition = useRecognition(locale)
  const value = text.trim()

  return (
    <div className="card practice-card">
      <h2>Practica cualquier frase</h2>
      <label className="sr-only" htmlFor="practice-text">Frase en {languageName(lang).toLowerCase()}</label>
      <textarea id="practice-text" className="text-area" lang={lang} rows={2} value={text} onChange={event => { setText(event.target.value); recognition.reset() }} placeholder={`Escribe algo en ${languageName(lang).toLowerCase()}`} maxLength={300} />
      <div className="practice-actions">
        <button className="secondary-button" type="button" disabled={!value} onClick={() => speak(value, locale)}><Volume2 size={16} aria-hidden="true" />Escuchar</button>
        <button className="secondary-button" type="button" disabled={!value} onClick={() => speak(value, locale, 0.6)}><Snail size={16} aria-hidden="true" />Despacio</button>
        {canRecognize() && (recognition.listening
          ? <button className="secondary-button listening" type="button" onClick={recognition.listening.stop}><Square size={14} aria-hidden="true" />Escuchando…</button>
          : <button className="secondary-button" type="button" disabled={!value} onClick={() => void recognition.start(value)}><Mic size={16} aria-hidden="true" />Decirla</button>)}
      </div>
      <HeardMessage heard={recognition.heard} lang={lang} />
    </div>
  )
}

/** "Pronunciar": minimal pairs to listen and say, and free practice with any sentence. */
export default function PronounceScreen({ pair }: { pair: LanguagePair }) {
  const { accents } = useSpeech()
  const lang = pair.target
  const locale = accents[lang]
  const pairs = useMemo(() => MINIMAL_PAIRS.filter(entry => entry.lang === lang && (!entry.regions || entry.regions.some(region => region === locale))), [lang, locale])

  return (
    <section className="screen" aria-labelledby="pronounce-title">
      <h1 id="pronounce-title">Pronunciar</h1>
      <p className="screen-intro">Los sonidos del {languageName(lang).toLowerCase()} que más cuestan, con la voz de tu dispositivo. El acento se cambia en Ajustes. ¿No oyes nada? Sube el volumen y, en iPhone, quita el modo silencio.</p>
      {!canSpeak() && <p className="error-message">Este navegador no puede leer en voz alta.</p>}
      {!canRecognize() && <p className="card-note">Este navegador no reconoce la voz: puedes escuchar, pero no comprobar cómo lo dices (prueba con Chrome).</p>}
      {pairs.length > 0 && <MinimalPairPractice key={`${lang}-${locale}`} pairs={pairs} lang={lang} locale={locale} />}
      <FreePractice key={lang} lang={lang} locale={locale} />
    </section>
  )
}
