// The user's own expressions ("Mías"): idioms they write themselves, with the same fields as the
// bundled ones (src/data/types.ts Idiom), so search, cards and both directions of a pair treat
// them alike. Each one is a Firestore document in users/{uid}/idioms/{id}. The form edits the two
// languages of the current pair; anything stored in other languages is kept as it was.
import { REGION_LABELS, REGISTER_LABELS } from './data/types.ts'
import type { Idiom, IdiomExpression, Region, Register, Translations } from './data/types'
import type { LanguageCode, LanguagePair } from './languages'

export const MAX_OWN_TEXT = 200
export const MAX_OWN_MEANING = 500
export const MAX_OWN_EXAMPLE = 500
export const MAX_OWN_KEYWORDS = 10
/** Ways of saying it per language; the rules allow 20 expressions in total. */
export const MAX_OWN_ROWS = 8

export interface OwnIdiom extends Idiom {
  /** Milliseconds; 0 while the server has not set it yet. */
  createdAt: number
}

/** One way of saying it, as the form edits it: plain strings, the literal one into the pair's other language. */
export interface ExpressionDraft {
  lang: LanguageCode
  text: string
  literal: string
  register: Register
  regions: Region[]
  /** Other forms that should find it, separated by commas. */
  keywords: string
  /** Literal translations into languages outside the pair, kept untouched. */
  otherLiterals?: Translations
}

export interface IdiomDraft {
  meaning: string
  source: ExpressionDraft[]
  target: ExpressionDraft[]
  exampleSource: string
  exampleTarget: string
}

/** What is written to Firestore, besides the timestamps. */
export interface OwnIdiomData {
  meaning: string
  expressions: IdiomExpression[]
  example: Translations
}

/** Regions offered for an expression: those of its language (es-ES and es-419 for Spanish). */
export function regionsOf(lang: LanguageCode): Region[] {
  return (Object.keys(REGION_LABELS) as Region[]).filter(region => region.startsWith(`${lang}-`))
}

function otherOf(lang: LanguageCode, pair: LanguagePair): LanguageCode {
  return lang === pair.source ? pair.target : pair.source
}

export function emptyExpression(lang: LanguageCode, text = ''): ExpressionDraft {
  return { lang, text, literal: '', register: 'neutral', regions: [], keywords: '' }
}

/** A blank form; `text` prefills the first expression in the source language (the filter typed in "Expresiones"). */
export function emptyDraft(pair: LanguagePair, text = ''): IdiomDraft {
  return { meaning: '', source: [emptyExpression(pair.source, text.trim().slice(0, MAX_OWN_TEXT))], target: [emptyExpression(pair.target)], exampleSource: '', exampleTarget: '' }
}

function expressionDraft(expression: IdiomExpression, pair: LanguagePair): ExpressionDraft {
  const other = otherOf(expression.lang, pair)
  const { [other]: literal, ...otherLiterals } = expression.literal ?? {}
  return {
    lang: expression.lang,
    text: expression.text,
    literal: literal ?? '',
    register: expression.register ?? 'neutral',
    regions: expression.regions ?? [],
    keywords: (expression.keywords ?? []).join(', '),
    ...(Object.keys(otherLiterals).length ? { otherLiterals } : {}),
  }
}

/** The form for an existing expression, seen from the current pair. */
export function draftFromIdiom(idiom: Idiom, pair: LanguagePair): IdiomDraft {
  const side = (lang: LanguageCode) => {
    const rows = idiom.expressions.filter(expression => expression.lang === lang).map(expression => expressionDraft(expression, pair))
    return rows.length ? rows : [emptyExpression(lang)]
  }
  return {
    meaning: idiom.meaning,
    source: side(pair.source),
    target: side(pair.target),
    exampleSource: idiom.example?.[pair.source] ?? '',
    exampleTarget: idiom.example?.[pair.target] ?? '',
  }
}

function clean(text: string, max: number): string {
  return text.replace(/\s+/g, ' ').trim().slice(0, max)
}

export function splitKeywords(text: string): string[] {
  const words = text.split(/[,;\n]/).map(word => clean(word, MAX_OWN_TEXT)).filter(Boolean)
  return [...new Set(words)].slice(0, MAX_OWN_KEYWORDS)
}

function expressionData(row: ExpressionDraft, pair: LanguagePair): IdiomExpression {
  const literal: Translations = { ...row.otherLiterals }
  const literalText = clean(row.literal, MAX_OWN_TEXT)
  if (literalText) literal[otherOf(row.lang, pair)] = literalText
  const regions = row.regions.filter(region => regionsOf(row.lang).includes(region))
  const keywords = splitKeywords(row.keywords)
  // Firestore rejects undefined fields, so optional ones are left out instead.
  return {
    lang: row.lang,
    text: clean(row.text, MAX_OWN_TEXT),
    ...(Object.keys(literal).length ? { literal } : {}),
    ...(row.register !== 'neutral' ? { register: row.register } : {}),
    ...(regions.length ? { regions } : {}),
    ...(keywords.length ? { keywords } : {}),
  }
}

/** Why the form cannot be saved yet, in Spanish, or '' when it can. */
export function draftProblem(draft: IdiomDraft, pair: LanguagePair, languageName: (code: LanguageCode) => string): string {
  const missing = [pair.source, pair.target].filter(lang => !(lang === pair.source ? draft.source : draft.target).some(row => row.text.trim()))
  if (missing.length === 2) return 'Escribe la expresión y cómo se dice en el otro idioma.'
  if (missing.length === 1) return `Falta cómo se dice en ${languageName(missing[0]).toLowerCase()}.`
  return ''
}

/**
 * The document for a filled form. `previous` is the stored expression when editing: its
 * expressions and examples in languages outside the pair stay.
 */
export function ownIdiomData(draft: IdiomDraft, pair: LanguagePair, previous?: Idiom): OwnIdiomData {
  const inPair = (lang: LanguageCode) => lang === pair.source || lang === pair.target
  const rows = [...draft.source, ...draft.target].filter(row => row.text.trim())
  const example: Translations = Object.fromEntries(Object.entries(previous?.example ?? {}).filter(([lang]) => !inPair(lang as LanguageCode)))
  const exampleSource = clean(draft.exampleSource, MAX_OWN_EXAMPLE)
  const exampleTarget = clean(draft.exampleTarget, MAX_OWN_EXAMPLE)
  if (exampleSource) example[pair.source] = exampleSource
  if (exampleTarget) example[pair.target] = exampleTarget
  return {
    meaning: clean(draft.meaning, MAX_OWN_MEANING),
    expressions: [
      ...(previous?.expressions ?? []).filter(expression => !inPair(expression.lang)),
      ...rows.map(row => expressionData(row, pair)),
    ],
    example,
  }
}

function text(value: unknown, max: number): string {
  return typeof value === 'string' ? clean(value, max) : ''
}

function translations(value: unknown, languages: readonly string[], max: number, except?: string): Translations {
  if (typeof value !== 'object' || value === null || Array.isArray(value)) return {}
  return Object.fromEntries(Object.entries(value).flatMap(([lang, entry]): [string, string][] => {
    const found = text(entry, max)
    return languages.includes(lang) && lang !== except && found ? [[lang, found]] : []
  }))
}

function parseExpression(value: unknown, languages: readonly string[]): IdiomExpression | null {
  if (typeof value !== 'object' || value === null) return null
  const { lang, text: raw, literal, register, regions, keywords } = value as Record<string, unknown>
  const expressionText = text(raw, MAX_OWN_TEXT)
  if (typeof lang !== 'string' || !languages.includes(lang) || !expressionText) return null
  const code = lang as LanguageCode
  const literals = translations(literal, languages, MAX_OWN_TEXT, code)
  const validRegions = Array.isArray(regions) ? regions.filter((region): region is Region => regionsOf(code).includes(region as Region)) : []
  const validKeywords = Array.isArray(keywords) ? keywords.map(keyword => text(keyword, MAX_OWN_TEXT)).filter(Boolean).slice(0, MAX_OWN_KEYWORDS) : []
  return {
    lang: code,
    text: expressionText,
    ...(Object.keys(literals).length ? { literal: literals } : {}),
    ...(typeof register === 'string' && register in REGISTER_LABELS && register !== 'neutral' ? { register: register as Register } : {}),
    ...(validRegions.length ? { regions: validRegions } : {}),
    ...(validKeywords.length ? { keywords: validKeywords } : {}),
  }
}

/** Reads a stored expression; null when malformed or without any expression the app can show. */
export function parseOwnIdiom(id: string, data: unknown, languages: readonly string[]): OwnIdiom | null {
  if (typeof data !== 'object' || data === null) return null
  const { meaning, expressions, example, createdAt } = data as Record<string, unknown>
  const parsed = Array.isArray(expressions) ? expressions.flatMap(expression => parseExpression(expression, languages) ?? []) : []
  if (!parsed.length) return null
  const examples = translations(example, languages, MAX_OWN_EXAMPLE)
  const millis = typeof (createdAt as { toMillis?: unknown } | null)?.toMillis === 'function' ? (createdAt as { toMillis: () => number }).toMillis() : 0
  return {
    id,
    meaning: text(meaning, MAX_OWN_MEANING),
    expressions: parsed,
    ...(Object.keys(examples).length ? { example: examples } : {}),
    createdAt: millis,
  }
}
