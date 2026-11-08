// Device preferences shared across screens: the order of the search engines.
import { createContext, useContext } from 'react'
import { DEFAULT_ENGINE_ORDER } from './engines/order'
import type { EngineId } from './engines/types'

export interface EnginePreferences {
  engineOrder: EngineId[]
  setEngineOrder: (order: EngineId[]) => void
}

export const EnginePreferencesContext = createContext<EnginePreferences>({ engineOrder: [...DEFAULT_ENGINE_ORDER], setEngineOrder: () => {} })

export function useEnginePreferences(): EnginePreferences {
  return useContext(EnginePreferencesContext)
}
