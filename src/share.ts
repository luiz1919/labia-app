// "Share" from any app to Labia (Web Share Target API, manifest share_target): the installed PWA
// opens with ?title=&text=&url= in the address. Android supports it; iOS does not.

const URL_PATTERN = /https?:\/\/\S+/gi

/** Text to search from the shared data: text, else title, without links; '' if nothing usable. */
export function sharedQuery(search: string): string {
  const params = new URLSearchParams(search)
  for (const name of ['text', 'title']) {
    const value = (params.get(name) ?? '').replace(URL_PATTERN, ' ').replace(/\s+/g, ' ').trim()
    // Quotes added by some apps when sharing a selection: «...», "...".
    const unquoted = value.replace(/^["“«'](.*)["”»']$/s, '$1').trim()
    if (unquoted) return unquoted.slice(0, 200)
  }
  return ''
}
