// "Leer en voz alta": compares the text the user was asked to read with what the speech
// recognizer understood and grades each word. This measures intelligibility, not phonetics: a
// word the recognizer understood is "good" even with an accent, and one it did not may be a
// mispronunciation or a recognizer mistake.

export type WordGrade = 'good' | 'bad' | 'horrible'

export interface GradedWord {
  /** The word as written in the text, punctuation included. */
  text: string
  /** Null when the token has no letters (a dash, for example): it is not graded. */
  grade: WordGrade | 'unread' | null
  /** What the recognizer understood instead (for "bad" and "horrible" substitutions). */
  heard?: string
}

export const GRADE_LABELS: Readonly<Record<WordGrade, string>> = { good: 'Bien', bad: 'Mal', horrible: 'Horrible' }

/** A word is "bad" (close, but not it) when at least this much of it is shared with what was heard. */
const CLOSE = 0.5
const COST = { closeSubstitution: 0.4, farSubstitution: 0.9, missing: 1, extra: 0.7 }

/** Lowercase letters and digits only: accents, apostrophes and punctuation do not count. */
export function normalizeWord(word: string): string {
  return word.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/['’`]/g, '').replace(/[^a-z0-9]/g, '')
}

/** The text as the tokens that will be shown and graded; dashes split compound words. */
export function readingTokens(text: string): string[] {
  return text.replace(/[-–—]/g, ' ').split(/\s+/).filter(Boolean)
}

/** What was understood as normalized words. */
export function spokenWords(phrases: readonly string[]): string[] {
  return phrases.flatMap(phrase => readingTokens(phrase).map(normalizeWord).filter(Boolean))
}

function distance(first: string, second: string): number {
  let previous = Array.from({ length: second.length + 1 }, (_, index) => index)
  for (let row = 1; row <= first.length; row++) {
    const current = [row]
    for (let column = 1; column <= second.length; column++) {
      current[column] = Math.min(previous[column] + 1, current[column - 1] + 1, previous[column - 1] + (first[row - 1] === second[column - 1] ? 0 : 1))
    }
    previous = current
  }
  return previous[second.length]
}

/** 1 for the same word, 0 for words with nothing in common. */
export function similarity(first: string, second: string): number {
  const longest = Math.max(first.length, second.length)
  return longest === 0 ? 1 : 1 - distance(first, second) / longest
}

/**
 * Adds a phrase to what has been understood. Some Android browsers repeat the earlier words in
 * each new result ("hello", "hello how", "hello how are"): a phrase that starts with the previous
 * one replaces it, and a shorter repeat is ignored.
 */
export function addPhrase(phrases: readonly string[], next: string): string[] {
  const text = next.trim()
  if (!text) return [...phrases]
  const last = phrases.at(-1)
  if (last !== undefined) {
    const before = spokenWords([last]).join(' ')
    const now = spokenWords([text]).join(' ')
    if (now === before || before.startsWith(`${now} `)) return [...phrases]
    if (now.startsWith(`${before} `)) return [...phrases.slice(0, -1), text]
  }
  return [...phrases, text]
}

/**
 * Lines the words of the text up with the words understood (an edit-distance alignment where a
 * similar word is a cheap substitution) and grades each one:
 * - good: heard as the same word;
 * - bad: heard as a similar word ("ship" for "sheep");
 * - horrible: heard as a very different word, or not heard at all.
 * The words after the last one heard are "unread": the user stopped before the end.
 */
export function gradeReading(text: string, phrases: readonly string[]): GradedWord[] {
  const tokens = readingTokens(text)
  const targets = tokens.map(normalizeWord)
  const heard = spokenWords(phrases)
  const graded: GradedWord[] = tokens.map(token => ({ text: token, grade: null }))
  const wordIndexes = targets.flatMap((word, index) => (word ? [index] : []))
  const words = wordIndexes.map(index => targets[index])

  const rows = words.length
  const columns = heard.length
  const cost = Array.from({ length: rows + 1 }, () => Array.from({ length: columns + 1 }, () => 0))
  for (let row = 1; row <= rows; row++) cost[row][0] = row * COST.missing
  for (let column = 1; column <= columns; column++) cost[0][column] = column * COST.extra
  const substitution = (row: number, column: number) => {
    const first = words[row - 1]
    const second = heard[column - 1]
    return first === second ? 0 : similarity(first, second) >= CLOSE ? COST.closeSubstitution : COST.farSubstitution
  }
  for (let row = 1; row <= rows; row++) {
    for (let column = 1; column <= columns; column++) {
      cost[row][column] = Math.min(
        cost[row - 1][column - 1] + substitution(row, column),
        cost[row - 1][column] + COST.missing,
        cost[row][column - 1] + COST.extra,
      )
    }
  }

  // Walk back from the end; a word of the text with no partner was not heard.
  const outcomes: ({ heard: string } | null)[] = Array.from({ length: rows }, () => null)
  let row = rows
  let column = columns
  while (row > 0) {
    if (column > 0 && cost[row][column] === cost[row - 1][column - 1] + substitution(row, column)) {
      outcomes[row - 1] = { heard: heard[column - 1] }
      row--
      column--
    } else if (column > 0 && cost[row][column] === cost[row][column - 1] + COST.extra) {
      column--
    } else {
      row--
    }
  }

  const lastHeard = outcomes.findLastIndex(outcome => outcome !== null)
  outcomes.forEach((outcome, position) => {
    const item = graded[wordIndexes[position]]
    if (position > lastHeard) {
      item.grade = 'unread'
    } else if (!outcome) {
      item.grade = 'horrible'
    } else if (outcome.heard === words[position]) {
      item.grade = 'good'
    } else {
      item.grade = similarity(words[position], outcome.heard) >= CLOSE ? 'bad' : 'horrible'
      item.heard = outcome.heard
    }
  })
  return graded
}

export interface ReadingSummary {
  good: number
  bad: number
  horrible: number
  unread: number
  /** Words that count: all but the unread ones. */
  graded: number
  /** 0 to 100: a good word is worth 1 and a bad one half. */
  percent: number
}

export function summarize(words: readonly GradedWord[]): ReadingSummary {
  const count = (grade: GradedWord['grade']) => words.filter(word => word.grade === grade).length
  const good = count('good')
  const bad = count('bad')
  const horrible = count('horrible')
  const graded = good + bad + horrible
  return { good, bad, horrible, unread: count('unread'), graded, percent: graded ? Math.round(((good + bad / 2) / graded) * 100) : 0 }
}

/** The overall verdict for a score. */
export function verdictFor(percent: number): string {
  if (percent >= 90) return '¡Muy bien! Se te entiende casi todo.'
  if (percent >= 70) return 'Bastante bien. Repasa las palabras marcadas.'
  if (percent >= 45) return 'Hay que practicar. Prueba más despacio.'
  return 'Cuesta que te entienda. Escucha el texto y vuelve a intentarlo, despacio.'
}

export interface TroubleWord {
  /** The word without punctuation, as written. */
  word: string
  grade: 'bad' | 'horrible'
  heard?: string
}

/** Words to practice: horrible ones first, then bad ones; each word once. */
export function troubleWords(words: readonly GradedWord[]): TroubleWord[] {
  const found = new Map<string, TroubleWord>()
  for (const item of words) {
    if (item.grade !== 'bad' && item.grade !== 'horrible') continue
    const key = normalizeWord(item.text)
    const word = item.text.replace(/^[^\p{L}\p{N}]+|[^\p{L}\p{N}]+$/gu, '')
    const known = found.get(key)
    if (!known || (known.grade === 'bad' && item.grade === 'horrible')) found.set(key, { word, grade: item.grade, heard: item.heard })
  }
  return [...found.values()].sort((first, second) => Number(second.grade === 'horrible') - Number(first.grade === 'horrible'))
}
