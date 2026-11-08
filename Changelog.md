# Changelog

Changes to Labia, newest first. Each published version has a git tag `vX.Y.Z`, created by
`npm run deploy` (see `README-COMMANDS.md`).

`npm run deploy` adds each new version here on its own (in a `docs(changelog): vX.Y.Z` commit):
it lists the entries written under **Unreleased**, if there are any, or otherwise the messages of
the commits since the previous tag. Write descriptive commit messages, or write the entries under
Unreleased by hand when you want them clearer.

## Unreleased

_Nothing yet._

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

[v0.2.1]: https://github.com/luiz1919/labia-app/compare/v0.1.0...v0.2.1
[v0.2.0]: https://github.com/luiz1919/labia-app/compare/v0.1.0...v0.2.0
[v0.1.0]: https://github.com/luiz1919/labia-app/releases/tag/v0.1.0
