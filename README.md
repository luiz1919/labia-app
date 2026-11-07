# Labia

Pocket language app (PWA) to look up idioms, verbs and words from your phone. It starts with
Spanish ↔ English and is built so more languages can be added later.

The name comes from the Spanish *tener labia*: having the gift of the gab.

Same technical base as TripPlanner and CommunityAssistant: React, TypeScript, Vite, Firebase
(Auth, Firestore, Hosting) and [firebase-app-kit](https://github.com/luiz1919/firebase-app-kit).

The app's UI is in Spanish. This README quotes UI labels exactly as they appear, with an
English translation the first time.

## What it does

Every screen shares the direction picker at the top: "De" (From) and "A" (To), with a button to
swap them. The direction is saved per user in Firestore, so it is the same on every device;
offline, the change is kept on the device and uploaded later. The bottom bar switches between:

- **"Buscar" (Search), "¿Cómo se dice?" (How do you say it?)**: type a word, a verb or an
  expression. The app searches its own content (false friends first, as a warning, then idioms,
  phrasal verbs and differences) and links the query to WordReference, Reverso Context and
  "Google Traductor" (Google Translate), opened in a new tab. These are plain links: no API, no
  keys and no scraping.
- **"Expresiones" (Idioms)**: the real equivalent in the other language, not the literal
  translation. Each one shows the meaning, the equivalents with their word-for-word translation
  ("Literalmente"), the register ("Coloquial" informal, "Vulgar", "Formal"), the region (Spain,
  Latin America, UK, US) and an example.
- **"Falsos amigos" (False friends)**: words that look alike but mean something else (*actually*
  ≠ *actualmente*), with what each one really means and examples. Searching one of them in
  "Buscar" shows the warning too.
- **"Diferencias" (Differences)**: words that are easy to mix up (*make/do*, *say/tell*,
  *since/for*, ser/estar, por/para...): the short rule, examples and a mini quiz ("Ponte a
  prueba", test yourself). The language you translate into comes first. Searching the word
  that leads to them also finds them ("hacer" → make / do).
- **"Phrasal verbs"**: searchable in English (*get over*) or by their meaning (superar), and
  browsable by verb and by particle. Each meaning says whether the object can go in the middle
  ("Separable": *turn it off*).

The section is in the URL (`#/expresiones`), so the phone's back button works. The app is an
installable PWA that opens offline, and all this content works offline too (only the external
links need a connection).

Feature ideas and possible data sources are in [docs/ideas.md](docs/ideas.md).

## Content

The content is curated and bundled with the app, in typed TypeScript modules under
[src/data/](src/data/) (the shapes are in [src/data/types.ts](src/data/types.ts)):

| File | Content |
|------|---------|
| `idioms.ts` | One entry per idea, with its expressions in each language (`lang`, `text`, `literal`, `register`, `regions`, `keywords` for other forms to search) |
| `falseFriends.ts` | Pairs of look-alike words, each with what it really means in the other language and an example |
| `confusables.ts` | Sets of confusing words in one language: rule, one usage per word with examples, quiz, and `hints` (words in other languages that lead to the set) |
| `phrasalVerbs.ts` | English phrasal verbs, each meaning with its translations, object behaviour and example |

Explanations for the user (meanings, rules, notes) are in Spanish, the UI language. Every other
text says which language it is in, so a new language only needs new entries, not new types.

To add content, add entries to those files and run `npm test`: `tests/content.test.ts` checks
unique ids, both languages present, regions that match their language, quiz answers that are
one of the set's words, examples with their translation, and so on. Search logic (accents,
case and punctuation ignored, a leading "to " dropped, `keywords`) is in
[src/search.ts](src/search.ts).

## Languages and sources

Everything language-specific is configuration, so adding a language does not touch the screens:

- [src/languages.ts](src/languages.ts): `LANGUAGES`, the list of languages (ISO 639 code and
  Spanish name). The pair can never have the same language on both sides.
- [src/sources.ts](src/sources.ts): `LINK_SOURCES`, the sites a query links to. Each source
  builds the link for a pair, or returns `null` if the site does not support that pair, and
  then it is not shown.

To add French, for example:

1. Add `{ code: 'fr', name: 'Francés' }` to `LANGUAGES`, and the French regions you need to
   `Region` in `src/data/types.ts`.
2. In `src/sources.ts`, add the pairs WordReference supports (`'esfr'`, `'fres'`, `'enfr'`,
   `'fren'`) and `fr: 'french'` to the Reverso names. Google Translate takes any code.
3. Add French expressions, false friends and sets to `src/data/`. Each screen only shows what
   exists for the chosen pair (phrasal verbs only when English is one side).
4. Update the tests in `tests/` that list the languages.

The Firestore rules accept any well-formed code (two or three lowercase letters), so a new
language does not need new rules.

## Data in Firestore

| Document | Content |
|----------|---------|
| `users/{uid}` | `{ sourceLanguage, targetLanguage }`: the user's last direction |

Everything else is denied by [firestore.rules](firestore.rules). New collections (a notebook
of saved lookups, for example) need their own rules and tests.

## Access

Access requires a Firebase Authentication account with email and password. Accounts cannot be
registered from the app.

1. Enable Email/Password in Firebase Console > Authentication > Sign-in method.
2. Create the authorized accounts in Authentication > Users > Add user.
3. Sign in to the app with those credentials.

The session is restored on reload and can be closed from the header. The app does not store
passwords: session persistence is handled by Firebase. This UI lock does not replace the
Firestore rules.

## Development

Use Node 22.18 or later (the tests run TypeScript directly).

```sh
npm install
npm run dev
```

From firebase-app-kit come the deploy, the Firebase startup, the service worker, the "Acerca
de" (About) build data and the shared UI: the login form, "Acerca de" and the sync status
(`firebase-app-kit/ui`, themed with the `--kit-*` variables in `src/index.css`). It is
installed from GitHub (`github:luiz1919/firebase-app-kit#vX.Y.Z`): while that repo is private,
`npm install` and `npm ci` need access to it through your git credentials.

```sh
npm run lint
npm test             # unit tests (content, search, languages, sources, screens), no Firebase
npm run test:rules   # Firestore rules in the local emulator (needs Java and the Firebase CLI)
npm run build
npm run preview
```

## Firebase

Project: `labia-app-6636b` (https://labia-app-6636b.web.app). The web config goes in a file
named `firebaseConfig` at the root of this folder: the snippet with
`const firebaseConfig = { ... }` from Project settings > Your apps. Vite only reads its values.
The file is ignored by Git, so a new machine needs a copy of it (or `.env.local` created from
`.env.example`; these variables take precedence over the file). Restart Vite after changing it.

Before the first use, in the console:

1. Authentication > Sign-in method: enable Email/Password, and add your user (see
   [Access](#access)).
2. Publish the Firestore rules (the deploy does not publish them):

   ```sh
   firebase deploy --config firebase.json --only firestore:rules --project labia-app-6636b
   ```

No `.firebaserc` is included: always pass the project explicitly to the Firebase CLI. `VITE_*`
variables are bundled into the client: do not store secrets in them.

## Publishing

```sh
npm run deploy                 # asks for the change type: 1=PATCH, 2=MINOR, 3=MAJOR
npm run deploy -- --minor      # without asking
npm run deploy -- --check      # validates (lint, tests, build) without publishing
```

Commit your changes first: the script refuses to start with uncommitted changes. It is the
shared release flow from firebase-app-kit: checks git, runs `npm ci`, checks that the Firebase
config belongs to `labia-app-6636b`, runs lint and tests, adds the version to
[Changelog.md](Changelog.md), creates the release commit and tag `vX.Y.Z`, builds, publishes
**Hosting only** and pushes the commits and the tag. If the build or the publish fails, the
release is undone. Details, including the one-time setup before the first release, in
[README-COMMANDS.md](README-COMMANDS.md).

## PWA

Custom manifest and icons ([public/icons/labia.svg](public/icons/labia.svg); the PNGs are
renders of it). The service worker (`/sw.js`) is generated at build time by firebase-app-kit
and registered only in production:

- On install it stores the app, its `/assets/` files and the static files listed in
  `vite.config.ts`, so the app opens offline from the first visit.
- Every online visit refreshes that copy and deletes the files of previous versions.
- It does not store responses from Firebase or other domains.

To discard everything stored by older versions, change `cacheName` in `vite.config.ts`. There
is no `public/sw.js`: the build fails if one is added.

## Continuous integration

[.github/workflows/checks.yml](.github/workflows/checks.yml) runs lint, unit tests, the build
and the rules tests (in the emulator) on every push to `main` and every pull request. It never
deploys. While firebase-app-kit is private, it needs the `FIREBASE_APP_KIT_TOKEN` secret (see
[README-COMMANDS.md](README-COMMANDS.md#continuous-integration)).
