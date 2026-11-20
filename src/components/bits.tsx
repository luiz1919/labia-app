// Small pieces shared by the content cards.
import { SearchField } from 'firebase-app-kit/ui'
import { REGION_LABELS, REGISTER_LABELS } from '../data/types'
import type { Region, Register, Translations } from '../data/types'
import type { LanguageCode } from '../languages'
import SpeakButton from './SpeakButton'

/** Register (when not neutral) and regions of an expression. */
export function Badges({ register, regions }: { register?: Register; regions?: readonly Region[] }) {
  const shown = register && register !== 'neutral' && register !== 'unknown' ? register : undefined
  if (!shown && !regions?.length) return null
  return (
    <span className="badges">
      {shown && <span className={`badge badge-${shown}`}>{REGISTER_LABELS[shown]}</span>}
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
  return <SearchField value={value} onChange={onChange} placeholder={label} lang={lang} autoCapitalize="none" spellCheck={false} />
}
