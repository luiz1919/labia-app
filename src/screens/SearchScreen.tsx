import { useState } from 'react'
import type { FormEvent, ReactNode } from 'react'
import { ExternalLink } from 'lucide-react'
import ConfusableCard from '../components/ConfusableCard'
import FalseFriendCard from '../components/FalseFriendCard'
import IdiomCard from '../components/IdiomCard'
import PhrasalVerbCard from '../components/PhrasalVerbCard'
import { languageName } from '../languages'
import type { LanguagePair } from '../languages'
import { phrasalVerbPartner, searchContent } from '../search'
import { sourceLinks } from '../sources'

function Results({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="result-group" aria-label={title}>
      <h2 className="eyebrow">{title}</h2>
      <div className="card-list">{children}</div>
    </section>
  )
}

export default function SearchScreen({ pair }: { pair: LanguagePair }) {
  const [term, setTerm] = useState('')
  const results = searchContent(term, pair)
  const links = sourceLinks(term, pair)
  const partner = phrasalVerbPartner(pair)
  const found = results.falseFriends.length + results.idioms.length + results.phrasalVerbs.length + results.confusables.length
  const sourceName = languageName(pair.source).toLowerCase()

  // Results update while typing; Enter only closes the phone keyboard so they are visible.
  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (document.activeElement instanceof HTMLElement) document.activeElement.blur()
  }

  return (
    <section className="screen" aria-labelledby="search-title">
      <h1 id="search-title">¿Cómo se dice?</h1>
      <form className="search-form" role="search" onSubmit={submit}>
        <label className="sr-only" htmlFor="search-term">Palabra, verbo o expresión en {sourceName}</label>
        <input id="search-term" type="search" lang={pair.source} value={term} onChange={event => setTerm(event.target.value)} placeholder={`Palabra, verbo o expresión en ${sourceName}`} autoComplete="off" autoCapitalize="none" spellCheck={false} enterKeyHint="search" maxLength={200} />
      </form>
      {links.length === 0 ? (
        <div className="empty-state">
          <img src="/icons/labia.svg" width="56" height="56" alt="" />
          <p>Escribe una palabra, un verbo o una expresión hecha. Te avisamos si es un falso amigo y te damos el equivalente real.</p>
        </div>
      ) : (
        <>
          {results.falseFriends.length > 0 && <Results title="Ojo: falso amigo">{results.falseFriends.map(match => <FalseFriendCard key={match.entry.id} match={match} pair={pair} />)}</Results>}
          {results.idioms.length > 0 && <Results title="Expresiones">{results.idioms.map(match => <IdiomCard key={match.idiom.id} idiom={match.idiom} expression={match.expression} pair={pair} />)}</Results>}
          {partner && results.phrasalVerbs.length > 0 && <Results title="Phrasal verbs">{results.phrasalVerbs.map(phrasal => <PhrasalVerbCard key={phrasal.id} phrasal={phrasal} partner={partner} />)}</Results>}
          {results.confusables.length > 0 && <Results title="Diferencias">{results.confusables.map(entry => <ConfusableCard key={entry.id} entry={entry} pair={pair} />)}</Results>}
          <section className="result-group" aria-labelledby="sources-title">
            <h2 id="sources-title" className="eyebrow">{found ? 'Consultar también en' : 'Todavía no está en Labia. Consulta en'}</h2>
            <ul className="source-links">
              {links.map(({ source, url }) => (
                <li key={source.id}>
                  <a className="source-link" href={url} target="_blank" rel="noopener noreferrer">
                    <span className="source-text"><strong>{source.name}</strong><span>{source.description}</span></span>
                    <ExternalLink size={18} aria-hidden="true" />
                  </a>
                </li>
              ))}
            </ul>
          </section>
        </>
      )}
    </section>
  )
}
