import assert from 'node:assert/strict'
import test from 'node:test'
import { CONFUSABLES } from '../src/data/confusables.ts'
import { FALSE_FRIENDS } from '../src/data/falseFriends.ts'
import { IDIOMS } from '../src/data/idioms.ts'
import { MINIMAL_PAIRS } from '../src/data/minimalPairs.ts'
import { PHRASAL_VERB_LANG, PHRASAL_VERBS } from '../src/data/phrasalVerbs.ts'
import { REGION_LABELS, REGISTER_LABELS } from '../src/data/types.ts'
import type { Translations } from '../src/data/types.ts'
import { isLanguageCode } from '../src/languages.ts'

function assertUniqueIds(entries: readonly { id: string }[]) {
  const ids = entries.map(entry => entry.id)
  assert.deepEqual(ids.filter((id, index) => ids.indexOf(id) !== index), [], 'duplicate ids')
}

function assertTranslations(value: Translations | undefined, languages: string[], where: string) {
  assert.ok(value, `${where}: missing`)
  for (const lang of languages) assert.ok(value[lang as keyof Translations]?.trim(), `${where}: missing ${lang}`)
  for (const lang of Object.keys(value)) assert.ok(isLanguageCode(lang), `${where}: unknown language ${lang}`)
}

test('idioms have a meaning and expressions in both languages, with consistent regions and literal translations', () => {
  assertUniqueIds(IDIOMS)
  for (const idiom of IDIOMS) {
    assert.ok(idiom.meaning.trim(), idiom.id)
    for (const lang of ['es', 'en']) assert.ok(idiom.expressions.some(expression => expression.lang === lang), `${idiom.id}: no ${lang} expression`)
    for (const expression of idiom.expressions) {
      const where = `${idiom.id} / ${expression.text}`
      assert.ok(isLanguageCode(expression.lang) && expression.text.trim(), where)
      assert.ok(!expression.register || expression.register in REGISTER_LABELS, where)
      for (const region of expression.regions ?? []) {
        assert.ok(region in REGION_LABELS, where)
        assert.ok(region.startsWith(`${expression.lang}-`), `${where}: region ${region} is not of its language`)
      }
      for (const [lang, literal] of Object.entries(expression.literal ?? {})) {
        assert.notEqual(lang, expression.lang, `${where}: literal translation into its own language`)
        assert.ok(isLanguageCode(lang) && literal?.trim(), where)
      }
    }
    if (idiom.example) assertTranslations(idiom.example, ['es', 'en'], `${idiom.id} example`)
  }
})

test('false friends pair two words of different languages with their real meanings', () => {
  assertUniqueIds(FALSE_FRIENDS)
  for (const entry of FALSE_FRIENDS) {
    const [first, second] = entry.words
    assert.notEqual(first.lang, second.lang, entry.id)
    for (const word of entry.words) {
      assert.ok(isLanguageCode(word.lang) && word.word.trim(), entry.id)
      assert.ok(word.means.length > 0 && word.means.every(meaning => meaning.trim()), `${entry.id}: ${word.word} has no meaning`)
      if (word.example) assertTranslations(word.example, [first.lang, second.lang], `${entry.id} / ${word.word}`)
    }
  }
})

test('every difference has a rule, at least three examples and a quiz whose answers are its words', () => {
  assertUniqueIds(CONFUSABLES)
  for (const entry of CONFUSABLES) {
    assert.ok(isLanguageCode(entry.lang) && entry.words.length >= 2 && entry.rule.trim(), entry.id)
    assert.deepEqual(entry.usages.map(usage => usage.word), entry.words, `${entry.id}: one usage per word, in order`)
    const examples = entry.usages.flatMap(usage => usage.examples)
    assert.ok(examples.length >= 3, `${entry.id}: fewer than three examples`)
    for (const example of examples) assertTranslations(example, ['es', 'en'], `${entry.id} example`)
    assert.ok(entry.quiz.length >= 3, `${entry.id}: quiz too short`)
    for (const question of entry.quiz) {
      assert.equal(question.sentence.split('___').length, 2, `${entry.id}: "${question.sentence}" needs exactly one ___`)
      assert.ok(entry.words.includes(question.answer), `${entry.id}: answer "${question.answer}" is not one of the words`)
      assert.ok(question.why.trim(), entry.id)
    }
    for (const [lang, hints] of Object.entries(entry.hints ?? {})) {
      assert.ok(isLanguageCode(lang) && lang !== entry.lang && hints?.length, `${entry.id}: hints`)
    }
  }
})

test('phrasal verbs are unique and every sense has a Spanish meaning and a translated example', () => {
  assertUniqueIds(PHRASAL_VERBS)
  const forms = PHRASAL_VERBS.map(phrasal => `${phrasal.verb} ${phrasal.particle}`)
  assert.equal(new Set(forms).size, forms.length, 'duplicate phrasal verb')
  for (const phrasal of PHRASAL_VERBS) {
    assert.equal(phrasal.id, `${phrasal.verb} ${phrasal.particle}`.replaceAll(' ', '-'), phrasal.id)
    assert.ok(phrasal.senses.length > 0, phrasal.id)
    for (const sense of phrasal.senses) {
      assert.ok(sense.translations.es?.length && sense.translations.es.every(meaning => meaning.trim()), phrasal.id)
      assertTranslations(sense.example, [PHRASAL_VERB_LANG, 'es'], `${phrasal.id} example`)
    }
  }
})

test('minimal pairs have two different words with their IPA, a hint and regions of their language', () => {
  assertUniqueIds(MINIMAL_PAIRS)
  for (const pair of MINIMAL_PAIRS) {
    assert.ok(isLanguageCode(pair.lang), pair.id)
    assert.notEqual(pair.words[0], pair.words[1], pair.id)
    assert.equal(pair.id, pair.words.join('-'), pair.id)
    for (const ipa of pair.ipa) assert.match(ipa, /^\/.+\/$/, `${pair.id}: IPA between slashes`)
    assert.ok(pair.hint.trim(), pair.id)
    for (const region of pair.regions ?? []) assert.ok(region.startsWith(`${pair.lang}-`), pair.id)
  }
  for (const lang of ['es', 'en']) assert.ok(MINIMAL_PAIRS.filter(pair => pair.lang === lang).length >= 5, `${lang}: too few pairs`)
})
