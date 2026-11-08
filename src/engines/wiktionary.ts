// English Wiktionary (en.wiktionary.org): free, no key, CORS allowed, content under CC BY-SA.
// - From another language into English: the REST "definition" endpoint, whose English
//   definitions of a Spanish word are its translations ("superar" -> to surpass, to overcome).
// - From English into another language: the translation tables of the English entry
//   ("* Spanish: {{t+|es|superar}}"), read from the page's wikitext.
import { englishName } from '../languages.ts'
import type { LanguageCode, LanguagePair } from '../languages'
import { stripHtml, stripWikiLinks } from './text.ts'
import type { AnswerGroup, EngineAnswer } from './types'

const POS_LABELS: Readonly<Record<string, string>> = {
  Noun: 'Nombre',
  'Proper noun': 'Nombre propio',
  Verb: 'Verbo',
  Adjective: 'Adjetivo',
  Adverb: 'Adverbio',
  Pronoun: 'Pronombre',
  Preposition: 'Preposición',
  'Prepositional phrase': 'Locución preposicional',
  Conjunction: 'Conjunción',
  Interjection: 'Interjección',
  Determiner: 'Determinante',
  Article: 'Artículo',
  Numeral: 'Numeral',
  Particle: 'Partícula',
  Participle: 'Participio',
  Contraction: 'Contracción',
  Phrase: 'Expresión',
  Idiom: 'Modismo',
  Proverb: 'Refrán',
  Prefix: 'Prefijo',
  Suffix: 'Sufijo',
}

const GENDERS: Readonly<Record<string, string>> = { m: 'masc.', f: 'fem.', n: 'neutro', mf: 'masc. y fem.', 'm-p': 'masc. pl.', 'f-p': 'fem. pl.', p: 'pl.', 'm-s': 'masc.', 'f-s': 'fem.' }

export function posLabel(pos: string): string {
  return POS_LABELS[pos] ?? pos
}

/** Groups from the REST definition endpoint: one per part of speech, translated into English. */
export function parseDefinitions(data: unknown, source: LanguageCode): AnswerGroup[] {
  const entries = (data as Record<string, unknown> | null)?.[source]
  if (!Array.isArray(entries)) return []
  const groups: AnswerGroup[] = []
  let examples = 0
  for (const entry of entries) {
    const definitions = Array.isArray(entry?.definitions) ? entry.definitions : []
    const texts = [...new Set(definitions.map((definition: { definition?: unknown }) => typeof definition?.definition === 'string' ? stripHtml(definition.definition) : '').filter(Boolean))] as string[]
    if (!texts.length) continue
    const group: AnswerGroup = { label: posLabel(String(entry.partOfSpeech ?? '')), items: texts.slice(0, 8).map(text => ({ text, lang: 'en' })) }
    for (const definition of definitions) {
      for (const parsed of Array.isArray(definition?.parsedExamples) ? definition.parsedExamples : []) {
        if (examples >= 3 || typeof parsed?.example !== 'string') continue
        group.examples = [...(group.examples ?? []), { text: stripHtml(parsed.example), lang: source, ...(typeof parsed.translation === 'string' ? { translation: stripHtml(parsed.translation), translationLang: 'en' as const } : {}) }]
        examples++
      }
    }
    groups.push(group)
  }
  return groups
}

const TRANSLATION_TEMPLATE = /\{\{(?:t|t\+|tt|tt\+|t-simple|t-check|t\+check)\|([a-z-]+)\|([^|}]+)((?:\|[^}]*)?)\}\}/g

/** The English section of a page ("==English==" up to the next language), or '' if missing. */
function englishSection(wikitext: string): string {
  const start = wikitext.search(/^==\s*English\s*==\s*$/m)
  if (start < 0) return ''
  const rest = wikitext.slice(start).split('\n')
  const end = rest.findIndex((line, index) => index > 0 && /^==[^=].*==\s*$/.test(line))
  return (end < 0 ? rest : rest.slice(0, end)).join('\n')
}

export interface TranslationTables {
  groups: AnswerGroup[]
  /** The page keeps some tables in a "<title>/translations" subpage. */
  subpage: boolean
}

/** Translations into `target` from the tables of an English entry, grouped by part of speech and meaning. */
export function parseTranslationTables(wikitext: string, target: LanguageCode, wholePage = false): TranslationTables {
  const text = wholePage ? wikitext : englishSection(wikitext)
  const language = englishName(target)
  const languageLine = new RegExp(`^\\*\\s*${language}\\s*:`)
  const groups = new Map<string, AnswerGroup>()
  let pos = ''
  let gloss: string | null = null
  let inLanguage = false

  for (const line of text.split('\n')) {
    const heading = /^===+\s*([^=]+?)\s*===+\s*$/.exec(line)
    if (heading) {
      if (POS_LABELS[heading[1]]) pos = heading[1]
      inLanguage = false
      continue
    }
    const top = /^\{\{(trans-top(?:-see|-also)?|checktrans-top)(\|[^}]*)?\}\}/.exec(line)
    if (top) {
      // Unchecked tables ("checktrans") are machine-copied and unreliable: skipped.
      const params = (top[2] ?? '').split('|').slice(1).filter(param => !param.includes('='))
      gloss = top[1] === 'checktrans-top' ? null : stripWikiLinks(params[0] ?? '')
      inLanguage = false
      continue
    }
    if (line.startsWith('{{trans-bottom}}')) {
      gloss = null
      inLanguage = false
      continue
    }
    if (gloss === null) continue
    let region = ''
    if (languageLine.test(line)) {
      inLanguage = true
    } else if (inLanguage && line.startsWith('*:')) {
      region = stripWikiLinks(/^\*:\s*([^:{]+):/.exec(line)?.[1] ?? '')
    } else {
      inLanguage = false
      continue
    }
    for (const match of line.matchAll(TRANSLATION_TEMPLATE)) {
      if (match[1] !== target) continue
      const word = stripWikiLinks(match[2])
      if (!word) continue
      const positional = match[3].split('|').slice(1).filter(param => !param.includes('='))
      const notes = [...positional.map(param => GENDERS[param]).filter(Boolean), region].filter(Boolean)
      const label = [pos ? posLabel(pos) : '', gloss].filter(Boolean).join(' · ')
      const group = groups.get(label) ?? { label, items: [] }
      if (!group.items.some(item => item.text === word)) group.items.push({ text: word, lang: target, ...(notes.length ? { note: notes.join(', ') } : {}) })
      groups.set(label, group)
    }
  }
  return { groups: [...groups.values()], subpage: /\{\{see translation subpage/.test(text) }
}

// Network ---------------------------------------------------------------------------------------

const WIKI = 'https://en.wiktionary.org'

/** Page titles to try: lower case first (most entries), then as typed. */
function titles(term: string): string[] {
  const clean = term.trim().replace(/\s+/g, ' ')
  return [...new Set([clean.toLowerCase(), clean])]
}

async function definitionsOf(title: string): Promise<unknown | null> {
  const response = await fetch(`${WIKI}/api/rest_v1/page/definition/${encodeURIComponent(title.replace(/ /g, '_'))}`)
  if (response.status === 404) return null
  if (!response.ok) throw new Error(`Wiktionary no responde (error ${response.status}).`)
  return response.json()
}

async function wikitextOf(title: string): Promise<{ title: string; text: string } | null> {
  const params = new URLSearchParams({ action: 'query', prop: 'revisions', rvprop: 'content', rvslots: 'main', titles: title, redirects: '1', format: 'json', formatversion: '2', origin: '*' })
  const response = await fetch(`${WIKI}/w/api.php?${params}`)
  if (!response.ok) throw new Error(`Wiktionary no responde (error ${response.status}).`)
  const page = (await response.json())?.query?.pages?.[0]
  const text = page?.revisions?.[0]?.slots?.main?.content
  return typeof text === 'string' ? { title: page.title, text } : null
}

function pageLink(title: string): EngineAnswer['source'] {
  return { label: 'Wiktionary (CC BY-SA)', href: `${WIKI}/wiki/${encodeURIComponent(title.replace(/ /g, '_'))}` }
}

export function wiktionarySupports(pair: LanguagePair): boolean {
  return pair.source === 'en' || pair.target === 'en'
}

export async function searchWiktionary(term: string, pair: LanguagePair): Promise<EngineAnswer> {
  if (pair.target === 'en') {
    for (const title of titles(term)) {
      const data = await definitionsOf(title)
      const groups = data ? parseDefinitions(data, pair.source) : []
      if (groups.length) return { groups, source: pageLink(title) }
    }
    return { groups: [] }
  }
  if (pair.source !== 'en') throw new Error('Wiktionary solo traduce cuando el inglés es uno de los dos idiomas.')
  for (const title of titles(term)) {
    const page = await wikitextOf(title)
    if (!page) continue
    const tables = parseTranslationTables(page.text, pair.target)
    let groups = tables.groups
    if (tables.subpage) {
      const subpage = await wikitextOf(`${page.title}/translations`)
      if (subpage) groups = [...parseTranslationTables(subpage.text, pair.target, true).groups, ...groups]
    }
    if (groups.length) return { groups, source: pageLink(page.title) }
  }
  return { groups: [] }
}
