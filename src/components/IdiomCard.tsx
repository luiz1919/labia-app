import type { Idiom, IdiomExpression } from '../data/types'
import { languageName } from '../languages'
import type { LanguagePair } from '../languages'
import { Badges, Example } from './bits'
import SpeakButton from './SpeakButton'

/** An idiom in the source language and how the target language really says it. */
export default function IdiomCard({ idiom, expression, pair }: { idiom: Idiom; expression: IdiomExpression; pair: LanguagePair }) {
  const synonyms = idiom.expressions.filter(candidate => candidate.lang === pair.source && candidate !== expression)
  const equivalents = idiom.expressions.filter(candidate => candidate.lang === pair.target)

  return (
    <article className="card">
      <div className="card-heading">
        <h3 className="speakable"><span lang={pair.source}>{expression.text}</span><SpeakButton text={expression.text} lang={pair.source} /></h3>
        <Badges register={expression.register} regions={expression.regions} />
      </div>
      {synonyms.length > 0 && <p className="card-also">También: {synonyms.map((synonym, index) => <span key={synonym.text}>{index > 0 && ', '}<span lang={pair.source}>{synonym.text}</span></span>)}</p>}
      <p className="card-meaning">{idiom.meaning}</p>
      <p className="card-label">En {languageName(pair.target).toLowerCase()}</p>
      <ul className="equivalents">
        {equivalents.map(equivalent => (
          <li key={equivalent.text}>
            <span className="equivalent-text"><strong lang={pair.target}>{equivalent.text}</strong><SpeakButton text={equivalent.text} lang={pair.target} size={16} /><Badges register={equivalent.register} regions={equivalent.regions} /></span>
            {equivalent.literal?.[pair.source] && <span className="literal">Literalmente: «<span lang={pair.source}>{equivalent.literal[pair.source]}</span>»</span>}
          </li>
        ))}
      </ul>
      <Example example={idiom.example} first={pair.source} second={pair.target} />
    </article>
  )
}
