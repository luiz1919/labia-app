# Changelog

Changes to Labia, newest first. Each published version has a git tag `vX.Y.Z`, created by
`npm run deploy` (see `README-COMMANDS.md`).

`npm run deploy` adds each new version here on its own (in a `docs(changelog): vX.Y.Z` commit):
it lists the entries written under **Unreleased**, if there are any, or otherwise the messages of
the commits since the previous tag. Write descriptive commit messages, or write the entries under
Unreleased by hand when you want them clearer.

## Unreleased

- Feedback ("Comentarios"): an icon next to the sync status to report something that does not
  work or suggest an improvement, with up to 3 screenshots and optional technical details. Every
  user sees the list (to avoid repeating a suggestion), only the author edits their text, and the
  admin answers, sets the status and the version that solved it, or deletes. From
  firebase-app-kit v0.12.0; Firestore `feedback/` and `admins/` (new rules).

## [v0.5.1] - 2026-11-09

- Deps: firebase-app-kit v0.11.0 (sync status in a centred dialog)

## [v0.5.0] - 2026-11-09

- Favorites: a star on every answer of "¿Cómo se dice?" (and of the Despensa) saves the search
  with its translations. "Favoritos", folded at the bottom of "Buscar", lists them with a filter,
  newest first or A–Z; tap one to search it again, or its star to remove it (with undo). Saved
  in Firestore, per user.

## [v0.4.1] - 2026-11-09

- "Mantén pulsado y habla": when the phone cuts the recognition on release ("aborted") before
  the last words become final, the words shown on screen are proposed instead of the error
  "No se ha podido reconocer la voz". A session cut before hearing anything is retried once
  while the button is held. A quick tap says to hold the button. Unknown recognition errors
  show their code.
- "Pronunciar": stopping the microphone keeps what was said (it used to discard it and show an
  error).

## [v0.4.0] - 2026-11-08

- New "Despensa" (Pantry) tab: save words to look up later. "Manos libres" (hands-free) keeps
  the microphone on, for example while reading a book aloud, and saves whatever follows
  "apunta" ("apunta zarzamora"; "note" in English) with a beep, keeping the screen on.
  "Mantén pulsado y habla" listens only while the button is held and, on release, proposes
  what it understood (editable, with other guesses) to save or discard. Words can also be
  typed. Tap a saved word to see its translation, open it in
  "Buscar", correct it, delete it or tick it as looked up. Saved in Firestore, per user.
- Android shortcut to the Despensa (long press on the app icon).

## [v0.3.1] - 2026-11-08

- Bump the acciones group with 4 updates
- Deps: bump typescript from 6.0.3 to 7.0.2
- Deps: bump @types/node from 24.19.2 to 26.6.6
- Update dependabot settings and upgrade firebase-app-kit

## [v0.3.0] - 2026-11-08

- "¿Cómo se dice?" answers inside the app: under "Traducción", the first search engine of your
  order answers, and "Ver también en" shows the others. Engines: Wiktionary (free dictionary,
  no key), the AI with your own key (full entry with meanings, examples, register and region;
  only on Enter or a tap), MyMemory (sentences) and Chrome's on-device translator where
  available.
- "Ajustes" › "Motores de búsqueda": order the engines (saved on this device). Wiktionary
  answers first by default.
- WordReference, Reverso Context and Google Translate are now folded under "Más diccionarios".

## [v0.2.1] - 2026-11-08

- Fixes for "Escuchar" (Listen) on phones: the app no longer cancels the speech engine right before
  speaking (Safari and Chrome on Android dropped the new word), resumes it if Android left it
  paused, and keeps the utterance alive while it plays. Tapping again quickly only plays the
  last word.
- Better voices: Apple's novelty voices (Bells, Bad News, Albert...) are never used, and older
  or character voices (Fred, Eddy, Grandma...) only when there is nothing else.
- "Pronunciar" reminds you to turn the volume up and, on iPhone, the silent mode off.

## [v0.2.0] - 2026-11-08

- New bottom bar with four tabs: "Buscar", "Aprender" (the four content sections, now with a
  back link), "Pronunciar" and "Asistente"; "Ajustes" (Settings) is the gear in the header.
- "Escuchar" (Listen) buttons on every word, expression and example, with the device voice and
  the accent chosen in "Ajustes" (British or American English, Spain or Mexico Spanish).
- "Pronunciar": minimal pairs to listen and choose (20 in English, 9 in Spanish) and to say
  aloud, checked with speech recognition; free practice with any sentence, also slowly.
- "Buscar": IPA and recordings by accent for single English words (Free Dictionary API);
  "Pegar" (Paste) from the clipboard; "Foto" (Photo) reads the text in a picture with the AI;
  text shared from other apps on Android ("Compartir" › Labia) goes straight to the search.
- "Asistente", with your own AI key (Gemini, OpenAI or Claude): "Punta de la lengua" finds a
  word from its description and "¿Suena natural?" reviews a sentence with alternatives.
- AI keys are set up in "Ajustes" with firebase-app-kit's shared panel, in
  `users/{uid}/settings/ai` (new Firestore rules).

## [v0.1.0] - 2026-11-08

- First version: sign-in with a Firebase account and the direction picker ("De" / "A") saved
  per user, for Spanish ↔ English.
- "¿Cómo se dice?" (How do you say it?) searches Labia's own content and links the query to
  WordReference, Reverso Context and Google Translate.
- "Expresiones" (Idioms): 45 idioms with their real equivalent, literal translation, register
  and region.
- "Falsos amigos" (False friends): 40 look-alike words, also flagged as a warning in the search.
- "Diferencias" (Differences): 15 sets of confusing words (make/do, ser/estar...) with a rule,
  examples and a mini quiz.
- "Phrasal verbs": 58 phrasal verbs, searchable in English or by their Spanish meaning, and
  browsable by verb and particle.
- Login, "Acerca de" (About) and the sync status come from firebase-app-kit's shared UI.
- Installable PWA that opens offline.

[v0.5.1]: https://github.com/luiz1919/labia-app/compare/v0.5.0...v0.5.1
[v0.5.0]: https://github.com/luiz1919/labia-app/compare/v0.4.1...v0.5.0
[v0.4.1]: https://github.com/luiz1919/labia-app/compare/v0.4.0...v0.4.1
[v0.4.0]: https://github.com/luiz1919/labia-app/compare/v0.3.1...v0.4.0
[v0.3.1]: https://github.com/luiz1919/labia-app/compare/v0.3.0...v0.3.1
[v0.3.0]: https://github.com/luiz1919/labia-app/compare/v0.2.1...v0.3.0
[v0.2.1]: https://github.com/luiz1919/labia-app/compare/v0.1.0...v0.2.1
[v0.2.0]: https://github.com/luiz1919/labia-app/compare/v0.1.0...v0.2.0
[v0.1.0]: https://github.com/luiz1919/labia-app/releases/tag/v0.1.0
