import { useEffect, useState } from 'react'
import { ChevronDown, Search, Star } from 'lucide-react'
import { filterFavorites } from '../favorites'
import type { Favorite, FavoriteOrder } from '../favorites'
import type { LanguagePair } from '../languages'
import type useFavorites from '../useFavorites'
import SpeakButton from './SpeakButton'

const PAGE = 30
const UNDO_MS = 6000

/**
 * Starred searches under "¿Cómo se dice?", folded by default: filter, order, open again or
 * remove (with undo).
 */
export default function FavoritesSection({ favorites, pair, onOpen }: { favorites: ReturnType<typeof useFavorites>; pair: LanguagePair; onOpen: (favorite: Favorite) => void }) {
  const [filter, setFilter] = useState('')
  const [order, setOrder] = useState<FavoriteOrder>('recent')
  const [shown, setShown] = useState(PAGE)
  const [removed, setRemoved] = useState<Favorite | null>(null)
  const found = filterFavorites(favorites.favorites, filter, order)
  const total = favorites.favorites.length

  useEffect(() => {
    if (!removed) return
    const timer = window.setTimeout(() => setRemoved(null), UNDO_MS)
    return () => window.clearTimeout(timer)
  }, [removed])

  function remove(favorite: Favorite) {
    favorites.remove(favorite)
    setRemoved(favorite)
  }

  function undo() {
    if (!removed) return
    favorites.add(removed.term, removed.pair, removed.engine, removed.translations)
    setRemoved(null)
  }

  return (
    <>
      <details className="favorites">
        <summary className="favorites-summary">
          <h2 className="favorites-title"><Star size={18} fill="currentColor" aria-hidden="true" />Favoritos{total > 0 && <span className="badge">{total}</span>}</h2>
          <ChevronDown className="favorites-chevron" size={20} aria-hidden="true" />
        </summary>
        <div className="favorites-body">
          {removed && (
            <p className="undo-bar" role="status">
              <span>Quitado de favoritos: «<span lang={removed.pair.source}>{removed.term}</span>»</span>
              <button className="text-button" type="button" onClick={undo}>Deshacer</button>
            </p>
          )}
          {!favorites.ready ? null : total === 0 ? (
            <p className="card-note">Toca la estrella <Star size={14} aria-label="estrella" /> junto a una respuesta para guardarla aquí, con su traducción.</p>
          ) : (
            <>
              <div className="favorites-tools">
                <div className="filter-field">
                  <Search size={18} aria-hidden="true" />
                  <label className="sr-only" htmlFor="favorites-filter">Buscar en favoritos</label>
                  <input id="favorites-filter" type="search" value={filter} onChange={event => { setFilter(event.target.value); setShown(PAGE) }} placeholder="Buscar en favoritos" autoComplete="off" autoCapitalize="none" spellCheck={false} />
                </div>
                <div className="segmented" role="tablist" aria-label="Orden">
                  <button type="button" role="tab" aria-selected={order === 'recent'} onClick={() => setOrder('recent')}>Recientes</button>
                  <button type="button" role="tab" aria-selected={order === 'alphabetical'} onClick={() => setOrder('alphabetical')}>A–Z</button>
                </div>
              </div>
              {found.length === 0 ? (
                <p className="card-note">Ningún favorito coincide con «{filter.trim()}».</p>
              ) : (
                <ul className="favorite-list">
                  {found.slice(0, shown).map(favorite => {
                    const otherDirection = favorite.pair.source !== pair.source || favorite.pair.target !== pair.target
                    return (
                      <li key={favorite.id} className="favorite-item">
                        <button className="favorite-open" type="button" onClick={() => onOpen(favorite)} title="Buscarla otra vez">
                          <span className="favorite-term">
                            <strong lang={favorite.pair.source}>{favorite.term}</strong>
                            {otherDirection && <span className="badge">{favorite.pair.source.toUpperCase()} → {favorite.pair.target.toUpperCase()}</span>}
                          </span>
                          <span className="favorite-translations" lang={favorite.pair.target}>{favorite.translations.length ? favorite.translations.slice(0, 4).join(' · ') : 'Sin traducción guardada'}</span>
                        </button>
                        <SpeakButton text={favorite.term} lang={favorite.pair.source} />
                        <button className="star-button star-on" type="button" onClick={() => remove(favorite)} aria-label={`Quitar «${favorite.term}» de favoritos`} title="Quitar de favoritos">
                          <Star size={20} fill="currentColor" aria-hidden="true" />
                        </button>
                      </li>
                    )
                  })}
                </ul>
              )}
              {found.length > shown && <button className="secondary-button" type="button" onClick={() => setShown(shown + PAGE)}>Ver más ({found.length - shown})</button>}
            </>
          )}
        </div>
      </details>
      {favorites.error && <p className="error-message" role="alert">{favorites.error}</p>}
    </>
  )
}
