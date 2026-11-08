import assert from 'node:assert/strict'
import test from 'node:test'
import { dictionaryRequest, naturalnessRequest, parseCandidates, parseDictionaryEntry, parseLines, parseNaturalness, photoTextRequest, tipOfTongueRequest } from '../src/assistant.ts'

type Schema = { type?: string; properties?: Record<string, Schema>; required?: string[]; additionalProperties?: boolean; items?: Schema }

/** Claude's structured outputs need every object closed and every property required. */
function assertStrict(schema: Schema | undefined, path = 'schema') {
  assert.ok(schema, `${path} missing`)
  if (schema.type === 'object') {
    assert.equal(schema.additionalProperties, false, `${path}: additionalProperties`)
    assert.deepEqual([...(schema.required ?? [])].sort(), Object.keys(schema.properties ?? {}).sort(), `${path}: required`)
    for (const [name, child] of Object.entries(schema.properties ?? {})) assertStrict(child, `${path}.${name}`)
  }
  if (schema.type === 'array') assertStrict(schema.items, `${path}[]`)
}

test('requests ask for JSON with a strict schema and keep the user text inside its tag', () => {
  const tip = tipOfTongueRequest('eso que se pone bajo la puerta', 'en', 'es')
  assertStrict(tip.schema as Schema)
  assert.match(tip.system, /en inglés/)
  assert.match(tip.system, /JSON/)
  assert.equal(tip.question, '<descripcion>\neso que se pone bajo la puerta\n</descripcion>')

  const natural = naturalnessRequest('I am agree', 'en', 'británico')
  assertStrict(natural.schema as Schema)
  assert.match(natural.system, /inglés británico/)
  assert.match(natural.question, /<frase>\nI am agree\n<\/frase>/)
  assert.doesNotMatch(naturalnessRequest('Hola', 'es').system, /toma como referencia/)

  const photo = photoTextRequest()
  assertStrict(photo.schema as Schema)
  assert.match(photo.system, /JSON/)
})

test('candidates are cleaned up: no empty words, at most five', () => {
  const many = Array.from({ length: 7 }, (_, index) => ({ word: ` draught excluder ${index} `, translation: 'burlete', explanation: 'x', example: 'y' }))
  const parsed = parseCandidates({ candidates: [{ word: '' }, ...many, 'garbage'] })
  assert.equal(parsed.length, 5)
  assert.equal(parsed[0].word, 'draught excluder 0')
  assert.deepEqual(parseCandidates({ candidates: 'none' }), [])
})

test('a review needs a known verdict and a corrected sentence; the rest has safe defaults', () => {
  const review = parseNaturalness({ verdict: 'unnatural', corrected: 'I agree', register: 'casual', explanation: 'Agree ya es un verbo.', alternatives: [{ text: "I'm with you", nuance: 'Coloquial' }, { text: '' }] })
  assert.equal(review.verdict, 'unnatural')
  assert.equal(review.register, 'neutral', 'unknown register')
  assert.deepEqual(review.alternatives, [{ text: "I'm with you", nuance: 'Coloquial' }])
  assert.throws(() => parseNaturalness({ verdict: 'great', corrected: 'x' }))
  assert.throws(() => parseNaturalness({ verdict: 'natural', corrected: ' ' }))
})

test('photo lines are trimmed, deduplicated and capped', () => {
  assert.deepEqual(parseLines({ lines: [' Fish  and chips ', 'Fish and chips', '', 3, 'Mushy peas'] }), ['Fish and chips', 'Mushy peas'])
  assert.deepEqual(parseLines({}), [])
})

test('the AI dictionary entry asks for a strict schema and becomes engine groups', () => {
  const request = dictionaryRequest('echar de menos', { source: 'es', target: 'en' }, 'británico')
  assertStrict(request.schema as Schema)
  assert.match(request.system, /español-inglés/)
  assert.match(request.question, /<busqueda>\necho de menos|<busqueda>\nechar de menos/)
  const answer = parseDictionaryEntry({
    entries: [
      { translation: 'to miss', partOfSpeech: 'verbo', meaning: 'notar la falta de alguien', register: 'neutral', region: '', example: 'I miss you.', exampleTranslation: 'Te echo de menos.' },
      { translation: '', partOfSpeech: 'verbo' },
    ],
    notes: 'No confundir con «to lose».',
  }, { source: 'es', target: 'en' })
  assert.equal(answer.groups.length, 1)
  assert.deepEqual(answer.groups[0].items, [{ text: 'to miss', lang: 'en' }])
  assert.deepEqual(answer.groups[0].examples, [{ text: 'I miss you.', lang: 'en', translation: 'Te echo de menos.', translationLang: 'es' }])
  assert.deepEqual(answer.notes, ['No confundir con «to lose».'])
  assert.equal(parseDictionaryEntry({ entries: [{ translation: 'cuesta un huevo', register: 'vulgar', region: 'España' }] }, { source: 'en', target: 'es' }).groups[0].items[0].note, 'vulgar, España')
})
