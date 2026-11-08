import assert from 'node:assert/strict'
import test from 'node:test'
import { captureEntries, MAX_ENTRY_WORDS, pantryKey, pantryPair, parsePantryItem, sortPantry, spokenEntry } from '../src/pantry.ts'
import type { PantryItem } from '../src/pantry.ts'

test('the words after the keyword are saved, and nothing is saved without it', () => {
  assert.deepEqual(captureEntries('apunta zarzamora', 'es'), { entries: ['zarzamora'], armed: false })
  assert.deepEqual(captureEntries('Apunta, zarzamora.', 'es').entries, ['zarzamora'], 'punctuation and capitals from the recognizer')
  assert.deepEqual(captureEntries('apúntame a regañadientes', 'es').entries, ['a regañadientes'])
  assert.deepEqual(captureEntries('anota darse cuenta', 'es').entries, ['darse cuenta'])
  assert.deepEqual(captureEntries('and then the fox jumped over the fence', 'es'), { entries: [], armed: false }, 'reading aloud saves nothing')
  assert.deepEqual(captureEntries('el niño se apuntaló en la pared', 'es').entries, [], 'a word that only starts like the keyword')
})

test('fillers and a leading article are dropped, and long phrases are cut', () => {
  assert.deepEqual(captureEntries('apunta la palabra zarzamora', 'es').entries, ['zarzamora'])
  assert.deepEqual(captureEntries('apunta el escarabajo', 'es').entries, ['escarabajo'])
  assert.deepEqual(captureEntries('apunta la', 'es').entries, ['la'], 'a lone article is the word itself')
  assert.deepEqual(captureEntries('jot down bramble', 'en').entries, ['bramble'])
  assert.deepEqual(captureEntries('note the word hedgehog', 'en').entries, ['hedgehog'])
  assert.deepEqual(captureEntries('note a hedgehog', 'en').entries, ['hedgehog'])
  const long = captureEntries('apunta estar en las nubes y luego seguimos leyendo', 'es').entries[0]
  assert.equal(long.split(' ').length, MAX_ENTRY_WORDS)
  assert.equal(long, 'estar en las nubes')
})

test('several keywords in one phrase save several words', () => {
  assert.deepEqual(captureEntries('apunta zarzamora y apunta escarabajo', 'es').entries, ['zarzamora', 'escarabajo'])
  assert.deepEqual(captureEntries('apunta apunta zarzamora', 'es').entries, ['zarzamora'])
})

test('a keyword at the end of a phrase arms the next one', () => {
  assert.deepEqual(captureEntries('vale, apunta', 'es'), { entries: [], armed: true })
  assert.deepEqual(captureEntries('Zarzamora', 'es', true), { entries: ['zarzamora'], armed: false }, 'the capital of a new phrase goes away')
  assert.deepEqual(captureEntries('Madrid es bonito', 'es', true).entries, ['madrid es bonito'])
  assert.deepEqual(captureEntries('ONU', 'es', true).entries, ['ONU'], 'acronyms keep their capitals')
  assert.deepEqual(captureEntries('apunta escarabajo', 'es', true).entries, ['escarabajo'])
  assert.deepEqual(captureEntries('', 'es', true), { entries: [], armed: false })
})

test('the keywords depend on the language being listened to', () => {
  assert.deepEqual(captureEntries('note bramble', 'es').entries, [])
  assert.deepEqual(captureEntries('apunta bramble', 'en').entries, [])
  assert.deepEqual(captureEntries('note bramble', 'en').entries, ['bramble'])
})

test('push to talk proposes the whole phrase, tidied and without a keyword', () => {
  assert.equal(spokenEntry('Zarzamora.', 'es'), 'zarzamora')
  assert.equal(spokenEntry('el escarabajo', 'es'), 'escarabajo')
  assert.equal(spokenEntry('apunta escarabajo', 'es'), 'escarabajo')
  assert.equal(spokenEntry('A la luz de la luna', 'es'), 'a la luz de la luna', 'not cut to a few words')
  assert.equal(spokenEntry('apunta', 'es'), '')
  assert.equal(spokenEntry('  ', 'es'), '')
})

test('stored words are read defensively and sorted newest first', () => {
  const at = (millis: number) => ({ toMillis: () => millis })
  assert.deepEqual(parsePantryItem('a', { text: ' zarzamora ', lang: 'es', createdAt: at(5), reviewed: true }, ['es', 'en']), { id: 'a', text: 'zarzamora', lang: 'es', createdAt: 5, reviewed: true })
  assert.deepEqual(parsePantryItem('b', { text: 'bramble', lang: 'en', createdAt: null }, ['es', 'en']), { id: 'b', text: 'bramble', lang: 'en', createdAt: 0, reviewed: false })
  assert.equal(parsePantryItem('c', { text: 'chat', lang: 'fr', createdAt: at(1) }, ['es', 'en']), null, 'a language the app no longer has')
  assert.equal(parsePantryItem('d', { text: '', lang: 'es' }, ['es', 'en']), null)
  assert.equal(parsePantryItem('e', null, ['es', 'en']), null)

  const item = (id: string, createdAt: number): PantryItem => ({ id, text: id, lang: 'es', createdAt, reviewed: false })
  assert.deepEqual(sortPantry([item('old', 1), item('pending', 0), item('new', 9)]).map(entry => entry.id), ['pending', 'new', 'old'])
})

test('duplicates ignore case, accents and punctuation; words are looked up into the other language', () => {
  assert.equal(pantryKey('Zarzamora.', 'es'), pantryKey('zarzamora', 'es'))
  assert.equal(pantryKey('regañadientes', 'es'), pantryKey('Regañadientes', 'es'))
  assert.notEqual(pantryKey('pie', 'es'), pantryKey('pie', 'en'))
  assert.deepEqual(pantryPair('es', { source: 'es', target: 'en' }), { source: 'es', target: 'en' })
  assert.deepEqual(pantryPair('en', { source: 'es', target: 'en' }), { source: 'en', target: 'es' })
})
