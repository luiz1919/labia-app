# Labia

Pocket language app (PWA) to look up idioms, verbs and words from your phone. It starts with
Spanish ↔ English and is built so more languages can be added later.

The name comes from the Spanish *tener labia*: having the gift of the gab.

Same technical base as TripPlanner and CommunityAssistant: React, TypeScript, Vite, Firebase
(Auth, Firestore, Hosting) and [firebase-app-kit](https://github.com/luiz1919/firebase-app-kit).

The app's UI is in Spanish. This README quotes UI labels exactly as they appear, with an
English translation the first time.

## What it does

Every screen except "Ajustes" (Settings) shares the direction picker at the top: "De" (From)
and "A" (To), with a button to swap them. The direction is saved per user in Firestore, so it is
the same on every device; offline, the change is kept on the device and uploaded later. The
bottom bar has five tabs:

- **"Buscar" (Search), "¿Cómo se dice?" (How do you say it?)**: type a word, a verb or an
  expression. Labia's own content shows while typing (false friends first, as a warning, then
  idioms, phrasal verbs and differences). Under "Traducción" (Translation), the first search
  engine of the user's order answers inside the app, and "Ver también en" (See also in) asks
  the others (see [Search engines](#search-engines)). WordReference, Reverso Context and Google
  Translate stay as plain links, folded under "Más diccionarios" (More dictionaries). A single
  English word also gets its pronunciation: IPA and recordings by accent from the
  [Free Dictionary API](https://dictionaryapi.dev) (free, no key; recordings from Wikimedia
  Commons). Text can come from elsewhere:
  - "Pegar" (Paste): the clipboard.
  - "Foto" (Photo): the AI reads the text in a photo (a sign, a menu) and you pick the line to
    search. Needs an AI set up in "Ajustes".
  - "Compartir" (Share) › Labia from any app, with the PWA installed on Android (Web Share
    Target). iOS has no share target: use "Pegar" there.

  Every engine answer has a star: it saves the query, its direction and the first translations
  of that answer (up to 8) as a favorite; tapping it again removes it. "Favoritos"
  (Favorites), at the bottom of the screen, lists them with a filter (by the query or its
  translations, ignoring accents), "Recientes" (newest first) or "A–Z", the direction when it
  is not the current one, a listen button, and the star to remove one ("Deshacer", undo, for a
  few seconds). Tapping a favorite searches it again in its direction, as if sent with Enter.
  The answers in the "Despensa" have the same star.
- **"Aprender" (Learn)**: the bundled content, one tile per section (each one has a back link):
  - "Expresiones" (Idioms): the real equivalent in the other language, not the literal
    translation, with the meaning, the word-for-word translation ("Literalmente"), the register
    ("Coloquial" informal, "Vulgar", "Formal"), the region (Spain, Latin America, UK, US) and an
    example.
  - "Falsos amigos" (False friends): words that look alike but mean something else (*actually*
    ≠ *actualmente*), with what each one really means and examples.
  - "Diferencias" (Differences): words that are easy to mix up (*make/do*, ser/estar...), with
    the short rule, examples and a mini quiz ("Ponte a prueba", test yourself).
  - "Phrasal verbs": searchable in English (*get over*) or by their meaning (superar), and
    browsable by verb and by particle.
- **"Pronunciar" (Pronounce)**, in the language you translate into:
  - "Escucha y elige" (Listen and choose): minimal pairs (*ship/sheep*, pero/perro). The phone
    says one of the two words and you pick which; then the hint on how to make the sound, both
    words to compare, and "Ahora dilo tú" (Now you say it): the app listens and tells you which
    word it understood.
  - "Practica cualquier frase" (Practise any sentence): listen to any text, slowly too, and say
    it to check it.
- **"Despensa" (Pantry)**: words saved to look up later, in the "De" (From) language. Made for
  reading a book aloud and translating it on the fly with your hands busy:
  - "Manos libres" (Hands-free): one tap and the microphone keeps listening; saying the keyword
    and the word ("apunta zarzamora"; in English, "note bramble") saves it, with a beep and a
    vibration. Only what follows the keyword is saved, so reading aloud saves nothing. The
    keyword is in the language of the words (the one being read), while the reader mostly
    speaks the other one, so it rarely comes up by chance. "apunta… zarzamora" with a pause
    works too, and so do "apúntame", "anota", "la palabra…" and a leading article (dropped).
    The screen stays on while listening (Screen Wake Lock); recognition restarts on its own
    after each silence and when coming back to the app. It uses the browser's speech
    recognition: in Chrome the audio goes to Google's service, as with the keyboard microphone.
  - "Añadir una palabra" (Add a word): "Mantén pulsado y habla" (hold and speak) listens only
    while the button is held (touch, mouse, or Space/Enter) and shows the words live; on
    release it proposes what it understood, editable, with the recognizer's other guesses
    ("¿O era…?") and "Guardar" (Save) or "Descartar" (Discard). Pauses while holding are fine:
    the words add up. Disabled while "Manos libres" is on (one microphone at a time). Words can
    also be typed.
  - "Por consultar" (To look up): tap a word to see the answer of the first search engine of
    the user's order, open it in "Buscar", correct it (misheard words), delete it or tick it
    as looked up ("Consultadas", which can be emptied). Saving a word already there does not
    repeat it; if it had been looked up, it goes back to the list.
  - Installed on Android, a long press on the icon has a "Despensa" shortcut.
- **"Asistente" (Assistant)**, with the user's own AI key:
  - "Punta de la lengua" (Tip of the tongue): describe a word you cannot remember and get the
    most likely candidates, with translation, nuance and an example ("Buscar" opens it in the
    search).
  - "¿Suena natural?" (Does it sound natural?): a verdict on a sentence ("Suena natural",
    "Se entiende, pero no suena natural", "Tiene errores"), the most natural version, its
    register, why, and up to three alternatives with their nuance. It follows the accent chosen
    in "Ajustes" (British or American, Spain or Mexico).

Every word, expression and example has an "Escuchar" (Listen) button. "Ajustes" (the gear in
the header) holds the accent for each language (stored on the device, like the voices) and the
AI keys (stored in the account).

The section is in the URL (`#/expresiones`), so the phone's back button works. The app is an
installable PWA that opens offline, and the bundled content works offline too. The external
links, the recordings, speech recognition and the AI need a connection.

Feature ideas and possible data sources are in [docs/ideas.md](docs/ideas.md).

## Search engines

The engines of "¿Cómo se dice?" live in [src/engines/](src/engines/). The user orders them in
"Ajustes" › "Motores de búsqueda" (stored on the device, `localStorage` key `labia.engines`);
the first one that can answer does so for every search, and the rest appear as "Ver también en"
chips. All of them return the same shape (groups of translations with notes and examples), shown
by one card.

| Engine | What it gives | Cost and limits |
|--------|---------------|-----------------|
| Wiktionary (default first) | Translations by part of speech and meaning, set phrases, inflected forms, some examples. Into English: the REST definitions of the Spanish entry; from English: the translation tables of the English entry (its wikitext, including `/translations` subpages; unchecked tables skipped) | Free, no key, CORS. CC BY-SA: the card links to the page. Only when English is one of the two languages |
| IA (AI) | A full entry: one translation per meaning with part of speech, register, region and an example, plus notes (false friends, typical mistakes) | The user's own key; Gemini has a free tier. Only on Enter or a tap, never while typing |
| MyMemory | Sentence translation from translation memories; suggestions that agree win over its first one, which can be wrong | Free, no key, about 5,000 characters a day per device |
| Traductor de Chrome | On-device translation (Chrome's Translator API): private and offline once the language pack is downloaded (the first time needs a tap) | Free. Only in Chrome versions that ship it (desktop for now); hidden elsewhere |

Free engines answer after a short pause in typing (or right away with Enter); answers are cached
for the session.

## Voice and AI

- **Voice**: the browser's own Web Speech API, free and without keys ([src/speech.ts](src/speech.ts)).
  Text to speech picks the device voice that best matches the accent (same accent, then same
  language, installed voices first). Speech recognition exists in Chrome (Android and desktop)
  and Safari; Chrome sends the audio to its own service, so it needs a connection. Firefox has
  no recognition: the app hides the microphone buttons.
- **AI**: `firebase-app-kit/ai`, the same browser-side adapter as CommunityAssistant (Google
  Gemini, OpenAI or Anthropic Claude, with the user's own key; Gemini has a free tier). Keys
  and models are set up with the kit's `AiSettingsPanel` in "Ajustes" and stored in
  `users/{uid}/settings/ai`, the same shape (and path) as CommunityAssistant: only the owner can
  read it. Prompts, JSON schemas and the checks of each answer are in
  [src/assistant.ts](src/assistant.ts): every task asks for one JSON object (Claude gets the
  schema as structured output; Gemini and OpenAI get JSON mode and the shape in the prompt), and
  the user's text is sent inside a tag and declared as data. Claude runs at effort `low` for the
  tip of the tongue and the photo text, and at its default for "¿Suena natural?". Photos are
  shrunk to 1568 px and sent as JPEG ([src/image.ts](src/image.ts)).

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
- [src/sources.ts](src/sources.ts): `LINK_SOURCES`, the sites under "Más diccionarios". Each source
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
| `users/{uid}/settings/ai` | `{ providers: { gemini?, openai?, anthropic?: { apiKey, model, models } }, lastProvider, anthropicFallback }`: the user's AI keys (firebase-app-kit/ai shape) |
| `users/{uid}/favorites/{source}-{target}-{query}` | `{ term, source, target, translations, engine, createdAt }`: a starred search (the id is the direction plus the normalized, URL-encoded query, so the same search is one favorite on every device; up to 8 translations; `createdAt` is the server time of the last star) |
| `users/{uid}/pantry/{id}` | `{ text, lang, createdAt, reviewed }`: a word of the "Despensa" (up to 100 characters; `createdAt` set by the server, never changed) |

Everything else is denied by [firestore.rules](firestore.rules). The accents are not in
Firestore: they are stored on the device (`localStorage`, key `labia.accents`). New collections need
their own rules and tests.

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
npm test             # unit tests (content, search, speech, AI prompts, sharing...), no Firebase or network
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
