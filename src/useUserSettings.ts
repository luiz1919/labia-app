import { useEffect, useState } from 'react'
import { FirebaseError } from 'firebase/app'
import { doc, onSnapshot, setDoc } from 'firebase/firestore'
import { useOnline } from 'firebase-app-kit/react'
import type { SyncState } from 'firebase-app-kit/utils'
import { db } from './firebase'
import { DEFAULT_PAIR, parsePair } from './languages'
import type { LanguagePair } from './languages'

function cloudError(error: unknown) {
  if (error instanceof FirebaseError) {
    if (error.code === 'permission-denied') return 'Firestore ha denegado el acceso. Publica las reglas de acceso por usuario del proyecto.'
    if (error.code === 'unavailable') return 'No se puede conectar con Firestore. Comprueba tu conexión.'
    if (error.code === 'unauthenticated') return 'La sesión ya no es válida. Vuelve a iniciar sesión.'
  }
  return 'No se han podido leer o guardar tus preferencias en Firebase.'
}

/**
 * The user's preferences, in the Firestore document users/{uid}
 * ({ sourceLanguage, targetLanguage }). Changes are written right away: offline, Firestore keeps
 * them in its local cache and uploads them when the connection comes back.
 */
export default function useUserSettings(uid: string) {
  const online = useOnline()
  const [pair, setPair] = useState<LanguagePair>({ ...DEFAULT_PAIR })
  const [pendingWrites, setPendingWrites] = useState(false)
  const [fromCache, setFromCache] = useState(true)
  const [error, setError] = useState(db ? '' : 'Firebase no está configurado.')

  useEffect(() => {
    if (!db) return
    return onSnapshot(doc(db, 'users', uid), { includeMetadataChanges: true }, snapshot => {
      setPair(parsePair(snapshot.data()))
      setPendingWrites(snapshot.metadata.hasPendingWrites)
      setFromCache(snapshot.metadata.fromCache)
    }, failure => setError(cloudError(failure)))
  }, [uid])

  function changePair(next: LanguagePair) {
    setPair(next)
    if (!db) return
    setError('')
    // merge: other preferences added to the document later are kept.
    setDoc(doc(db, 'users', uid), { sourceLanguage: next.source, targetLanguage: next.target }, { merge: true })
      .catch(failure => setError(cloudError(failure)))
  }

  const syncState: SyncState = error ? 'error' : !online ? 'offline' : pendingWrites || fromCache ? 'syncing' : 'synced'
  return { pair, changePair, syncState, error }
}
