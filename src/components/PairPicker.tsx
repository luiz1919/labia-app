import { useId } from 'react'
import { ArrowLeftRight } from 'lucide-react'
import { isLanguageCode, LANGUAGES, swapPair, withLanguage } from '../languages'
import type { LanguagePair } from '../languages'

function LanguageSelect({ label, value, onChange }: { label: string; value: string; onChange: (value: string) => void }) {
  const id = useId()
  return (
    <div className="language-select">
      <label htmlFor={id}>{label}</label>
      <select id={id} value={value} onChange={event => onChange(event.target.value)}>
        {LANGUAGES.map(language => <option key={language.code} value={language.code}>{language.name}</option>)}
      </select>
    </div>
  )
}

/** "De" (From) and "A" (To), shared by every screen. */
export default function PairPicker({ pair, onChange }: { pair: LanguagePair; onChange: (pair: LanguagePair) => void }) {
  function changeSide(side: keyof LanguagePair, code: string) {
    if (isLanguageCode(code)) onChange(withLanguage(pair, side, code))
  }

  return (
    <fieldset className="pair-picker">
      <legend className="sr-only">Idiomas</legend>
      <LanguageSelect label="De" value={pair.source} onChange={code => changeSide('source', code)} />
      <button className="icon-button swap-button" type="button" onClick={() => onChange(swapPair(pair))} aria-label="Intercambiar idiomas" title="Intercambiar idiomas"><ArrowLeftRight size={20} /></button>
      <LanguageSelect label="A" value={pair.target} onChange={code => changeSide('target', code)} />
    </fieldset>
  )
}
