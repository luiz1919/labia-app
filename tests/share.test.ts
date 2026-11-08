import assert from 'node:assert/strict'
import test from 'node:test'
import { fitWithin } from '../src/image.ts'
import { sharedQuery } from '../src/share.ts'

test('shared text becomes the query, without links or wrapping quotes', () => {
  assert.equal(sharedQuery('?text=break%20a%20leg'), 'break a leg')
  assert.equal(sharedQuery('?title=Article&text=%E2%80%9Cbreak%20a%20leg%E2%80%9D%20https%3A%2F%2Fexample.com%2Fx'), 'break a leg')
  assert.equal(sharedQuery('?title=Only%20a%20title&url=https%3A%2F%2Fexample.com'), 'Only a title')
  assert.equal(sharedQuery('?url=https%3A%2F%2Fexample.com'), '')
  assert.equal(sharedQuery(''), '')
  assert.equal(sharedQuery(`?text=${'a'.repeat(300)}`).length, 200)
})

test('photos are shrunk to fit, keeping proportions and never enlarged', () => {
  assert.deepEqual(fitWithin(4032, 3024), { width: 1568, height: 1176 })
  assert.deepEqual(fitWithin(3024, 4032), { width: 1176, height: 1568 })
  assert.deepEqual(fitWithin(800, 600), { width: 800, height: 600 })
})
