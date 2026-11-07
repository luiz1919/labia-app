import assert from 'node:assert/strict'
import test from 'node:test'
import { DEFAULT_PAIR, isLanguageCode, LANGUAGES, languageName, parsePair, swapPair, withLanguage } from '../src/languages.ts'

test('every language has a unique ISO 639 code and a name', () => {
  const codes = LANGUAGES.map(language => language.code)
  assert.equal(new Set(codes).size, codes.length)
  for (const language of LANGUAGES) {
    assert.match(language.code, /^[a-z]{2,3}$/, 'the Firestore rules only accept this shape')
    assert.ok(language.name)
  }
})

test('the default pair is Spanish to English', () => {
  assert.deepEqual(DEFAULT_PAIR, { source: 'es', target: 'en' })
  assert.equal(languageName('es'), 'Español')
  assert.equal(languageName('en'), 'Inglés')
})

test('swapping and picking languages never leaves the same language on both sides', () => {
  const pair = { source: 'es', target: 'en' } as const
  assert.deepEqual(swapPair(pair), { source: 'en', target: 'es' })
  assert.deepEqual(withLanguage(pair, 'source', 'en'), { source: 'en', target: 'es' })
  assert.deepEqual(withLanguage(pair, 'target', 'es'), { source: 'en', target: 'es' })
  assert.equal(withLanguage(pair, 'source', 'es'), pair)
})

test('stored pairs are read back and anything unusable falls back to the default', () => {
  assert.deepEqual(parsePair({ sourceLanguage: 'en', targetLanguage: 'es' }), { source: 'en', target: 'es' })
  for (const stored of [undefined, null, 'es-en', {}, { sourceLanguage: 'es', targetLanguage: 'es' }, { sourceLanguage: 'xx', targetLanguage: 'en' }]) {
    assert.deepEqual(parsePair(stored), DEFAULT_PAIR)
  }
  assert.notEqual(parsePair(undefined), DEFAULT_PAIR, 'callers get a copy, not the shared default')
  assert.equal(isLanguageCode('en'), true)
  assert.equal(isLanguageCode('EN'), false)
})
