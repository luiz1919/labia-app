import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { after, before, beforeEach, test } from 'node:test'
import { assertFails, assertSucceeds, initializeTestEnvironment } from '@firebase/rules-unit-testing'
import { feedbackRulesTests } from 'firebase-app-kit/rules-testing'
import { deleteDoc, deleteField, doc, getDoc, serverTimestamp, setDoc, Timestamp, updateDoc } from 'firebase/firestore'

const projectId = 'demo-labia'
const ownerUid = 'settings-test-owner'
const settingsPath = `users/${ownerUid}`
const settings = { sourceLanguage: 'es', targetLanguage: 'en' }
let environment

before(async () => {
  assert.equal(process.env.FIRESTORE_EMULATOR_HOST, '127.0.0.1:8087', 'Run through npm run test:rules; real Firebase is never used.')
  environment = await initializeTestEnvironment({
    projectId,
    firestore: { host: '127.0.0.1', port: 8087, rules: readFileSync(new URL('../firestore.rules', import.meta.url), 'utf8') },
  })
})

beforeEach(async () => { await environment.clearFirestore() })
after(async () => { await environment?.cleanup() })

function owner() {
  return environment.authenticatedContext(ownerUid).firestore()
}

test('owner can save, change, read and delete their preferences', async () => {
  const database = owner()
  await assertSucceeds(setDoc(doc(database, settingsPath), settings))
  await assertSucceeds(setDoc(doc(database, settingsPath), { targetLanguage: 'es', sourceLanguage: 'en' }, { merge: true }))
  const saved = await assertSucceeds(getDoc(doc(database, settingsPath)))
  assert.deepEqual(saved.data(), { sourceLanguage: 'en', targetLanguage: 'es' })
  await assertSucceeds(deleteDoc(doc(database, settingsPath)))
})

test('languages not in the app yet are accepted when the code is well formed', async () => {
  await assertSucceeds(setDoc(doc(owner(), settingsPath), { sourceLanguage: 'fr', targetLanguage: 'ast' }))
})

test('another user and anonymous visitors cannot read or modify the preferences', async () => {
  await setDoc(doc(owner(), settingsPath), settings)
  for (const context of [environment.authenticatedContext('other-user'), environment.unauthenticatedContext()]) {
    const database = context.firestore()
    await assertFails(getDoc(doc(database, settingsPath)))
    await assertFails(setDoc(doc(database, settingsPath), settings))
    await assertFails(deleteDoc(doc(database, settingsPath)))
  }
})

test('malformed preferences are rejected', async () => {
  const database = owner()
  const invalid = [
    { sourceLanguage: 'es', targetLanguage: 'es' },
    { sourceLanguage: 'ES', targetLanguage: 'en' },
    { sourceLanguage: 'es-ES', targetLanguage: 'en' },
    { sourceLanguage: 'es' },
    { sourceLanguage: 'es', targetLanguage: 7 },
    { ...settings, extra: true },
  ]
  for (const data of invalid) await assertFails(setDoc(doc(database, settingsPath), data))
})

const aiPath = `users/${ownerUid}/settings/ai`
const aiSettings = { providers: { gemini: { apiKey: 'test-key', model: 'gemini-flash', models: ['gemini-flash'] } }, lastProvider: 'gemini', anthropicFallback: true }

test('owner can save, update and remove their AI settings with the kit actions', async () => {
  const database = owner()
  await assertSucceeds(setDoc(doc(database, aiPath), aiSettings))
  await assertSucceeds(setDoc(doc(database, aiPath), { providers: { anthropic: { apiKey: 'other-key', model: 'claude-opus-5-5', models: [] } } }, { merge: true }))
  await assertSucceeds(setDoc(doc(database, aiPath), { lastProvider: 'anthropic' }, { merge: true }))
  await assertSucceeds(setDoc(doc(database, aiPath), { providers: { gemini: deleteField() } }, { merge: true }))
  const saved = (await assertSucceeds(getDoc(doc(database, aiPath)))).data()
  assert.deepEqual(Object.keys(saved.providers), ['anthropic'])
  await assertSucceeds(deleteDoc(doc(database, aiPath)))
})

test('nobody else can read the AI keys, and malformed AI settings are rejected', async () => {
  await setDoc(doc(owner(), aiPath), aiSettings)
  for (const context of [environment.authenticatedContext('other-user'), environment.unauthenticatedContext()]) {
    await assertFails(getDoc(doc(context.firestore(), aiPath)))
    await assertFails(setDoc(doc(context.firestore(), aiPath), aiSettings))
  }
  const database = owner()
  for (const invalid of [
    { ...aiSettings, extra: 1 },
    { providers: { mistral: { apiKey: 'x', model: 'y' } } },
    { providers: { gemini: { apiKey: 42, model: 'y' } } },
    { providers: { gemini: { apiKey: 'x', model: 'y', secret: true } } },
    { providers: { gemini: { apiKey: 'x'.repeat(501), model: 'y' } } },
    { lastProvider: 'mistral' },
    { anthropicFallback: 'yes' },
  ]) await assertFails(setDoc(doc(database, aiPath), invalid))
})

const pantryPath = `users/${ownerUid}/pantry/word-1`
const pantryWord = () => ({ text: 'zarzamora', lang: 'es', createdAt: serverTimestamp(), reviewed: false })

test('owner can add, look up, correct and delete words in their pantry', async () => {
  const database = owner()
  await assertSucceeds(setDoc(doc(database, pantryPath), pantryWord()))
  await assertSucceeds(updateDoc(doc(database, pantryPath), { reviewed: true }))
  await assertSucceeds(updateDoc(doc(database, pantryPath), { text: 'zarzamoras' }))
  const saved = (await assertSucceeds(getDoc(doc(database, pantryPath)))).data()
  assert.equal(saved.text, 'zarzamoras')
  assert.equal(saved.reviewed, true)
  await assertSucceeds(deleteDoc(doc(database, pantryPath)))
})

test('nobody else can see or change the pantry, and malformed words are rejected', async () => {
  await setDoc(doc(owner(), pantryPath), pantryWord())
  for (const context of [environment.authenticatedContext('other-user'), environment.unauthenticatedContext()]) {
    const database = context.firestore()
    await assertFails(getDoc(doc(database, pantryPath)))
    await assertFails(setDoc(doc(database, `users/${ownerUid}/pantry/word-2`), pantryWord()))
    await assertFails(updateDoc(doc(database, pantryPath), { reviewed: true }))
    await assertFails(deleteDoc(doc(database, pantryPath)))
  }
  const database = owner()
  const newPath = `users/${ownerUid}/pantry/word-3`
  for (const invalid of [
    { ...pantryWord(), text: '' },
    { ...pantryWord(), text: 'x'.repeat(101) },
    { ...pantryWord(), lang: 'Spanish' },
    { ...pantryWord(), reviewed: 'no' },
    { ...pantryWord(), extra: true },
    { text: 'zarzamora', lang: 'es', createdAt: serverTimestamp() },
    { ...pantryWord(), createdAt: Timestamp.fromMillis(0) },
  ]) await assertFails(setDoc(doc(database, newPath), invalid))
  await assertFails(updateDoc(doc(database, pantryPath), { createdAt: Timestamp.fromMillis(0) }))
  await assertFails(updateDoc(doc(database, pantryPath), { lang: 'en' }))
  await assertFails(updateDoc(doc(database, pantryPath), { text: 42 }))
})

const favoritePath = `users/${ownerUid}/favorites/es-en-zarzamora`
const favorite = () => ({ term: 'zarzamora', source: 'es', target: 'en', translations: ['blackberry', 'bramble'], engine: 'wiktionary', createdAt: serverTimestamp() })

test('owner can star, star again, read and remove a search', async () => {
  const database = owner()
  await assertSucceeds(setDoc(doc(database, favoritePath), favorite()))
  await assertSucceeds(setDoc(doc(database, favoritePath), { ...favorite(), translations: [] }))
  const saved = (await assertSucceeds(getDoc(doc(database, favoritePath)))).data()
  assert.deepEqual(saved.translations, [])
  await assertSucceeds(deleteDoc(doc(database, favoritePath)))
})

test('nobody else can see or change the favorites, and malformed ones are rejected', async () => {
  await setDoc(doc(owner(), favoritePath), favorite())
  for (const context of [environment.authenticatedContext('other-user'), environment.unauthenticatedContext()]) {
    const database = context.firestore()
    await assertFails(getDoc(doc(database, favoritePath)))
    await assertFails(setDoc(doc(database, favoritePath), favorite()))
    await assertFails(deleteDoc(doc(database, favoritePath)))
  }
  const database = owner()
  for (const invalid of [
    { ...favorite(), term: '' },
    { ...favorite(), term: 'x'.repeat(201) },
    { ...favorite(), target: 'es' },
    { ...favorite(), source: 'Spanish' },
    { ...favorite(), translations: 'blackberry' },
    { ...favorite(), translations: Array.from({ length: 9 }, (_, index) => `t${index}`) },
    { ...favorite(), engine: 7 },
    { ...favorite(), extra: true },
    { ...favorite(), createdAt: Timestamp.fromMillis(0) },
    { term: 'zarzamora', source: 'es', target: 'en', createdAt: serverTimestamp() },
  ]) await assertFails(setDoc(doc(database, `users/${ownerUid}/favorites/es-en-other`), invalid))
})

test('everything outside the user documents is denied', async () => {
  const database = owner()
  await assertFails(setDoc(doc(database, `users/${ownerUid}/settings/other`), { theme: 'dark' }))
  await assertFails(setDoc(doc(database, `users/${ownerUid}/notebook/entry`), { term: 'hola' }))
  await assertFails(getDoc(doc(database, 'languages/es')))
})

// In-app feedback ("Comentarios"): firebase-app-kit's tests of its rules block, run against this file.
feedbackRulesTests({ environment: () => environment, assertSucceeds, assertFails, rules: readFileSync(new URL('../firestore.rules', import.meta.url), 'utf8') })
