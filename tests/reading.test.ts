import assert from 'node:assert/strict'
import test from 'node:test'
import { READING_LEVELS, READING_TEXTS } from '../src/data/readingTexts.ts'
import { addPhrase, gradeReading, normalizeWord, readingTokens, similarity, summarize, troubleWords, verdictFor } from '../src/reading.ts'

const grades = (text: string, ...phrases: string[]) => gradeReading(text, phrases).map(word => word.grade)

test('words are compared without case, accents, apostrophes or punctuation', () => {
  assert.equal(normalizeWord('Don\'t,'), 'dont')
  assert.equal(normalizeWord('café!'), 'cafe')
  assert.deepEqual(readingTokens('A well-known  dish —  yes'), ['A', 'well', 'known', 'dish', 'yes'])
  assert.equal(similarity('ship', 'ship'), 1)
  assert.equal(similarity('ship', 'sheep') >= 0.5, true)
  assert.equal(similarity('ship', 'table') < 0.5, true)
})

test('good, bad and horrible: same word, similar word, different word', () => {
  const words = gradeReading('The ship is big.', ['The sheep is table'])
  assert.deepEqual(words.map(word => word.grade), ['good', 'bad', 'good', 'horrible'])
  assert.deepEqual(words.map(word => word.heard), [undefined, 'sheep', undefined, 'table'])
  assert.deepEqual(grades('The ship is big.', 'the ship is big'), ['good', 'good', 'good', 'good'])
})

test('a word that was not heard is horrible and the words around it stay lined up', () => {
  assert.deepEqual(grades('I like green tea very much', 'I like tea very much'), ['good', 'good', 'horrible', 'good', 'good', 'good'])
  assert.equal(gradeReading('I like green tea very much', ['I like tea very much'])[2].heard, undefined)
})

test('extra words the recognizer heard do not hurt the words of the text', () => {
  assert.deepEqual(grades('We went home', 'um we went right home'), ['good', 'good', 'good'])
})

test('stopping before the end leaves the last words unread and out of the score', () => {
  const words = gradeReading('One two three four five', ['one two three'])
  assert.deepEqual(words.map(word => word.grade), ['good', 'good', 'good', 'unread', 'unread'])
  assert.deepEqual(summarize(words), { good: 3, bad: 0, horrible: 0, unread: 2, graded: 3, percent: 100 })
})

test('tokens without letters are not graded and phrases add up across the sessions', () => {
  assert.deepEqual(gradeReading('Yes — no', ['yes no']).map(word => word.grade), ['good', 'good'])
  assert.deepEqual(gradeReading('Yes … no', ['yes', 'no']).map(word => word.grade), ['good', null, 'good'])
  assert.deepEqual(grades('Go now. Stay here.', 'go now', 'stay here'), ['good', 'good', 'good', 'good'])
})

test('nothing heard grades nothing', () => {
  const words = gradeReading('Hello there', [])
  assert.deepEqual(words.map(word => word.grade), ['unread', 'unread'])
  assert.equal(summarize(words).percent, 0)
})

test('the score counts a bad word as half and the verdict follows it', () => {
  const summary = summarize(gradeReading('The ship is big.', ['The sheep is table']))
  assert.deepEqual(summary, { good: 2, bad: 1, horrible: 1, unread: 0, graded: 4, percent: 63 })
  assert.match(verdictFor(95), /Muy bien/)
  assert.match(verdictFor(75), /Bastante bien/)
  assert.match(verdictFor(50), /practicar/)
  assert.match(verdictFor(10), /despacio/)
})

test('words to practice: horrible first, each word once, without punctuation', () => {
  const words = gradeReading('Ship, ship! The think is thing.', ['sheep sheep the sink is table'])
  assert.deepEqual(troubleWords(words).map(item => [item.word, item.grade, item.heard]), [
    ['thing', 'horrible', 'table'],
    ['Ship', 'bad', 'sheep'],
    ['think', 'bad', 'sink'],
  ])
})

test('a browser that repeats the earlier words in each result does not repeat them in the text', () => {
  let phrases: string[] = []
  for (const heard of ['hello', 'hello how', 'hello how are', 'hello how are you', 'fine thanks']) phrases = addPhrase(phrases, heard)
  assert.deepEqual(phrases, ['hello how are you', 'fine thanks'])
  assert.deepEqual(addPhrase(['hello how are you'], 'hello how'), ['hello how are you'])
  assert.deepEqual(addPhrase(['a'], '  '), ['a'])
  assert.deepEqual(addPhrase(['the cat'], 'the dog'), ['the cat', 'the dog'])
})

test('bundled texts are short, in English, without digits, and have unique ids', () => {
  assert.equal(new Set(READING_TEXTS.map(entry => entry.id)).size, READING_TEXTS.length)
  for (const entry of READING_TEXTS) {
    assert.ok(entry.level in READING_LEVELS, entry.id)
    assert.ok(entry.title && entry.focus, entry.id)
    const words = readingTokens(entry.text).length
    assert.ok(words >= 30 && words <= 60, `${entry.id}: ${words} words`)
    assert.doesNotMatch(entry.text, /\d/, entry.id)
    assert.ok(entry.text.length <= 400, entry.id)
  }
  for (const level of Object.keys(READING_LEVELS)) assert.ok(READING_TEXTS.some(entry => entry.level === level), level)
})
