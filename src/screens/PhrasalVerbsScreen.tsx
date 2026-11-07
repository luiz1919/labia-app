import { useState } from 'react'
import { FilterField } from '../components/bits'
import PhrasalVerbCard from '../components/PhrasalVerbCard'
import { PHRASAL_VERBS } from '../data/phrasalVerbs'
import { languageName } from '../languages'
import type { LanguagePair } from '../languages'
import { findPhrasalVerbs, phrasalVerbPartner } from '../search'

/** Values ordered by how many phrasal verbs use them, then alphabetically. */
function byFrequency(values: string[]): string[] {
  const counts = new Map<string, number>()
  for (const value of values) counts.set(value, (counts.get(value) ?? 0) + 1)
  return [...counts.keys()].sort((first, second) => counts.get(second)! - counts.get(first)! || first.localeCompare(second, 'en'))
}

const VERBS = byFrequency(PHRASAL_VERBS.map(phrasal => phrasal.verb))
const PARTICLES = byFrequency(PHRASAL_VERBS.map(phrasal => phrasal.particle.split(' ')[0]))

function ChipFilter({ label, values, value, onChange }: { label: string; values: string[]; value: string; onChange: (value: string) => void }) {
  return (
    <div className="chip-filter" role="group" aria-label={label}>
      <span className="chip-filter-label">{label}</span>
      <div className="chip-row">
        <button type="button" className="chip" aria-pressed={value === ''} onClick={() => onChange('')}>Todos</button>
        {values.map(option => <button key={option} type="button" className="chip" lang="en" aria-pressed={value === option} onClick={() => onChange(value === option ? '' : option)}>{option}</button>)}
      </div>
    </div>
  )
}

export default function PhrasalVerbsScreen({ pair }: { pair: LanguagePair }) {
  const [filter, setFilter] = useState('')
  const [verb, setVerb] = useState('')
  const [particle, setParticle] = useState('')
  const partner = phrasalVerbPartner(pair)

  if (!partner) {
    return (
      <section className="screen" aria-labelledby="phrasal-title">
        <h1 id="phrasal-title">Phrasal verbs</h1>
        <p className="screen-intro">Los phrasal verbs son del inglés: elige inglés en «De» o en «A».</p>
      </section>
    )
  }

  const matches = findPhrasalVerbs(filter, pair)
    .filter(phrasal => (!verb || phrasal.verb === verb) && (!particle || phrasal.particle.split(' ')[0] === particle))

  return (
    <section className="screen" aria-labelledby="phrasal-title">
      <h1 id="phrasal-title">Phrasal verbs</h1>
      <p className="screen-intro">Búscalos en inglés (get over) o por su significado en {languageName(partner).toLowerCase()} (superar).</p>
      <FilterField value={filter} onChange={setFilter} label="get over, superar..." />
      <ChipFilter label="Verbo" values={VERBS} value={verb} onChange={setVerb} />
      <ChipFilter label="Partícula" values={PARTICLES} value={particle} onChange={setParticle} />
      <p className="result-count" role="status">{matches.length === 1 ? '1 phrasal verb' : `${matches.length} phrasal verbs`}</p>
      <div className="card-list">
        {matches.map(phrasal => <PhrasalVerbCard key={phrasal.id} phrasal={phrasal} partner={partner} />)}
      </div>
    </section>
  )
}
