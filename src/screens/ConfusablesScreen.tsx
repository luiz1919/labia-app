import ConfusableCard from '../components/ConfusableCard'
import { CONFUSABLES } from '../data/confusables'
import { languageName } from '../languages'
import type { LanguagePair } from '../languages'

/** Sets in the language being translated into first: that is the one the user is producing. */
export default function ConfusablesScreen({ pair }: { pair: LanguagePair }) {
  const groups = [pair.target, pair.source]
    .map(lang => ({ lang, entries: CONFUSABLES.filter(entry => entry.lang === lang) }))
    .filter(group => group.entries.length > 0)

  return (
    <section className="screen" aria-labelledby="confusables-title">
      <h1 id="confusables-title">Diferencias</h1>
      <p className="screen-intro">Palabras que se confunden: la regla corta, ejemplos y un mini test para practicar.</p>
      {groups.map(group => (
        <section key={group.lang} className="result-group" aria-label={`En ${languageName(group.lang).toLowerCase()}`}>
          <h2 className="eyebrow">En {languageName(group.lang).toLowerCase()}</h2>
          <div className="card-list">
            {group.entries.map(entry => <ConfusableCard key={entry.id} entry={entry} pair={pair} />)}
          </div>
        </section>
      ))}
    </section>
  )
}
