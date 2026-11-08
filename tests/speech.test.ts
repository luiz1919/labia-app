import assert from 'node:assert/strict'
import test from 'node:test'
import { accentVariety, DEFAULT_ACCENTS, heardAs, parseAccents, pickVoice } from '../src/speech.ts'

const voices = [
  { lang: 'en-US', name: 'Samantha', localService: true, default: true },
  { lang: 'en-GB', name: 'Google UK English Female', localService: false },
  { lang: 'en-GB', name: 'Daniel', localService: true },
  { lang: 'es-ES', name: 'Mónica', localService: true },
  { lang: 'es_MX', name: 'Paulina', localService: true },
  { lang: 'fr-FR', name: 'Thomas', localService: true },
]

test('the voice for a locale prefers the same accent, then the same language, then installed voices', () => {
  assert.equal(pickVoice(voices, 'en-GB')?.name, 'Daniel')
  assert.equal(pickVoice(voices, 'en-US')?.name, 'Samantha')
  assert.equal(pickVoice(voices, 'es-MX')?.name, 'Paulina', 'underscore locales from some Android voices')
  assert.equal(pickVoice(voices, 'en-AU')?.name, 'Samantha', 'same language when the accent is missing')
  assert.equal(pickVoice(voices, 'de-DE'), null)
  assert.equal(pickVoice([], 'en-GB'), null)
})

test('Apple novelty voices are never picked, and better voices win a tie', () => {
  const apple = [
    { lang: 'en-US', name: 'Albert', localService: true },
    { lang: 'en-US', name: 'Bad News', localService: true },
    { lang: 'en-US', name: 'Eddy (English (United States))', localService: true },
    { lang: 'en-US', name: 'Fred', localService: true },
    { lang: 'en-US', name: 'Samantha', localService: true },
    { lang: 'es-ES', name: 'Mónica', localService: true, default: true },
  ]
  assert.equal(pickVoice(apple, 'en-US')?.name, 'Samantha', 'normal voices before the old or character ones')
  assert.equal(pickVoice([...apple, { lang: 'en-US', name: 'Ava (Premium)', localService: true }], 'en-US')?.name, 'Ava (Premium)')
  assert.equal(pickVoice(apple.slice(0, 2), 'en-US'), null, 'only novelty voices: let the browser choose')
  assert.equal(pickVoice(apple.slice(0, 4), 'en-US')?.name, 'Eddy (English (United States))', 'a plain voice is still better than none')
  assert.equal(pickVoice(apple, 'en-GB')?.name, 'Samantha', 'same language when the accent is missing')
})

test('saved accents are read back and anything unknown falls back to the default', () => {
  assert.deepEqual(parseAccents(null), DEFAULT_ACCENTS)
  assert.deepEqual(parseAccents('{"en":"en-US","es":"es-MX"}'), { en: 'en-US', es: 'es-MX' })
  assert.deepEqual(parseAccents('{"en":"en-AU","es":7}'), DEFAULT_ACCENTS)
  assert.deepEqual(parseAccents('not json'), DEFAULT_ACCENTS)
  assert.equal(accentVariety('en', 'en-US'), 'americano')
  assert.equal(accentVariety('es', 'xx'), '')
})

test('what the recognizer heard matches ignoring case, accents and punctuation', () => {
  assert.equal(heardAs('sheep', ['Ship', 'sheep']), true)
  assert.equal(heardAs('papá', ['Papá.']), true)
  assert.equal(heardAs('ship', ['sheep', 'cheap']), false)
  assert.equal(heardAs('How are you?', ['how are you']), true)
})
