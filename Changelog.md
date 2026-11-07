# Changelog

Changes to Labia, newest first. Each published version has a git tag `vX.Y.Z`, created by
`npm run deploy` (see `README-COMMANDS.md`).

`npm run deploy` adds each new version here on its own (in a `docs(changelog): vX.Y.Z` commit):
it lists the entries written under **Unreleased**, if there are any, or otherwise the messages of
the commits since the previous tag. Write descriptive commit messages, or write the entries under
Unreleased by hand when you want them clearer.

## Unreleased

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
