import assert from 'node:assert/strict'
import test from 'node:test'
import { IDIOMS } from '../src/data/idioms.ts'
import { draftFromIdiom, draftProblem, emptyDraft, emptyExpression, ownIdiomData, parseOwnIdiom, regionsOf, splitKeywords } from '../src/ownIdioms.ts'
import type { IdiomDraft } from '../src/ownIdioms.ts'
import { findIdioms, searchContent } from '../src/search.ts'

const esEn = { source: 'es', target: 'en' } as const
const enEs = { source: 'en', target: 'es' } as const
const LANGS = ['es', 'en']
const name = (code: string) => (code === 'es' ? 'Español' : 'Inglés')
const timestamp = (millis: number) => ({ toMillis: () => millis })

function filled(): IdiomDraft {
  const draft = emptyDraft(esEn, '  estar hasta el moño ')
  draft.source[0] = { ...draft.source[0], literal: ' to be up to the bun ', register: 'informal', regions: ['es-ES'], keywords: 'estoy hasta el moño, hasta el moño,, estoy hasta el moño' }
  draft.target[0] = { ...emptyExpression('en', 'to be fed up'), register: 'informal' }
  draft.target.push({ ...emptyExpression('en', "  to have had   it up to here "), regions: ['en-US', 'es-ES'] })
  draft.meaning = 'Estar harto. '
  draft.exampleSource = 'Estoy hasta el moño de tanto ruido.'
  return draft
}

test('a filled form becomes an idiom shaped like the bundled ones, without empty or undefined fields', () => {
  const data = ownIdiomData(filled(), esEn)
  assert.deepEqual(data, {
    meaning: 'Estar harto.',
    expressions: [
      { lang: 'es', text: 'estar hasta el moño', literal: { en: 'to be up to the bun' }, register: 'informal', regions: ['es-ES'], keywords: ['estoy hasta el moño', 'hasta el moño'] },
      { lang: 'en', text: 'to be fed up', register: 'informal' },
      { lang: 'en', text: 'to have had it up to here', regions: ['en-US'] },
    ],
    example: { es: 'Estoy hasta el moño de tanto ruido.' },
  })
  assert.ok(!JSON.stringify(data).includes('null'))
})

test('the form needs the expression in both languages of the pair', () => {
  assert.equal(draftProblem(emptyDraft(esEn), esEn, name), 'Escribe la expresión y cómo se dice en el otro idioma.')
  assert.equal(draftProblem(emptyDraft(esEn, 'estar en babia'), esEn, name), 'Falta cómo se dice en inglés.')
  assert.equal(draftProblem(filled(), esEn, name), '')
  const onlyTarget = emptyDraft(esEn)
  onlyTarget.target[0].text = 'to daydream'
  assert.equal(draftProblem(onlyTarget, esEn, name), 'Falta cómo se dice en español.')
})

test('blank extra rows are dropped and keywords are split on commas, once each', () => {
  const draft = filled()
  draft.source.push(emptyExpression('es'))
  assert.equal(ownIdiomData(draft, esEn).expressions.filter(expression => expression.lang === 'es').length, 1)
  assert.deepEqual(splitKeywords(' a, b;c\n a ,, '), ['a', 'b', 'c'])
})

test('editing in the other direction shows the same idiom from the other side and keeps what is not in the pair', () => {
  const stored = { ...ownIdiomData(filled(), esEn), id: 'abc', createdAt: 1 }
  const draft = draftFromIdiom(stored, enEs)
  assert.deepEqual(draft.source.map(row => row.text), ['to be fed up', 'to have had it up to here'])
  assert.deepEqual(draft.target.map(row => [row.text, row.literal]), [['estar hasta el moño', 'to be up to the bun']])
  assert.equal(draft.exampleTarget, 'Estoy hasta el moño de tanto ruido.')
  assert.deepEqual(ownIdiomData(draft, enEs).expressions.map(expression => expression.text).sort(), stored.expressions.map(expression => expression.text).sort())

  // A third language (not in the app today) survives an edit made in es-en.
  const withFrench = { ...stored, expressions: [...stored.expressions, { lang: 'fr' as never, text: 'en avoir ras le bol' }], example: { ...stored.example, fr: 'J’en ai ras le bol.' } }
  const edited = ownIdiomData(draftFromIdiom(withFrench, esEn), esEn, withFrench)
  assert.ok(edited.expressions.some(expression => expression.text === 'en avoir ras le bol'))
  assert.equal((edited.example as Record<string, string>).fr, 'J’en ai ras le bol.')
})

test('a bundled idiom round-trips through the form unchanged', () => {
  for (const idiom of IDIOMS.slice(0, 10)) {
    const data = ownIdiomData(draftFromIdiom(idiom, esEn), esEn)
    const sameOrder = (list: readonly { lang: string; text: string }[]) => [...list].sort((first, second) => first.lang.localeCompare(second.lang))
    assert.deepEqual(sameOrder(data.expressions), sameOrder(idiom.expressions), idiom.id)
    assert.equal(data.meaning, idiom.meaning)
    assert.deepEqual(data.example, idiom.example ?? {})
  }
})

test('stored expressions are read defensively', () => {
  const stored = { ...ownIdiomData(filled(), esEn), createdAt: timestamp(1234) }
  const parsed = parseOwnIdiom('abc', stored, LANGS)
  assert.equal(parsed?.id, 'abc')
  assert.equal(parsed?.createdAt, 1234)
  assert.equal(parsed?.expressions.length, 3)
  assert.equal(parseOwnIdiom('x', null, LANGS), null)
  assert.equal(parseOwnIdiom('x', { meaning: 'm', expressions: [] }, LANGS), null)
  assert.equal(parseOwnIdiom('x', { meaning: 'm', expressions: [{ lang: 'de', text: 'Hals- und Beinbruch' }] }, LANGS), null)
  const messy = parseOwnIdiom('x', {
    meaning: 42,
    expressions: [
      { lang: 'es', text: '  ser pan comido ', literal: { es: 'own language', en: '', de: 'x', fr: 7 }, register: 'loud', regions: ['en-GB', 'es-419', 3], keywords: ['es pan comido', 5, ''] },
      { lang: 'en', text: '' },
      'nope',
      { lang: 'en', text: 'a piece of cake', register: 'neutral' },
    ],
    example: { es: 'Fue pan comido.', en: null },
  }, LANGS)
  assert.deepEqual(messy, {
    id: 'x',
    meaning: '',
    expressions: [
      { lang: 'es', text: 'ser pan comido', regions: ['es-419'], keywords: ['es pan comido'] },
      { lang: 'en', text: 'a piece of cake' },
    ],
    example: { es: 'Fue pan comido.' },
    createdAt: 0,
  })
})

test('regions offered are those of the language of the expression', () => {
  assert.deepEqual(regionsOf('es'), ['es-ES', 'es-419'])
  assert.deepEqual(regionsOf('en'), ['en-GB', 'en-US'])
})

test('own expressions are searched with the bundled ones and marked as own', () => {
  const own = [{ ...ownIdiomData(filled(), esEn), id: 'mine', createdAt: 0 }]
  const [first] = findIdioms('hasta el moño', esEn, undefined, own)
  assert.equal(first.idiom.id, 'mine')
  assert.equal(first.own, true)
  assert.equal(findIdioms('fed up', enEs, undefined, own)[0].idiom.id, 'mine', 'and in the other direction')
  assert.equal(findIdioms('estoy hasta el moño', esEn, undefined, own)[0].idiom.id, 'mine', 'through its keywords')
  assert.equal(findIdioms('', esEn, undefined, own).length, IDIOMS.length + 1)
  assert.ok(findIdioms('', esEn).every(match => !match.own))
  assert.equal(searchContent('hasta el moño', esEn, own).idioms[0].idiom.id, 'mine')
})
