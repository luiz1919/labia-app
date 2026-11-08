import assert from 'node:assert/strict'
import test from 'node:test'
import { accentVariety, DEFAULT_ACCENTS, heardAs, listenContinuously, listenWhileHeld, parseAccents, pickVoice } from '../src/speech.ts'
import type { Recognition } from '../src/speech.ts'

const voices = [
  { lang: 'en-US', name: 'Samantha', localService: true, default: true },
  { lang: 'en-GB', name: 'Google UK English Female', localService: false },
  { lang: 'en-GB', name: 'Daniel', localService: true },
  { lang: 'es-ES', name: 'Mónica', localService: true },
  { lang: 'es_MX', name: 'Paulina', localService: true },
  { lang: 'fr-FR', name: 'Thomas', localService: true },
]

test('the voice for a locale prefers the same accent, then the same language, then installed voices', () => {
  assert.equal(pickVoice(voices, 'en-GB')?.name, 'Daniel')
  assert.equal(pickVoice(voices, 'en-US')?.name, 'Samantha')
  assert.equal(pickVoice(voices, 'es-MX')?.name, 'Paulina', 'underscore locales from some Android voices')
  assert.equal(pickVoice(voices, 'en-AU')?.name, 'Samantha', 'same language when the accent is missing')
  assert.equal(pickVoice(voices, 'de-DE'), null)
  assert.equal(pickVoice([], 'en-GB'), null)
})

test('Apple novelty voices are never picked, and better voices win a tie', () => {
  const apple = [
    { lang: 'en-US', name: 'Albert', localService: true },
    { lang: 'en-US', name: 'Bad News', localService: true },
    { lang: 'en-US', name: 'Eddy (English (United States))', localService: true },
    { lang: 'en-US', name: 'Fred', localService: true },
    { lang: 'en-US', name: 'Samantha', localService: true },
    { lang: 'es-ES', name: 'Mónica', localService: true, default: true },
  ]
  assert.equal(pickVoice(apple, 'en-US')?.name, 'Samantha', 'normal voices before the old or character ones')
  assert.equal(pickVoice([...apple, { lang: 'en-US', name: 'Ava (Premium)', localService: true }], 'en-US')?.name, 'Ava (Premium)')
  assert.equal(pickVoice(apple.slice(0, 2), 'en-US'), null, 'only novelty voices: let the browser choose')
  assert.equal(pickVoice(apple.slice(0, 4), 'en-US')?.name, 'Eddy (English (United States))', 'a plain voice is still better than none')
  assert.equal(pickVoice(apple, 'en-GB')?.name, 'Samantha', 'same language when the accent is missing')
})

test('saved accents are read back and anything unknown falls back to the default', () => {
  assert.deepEqual(parseAccents(null), DEFAULT_ACCENTS)
  assert.deepEqual(parseAccents('{"en":"en-US","es":"es-MX"}'), { en: 'en-US', es: 'es-MX' })
  assert.deepEqual(parseAccents('{"en":"en-AU","es":7}'), DEFAULT_ACCENTS)
  assert.deepEqual(parseAccents('not json'), DEFAULT_ACCENTS)
  assert.equal(accentVariety('en', 'en-US'), 'americano')
  assert.equal(accentVariety('es', 'xx'), '')
})

test('what the recognizer heard matches ignoring case, accents and punctuation', () => {
  assert.equal(heardAs('sheep', ['Ship', 'sheep']), true)
  assert.equal(heardAs('papá', ['Papá.']), true)
  assert.equal(heardAs('ship', ['sheep', 'cheap']), false)
  assert.equal(heardAs('How are you?', ['how are you']), true)
})

// A fake recognizer driven by the test, a clock and a queue of delayed calls.
function harness({ hidden = false } = {}) {
  const sessions: FakeRecognition[] = []
  const queue: { callback: () => void; ms: number }[] = []
  const phrases: string[][] = []
  const listening: boolean[] = []
  const errors: string[] = []
  const state = { now: 0, hidden }
  class FakeRecognition implements Recognition {
    lang = ''
    continuous = false
    maxAlternatives = 1
    interimResults = true
    onresult: Recognition['onresult'] = null
    onerror: Recognition['onerror'] = null
    onend: Recognition['onend'] = null
    aborted = false
    start() { sessions.push(this) }
    stop() { this.onend?.() }
    abort() { this.aborted = true; this.onend?.() }
    say(...alternatives: string[]) {
      const result = Object.assign(alternatives.map(transcript => ({ transcript })), { isFinal: true })
      this.onresult?.({ resultIndex: 0, results: [result] })
    }
    end(error?: string) {
      if (error) this.onerror?.({ error })
      this.onend?.()
    }
  }
  const session = listenContinuously('es-ES', {
    onPhrase: alternatives => phrases.push(alternatives),
    onListening: on => listening.push(on),
    onError: message => errors.push(message),
  }, {
    Recognition: FakeRecognition,
    hidden: () => state.hidden,
    later: (callback, ms) => queue.push({ callback, ms }),
    now: () => state.now,
  })
  const flush = () => queue.splice(0).forEach(({ callback }) => callback())
  return { session, sessions, queue, phrases, listening, errors, state, flush }
}

test('continuous listening restarts after each session and passes on every phrase', () => {
  const { sessions, queue, phrases, listening, errors, state, flush } = harness()
  assert.equal(sessions.length, 1)
  assert.equal(sessions[0].lang, 'es-ES')
  assert.equal(sessions[0].continuous, true)
  assert.equal(sessions[0].interimResults, false)
  sessions[0].say('apunta zarzamora', 'apunta sarsamora')
  assert.deepEqual(phrases, [['apunta zarzamora', 'apunta sarsamora']])
  state.now = 8000
  sessions[0].end('no-speech')
  assert.deepEqual(queue.map(item => item.ms), [300], 'silence is normal: listen again shortly')
  flush()
  assert.equal(sessions.length, 2)
  assert.deepEqual(listening, [true, false, true])
  assert.deepEqual(errors, [])
})

test('repeated failures back off and then stop; fatal errors stop at once', () => {
  const failing = harness()
  for (let attempt = 0; attempt < 2; attempt++) {
    failing.sessions.at(-1)?.end('network')
    assert.equal(failing.queue.at(-1)?.ms, 1000 * 2 ** (attempt + 1))
    failing.flush()
  }
  failing.sessions.at(-1)?.end('network')
  assert.equal(failing.queue.length, 0)
  assert.deepEqual(failing.errors, ['El reconocimiento de voz necesita conexión.'])

  const denied = harness()
  denied.sessions[0].end('not-allowed')
  assert.equal(denied.queue.length, 0)
  assert.match(denied.errors[0], /permiso/)

  const flapping = harness()
  for (let attempt = 0; attempt < 3; attempt++) {
    flapping.sessions.at(-1)?.end()
    flapping.flush()
  }
  assert.equal(flapping.sessions.length, 3, 'sessions that end at once count as failures')
  assert.match(flapping.errors[0], /se corta/)
})

test('a hidden page waits for resume(), and stop() ends it for good', () => {
  const { session, sessions, state, flush, listening } = harness()
  state.hidden = true
  state.now = 5000
  sessions[0].end('aborted')
  flush()
  assert.equal(sessions.length, 1, 'no microphone while the page is hidden')
  state.hidden = false
  session.resume()
  assert.equal(sessions.length, 2)
  session.stop()
  assert.equal(sessions[1].aborted, true)
  assert.deepEqual(listening.at(-1), false)
  session.resume()
  flush()
  assert.equal(sessions.length, 2)
})

// Push to talk: a fake recognizer whose stop() waits for the test to deliver the last words.
function heldHarness() {
  const sessions: HeldRecognition[] = []
  const queue: (() => void)[] = []
  const live: string[] = []
  class HeldRecognition implements Recognition {
    lang = ''
    continuous = true
    maxAlternatives = 1
    interimResults = false
    onresult: Recognition['onresult'] = null
    onerror: Recognition['onerror'] = null
    onend: Recognition['onend'] = null
    stopped = false
    aborted = false
    start() { sessions.push(this) }
    stop() { this.stopped = true }
    abort() { this.aborted = true; this.onend?.() }
    hear(isFinal: boolean, ...alternatives: string[]) {
      const result = Object.assign(alternatives.map(transcript => ({ transcript })), { isFinal })
      this.onresult?.({ resultIndex: 0, results: [result] })
    }
    end(error?: string) {
      if (error) this.onerror?.({ error })
      this.onend?.()
    }
  }
  const held = listenWhileHeld('es-ES', text => live.push(text), { Recognition: HeldRecognition, later: callback => queue.push(callback) })
  return { held, sessions, queue, live }
}

test('push to talk shows the words live and transcribes them on release', async () => {
  const { held, sessions, live } = heldHarness()
  assert.equal(sessions[0].interimResults, true)
  assert.equal(sessions[0].continuous, false)
  sessions[0].hear(false, 'zarza')
  sessions[0].hear(true, 'zarzamora', 'sarsamora')
  assert.deepEqual(live, ['zarza', 'zarzamora'])
  held.finish()
  assert.equal(sessions[0].stopped, true, 'released: stop, not abort, so the last words still arrive')
  sessions[0].end()
  assert.deepEqual(await held.result, ['zarzamora', 'sarsamora'])
})

test('a pause while holding starts a new session and the words add up', async () => {
  const { held, sessions, live } = heldHarness()
  sessions[0].hear(true, 'a la luz')
  sessions[0].end('no-speech')
  assert.equal(sessions.length, 2, 'still held: keep listening')
  sessions[1].hear(true, 'de la luna', 'de la una')
  assert.equal(live.at(-1), 'a la luz de la luna')
  held.finish()
  sessions[1].end()
  assert.deepEqual(await held.result, ['a la luz de la luna', 'a la luz de la una'])
})

test('push to talk: nothing heard, errors, a browser that never ends, and leaving', async () => {
  const quick = heldHarness()
  quick.held.finish()
  quick.sessions[0].end()
  assert.deepEqual(await quick.held.result, [], 'released before saying anything')

  const denied = heldHarness()
  denied.sessions[0].end('not-allowed')
  await assert.rejects(denied.held.result, /permiso/)

  const stuck = heldHarness()
  stuck.sessions[0].hear(true, 'escarabajo')
  stuck.held.finish()
  stuck.queue.forEach(callback => callback())
  assert.deepEqual(await stuck.held.result, ['escarabajo'], 'the release timeout keeps what was heard')
  assert.equal(stuck.sessions[0].aborted, true)

  const left = heldHarness()
  left.held.cancel()
  assert.equal(left.sessions[0].aborted, true)
  assert.deepEqual(await left.held.result, [])
})
