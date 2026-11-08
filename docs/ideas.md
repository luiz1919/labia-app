# Feature ideas and data sources

Brainstorm from 2026-11-07: what people search for most about languages, plus some original
ideas. Nothing here is decided; pick a few for each version. Examples are Spanish ↔ English.

## Features

Done: 1 to 4 in v0.1.0 (screens "Expresiones", "Falsos amigos", "Diferencias" and "Phrasal
verbs", all searchable from "Buscar"); 6 to 9 after it ("Pronunciar", "Asistente", and "Pegar",
"Foto" and the share target in "Buscar"). Pending: 5 (conjugator) and 10 (notebook).

1. **Idioms: the real equivalent, not the literal translation.** "Estar en las nubes" →
   *to have your head in the clouds*; "costar un ojo de la cara" → *to cost an arm and a leg*.
   Show the literal translation too (it helps remember it), the register (informal, vulgar) and
   the region (UK/US, Spain/Latin America). Machine translators fail exactly here.
2. **False friends with an automatic warning.** Looking up *actually*, *embarrassed*,
   *constipated* or *carpet* shows "careful, it does not mean what you think".
3. **"What is the difference between X and Y?"** Confusing pairs: *make/do*, *say/tell*,
   *since/for*, *borrow/lend*, ser/estar, por/para. Short rule, three examples, a mini quiz.
4. **Phrasal verbs, both ways.** Direct (*get over* → superar) and reverse ("I want to say
   *superar*" → *get over*, *overcome*). Browse by verb (*get up/by/over/away*) or by particle.
5. **Conjugator with "when is it used".** English irregular verbs and the Spanish subjunctive,
   with its triggers ("after *ojalá* comes the subjunctive"). Should work offline.
6. **Real pronunciation.** IPA, audio with the phone's own voices (Web Speech API, free),
   minimal pairs (*ship/sheep*), and "record and compare" with the browser's speech recognition.
7. **"On the tip of my tongue".** Describe the word ("the thing you put under the door so the
   draught does not come in") and get it. Needs an LLM.
8. **"Does it sound natural?"** Paste a sentence: would a native say it like that, is it formal
   or informal, alternatives. Needs an LLM.
9. **Look up from anywhere.** Select text in any app > Share > Labia (Web Share Target API, works
   for PWAs on Android). Also the camera with text recognition (OCR) for signs and menus.
10. **Automatic notebook with spaced repetition.** Every lookup is saved; flashcards with a
    spaced repetition algorithm (FSRS or SM-2); the "word of the day" comes from your history.

Extras: slang and regional variants ("guay" in the UK, the US and Mexico); offline phrase kits by
situation (doctor, airport, job interview); real example sentences from Tatoeba.

## Data sources

| Source | Cost | Notes |
|--------|------|-------|
| WordReference | Free (links) | No official public API. [fega/wordreference-api](https://github.com/fega/wordreference-api) scrapes the website: it breaks when the site changes, goes against its terms and cannot run in the browser (CORS), so it would need a backend. The app links to it instead. |
| Google Cloud Translation | ~500,000 characters/month free | Needs a billing account (card). Good for sentences, bad for idioms. |
| DeepL API Free | 500,000 characters/month | Usually better quality for Spanish ↔ English. |
| Wiktionary (kaikki.org / Wiktextract JSON dumps) | Free, CC BY-SA | IPA, conjugations, translations and idioms in many languages. Best base for adding languages; can be preloaded for offline use. |
| Tatoeba | Free, CC BY | Example sentences paired across languages. |
| Web Speech API | Free | Text to speech and speech recognition on the device (support varies by browser). |
| An LLM (for example Claude Haiku) | Pay per use | Only for ideas 7 and 8, always through a backend (Cloud Functions) so the key is never in the client. |

## Name

Labia, from *tener labia* (having the gift of the gab): short, fits under the home screen icon
and does not tie the app to one language. Other candidates were Chuleta, Dicho, Pico de oro,
Loro and "Cómo se dice".
