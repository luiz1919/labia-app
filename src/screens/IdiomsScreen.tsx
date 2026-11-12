import { useEffect, useState } from 'react'
import { ArrowLeft, Plus } from 'lucide-react'
import { FilterField } from '../components/bits'
import IdiomCard from '../components/IdiomCard'
import IdiomForm from '../components/IdiomForm'
import { languageName } from '../languages'
import type { LanguagePair } from '../languages'
import { draftFromIdiom, emptyDraft } from '../ownIdioms.ts'
import type { OwnIdiom } from '../ownIdioms.ts'
import { findIdioms, MIN_QUERY_LENGTH, normalize } from '../search'
import { closeSubpage, idiomRoute, NEW_IDIOM_HASH, openSubpage } from '../subpage'
import type { OwnIdioms } from '../useOwnIdioms'

const LIST_HASH = '#/expresiones'
const UNDO_MS = 6000

type Shown = 'all' | 'own'

/** "Expresiones": the bundled idioms and the user's own ones, and the form to write or edit one (#/expresiones/nueva, #/expresiones/editar/{id}). */
export default function IdiomsScreen({ pair, detail, ownIdioms }: { pair: LanguagePair; detail: readonly string[]; ownIdioms: OwnIdioms }) {
  const [filter, setFilter] = useState('')
  const [shown, setShown] = useState<Shown>('all')
  const [prefill, setPrefill] = useState('')
  const [removed, setRemoved] = useState<OwnIdiom | null>(null)
  const route = idiomRoute(detail)

  useEffect(() => {
    if (!removed) return
    const timer = window.setTimeout(() => setRemoved(null), UNDO_MS)
    return () => window.clearTimeout(timer)
  }, [removed])

  if (route.page === 'new') {
    return (
      <IdiomForm
        key={`new-${pair.source}-${pair.target}`}
        pair={pair}
        initial={emptyDraft(pair, prefill)}
        editing={false}
        onSave={draft => { ownIdioms.save(draft, pair); setShown('all'); closeSubpage(LIST_HASH) }}
        onCancel={() => closeSubpage(LIST_HASH)}
      />
    )
  }

  if (route.page === 'edit') {
    const idiom = ownIdioms.idioms.find(candidate => candidate.id === route.id)
    if (!idiom) {
      return (
        <section className="screen">
          <a className="back-link" href={LIST_HASH}><ArrowLeft size={18} aria-hidden="true" />Expresiones</a>
          <p role="status">{ownIdioms.ready ? 'Esta expresión ya no existe: puede que la hayas borrado en otro dispositivo.' : 'Cargando tus expresiones…'}</p>
        </section>
      )
    }
    return (
      <IdiomForm
        key={`${idiom.id}-${pair.source}-${pair.target}`}
        pair={pair}
        initial={draftFromIdiom(idiom, pair)}
        editing
        onSave={draft => { ownIdioms.save(draft, pair, idiom); closeSubpage(LIST_HASH) }}
        onCancel={() => closeSubpage(LIST_HASH)}
        onDelete={() => { ownIdioms.remove(idiom); setRemoved(idiom); closeSubpage(LIST_HASH) }}
      />
    )
  }

  const all = findIdioms(filter, pair, undefined, ownIdioms.idioms)
  const ownCount = all.filter(match => match.own).length
  const matches = shown === 'own' ? all.filter(match => match.own) : all
  const sourceName = languageName(pair.source).toLowerCase()
  const targetName = languageName(pair.target).toLowerCase()
  const typed = normalize(filter).length >= MIN_QUERY_LENGTH ? filter.trim() : ''
  const ownTotal = ownIdioms.idioms.length

  return (
    <section className="screen" aria-labelledby="idioms-title">
      <h1 id="idioms-title">Expresiones</h1>
      <p className="screen-intro">Cómo se dicen de verdad en {targetName}, no su traducción literal. Puedes añadir las tuyas.</p>
      {removed && (
        <p className="undo-bar" role="status">
          <span>Borrada: «{removed.expressions.find(expression => expression.lang === pair.source)?.text ?? removed.expressions[0]?.text}»</span>
          <button className="text-button" type="button" onClick={() => { ownIdioms.restore(removed); setRemoved(null) }}>Deshacer</button>
        </p>
      )}
      {ownIdioms.error && <p className="error-message" role="alert">{ownIdioms.error}</p>}
      <a className="secondary-button new-idiom" href={NEW_IDIOM_HASH} onClick={event => { setPrefill(''); openSubpage(event) }}><Plus size={16} aria-hidden="true" />Nueva expresión</a>
      <FilterField value={filter} onChange={setFilter} label={`Buscar una expresión en ${sourceName}`} lang={pair.source} />
      {ownTotal > 0 && (
        <div className="segmented" role="tablist" aria-label="Qué expresiones">
          <button type="button" role="tab" aria-selected={shown === 'all'} onClick={() => setShown('all')}>Todas</button>
          <button type="button" role="tab" aria-selected={shown === 'own'} onClick={() => setShown('own')}>Mías ({ownCount})</button>
        </div>
      )}
      <p className="result-count" role="status">{matches.length === 1 ? '1 expresión' : `${matches.length} expresiones`}</p>
      {shown === 'own' && ownTotal > 0 && ownCount === 0 && !typed && <p className="card-note">Ninguna de tus expresiones está en {sourceName} y {targetName}.</p>}
      {typed && matches.length === 0 && (
        <p className="card-note">
          Ninguna expresión coincide con «<span lang={pair.source}>{typed}</span>».{' '}
          <a href={NEW_IDIOM_HASH} onClick={event => { setPrefill(typed); openSubpage(event) }}>Añadirla como tuya</a>
        </p>
      )}
      <div className="card-list">
        {matches.map(match => <IdiomCard key={`${match.own ? 'own' : 'app'}-${match.idiom.id}`} idiom={match.idiom} expression={match.expression} pair={pair} own={match.own} />)}
      </div>
    </section>
  )
}
