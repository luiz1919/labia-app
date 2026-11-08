import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import test from 'node:test'
import { parseMyMemory } from '../src/engines/mymemory.ts'
import { DEFAULT_ENGINE_ORDER, moveEngine, parseEngineOrder } from '../src/engines/order.ts'
import { stripHtml, stripWikiLinks } from '../src/engines/text.ts'
import { parseDefinitions, parseTranslationTables, wiktionarySupports } from '../src/engines/wiktionary.ts'

const fixture = (name: string) => readFileSync(new URL(`./fixtures/${name}`, import.meta.url), 'utf8')
const esEn = { source: 'es', target: 'en' } as const
const enEs = { source: 'en', target: 'es' } as const

test('Spanish words get their English translations by part of speech, with examples', () => {
  const groups = parseDefinitions(JSON.parse(fixture('wiktionary-superar.json')), 'es')
  assert.equal(groups[0].label, 'Verbo')
  assert.deepEqual(groups[0].items.slice(0, 3).map(item => item.text), ['to surpass, exceed', 'to overcome', 'to beat, to outdo'])
  assert.ok(groups[0].items.every(item => item.lang === 'en'))
  assert.deepEqual(groups[0].examples?.[0], { text: 'Supéralo, hombre.', lang: 'es', translation: 'Get over it, man.', translationLang: 'en' })
  assert.equal(parseDefinitions(JSON.parse(fixture('wiktionary-echar-de-menos.json')), 'es')[0].items[0].text, 'to miss; to feel the absence of')
  assert.deepEqual(parseDefinitions({ en: [] }, 'es'), [])
})

test('English entries give their Spanish translation tables, grouped by meaning', () => {
  const { groups, subpage } = parseTranslationTables(fixture('wiktionary-get-over.wikitext'), 'es')
  assert.equal(subpage, false)
  assert.deepEqual(groups.map(group => group.label), ['Verbo · to overcome', 'Verbo · to forget, and move on'])
  assert.deepEqual(groups[0].items.map(item => item.text), ['superar', 'sobreponerse a'])
})

test('pages with a translation subpage say so, and the subpage is read as a whole', () => {
  const house = parseTranslationTables(fixture('wiktionary-house.wikitext'), 'es')
  assert.equal(house.subpage, true)
  assert.deepEqual(house.groups.find(group => group.label === 'Verbo · admit to residence')?.items.map(item => item.text), ['alojar', 'hospedar', 'albergar'])
  const subpage = parseTranslationTables(fixture('wiktionary-house-translations.wikitext'), 'es', true)
  const abode = subpage.groups.find(group => group.label === 'Nombre · human abode')
  assert.deepEqual(abode?.items[0], { text: 'casa', lang: 'es', note: 'fem.' })
  assert.ok(subpage.groups.every(group => group.items.every(item => item.lang === 'es')))
})

test('unchecked tables, other languages and regional lines are handled', () => {
  const wikitext = [
    '==English==', '===Noun===', '====Translations====',
    '{{trans-top|a vehicle}}', '* French: {{t+|fr|voiture|f}}', '* Spanish: {{t+|es|coche|m}}', '*: Latin America: {{t+|es|carro|m}}', '{{trans-bottom}}',
    '{{checktrans-top}}', '* Spanish: {{t|es|auto}}', '{{trans-bottom}}',
    '==Spanish==', '===Noun===', '{{trans-top|ignored}}', '* Spanish: {{t|es|nada}}', '{{trans-bottom}}',
  ].join('\n')
  const { groups } = parseTranslationTables(wikitext, 'es')
  assert.deepEqual(groups, [{ label: 'Nombre · a vehicle', items: [{ text: 'coche', lang: 'es', note: 'masc.' }, { text: 'carro', lang: 'es', note: 'masc., Latin America' }] }])
  assert.equal(wiktionarySupports(esEn), true)
  assert.equal(wiktionarySupports({ source: 'es', target: 'es' as 'en' }), false)
})

test('MyMemory: suggestions that agree win over a wrong first suggestion', () => {
  const answer = parseMyMemory(JSON.parse(fixture('mymemory-i-miss-you.json')), enEs)
  assert.equal(answer.groups[0].items[0].text.toLowerCase(), 'te echo tanto de menos.')
  assert.ok(answer.groups[1].items.some(item => item.text.startsWith('¿por qué')))
  assert.throws(() => parseMyMemory({ responseStatus: 429, responseDetails: 'MYMEMORY WARNING: YOU USED ALL AVAILABLE FREE TRANSLATIONS FOR TODAY' }, enEs), /cupo/)
  assert.deepEqual(parseMyMemory({ responseStatus: 200, responseData: { translatedText: '' }, matches: [] }, enEs).groups, [])
})

test('the engine order keeps known engines once and appends new ones', () => {
  assert.deepEqual(parseEngineOrder(null), DEFAULT_ENGINE_ORDER)
  assert.deepEqual(parseEngineOrder('["ai","nope","ai","mymemory"]'), ['ai', 'mymemory', 'wiktionary', 'chrome'])
  assert.deepEqual(parseEngineOrder('{bad'), DEFAULT_ENGINE_ORDER)
  assert.deepEqual(moveEngine(DEFAULT_ENGINE_ORDER, 'ai', -1), ['ai', 'wiktionary', 'mymemory', 'chrome'])
  assert.deepEqual(moveEngine(DEFAULT_ENGINE_ORDER, 'wiktionary', -1), DEFAULT_ENGINE_ORDER)
})

test('HTML and wiki markup become plain text', () => {
  assert.equal(stripHtml('to <a href="/wiki/x">surpass</a> &amp; exceed&#39;s'), "to surpass & exceed's")
  assert.equal(stripWikiLinks("[[sobreponerse]] [[a|al]] '''x'''"), 'sobreponerse al x')
})
