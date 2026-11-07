import assert from 'node:assert/strict'
import test from 'node:test'
import { findConfusables, findFalseFriends, findIdioms, findPhrasalVerbs, matchScore, normalize, phrasalVerbPartner, searchContent } from '../src/search.ts'
import { IDIOMS } from '../src/data/idioms.ts'

const esEn = { source: 'es', target: 'en' } as const
const enEs = { source: 'en', target: 'es' } as const

test('normalizing ignores case, accents, punctuation and a leading "to"', () => {
  assert.equal(normalize('  ¿Llover a CÁNTAROS?  '), 'llover a cantaros')
  assert.equal(normalize('To get over'), 'get over')
  assert.equal(normalize('pull someone’s leg'), "pull someone's leg")
  assert.equal(normalize('rip-off'), 'rip off')
})

test('matches rank exact text over prefixes over loose word matches', () => {
  assert.equal(matchScore('get over', 'get over'), 3)
  assert.equal(matchScore('get', 'get over'), 2)
  assert.equal(matchScore('tomar pelo', 'tomarle el pelo a alguien'), 1)
  assert.equal(matchScore('x', 'xylophone'), 0, 'one letter is too short')
  assert.equal(matchScore('nubes', 'estar en las nubes'), 1)
  assert.equal(matchScore('perro', 'estar en las nubes'), 0)
})

test('idioms are found in the source language and come with their real equivalents', () => {
  const [first] = findIdioms('estar en las nubes', esEn)
  assert.equal(first.idiom.id, 'head-in-the-clouds')
  assert.equal(first.expression.lang, 'es')
  assert.equal(findIdioms('piece of cake', enEs)[0].idiom.id, 'piece-of-cake')
  assert.equal(findIdioms('cantaros', esEn)[0].idiom.id, 'raining-cats-and-dogs', 'without the accent')
  assert.equal(findIdioms('tomar el pelo', esEn)[0].idiom.id, 'pull-someones-leg', 'through its keywords')
  assert.deepEqual(findIdioms('piece of cake', esEn), [], 'English text is not searched as Spanish')
})

test('without a query, the idiom list has every idiom once, in alphabetical order', () => {
  const all = findIdioms('', esEn)
  assert.equal(all.length, IDIOMS.length)
  const texts = all.map(match => match.expression.text)
  assert.deepEqual(texts, [...texts].sort((first, second) => normalize(first).localeCompare(normalize(second), 'es')))
})

test('false friends warn from either side', () => {
  const [english] = findFalseFriends('actually', enEs)
  assert.equal(english.word.word, 'actually')
  assert.equal(english.other.word, 'actualmente')
  const [spanish] = findFalseFriends('embarazada', esEn)
  assert.equal(spanish.word.word, 'embarazada')
  assert.deepEqual(spanish.word.means, ['pregnant'])
  assert.deepEqual(findFalseFriends('actual', enEs).map(match => match.entry.id), ['actual', 'actually'], 'exact match first')
})

test('phrasal verbs are found by their English form or by their Spanish meaning', () => {
  assert.equal(findPhrasalVerbs('get over', enEs)[0].id, 'get-over')
  assert.ok(findPhrasalVerbs('superar', esEn).some(phrasal => phrasal.id === 'get-over'))
  assert.deepEqual(findPhrasalVerbs('apagar', esEn).map(phrasal => phrasal.id), ['turn-off'])
  assert.ok(findPhrasalVerbs('get', enEs).length >= 5)
  assert.equal(phrasalVerbPartner(esEn), 'es')
  assert.equal(phrasalVerbPartner(enEs), 'es')
})

test('differences are found by their words or by the word that leads to them', () => {
  assert.equal(findConfusables('hacer', esEn)[0].id, 'make-do')
  assert.equal(findConfusables('make', enEs)[0].id, 'make-do')
  assert.ok(findConfusables('to be', enEs).some(entry => entry.id === 'ser-estar'))
  assert.ok(findConfusables('perder', esEn).some(entry => entry.id === 'lose-miss'))
})

test('the search screen gets a few results of each kind, and nothing for a blank query', () => {
  const results = searchContent('actually', enEs)
  assert.equal(results.falseFriends[0].entry.id, 'actually')
  assert.ok(results.falseFriends.length <= 3 && results.idioms.length <= 5 && results.phrasalVerbs.length <= 6 && results.confusables.length <= 2)
  assert.deepEqual(searchContent(' ', esEn), { falseFriends: [], idioms: [], phrasalVerbs: [], confusables: [] })
})
