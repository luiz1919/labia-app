// Languages the app works with. Adding a language means adding it here and, in sources.ts,
// to the sources that support it. Codes are ISO 639-1, the same ones used by Intl, the
// browser's speech APIs and the translation sites.

export interface Language {
  code: string
  /** Name shown in the UI (Spanish). */
  name: string
  /** English name, as used by the English Wiktionary ("* Spanish: ..." in translation tables). */
  englishName: string
}

export const LANGUAGES = [
  { code: 'es', name: 'Español', englishName: 'Spanish' },
  { code: 'en', name: 'Inglés', englishName: 'English' },
] as const satisfies readonly Language[]

export type LanguageCode = (typeof LANGUAGES)[number]['code']

/** Direction of a query: from `source` to `target`. They are always different. */
export interface LanguagePair {
  source: LanguageCode
  target: LanguageCode
}

export const DEFAULT_PAIR: Readonly<LanguagePair> = { source: 'es', target: 'en' }

export function isLanguageCode(value: unknown): value is LanguageCode {
  return LANGUAGES.some(language => language.code === value)
}

export function languageName(code: LanguageCode): string {
  return LANGUAGES.find(language => language.code === code)?.name ?? code
}

export function englishName(code: LanguageCode): string {
  return LANGUAGES.find(language => language.code === code)?.englishName ?? code
}

export function swapPair({ source, target }: LanguagePair): LanguagePair {
  return { source: target, target: source }
}

/**
 * Changes one side of the pair. Picking the language already on the other side swaps them,
 * so the pair never ends up with the same language twice.
 */
export function withLanguage(pair: LanguagePair, side: keyof LanguagePair, code: LanguageCode): LanguagePair {
  if (pair[side] === code) return pair
  const other = side === 'source' ? 'target' : 'source'
  if (pair[other] === code) return swapPair(pair)
  return { ...pair, [side]: code }
}

/**
 * Reads a pair stored in Firestore. Unknown codes (for example, a language removed from
 * LANGUAGES) or a pair with the same language twice fall back to the default pair.
 */
export function parsePair(data: unknown): LanguagePair {
  if (typeof data !== 'object' || data === null) return { ...DEFAULT_PAIR }
  const { sourceLanguage, targetLanguage } = data as Record<string, unknown>
  if (!isLanguageCode(sourceLanguage) || !isLanguageCode(targetLanguage) || sourceLanguage === targetLanguage) return { ...DEFAULT_PAIR }
  return { source: sourceLanguage, target: targetLanguage }
}
