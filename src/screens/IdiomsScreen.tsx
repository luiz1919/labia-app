import { useState } from 'react'
import { FilterField } from '../components/bits'
import IdiomCard from '../components/IdiomCard'
import { languageName } from '../languages'
import type { LanguagePair } from '../languages'
import { findIdioms } from '../search'

export default function IdiomsScreen({ pair }: { pair: LanguagePair }) {
  const [filter, setFilter] = useState('')
  const matches = findIdioms(filter, pair)
  const sourceName = languageName(pair.source).toLowerCase()
  const targetName = languageName(pair.target).toLowerCase()

  return (
    <section className="screen" aria-labelledby="idioms-title">
      <h1 id="idioms-title">Expresiones</h1>
      <p className="screen-intro">Cómo se dicen de verdad en {targetName}, no su traducción literal.</p>
      <FilterField value={filter} onChange={setFilter} label={`Buscar una expresión en ${sourceName}`} lang={pair.source} />
      <p className="result-count" role="status">{matches.length === 1 ? '1 expresión' : `${matches.length} expresiones`}</p>
      <div className="card-list">
        {matches.map(match => <IdiomCard key={match.idiom.id} idiom={match.idiom} expression={match.expression} pair={pair} />)}
      </div>
    </section>
  )
}
