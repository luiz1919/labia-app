import { useEffect, useState } from 'react'
import { FirebaseError } from 'firebase/app'
import { collection, deleteDoc, doc, limit, onSnapshot, query, serverTimestamp, setDoc, updateDoc } from 'firebase/firestore'
import { db } from './firebase'
import { LANGUAGES } from './languages'
import type { LanguagePair } from './languages'
import { ownIdiomData, parseOwnIdiom } from './ownIdioms.ts'
import type { IdiomDraft, OwnIdiom } from './ownIdioms.ts'

const CODES: readonly string[] = LANGUAGES.map(language => language.code)
const MAX_IDIOMS = 1000

function cloudError(error: unknown) {
  if (error instanceof FirebaseError && error.code === 'permission-denied') return 'Firestore ha denegado el acceso a tus expresiones. Hay que publicar las reglas de Firestore del proyecto.'
  if (error instanceof FirebaseError && error.code === 'unavailable') return 'No se puede conectar con Firestore. Comprueba tu conexión.'
  return 'No se han podido leer o guardar tus expresiones en Firebase.'
}

/**
 * The user's own expressions, in users/{uid}/idioms. Writes are not awaited: offline, Firestore
 * keeps them in its cache (the list changes at once) and uploads them later.
 */
export default function useOwnIdioms(uid: string) {
  const [idioms, setIdioms] = useState<OwnIdiom[]>([])
  const [ready, setReady] = useState(!db)
  const [error, setError] = useState(db ? '' : 'Firebase no está configurado.')

  useEffect(() => {
    if (!db) return
    return onSnapshot(query(collection(db, 'users', uid, 'idioms'), limit(MAX_IDIOMS)), snapshot => {
      setIdioms(snapshot.docs.flatMap(item => parseOwnIdiom(item.id, item.data({ serverTimestamps: 'estimate' }), CODES) ?? []))
      setReady(true)
    }, failure => {
      setError(cloudError(failure))
      setReady(true)
    })
  }, [uid])

  function report(write: Promise<unknown>) {
    write.catch(failure => setError(cloudError(failure)))
  }

  /** Saves the form as a new expression, or over `previous` (createdAt stays). Returns its id. */
  function save(draft: IdiomDraft, pair: LanguagePair, previous?: OwnIdiom): string {
    if (!db) return ''
    setError('')
    const data = ownIdiomData(draft, pair, previous)
    if (previous) {
      report(updateDoc(doc(db, 'users', uid, 'idioms', previous.id), { ...data, updatedAt: serverTimestamp() }))
      return previous.id
    }
    const ref = doc(collection(db, 'users', uid, 'idioms'))
    report(setDoc(ref, { ...data, createdAt: serverTimestamp(), updatedAt: serverTimestamp() }))
    return ref.id
  }

  function remove(idiom: OwnIdiom) {
    if (db) report(deleteDoc(doc(db, 'users', uid, 'idioms', idiom.id)))
  }

  /** Puts a removed expression back, with the same id (and a new creation time). */
  function restore(idiom: OwnIdiom) {
    if (!db) return
    const { meaning, expressions, example = {} } = idiom
    report(setDoc(doc(db, 'users', uid, 'idioms', idiom.id), { meaning, expressions, example, createdAt: serverTimestamp(), updatedAt: serverTimestamp() }))
  }

  return { idioms, ready, error, save, remove, restore }
}

export type OwnIdioms = ReturnType<typeof useOwnIdioms>
