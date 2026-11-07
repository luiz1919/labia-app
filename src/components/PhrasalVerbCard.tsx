import { PHRASAL_VERB_LANG } from '../data/phrasalVerbs'
import { PHRASAL_OBJECT_LABELS } from '../data/types'
import type { PhrasalObject, PhrasalVerb } from '../data/types'
import type { LanguageCode } from '../languages'
import { phrasalVerbText } from '../search'
import { Badges, Example } from './bits'

const OBJECT_HINTS: Readonly<Record<PhrasalObject, string>> = {
  separable: 'El complemento puede ir en medio: turn it off',
  inseparable: 'El complemento va detrás de la partícula: look after her',
  none: 'No lleva complemento directo',
}

/** A phrasal verb with its meanings in the pair's other language. */
export default function PhrasalVerbCard({ phrasal, partner }: { phrasal: PhrasalVerb; partner: LanguageCode }) {
  return (
    <article className="card">
      <div className="card-heading">
        <h3 lang={PHRASAL_VERB_LANG}>{phrasalVerbText(phrasal)}</h3>
        <Badges register={phrasal.register} />
      </div>
      <ol className="senses">
        {phrasal.senses.map(sense => (
          <li key={sense.example[PHRASAL_VERB_LANG]}>
            <p className="sense-meaning">
              <strong lang={partner}>{sense.translations[partner]?.join(', ')}</strong>
              <span className="badge badge-object" title={OBJECT_HINTS[sense.object]}>{PHRASAL_OBJECT_LABELS[sense.object]}</span>
            </p>
            <Example example={sense.example} first={PHRASAL_VERB_LANG} second={partner} />
          </li>
        ))}
      </ol>
    </article>
  )
}
