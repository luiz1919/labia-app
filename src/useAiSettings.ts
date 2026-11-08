import { useEffect, useState } from 'react'
import { FirebaseError } from 'firebase/app'
import { deleteField, doc, onSnapshot, setDoc } from 'firebase/firestore'
import { DEFAULT_AI_SETTINGS, parseAiSettings } from 'firebase-app-kit/ai'
import type { AiProviderId, AiProviderSettings, AiSettings, AiSettingsActions } from 'firebase-app-kit/ai'
import { db } from './firebase'

function cloudError(error: unknown) {
  if (error instanceof FirebaseError && error.code === 'permission-denied') return 'Firestore ha denegado el acceso a los ajustes de IA. Publica las reglas del proyecto.'
  return 'No se han podido leer o guardar los ajustes de IA.'
}

/**
 * AI keys and models, in users/{uid}/settings/ai (the shape shared through firebase-app-kit/ai,
 * same document as CommunityAssistant). Only the owner can read it (Firestore rules).
 */
export default function useAiSettings(uid: string) {
  const [settings, setSettings] = useState<AiSettings>(DEFAULT_AI_SETTINGS)
  const [ready, setReady] = useState(!db)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!db) return
    return onSnapshot(doc(db, 'users', uid, 'settings', 'ai'), snapshot => {
      setSettings(parseAiSettings(snapshot.data()))
      setReady(true)
    }, failure => {
      setError(cloudError(failure))
      setReady(true)
    })
  }, [uid])

  function save(values: Record<string, unknown>) {
    if (!db) return Promise.resolve()
    setError('')
    return setDoc(doc(db, 'users', uid, 'settings', 'ai'), values, { merge: true }).catch(failure => setError(cloudError(failure)))
  }

  const actions: AiSettingsActions = {
    saveProvider: (id: AiProviderId, values: Partial<AiProviderSettings>) => save({ providers: { [id]: values } }),
    removeProvider: (id: AiProviderId) => save({ providers: { [id]: deleteField() } }),
    setLastProvider: (id: AiProviderId) => save({ lastProvider: id }),
    setAnthropicFallback: (enabled: boolean) => save({ anthropicFallback: enabled }),
  }

  return { settings, ready, error, actions }
}
