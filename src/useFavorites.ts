import { useEffect, useState } from 'react'
import { FirebaseError } from 'firebase/app'
import { collection, deleteDoc, doc, limit, onSnapshot, query, serverTimestamp, setDoc } from 'firebase/firestore'
import { db } from './firebase'
import type { EngineAnswer, EngineId } from './engines/types'
import { favoriteId, favoriteTranslations, MAX_FAVORITE_TERM, parseFavorite } from './favorites.ts'
import type { Favorite } from './favorites.ts'
import { LANGUAGES } from './languages'
import type { LanguagePair } from './languages'

const CODES: readonly string[] = LANGUAGES.map(language => language.code)
const MAX_FAVORITES = 1000

function cloudError(error: unknown) {
  if (error instanceof FirebaseError && error.code === 'permission-denied') return 'Firestore ha denegado el acceso a los favoritos. Hay que publicar las reglas de Firestore del proyecto.'
  if (error instanceof FirebaseError && error.code === 'unavailable') return 'No se puede conectar con Firestore. Comprueba tu conexión.'
  return 'No se han podido leer o guardar los favoritos en Firebase.'
}

/**
 * The user's favorite searches, in users/{uid}/favorites. Writes are not awaited: offline,
 * Firestore keeps them in its cache (the star and the list change at once) and uploads them later.
 */
export default function useFavorites(uid: string) {
  const [favorites, setFavorites] = useState<Favorite[]>([])
  const [ready, setReady] = useState(!db)
  const [error, setError] = useState(db ? '' : 'Firebase no está configurado.')

  useEffect(() => {
    if (!db) return
    return onSnapshot(query(collection(db, 'users', uid, 'favorites'), limit(MAX_FAVORITES)), snapshot => {
      setFavorites(snapshot.docs.flatMap(item => parseFavorite(item.id, item.data({ serverTimestamps: 'estimate' }), CODES) ?? []))
      setReady(true)
    }, failure => {
      setError(cloudError(failure))
      setReady(true)
    })
  }, [uid])

  function report(write: Promise<unknown>) {
    write.catch(failure => setError(cloudError(failure)))
  }

  function isFavorite(term: string, pair: LanguagePair): boolean {
    const id = favoriteId(term, pair)
    return favorites.some(favorite => favorite.id === id)
  }

  /** Saves a query with the translations of the answer it got (or the ones given, to undo a removal). */
  function add(term: string, pair: LanguagePair, engine: EngineId | string, answer: EngineAnswer | string[]) {
    const clean = term.replace(/\s+/g, ' ').trim().slice(0, MAX_FAVORITE_TERM)
    if (!db || !clean) return
    setError('')
    const translations = Array.isArray(answer) ? answer : favoriteTranslations(answer)
    report(setDoc(doc(db, 'users', uid, 'favorites', favoriteId(clean, pair)), { term: clean, source: pair.source, target: pair.target, translations, engine, createdAt: serverTimestamp() }))
  }

  function remove(favorite: Favorite) {
    if (db) report(deleteDoc(doc(db, 'users', uid, 'favorites', favorite.id)))
  }

  /** The star of an answer: saves the query, or removes it if it was already a favorite. */
  function toggle(term: string, pair: LanguagePair, engine: EngineId, answer: EngineAnswer) {
    const existing = favorites.find(favorite => favorite.id === favoriteId(term, pair))
    if (existing) remove(existing)
    else add(term, pair, engine, answer)
  }

  return { favorites, ready, error, isFavorite, add, remove, toggle }
}
