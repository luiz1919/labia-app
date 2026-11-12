import { useState } from 'react'
import { FilterField } from '../components/bits'
import FalseFriendCard from '../components/FalseFriendCard'
import { languageName } from '../languages'
import type { LanguagePair } from '../languages'
import { findFalseFriends } from '../search'

export default function FalseFriendsScreen({ pair }: { pair: LanguagePair }) {
  const [filter, setFilter] = useState('')
  const matches = findFalseFriends(filter, pair)
  const sourceName = languageName(pair.source).toLowerCase()

  return (
    <section className="screen" aria-labelledby="false-friends-title">
      <h1 id="false-friends-title">Falsos amigos</h1>
      <p className="screen-intro">Palabras que se parecen pero no significan lo mismo. Toca una para ver qué significa cada una. Al buscar una en «Buscar» también te avisamos.</p>
      <FilterField value={filter} onChange={setFilter} label={`Buscar una palabra en ${sourceName}`} lang={pair.source} />
      <p className="result-count" role="status">{matches.length === 1 ? '1 palabra' : `${matches.length} palabras`}</p>
      <div className="card-list fold-list">
        {matches.map(match => <FalseFriendCard key={match.entry.id} match={match} pair={pair} folded open={matches.length === 1} />)}
      </div>
    </section>
  )
}
