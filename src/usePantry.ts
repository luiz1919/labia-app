import { useEffect, useRef, useState } from 'react'
import { FirebaseError } from 'firebase/app'
import { collection, deleteDoc, doc, limit, onSnapshot, query, serverTimestamp, setDoc, updateDoc, writeBatch } from 'firebase/firestore'
import { db } from './firebase'
import { LANGUAGES } from './languages'
import type { LanguageCode } from './languages'
import { MAX_ENTRY_LENGTH, pantryKey, parsePantryItem, sortPantry } from './pantry.ts'
import type { PantryItem } from './pantry.ts'

const CODES: readonly string[] = LANGUAGES.map(language => language.code)
/** More than enough for a list that gets emptied as words are looked up. */
const MAX_ITEMS = 500

function cloudError(error: unknown) {
  if (error instanceof FirebaseError && error.code === 'permission-denied') return 'Firestore ha denegado el acceso a la despensa. Hay que publicar las reglas de Firestore del proyecto.'
  if (error instanceof FirebaseError && error.code === 'unavailable') return 'No se puede conectar con Firestore. Comprueba tu conexión.'
  return 'No se ha podido leer o guardar la despensa en Firebase.'
}

export type AddResult = 'added' | 'duplicate' | 'invalid'

/**
 * The user's pantry, in users/{uid}/pantry. Writes are not awaited: offline, Firestore keeps
 * them in its cache (the list updates at once) and uploads them when the connection comes back.
 */
export default function usePantry(uid: string) {
  const [items, setItems] = useState<PantryItem[]>([])
  const [ready, setReady] = useState(!db)
  const [error, setError] = useState(db ? '' : 'Firebase no está configurado.')
  // Words added since the last snapshot: two quick captures of the same word stay one.
  const latest = useRef<PantryItem[]>([])
  const recent = useRef(new Set<string>())

  useEffect(() => {
    if (!db) return
    return onSnapshot(query(collection(db, 'users', uid, 'pantry'), limit(MAX_ITEMS)), snapshot => {
      const next = sortPantry(snapshot.docs.flatMap(item => parsePantryItem(item.id, item.data({ serverTimestamps: 'estimate' }), CODES) ?? []))
      latest.current = next
      recent.current.clear()
      setItems(next)
      setReady(true)
    }, failure => {
      setError(cloudError(failure))
      setReady(true)
    })
  }, [uid])

  function report(write: Promise<unknown>) {
    write.catch(failure => setError(cloudError(failure)))
  }

  /** Saves a word unless it is already there; a word already looked up goes back to the list. */
  function add(text: string, lang: LanguageCode): AddResult {
    const clean = text.replace(/\s+/g, ' ').trim().slice(0, MAX_ENTRY_LENGTH)
    if (!db || !clean) return 'invalid'
    const key = pantryKey(clean, lang)
    const existing = latest.current.find(item => pantryKey(item.text, item.lang) === key)
    if (existing || recent.current.has(key)) {
      if (existing?.reviewed) report(updateDoc(doc(db, 'users', uid, 'pantry', existing.id), { reviewed: false }))
      return 'duplicate'
    }
    recent.current.add(key)
    setError('')
    report(setDoc(doc(collection(db, 'users', uid, 'pantry')), { text: clean, lang, createdAt: serverTimestamp(), reviewed: false }))
    return 'added'
  }

  function setReviewed(item: PantryItem, reviewed: boolean) {
    if (db) report(updateDoc(doc(db, 'users', uid, 'pantry', item.id), { reviewed }))
  }

  function rename(item: PantryItem, text: string) {
    const clean = text.replace(/\s+/g, ' ').trim().slice(0, MAX_ENTRY_LENGTH)
    if (db && clean && clean !== item.text) report(updateDoc(doc(db, 'users', uid, 'pantry', item.id), { text: clean }))
  }

  function remove(item: PantryItem) {
    if (db) report(deleteDoc(doc(db, 'users', uid, 'pantry', item.id)))
  }

  function removeAll(list: readonly PantryItem[]) {
    if (!db || !list.length) return
    const batch = writeBatch(db)
    for (const item of list) batch.delete(doc(db, 'users', uid, 'pantry', item.id))
    report(batch.commit())
  }

  return { items, ready, error, add, setReviewed, rename, remove, removeAll }
}
