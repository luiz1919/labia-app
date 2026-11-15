import { useId, useState } from 'react'
import type { FormEvent } from 'react'
import { ArrowLeft, Save, Trash2 } from 'lucide-react'
import { REGISTER_LABELS } from '../data/types'
import type { Register } from '../data/types'
import { languageName } from '../languages'
import type { LanguagePair } from '../languages'
import { draftProblem, MAX_OWN_EXAMPLE, MAX_OWN_MEANING, MAX_OWN_TEXT } from '../ownIdioms.ts'
import type { ExpressionDraft, IdiomDraft } from '../ownIdioms.ts'

/** "No sé" first: it is the honest default for someone adding an expression they just heard. */
const REGISTERS: Register[] = ['unknown', 'neutral', 'informal', 'formal', 'vulgar']
const PLACEHOLDERS: Record<string, string> = { es: 'estar en las nubes', en: 'to have your head in the clouds' }

/** The same texts seen from the other direction: what was the translation is now the expression. */
function reversed(draft: IdiomDraft, pair: LanguagePair): IdiomDraft {
  const flip = (row: ExpressionDraft | undefined, lang: ExpressionDraft['lang']): ExpressionDraft[] => row ? [{ ...row, lang, regions: [], otherLiterals: undefined }] : []
  return {
    ...draft,
    source: flip(draft.target[0], pair.source),
    target: flip(draft.source[0], pair.target),
    exampleSource: draft.exampleTarget,
    exampleTarget: draft.exampleSource,
  }
}

/**
 * "Nueva expresión" / "Editar expresión". When creating, it first asks the direction (which
 * language the expression is in and which one it is translated into) and only then shows the
 * fields. Only the first expression of each language is edited here; other forms of an expression
 * stored earlier are kept as they are.
 */
export default function IdiomForm({ pair: current, initial, editing, onSave, onCancel, onDelete }: { pair: LanguagePair; initial: IdiomDraft; editing: boolean; onSave: (draft: IdiomDraft, pair: LanguagePair) => void; onCancel: () => void; onDelete?: () => void }) {
  const id = useId()
  const [start] = useState(initial)
  const [draft, setDraft] = useState(start)
  // The direction of the form. Editing keeps the one the idiom is seen from; creating asks for it.
  const [pair, setPair] = useState<LanguagePair | null>(editing ? current : null)
  const [problem, setProblem] = useState('')
  const directions: LanguagePair[] = [current, { source: current.target, target: current.source }]

  function choose(next: LanguagePair) {
    if (pair && pair.source === next.source) return
    // First choice: the draft was built for the pair on screen, which may be the other direction.
    const wanted = pair ?? current
    setDraft(next.source === wanted.source ? draft : reversed(draft, next))
    setPair(next)
    setProblem('')
  }

  function change(next: Partial<IdiomDraft>) {
    setDraft({ ...draft, ...next })
    if (problem) setProblem('')
  }

  function changeRow(side: 'source' | 'target', fields: Partial<ExpressionDraft>) {
    const [first, ...rest] = draft[side]
    change({ [side]: [{ ...first, ...fields }, ...rest] })
  }

  function setRegister(register: Register) {
    change({ source: [{ ...draft.source[0], register }, ...draft.source.slice(1)], target: [{ ...draft.target[0], register }, ...draft.target.slice(1)] })
  }

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!pair) return
    const found = draftProblem(draft, pair, languageName)
    setProblem(found)
    if (!found) onSave(draft, pair)
  }

  function cancel() {
    if (draft !== start && !window.confirm('¿Descartar los cambios?')) return
    onCancel()
  }

  const sourceName = pair ? languageName(pair.source).toLowerCase() : ''
  const targetName = pair ? languageName(pair.target).toLowerCase() : ''
  const origin = draft.source[0]
  const translation = draft.target[0]

  return (
    <form className="screen idiom-form" onSubmit={submit} noValidate aria-labelledby={`${id}-title`}>
      <button className="back-link" type="button" onClick={cancel}><ArrowLeft size={18} aria-hidden="true" />Expresiones</button>
      <h1 id={`${id}-title`}>{editing ? 'Editar expresión' : 'Nueva expresión'}</h1>
      <p className="screen-intro">Se guarda en tu cuenta y sale en «Expresiones» y en «Buscar» junto a las de Labia, en los dos sentidos.</p>
      {!editing && (
        <fieldset className="form-group">
          <legend>¿En qué sentido?</legend>
          <div className="segmented" role="radiogroup" aria-label="Sentido de la traducción">
            {directions.map(direction => {
              const on = pair?.source === direction.source
              return (
                <button key={direction.source} type="button" role="radio" aria-checked={on} className={on ? 'is-on' : undefined} onClick={() => choose(direction)}>
                  {languageName(direction.source)} → {languageName(direction.target)}
                </button>
              )
            })}
          </div>
          {!pair && <p className="card-note">Elige el idioma de la expresión y el idioma al que la traduces.</p>}
        </fieldset>
      )}
      {pair && (
        <>
          <fieldset className="form-group">
            <legend>La expresión</legend>
            <div className="form-field">
              <label htmlFor={`${id}-text`}>Expresión en {sourceName}</label>
              <input id={`${id}-text`} className="form-input" type="text" lang={pair.source} value={origin.text} onChange={event => changeRow('source', { text: event.target.value })} placeholder={PLACEHOLDERS[pair.source]} maxLength={MAX_OWN_TEXT} autoComplete="off" autoCapitalize="none" />
            </div>
            <div className="form-field">
              <label htmlFor={`${id}-translation`}>Traducción en {targetName}</label>
              <input id={`${id}-translation`} className="form-input" type="text" lang={pair.target} value={translation.text} onChange={event => changeRow('target', { text: event.target.value })} placeholder={PLACEHOLDERS[pair.target]} maxLength={MAX_OWN_TEXT} autoComplete="off" autoCapitalize="none" />
            </div>
            <div className="form-field">
              <label htmlFor={`${id}-register`}>Registro</label>
              <select id={`${id}-register`} className="form-input" value={origin.register} onChange={event => setRegister(event.target.value as Register)}>
                {REGISTERS.map(register => <option key={register} value={register}>{REGISTER_LABELS[register]}</option>)}
              </select>
            </div>
            <div className="form-field">
              <label htmlFor={`${id}-keywords`}>Otras formas de encontrarla (opcional, en {sourceName}, separadas por comas)</label>
              <input id={`${id}-keywords`} className="form-input" type="text" lang={pair.source} value={origin.keywords} onChange={event => changeRow('source', { keywords: event.target.value })} placeholder={pair.source === 'es' ? 'estoy en las nubes, en las nubes' : undefined} autoComplete="off" autoCapitalize="none" />
            </div>
          </fieldset>
          <fieldset className="form-group">
            <legend>Qué significa (opcional)</legend>
            <label className="sr-only" htmlFor={`${id}-meaning`}>Qué significa</label>
            <textarea id={`${id}-meaning`} className="text-area" rows={2} value={draft.meaning} onChange={event => change({ meaning: event.target.value })} placeholder="Solo si la traducción literal no basta para entenderla." maxLength={MAX_OWN_MEANING} />
          </fieldset>
          <fieldset className="form-group">
            <legend>Ejemplo (opcional)</legend>
            <div className="form-field">
              <label htmlFor={`${id}-example-source`}>Frase en {sourceName}</label>
              <textarea id={`${id}-example-source`} className="text-area" lang={pair.source} rows={2} value={draft.exampleSource} onChange={event => change({ exampleSource: event.target.value })} maxLength={MAX_OWN_EXAMPLE} />
            </div>
            <div className="form-field">
              <label htmlFor={`${id}-example-target`}>La misma frase en {targetName}</label>
              <textarea id={`${id}-example-target`} className="text-area" lang={pair.target} rows={2} value={draft.exampleTarget} onChange={event => change({ exampleTarget: event.target.value })} maxLength={MAX_OWN_EXAMPLE} />
            </div>
          </fieldset>
          {problem && <p className="error-message form-problem" role="alert">{problem}</p>}
        </>
      )}
      <div className="form-actions">
        {pair && <button className="primary-action" type="submit"><Save size={18} aria-hidden="true" />Guardar</button>}
        <button className="secondary-button" type="button" onClick={cancel}>Cancelar</button>
      </div>
      {onDelete && <button className="text-button danger-text" type="button" onClick={onDelete}><Trash2 size={16} aria-hidden="true" />Borrar esta expresión</button>}
    </form>
  )
}
