import { ChevronDown } from 'lucide-react'
import { languageName } from '../languages'
import type { LanguagePair } from '../languages'
import type { FalseFriendMatch } from '../search'
import { Example } from './bits'
import SpeakButton from './SpeakButton'

/**
 * Warns that a word does not mean what it looks like in the other language. Folded: only the two
 * words (actually ≠ actualmente) until tapped, so a list of them stays short. `open` unfolds it
 * (the only match of a filter).
 */
export default function FalseFriendCard({ match: { entry, word, other }, pair, open }: { match: FalseFriendMatch; pair: LanguagePair; open?: boolean }) {
  const targetName = languageName(pair.target).toLowerCase()
  const sourceName = languageName(pair.source).toLowerCase()

  // The title is what opens the accordion, so the speak buttons go next to each word inside.
  return (
    <details className="fold-card false-friend-card" open={open}>
      <summary className="fold-summary">
        <h3 className="fold-title"><span lang={pair.source}>{word.word}</span><span className="not-equal" aria-label="no es">≠</span><span lang={pair.target}>{other.word}</span></h3>
        <ChevronDown className="fold-chevron" size={20} aria-hidden="true" />
      </summary>
      <div className="fold-body">
        <dl className="false-friend-meanings">
          <div>
            <dt>«<span lang={pair.source}>{word.word}</span>»<SpeakButton text={word.word} lang={pair.source} size={16} /> en {targetName} es</dt>
            <dd lang={pair.target}>{word.means.join(', ')}</dd>
            <dd><Example example={word.example} first={pair.source} second={pair.target} /></dd>
          </div>
          <div>
            <dt>«<span lang={pair.target}>{other.word}</span>»<SpeakButton text={other.word} lang={pair.target} size={16} /> en {sourceName} es</dt>
            <dd lang={pair.source}>{other.means.join(', ')}</dd>
            <dd><Example example={other.example} first={pair.target} second={pair.source} /></dd>
          </div>
        </dl>
        {entry.note && <p className="card-note">{entry.note}</p>}
      </div>
    </details>
  )
}
