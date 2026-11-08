import { useState } from 'react'
import type { ReactNode } from 'react'
import { ENGINES_STORAGE_KEY, parseEngineOrder } from '../engines/order'
import type { EngineId } from '../engines/types'
import { EnginePreferencesContext } from '../preferencesContext'

function storedOrder(): EngineId[] {
  try {
    return parseEngineOrder(localStorage.getItem(ENGINES_STORAGE_KEY))
  } catch {
    return parseEngineOrder(null)
  }
}

export default function EnginePreferencesProvider({ children }: { children: ReactNode }) {
  const [engineOrder, setOrder] = useState(storedOrder)

  function setEngineOrder(order: EngineId[]) {
    setOrder(order)
    try {
      localStorage.setItem(ENGINES_STORAGE_KEY, JSON.stringify(order))
    } catch {
      // Private mode or full storage: the order lasts until the page is closed.
    }
  }

  return <EnginePreferencesContext.Provider value={{ engineOrder, setEngineOrder }}>{children}</EnginePreferencesContext.Provider>
}
