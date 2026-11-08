// Small pieces shared by the content cards.
import { useId } from 'react'
import { Search } from 'lucide-react'
import { REGION_LABELS, REGISTER_LABELS } from '../data/types'
import type { Region, Register, Translations } from '../data/types'
import type { LanguageCode } from '../languages'
import SpeakButton from './SpeakButton'

/** Register (when not neutral) and regions of an expression. */
export function Badges({ register, regions }: { register?: Register; regions?: readonly Region[] }) {
  if ((!register || register === 'neutral') && !regions?.length) return null
  return (
    <span className="badges">
      {register && register !== 'neutral' && <span className={`badge badge-${register}`}>{REGISTER_LABELS[register]}</span>}
      {regions?.map(region => <span key={region} className="badge badge-region">{REGION_LABELS[region]}</span>)}
    </span>
  )
}

/** A sentence and its translation. */
export function Example({ example, first, second }: { example?: Translations; first: LanguageCode; second: LanguageCode }) {
  const original = example?.[first]
  const translation = example?.[second]
  if (!original && !translation) return null
  return (
    <p className="example">
      {original && <span className="example-original"><span lang={first}>{original}</span><SpeakButton text={original} lang={first} size={16} /></span>}
      {translation && <span className="example-translation" lang={second}>{translation}</span>}
    </p>
  )
}

/** Text field that filters a list on screen. */
export function FilterField({ value, onChange, label, lang }: { value: string; onChange: (value: string) => void; label: string; lang?: string }) {
  const id = useId()
  return (
    <div className="filter-field">
      <label className="sr-only" htmlFor={id}>{label}</label>
      <Search size={18} aria-hidden="true" />
      <input id={id} type="search" lang={lang} value={value} onChange={event => onChange(event.target.value)} placeholder={label} autoComplete="off" autoCapitalize="none" spellCheck={false} enterKeyHint="search" />
    </div>
  )
}
