import assert from 'node:assert/strict'
import test from 'node:test'
import { DEFAULT_SCREEN, SCREENS, screenFromHash, screenHash, tabOf, TABS } from '../src/screens.ts'

test('the hash selects the screen and unknown hashes go to the search', () => {
  assert.equal(screenFromHash(''), DEFAULT_SCREEN)
  assert.equal(screenFromHash('#/'), 'buscar')
  assert.equal(screenFromHash('#/expresiones'), 'expresiones')
  assert.equal(screenFromHash('#phrasal-verbs'), 'phrasal-verbs')
  assert.equal(screenFromHash('#/diferencias/make-do'), 'diferencias')
  assert.equal(screenFromHash('#/ajustes'), 'ajustes')
  assert.equal(screenFromHash('#/acerca'), 'acerca')
  assert.equal(screenFromHash('#/nope'), 'buscar')
})

test('every screen round-trips through its hash and belongs to a tab, except settings', () => {
  for (const screen of SCREENS) assert.equal(screenFromHash(screenHash(screen.id)), screen.id)
  assert.equal(screenHash('buscar'), '#/')
  assert.equal(tabOf('falsos-amigos'), 'aprender')
  assert.equal(tabOf('asistente'), 'asistente')
  assert.equal(tabOf('ajustes'), null)
  assert.equal(tabOf('acerca'), null)
  for (const tab of TABS) assert.equal(tabOf(tab.id), tab.id, 'each tab has its own screen')
})
