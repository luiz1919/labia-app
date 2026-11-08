import assert from 'node:assert/strict'
import test from 'node:test'
import { isSingleEnglishWord, parsePronunciations } from '../src/pronunciation.ts'

// Real shapes returned by api.dictionaryapi.dev (trimmed).
const tomato = [{ phonetic: '[tʰə̥ˈmɐːtʰɐʉ]', phonetics: [
  { text: '[tʰə̥ˈmɐːtʰɐʉ]', audio: 'https://api.dictionaryapi.dev/media/pronunciations/en/tomato-au.mp3' },
  { text: '[tʰə̥ˈmeɪɾoʊ]', audio: '' },
  { text: '[tʰə̥ˈmɑːtʰəʊ]', audio: 'https://api.dictionaryapi.dev/media/pronunciations/en/tomato-uk.mp3' },
  { text: '[tʰə̥ˈmeɪɾoʊ]', audio: 'https://api.dictionaryapi.dev/media/pronunciations/en/tomato-us.mp3' },
] }]
const through = [
  { phonetic: '/θɹuː/', phonetics: [{ text: '/θɹuː/', audio: '' }, { text: '/θɹu/', audio: 'https://api.dictionaryapi.dev/media/pronunciations/en/through-1-us.mp3' }] },
  { phonetic: '/θɹuː/', phonetics: [{ text: '/θɹuː/', audio: '' }] },
]

test('recordings come first, ordered UK, US, Australia..., with their accent and transcription', () => {
  const list = parsePronunciations(tomato)
  assert.deepEqual(list.map(item => item.accent), ['Reino Unido', 'EE. UU.', 'Australia'])
  assert.equal(list[0].ipa, '[tʰə̥ˈmɑːtʰəʊ]')
  assert.ok(list.every(item => item.audio.startsWith('https://')))
})

test('transcriptions without audio are added once, after the recordings', () => {
  const list = parsePronunciations(through)
  assert.deepEqual(list, [
    { ipa: '/θɹu/', audio: 'https://api.dictionaryapi.dev/media/pronunciations/en/through-1-us.mp3', accent: 'EE. UU.' },
    { ipa: '/θɹuː/', audio: '', accent: '' },
  ])
})

test('unexpected answers give nothing, and only single English words are looked up', () => {
  assert.deepEqual(parsePronunciations({ title: 'No Definitions Found' }), [])
  assert.deepEqual(parsePronunciations([{ phonetics: [{ audio: 'http://insecure/x-uk.mp3' }] }]), [])
  assert.equal(isSingleEnglishWord('schedule'), true)
  assert.equal(isSingleEnglishWord("don't"), true)
  assert.equal(isSingleEnglishWord('get over'), false)
  assert.equal(isSingleEnglishWord('casa'), true)
  assert.equal(isSingleEnglishWord('camión'), false)
})
