import assert from 'node:assert/strict'
import test from 'node:test'
import { LINK_SOURCES, sourceLinks } from '../src/sources.ts'
import type { LinkSource } from '../src/sources.ts'

const esEn = { source: 'es', target: 'en' } as const
const enEs = { source: 'en', target: 'es' } as const

test('a blank query has no links', () => {
  assert.deepEqual(sourceLinks('   ', esEn), [])
})

test('every source supports both directions of Spanish and English', () => {
  for (const pair of [esEn, enEs]) {
    assert.deepEqual(sourceLinks('casa', pair).map(link => link.source.id), LINK_SOURCES.map(source => source.id))
  }
})

test('links point to the right dictionary and direction, with the query encoded', () => {
  const urls = Object.fromEntries(sourceLinks('  estar   en las nubes ', esEn).map(link => [link.source.id, link.url]))
  assert.equal(urls.wordreference, 'https://www.wordreference.com/esen/estar%20en%20las%20nubes')
  assert.equal(urls['reverso-context'], 'https://context.reverso.net/translation/spanish-english/estar%20en%20las%20nubes')
  assert.equal(urls['google-translate'], 'https://translate.google.com/?sl=es&tl=en&text=estar+en+las+nubes&op=translate')
  const reverse = Object.fromEntries(sourceLinks('get over/it?', enEs).map(link => [link.source.id, link.url]))
  assert.equal(reverse.wordreference, 'https://www.wordreference.com/enes/get%20over%2Fit%3F')
})

test('sources that do not support a pair are left out', () => {
  const onlyEnglish: LinkSource = { id: 'english-only', name: 'Solo inglés', description: '', url: (term, pair) => pair.source === 'en' ? `https://example.com/${term}` : null }
  assert.deepEqual(sourceLinks('casa', esEn, [onlyEnglish]), [])
  assert.equal(sourceLinks('house', enEs, [onlyEnglish]).length, 1)
})
