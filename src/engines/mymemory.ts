// MyMemory (mymemory.translated.net): translation memories (human translations from the web and
// public corpora) plus machine translation. Free, no key, CORS allowed; about 5,000 characters a
// day without an account. Its first suggestion can be wrong (the memories are noisy), so the
// suggestions that agree with each other win.
import type { LanguagePair } from '../languages'
import { normalize } from '../search.ts'
import { stripHtml } from './text.ts'
import type { EngineAnswer } from './types'

interface Candidate { text: string; weight: number; machine: boolean }

function quality(value: unknown): number {
  const number = Number(value)
  return Number.isFinite(number) && number > 0 ? Math.min(number, 100) / 100 : 0.6
}

export function parseMyMemory(data: unknown, pair: LanguagePair): EngineAnswer {
  const body = (data ?? {}) as { responseStatus?: unknown; responseDetails?: unknown; responseData?: { translatedText?: unknown; match?: unknown }; matches?: unknown }
  const status = Number(body.responseStatus)
  if (status === 429 || /USED ALL AVAILABLE FREE TRANSLATIONS/i.test(String(body.responseDetails ?? ''))) {
    throw new Error('Se ha agotado el cupo gratuito de MyMemory por hoy. Prueba otro motor.')
  }
  if (status !== 200) throw new Error('MyMemory no ha podido traducirlo.')

  const candidates: Candidate[] = []
  for (const match of Array.isArray(body.matches) ? body.matches : []) {
    const text = typeof match?.translation === 'string' ? stripHtml(match.translation) : ''
    const similarity = Number(match?.match)
    if (!text || !(similarity >= 0.9)) continue
    candidates.push({ text, weight: similarity * quality(match.quality), machine: match['created-by'] === 'MT!' })
  }

  // The main suggestion repeats the best match: it only counts when there are no matches.
  const main = typeof body.responseData?.translatedText === 'string' ? stripHtml(body.responseData.translatedText) : ''
  if (main && !candidates.length) candidates.push({ text: main, weight: 0.5, machine: false })

  // Suggestions that say the same thing (ignoring case and punctuation) add up.
  const totals = new Map<string, Candidate>()
  for (const candidate of candidates) {
    const key = normalize(candidate.text)
    if (!key) continue
    const current = totals.get(key)
    if (current) {
      current.weight += candidate.weight
      current.machine &&= candidate.machine
    } else {
      totals.set(key, { ...candidate })
    }
  }
  const ranked = [...totals.values()].sort((first, second) => second.weight - first.weight).slice(0, 4)
  if (!ranked.length) return { groups: [] }
  const item = (candidate: Candidate) => ({ text: candidate.text, lang: pair.target, ...(candidate.machine ? { note: 'automática' } : {}) })
  return {
    groups: [
      { label: 'Traducción', items: [item(ranked[0])] },
      ...(ranked.length > 1 ? [{ label: 'Otras traducciones', items: ranked.slice(1).map(item) }] : []),
    ],
    notes: ['Traducciones de memorias de traducción y automáticas: pueden contener errores.'],
    source: { label: 'MyMemory', href: 'https://mymemory.translated.net' },
  }
}

export async function searchMyMemory(term: string, pair: LanguagePair): Promise<EngineAnswer> {
  const params = new URLSearchParams({ q: term.trim().slice(0, 500), langpair: `${pair.source}|${pair.target}` })
  const response = await fetch(`https://api.mymemory.translated.net/get?${params}`)
  if (!response.ok && response.status !== 429) throw new Error(`MyMemory no responde (error ${response.status}).`)
  return parseMyMemory(await response.json(), pair)
}
