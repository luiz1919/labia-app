// Order of the search engines, saved on the device (like the voices: the Chrome translator, for
// one, depends on the browser).
import type { EngineId } from './types'

export const ENGINES_STORAGE_KEY = 'labia.engines'

export const DEFAULT_ENGINE_ORDER: readonly EngineId[] = ['wiktionary', 'ai', 'mymemory', 'chrome']

/** Saved order with unknown ids dropped and engines added in a later version appended. */
export function parseEngineOrder(stored: string | null): EngineId[] {
  let saved: unknown = []
  try {
    saved = stored ? JSON.parse(stored) : []
  } catch {
    // Corrupt value: default order.
  }
  const known = (Array.isArray(saved) ? saved : []).filter((id): id is EngineId => DEFAULT_ENGINE_ORDER.includes(id as EngineId))
  const unique = [...new Set(known)]
  return [...unique, ...DEFAULT_ENGINE_ORDER.filter(id => !unique.includes(id))]
}

/** Moves an engine one place up (-1) or down (+1). */
export function moveEngine(order: readonly EngineId[], id: EngineId, step: -1 | 1): EngineId[] {
  const index = order.indexOf(id)
  const other = index + step
  if (index < 0 || other < 0 || other >= order.length) return [...order]
  const next = [...order]
  ;[next[index], next[other]] = [next[other], next[index]]
  return next
}
