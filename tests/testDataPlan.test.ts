import assert from 'node:assert/strict'
import test from 'node:test'
import { favoriteId, MAX_FAVORITE_TRANSLATIONS, parseFavorite } from '../src/favorites.ts'
import { MAX_ENTRY_LENGTH, pantryKey } from '../src/pantry.ts'
import { planTestData, seededRandom, TEST_DATA_SIZES, testDataSummary, testEntries } from '../src/testDataPlan.ts'
import type { TestDataSizeId } from '../src/testDataPlan.ts'

const none = { favorites: new Set<string>(), pantry: new Set<string>() }

test('the content has enough different queries for every size', () => {
  const ids = new Set(testEntries().map(entry => favoriteId(entry.term, entry)))
  const words = new Set(testEntries().map(entry => pantryKey(entry.term, entry.source)))
  assert.ok(ids.size >= TEST_DATA_SIZES.muchos.favorites, `${ids.size} favorites`)
  assert.ok(words.size >= TEST_DATA_SIZES.muchos.pantry, `${words.size} words`)
})

test('each size creates its favorites and pantry words, all different', () => {
  for (const size of Object.keys(TEST_DATA_SIZES) as TestDataSizeId[]) {
    const plan = planTestData(size, seededRandom(1), none)
    assert.equal(plan.favorites.length, TEST_DATA_SIZES[size].favorites)
    assert.equal(plan.pantry.length, TEST_DATA_SIZES[size].pantry)
    assert.equal(new Set(plan.favorites.map(favorite => favorite.id)).size, plan.favorites.length)
    assert.equal(new Set(plan.pantry.map(item => pantryKey(item.text, item.lang))).size, plan.pantry.length)
  }
})

test('favorites have the shape the app reads and the rules accept', () => {
  for (const favorite of planTestData('muchos', seededRandom(2), none).favorites) {
    assert.equal(favorite.id, favoriteId(favorite.term, favorite))
    assert.notEqual(favorite.source, favorite.target)
    assert.ok(favorite.term.length > 0 && favorite.term.length <= 200 && favorite.id.length <= 1000)
    assert.ok(favorite.translations.length >= 1 && favorite.translations.length <= MAX_FAVORITE_TRANSLATIONS)
    assert.ok(['wiktionary', 'mymemory', 'ai', 'chrome'].includes(favorite.engine))
    const { id, ...data } = favorite
    assert.ok(parseFavorite(id, { ...data, createdAt: { toMillis: () => 1 } }, ['es', 'en']), favorite.term)
  }
})

test('pantry words fit the rules (1 to 100 characters, es or en)', () => {
  for (const item of planTestData('muchos', seededRandom(3), none).pantry) {
    assert.ok(item.text.length > 0 && item.text.length <= MAX_ENTRY_LENGTH)
    assert.ok(item.lang === 'es' || item.lang === 'en')
  }
})

test('generating again leaves out what the user already has', () => {
  const first = planTestData('bastantes', seededRandom(4), none)
  const existing = { favorites: new Set(first.favorites.map(favorite => favorite.id)), pantry: new Set(first.pantry.map(item => pantryKey(item.text, item.lang))) }
  const second = planTestData('bastantes', seededRandom(5), existing)
  assert.ok(second.favorites.every(favorite => !existing.favorites.has(favorite.id)))
  assert.ok(second.pantry.every(item => !existing.pantry.has(pantryKey(item.text, item.lang))))
  assert.equal(testDataSummary(first), 'Creadas 60 palabras en la Despensa y 60 favoritos.')
})
