import { TriangleAlert } from 'lucide-react'
import { languageName } from '../languages'
import type { LanguagePair } from '../languages'
import type { FalseFriendMatch } from '../search'
import { Example } from './bits'

/** Warns that a word does not mean what it looks like in the other language. */
export default function FalseFriendCard({ match: { entry, word, other }, pair }: { match: FalseFriendMatch; pair: LanguagePair }) {
  const targetName = languageName(pair.target).toLowerCase()
  const sourceName = languageName(pair.source).toLowerCase()

  return (
    <article className="card false-friend-card">
      <p className="warning-label"><TriangleAlert size={16} aria-hidden="true" />Falso amigo</p>
      <h3><span lang={pair.source}>{word.word}</span> <span className="not-equal" aria-label="no es">≠</span> <span lang={pair.target}>{other.word}</span></h3>
      <dl className="false-friend-meanings">
        <div>
          <dt>«<span lang={pair.source}>{word.word}</span>» en {targetName} es</dt>
          <dd lang={pair.target}>{word.means.join(', ')}</dd>
          <dd><Example example={word.example} first={pair.source} second={pair.target} /></dd>
        </div>
        <div>
          <dt>«<span lang={pair.target}>{other.word}</span>» en {sourceName} es</dt>
          <dd lang={pair.source}>{other.means.join(', ')}</dd>
          <dd><Example example={other.example} first={pair.target} second={pair.source} /></dd>
        </div>
      </dl>
      {entry.note && <p className="card-note">{entry.note}</p>}
    </article>
  )
}
