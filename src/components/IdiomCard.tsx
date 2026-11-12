import { Pencil } from 'lucide-react'
import type { Idiom, IdiomExpression } from '../data/types'
import { languageName } from '../languages'
import type { LanguagePair } from '../languages'
import { editIdiomHash, openSubpage } from '../subpage'
import { Badges, Example } from './bits'
import SpeakButton from './SpeakButton'

/** An idiom in the source language and how the target language really says it. `own`: the user wrote it, so it can be edited. */
export default function IdiomCard({ idiom, expression, pair, own = false }: { idiom: Idiom; expression: IdiomExpression; pair: LanguagePair; own?: boolean }) {
  const synonyms = idiom.expressions.filter(candidate => candidate.lang === pair.source && candidate !== expression)
  const equivalents = idiom.expressions.filter(candidate => candidate.lang === pair.target)

  return (
    <article className="card">
      <div className="card-heading">
        <h3 className="speakable"><span lang={pair.source}>{expression.text}</span><SpeakButton text={expression.text} lang={pair.source} /></h3>
        <span className="card-heading-end">
          {own && <span className="badge badge-own">Tuya</span>}
          <Badges register={expression.register} regions={expression.regions} />
          {own && <a className="icon-button" href={editIdiomHash(idiom.id)} onClick={openSubpage} aria-label={`Editar «${expression.text}»`} title="Editar"><Pencil size={18} /></a>}
        </span>
      </div>
      {synonyms.length > 0 && <p className="card-also">También: {synonyms.map((synonym, index) => <span key={synonym.text}>{index > 0 && ', '}<span lang={pair.source}>{synonym.text}</span></span>)}</p>}
      {idiom.meaning && <p className="card-meaning">{idiom.meaning}</p>}
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
