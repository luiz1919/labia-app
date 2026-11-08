// Small text helpers for the engines' answers.

const ENTITIES: Readonly<Record<string, string>> = { amp: '&', lt: '<', gt: '>', quot: '"', apos: "'", nbsp: ' ', '#39': "'" }

/** Plain text from a small HTML fragment (tags removed, common entities decoded). */
export function stripHtml(html: string): string {
  return html
    .replace(/<[^>]*>/g, '')
    .replace(/&(#\d+|#x[0-9a-f]+|[a-z]+);/gi, (match, entity: string) => {
      if (entity.startsWith('#x')) return String.fromCodePoint(parseInt(entity.slice(2), 16))
      if (entity.startsWith('#') && entity !== '#39') return String.fromCodePoint(Number(entity.slice(1)))
      return ENTITIES[entity.toLowerCase()] ?? match
    })
    .replace(/\s+/g, ' ')
    .trim()
}

/** Wiki link markup to plain text: [[a|b]] -> b, [[a]] -> a, and '''bold''' / ''italic'' removed. */
export function stripWikiLinks(text: string): string {
  return text.replace(/\[\[(?:[^|\]]*\|)?([^\]]+)\]\]/g, '$1').replace(/'{2,}/g, '').replace(/\s+/g, ' ').trim()
}
