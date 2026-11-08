// Pronunciation of English words from the Free Dictionary API (api.dictionaryapi.dev): free, no
// key, CORS allowed. It returns IPA transcriptions and, for many words, recordings from Wikimedia
// Commons (CC BY-SA) whose file name says the accent (ship-us.mp3, tomato-uk.mp3).

export interface Pronunciation {
  /** IPA transcription, or '' when the recording has none. */
  ipa: string
  /** Recording URL, or '' when there is only the transcription. */
  audio: string
  /** Accent label in Spanish, or '' when unknown. */
  accent: string
}

const ACCENTS: Readonly<Record<string, string>> = {
  uk: 'Reino Unido',
  us: 'EE. UU.',
  au: 'Australia',
  ca: 'Canadá',
  nz: 'Nueva Zelanda',
  ie: 'Irlanda',
}

const ACCENT_ORDER = ['uk', 'us', 'au', 'ca', 'nz', 'ie']

function accentCode(audio: string): string {
  return /-(uk|us|au|ca|nz|ie)(?:-\d+)?\.(?:mp3|ogg)$/i.exec(audio)?.[1]?.toLowerCase() ?? ''
}

/** Recordings first (UK, then US...), then transcriptions without audio; no duplicates, at most `limit`. */
export function parsePronunciations(data: unknown, limit = 4): Pronunciation[] {
  if (!Array.isArray(data)) return []
  const recordings: (Pronunciation & { order: number })[] = []
  const transcriptions: string[] = []
  for (const entry of data) {
    const phonetics = (entry as { phonetics?: unknown }).phonetics
    if (!Array.isArray(phonetics)) continue
    for (const phonetic of phonetics) {
      const text = typeof phonetic?.text === 'string' ? phonetic.text.trim() : ''
      const audio = typeof phonetic?.audio === 'string' && phonetic.audio.startsWith('https://') ? phonetic.audio : ''
      if (audio) {
        if (recordings.some(recording => recording.audio === audio)) continue
        const code = accentCode(audio)
        recordings.push({ ipa: text, audio, accent: ACCENTS[code] ?? '', order: code ? ACCENT_ORDER.indexOf(code) : ACCENT_ORDER.length })
      } else if (text && !transcriptions.includes(text)) {
        transcriptions.push(text)
      }
    }
  }
  recordings.sort((first, second) => first.order - second.order)
  const withAudio = recordings.map(({ order: _order, ...pronunciation }) => pronunciation)
  const shown = new Set(withAudio.map(pronunciation => pronunciation.ipa))
  const onlyText = transcriptions.filter(text => !shown.has(text)).map(ipa => ({ ipa, audio: '', accent: '' }))
  return [...withAudio, ...onlyText].slice(0, limit)
}

/** A single English word (letters, apostrophes or hyphens): the only thing worth looking up. */
export function isSingleEnglishWord(text: string): boolean {
  return /^[a-z][a-z'-]{1,30}$/i.test(text.trim())
}

const cache = new Map<string, Promise<Pronunciation[]>>()

/** Pronunciations of an English word; [] if the word is unknown or the service fails. */
export function fetchPronunciations(word: string): Promise<Pronunciation[]> {
  const key = word.trim().toLowerCase()
  if (!isSingleEnglishWord(key)) return Promise.resolve([])
  let pending = cache.get(key)
  if (!pending) {
    pending = fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${encodeURIComponent(key)}`)
      .then(response => (response.ok ? response.json() : []))
      .then(data => parsePronunciations(data))
      .catch(() => {
        cache.delete(key)
        return []
      })
    cache.set(key, pending)
  }
  return pending
}
