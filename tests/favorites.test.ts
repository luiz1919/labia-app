import assert from 'node:assert/strict'
import test from 'node:test'
import { favoriteId, favoriteTranslations, filterFavorites, MAX_FAVORITE_TRANSLATIONS, parseFavorite } from '../src/favorites.ts'
import type { Favorite } from '../src/favorites.ts'

const esEn = { source: 'es', target: 'en' } as const
const enEs = { source: 'en', target: 'es' } as const

test('the same query in the same direction is one favorite', () => {
  assert.equal(favoriteId('Zarzamora', esEn), favoriteId('zarzamora.', esEn))
  assert.equal(favoriteId('  echar de menos ', esEn), favoriteId('Echar de menos', esEn))
  assert.equal(favoriteId('regañadientes', esEn), favoriteId('Regañadientes', esEn))
  assert.notEqual(favoriteId('pie', esEn), favoriteId('pie', enEs), 'the direction is part of it')
  assert.doesNotMatch(favoriteId('and/or', enEs), /\//, 'a Firestore id cannot contain a slash')
})

test('the translations of the starred answer are kept, each once and only the first ones', () => {
  const answer = {
    groups: [
      { label: 'Nombre', items: [{ text: 'blackberry', lang: 'en' as const }, { text: 'bramble', lang: 'en' as const }] },
      { label: 'Otro', items: [{ text: 'blackberry', lang: 'en' as const }, { text: ' dewberry ', lang: 'en' as const }] },
    ],
  }
  assert.deepEqual(favoriteTranslations(answer), ['blackberry', 'bramble', 'dewberry'])
  const many = { groups: [{ items: Array.from({ length: 20 }, (_, index) => ({ text: `t${index}`, lang: 'en' as const })) }] }
  assert.equal(favoriteTranslations(many).length, MAX_FAVORITE_TRANSLATIONS)
  assert.deepEqual(favoriteTranslations({ groups: [] }), [])
})

test('stored favorites are read defensively', () => {
  const at = (millis: number) => ({ toMillis: () => millis })
  assert.deepEqual(parseFavorite('a', { term: ' zarzamora ', source: 'es', target: 'en', translations: ['blackberry', 3, ''], engine: 'wiktionary', createdAt: at(7) }, ['es', 'en']), {
    id: 'a', term: 'zarzamora', pair: esEn, translations: ['blackberry'], engine: 'wiktionary', createdAt: 7,
  })
  assert.equal(parseFavorite('b', { term: 'x', source: 'es', target: 'es' }, ['es', 'en']), null)
  assert.equal(parseFavorite('c', { term: 'chat', source: 'fr', target: 'es' }, ['es', 'en']), null, 'a language the app no longer has')
  assert.equal(parseFavorite('d', { term: '', source: 'es', target: 'en' }, ['es', 'en']), null)
  assert.equal(parseFavorite('e', { term: 'x', source: 'es', target: 'en' }, ['es', 'en'])?.translations.length, 0)
})

test('favorites are found by the query or its translations, newest first or alphabetically', () => {
  const favorite = (term: string, translations: string[], createdAt: number): Favorite => ({ id: term, term, pair: esEn, translations, engine: 'wiktionary', createdAt })
  const list = [favorite('zarzamora', ['blackberry'], 1), favorite('Árbol', ['tree'], 3), favorite('echar de menos', ['to miss'], 2), favorite('nuevo', [], 0)]
  assert.deepEqual(filterFavorites(list, '', 'recent').map(item => item.term), ['nuevo', 'Árbol', 'echar de menos', 'zarzamora'], 'not yet saved on the server = newest')
  assert.deepEqual(filterFavorites(list, '', 'alphabetical').map(item => item.term), ['Árbol', 'echar de menos', 'nuevo', 'zarzamora'], 'accents do not push words to the end')
  assert.deepEqual(filterFavorites(list, 'arbol', 'recent').map(item => item.term), ['Árbol'])
  assert.deepEqual(filterFavorites(list, 'BLACK', 'recent').map(item => item.term), ['zarzamora'], 'by translation')
  assert.deepEqual(filterFavorites(list, 'menos', 'recent').map(item => item.term), ['echar de menos'])
  assert.deepEqual(filterFavorites(list, 'xyz', 'recent'), [])
  assert.equal(list[0].term, 'zarzamora', 'the original list is not reordered')
})
