import { useId, useState } from 'react'
import type { FormEvent } from 'react'
import { ArrowLeft, Plus, Save, Trash2, X } from 'lucide-react'
import { REGION_LABELS, REGISTER_LABELS } from '../data/types'
import type { Register } from '../data/types'
import { languageName } from '../languages'
import type { LanguageCode, LanguagePair } from '../languages'
import { draftProblem, emptyExpression, MAX_OWN_EXAMPLE, MAX_OWN_MEANING, MAX_OWN_ROWS, MAX_OWN_TEXT, regionsOf } from '../ownIdioms.ts'
import type { ExpressionDraft, IdiomDraft } from '../ownIdioms.ts'

const PLACEHOLDERS: Partial<Record<LanguageCode, string>> = { es: 'estar en las nubes', en: 'to have your head in the clouds' }

function ExpressionFields({ row, other, first, onChange, onRemove }: { row: ExpressionDraft; other: LanguageCode; first: boolean; onChange: (row: ExpressionDraft) => void; onRemove?: () => void }) {
  const id = useId()
  const regions = regionsOf(row.lang)
  const otherName = languageName(other).toLowerCase()

  return (
    <div className="expression-row">
      <div className="form-field">
        <div className="expression-row-heading">
          <label htmlFor={`${id}-text`}>{first ? 'Expresión' : 'Otra forma de decirlo'}</label>
          {onRemove && <button className="icon-button" type="button" onClick={onRemove} aria-label={`Quitar «${row.text || 'esta forma'}»`} title="Quitar"><X size={18} /></button>}
        </div>
        <input id={`${id}-text`} className="form-input" type="text" lang={row.lang} value={row.text} onChange={event => onChange({ ...row, text: event.target.value })} placeholder={first ? PLACEHOLDERS[row.lang] : undefined} maxLength={MAX_OWN_TEXT} autoComplete="off" autoCapitalize="none" />
      </div>
      <div className="form-field">
        <label htmlFor={`${id}-literal`}>Literalmente en {otherName} (opcional)</label>
        <input id={`${id}-literal`} className="form-input" type="text" lang={other} value={row.literal} onChange={event => onChange({ ...row, literal: event.target.value })} maxLength={MAX_OWN_TEXT} autoComplete="off" autoCapitalize="none" />
      </div>
      <div className="form-field">
        <label htmlFor={`${id}-register`}>Registro</label>
        <select id={`${id}-register`} className="form-input" value={row.register} onChange={event => onChange({ ...row, register: event.target.value as Register })}>
          {(Object.keys(REGISTER_LABELS) as Register[]).map(register => <option key={register} value={register}>{REGISTER_LABELS[register]}</option>)}
        </select>
      </div>
      {regions.length > 0 && (
        <div className="form-field" role="group" aria-labelledby={`${id}-regions`}>
          <span id={`${id}-regions`} className="form-label">Solo se dice en (si no marcas ninguna, en todas partes)</span>
          <div className="chip-wrap">
            {regions.map(region => {
              const on = row.regions.includes(region)
              return <button key={region} type="button" className="chip" aria-pressed={on} onClick={() => onChange({ ...row, regions: on ? row.regions.filter(other => other !== region) : [...row.regions, region] })}>{REGION_LABELS[region]}</button>
            })}
          </div>
        </div>
      )}
      <div className="form-field">
        <label htmlFor={`${id}-keywords`}>Otras formas para encontrarla (opcional, separadas por comas)</label>
        <input id={`${id}-keywords`} className="form-input" type="text" lang={row.lang} value={row.keywords} onChange={event => onChange({ ...row, keywords: event.target.value })} placeholder={row.lang === 'es' ? 'estoy en las nubes, en las nubes' : undefined} autoComplete="off" autoCapitalize="none" />
      </div>
    </div>
  )
}

function ExpressionGroup({ lang, other, rows, onChange }: { lang: LanguageCode; other: LanguageCode; rows: ExpressionDraft[]; onChange: (rows: ExpressionDraft[]) => void }) {
  const name = languageName(lang).toLowerCase()
  return (
    <fieldset className="form-group">
      <legend>En {name}</legend>
      {rows.map((row, index) => (
        <ExpressionFields
          // Rows have no id of their own; the position is stable because rows are only appended or removed.
          key={index}
          row={row}
          other={other}
          first={index === 0}
          onChange={next => onChange(rows.map((current, position) => position === index ? next : current))}
          onRemove={rows.length > 1 ? () => onChange(rows.filter((_, position) => position !== index)) : undefined}
        />
      ))}
      {rows.length < MAX_OWN_ROWS && <button className="text-button" type="button" onClick={() => onChange([...rows, emptyExpression(lang)])}><Plus size={16} aria-hidden="true" />Otra forma de decirlo en {name}</button>}
    </fieldset>
  )
}

/**
 * "Nueva expresión" / "Editar expresión": the same fields as the bundled idioms, for the two
 * languages of the pair. Several forms per language; the first one is the main one.
 */
export default function IdiomForm({ pair, initial, editing, onSave, onCancel, onDelete }: { pair: LanguagePair; initial: IdiomDraft; editing: boolean; onSave: (draft: IdiomDraft) => void; onCancel: () => void; onDelete?: () => void }) {
  const id = useId()
  const [start] = useState(initial)
  const [draft, setDraft] = useState(start)
  const [problem, setProblem] = useState('')
  const sourceName = languageName(pair.source).toLowerCase()
  const targetName = languageName(pair.target).toLowerCase()

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const found = draftProblem(draft, pair, languageName)
    setProblem(found)
    if (!found) onSave(draft)
  }

  function cancel() {
    if (draft !== start && !window.confirm('¿Descartar los cambios?')) return
    onCancel()
  }

  function change(next: Partial<IdiomDraft>) {
    setDraft({ ...draft, ...next })
    if (problem) setProblem('')
  }

  return (
    <form className="screen idiom-form" onSubmit={submit} noValidate aria-labelledby={`${id}-title`}>
      <button className="back-link" type="button" onClick={cancel}><ArrowLeft size={18} aria-hidden="true" />Expresiones</button>
      <h1 id={`${id}-title`}>{editing ? 'Editar expresión' : 'Nueva expresión'}</h1>
      <p className="screen-intro">Se guarda en tu cuenta y sale en «Expresiones» y en «Buscar» junto a las de Labia, en los dos sentidos.</p>
      <ExpressionGroup lang={pair.source} other={pair.target} rows={draft.source} onChange={source => change({ source })} />
      <ExpressionGroup lang={pair.target} other={pair.source} rows={draft.target} onChange={target => change({ target })} />
      <fieldset className="form-group">
        <legend>Qué significa</legend>
        <label className="sr-only" htmlFor={`${id}-meaning`}>Qué significa</label>
        <textarea id={`${id}-meaning`} className="text-area" rows={2} value={draft.meaning} onChange={event => change({ meaning: event.target.value })} placeholder="Estar distraído, sin prestar atención." maxLength={MAX_OWN_MEANING} />
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
      <div className="form-actions">
        <button className="primary-action" type="submit"><Save size={18} aria-hidden="true" />Guardar</button>
        <button className="secondary-button" type="button" onClick={cancel}>Cancelar</button>
      </div>
      {onDelete && <button className="text-button danger-text" type="button" onClick={onDelete}><Trash2 size={16} aria-hidden="true" />Borrar esta expresión</button>}
    </form>
  )
}
