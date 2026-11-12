import { ChevronDown, TriangleAlert } from 'lucide-react'
import { languageName } from '../languages'
import type { LanguagePair } from '../languages'
import type { FalseFriendMatch } from '../search'
import { Example } from './bits'
import SpeakButton from './SpeakButton'

/**
 * Warns that a word does not mean what it looks like in the other language. `folded`: only the
 * two words until tapped, for the full list in "Falsos amigos" (open: unfold it, e.g. the only match).
 */
export default function FalseFriendCard({ match: { entry, word, other }, pair, folded = false, open }: { match: FalseFriendMatch; pair: LanguagePair; folded?: boolean; open?: boolean }) {
  const targetName = languageName(pair.target).toLowerCase()
  const sourceName = languageName(pair.source).toLowerCase()
  // Folded, the title is what opens the accordion, so the speak buttons go next to each word below.
  const meanings = (
    <>
      <dl className="false-friend-meanings">
        <div>
          <dt>«<span lang={pair.source}>{word.word}</span>»{folded && <SpeakButton text={word.word} lang={pair.source} size={16} />} en {targetName} es</dt>
          <dd lang={pair.target}>{word.means.join(', ')}</dd>
          <dd><Example example={word.example} first={pair.source} second={pair.target} /></dd>
        </div>
        <div>
          <dt>«<span lang={pair.target}>{other.word}</span>»{folded && <SpeakButton text={other.word} lang={pair.target} size={16} />} en {sourceName} es</dt>
          <dd lang={pair.source}>{other.means.join(', ')}</dd>
          <dd><Example example={other.example} first={pair.target} second={pair.source} /></dd>
        </div>
      </dl>
      {entry.note && <p className="card-note">{entry.note}</p>}
    </>
  )

  if (folded) {
    return (
      <details className="fold-card false-friend-card" open={open}>
        <summary className="fold-summary">
          <h3 className="fold-title"><span lang={pair.source}>{word.word}</span><span className="not-equal" aria-label="no es">≠</span><span lang={pair.target}>{other.word}</span></h3>
          <ChevronDown className="fold-chevron" size={20} aria-hidden="true" />
        </summary>
        <div className="fold-body">{meanings}</div>
      </details>
    )
  }

  return (
    <article className="card false-friend-card">
      <p className="warning-label"><TriangleAlert size={16} aria-hidden="true" />Falso amigo</p>
      <h3 className="speakable"><span lang={pair.source}>{word.word}</span><SpeakButton text={word.word} lang={pair.source} size={16} /> <span className="not-equal" aria-label="no es">≠</span> <span lang={pair.target}>{other.word}</span><SpeakButton text={other.word} lang={pair.target} size={16} /></h3>
      {meanings}
    </article>
  )
}
