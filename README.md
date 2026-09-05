# Learn Japanese by Drawing (日本語を描いて学ぶ)

Learn Japanese vocabulary by **drawing each character stroke by stroke**.
For every word you **hear** it, **write** it with live stroke-order feedback,
and **say** it out loud and get a pronunciation check. When all three are done
the word is complete, and completed words build a daily streak.

Everything runs in your browser. There is no account, no server and no database.

---

## Contents

- [How it works](#how-it-works)
- [Features](#features)
- [Japanese terminology](#japanese-terminology)
- [How the scoring works](#how-the-scoring-works)
- [How the pronunciation check works](#how-the-pronunciation-check-works)
- [Daily streak](#daily-streak)
- [Guided tour](#guided-tour)
- [Getting started](#getting-started)
- [Project structure](#project-structure)
- [Tech stack](#tech-stack)
- [Adding or editing words](#adding-or-editing-words)
- [Data and storage](#data-and-storage)
- [Testing](#testing)
- [Browser support and limitations](#browser-support-and-limitations)
- [Privacy](#privacy)
- [License and credits](#license-and-credits)

---

## How it works

1. **Home.** Pick a session length with the slider (10, 20, 30 … words) and press
   **Start Practice**.
2. **Practice.** Each word is shown with its kanji/kana form, its reading in
   kana, its romaji and its English meaning. A word is **complete** only after
   three actions:

   | Action | Japanese | What you do | When it counts |
   | --- | --- | --- | --- |
   | **Heard** | 聞く (kiku) | Press the speaker button to hear the word | As soon as playback starts |
   | **Written** | 書く (kaku) | Press **Learn to draw** and trace every stroke of every character | When the last stroke of the last character is accepted |
   | **Pronounced** | 話す (hanasu) | Press **Speak** and say the word | When what you said matches the word's reading |

   Three badges under the word show which of the three you have done.
3. **Celebrate.** When the third action is done you get confetti and a
   "Word complete!" message, once per word, and the day's streak is updated.
4. **Streak.** The flame button opens a GitHub-style graph of the words you
   completed each day.

You can leave and come back at any time: progress is saved, and reloading the
practice page resumes at the first word you have not finished yet.

---

## Features

### Practice

- **Stroke-order preview.** *Preview stroke order* animates every character
  one stroke at a time, in the correct order, then hides itself shortly after it
  finishes. Each character's meaning is shown (for example 朝 "Morning",
  飯 "Rice / meal").
- **Draw-along practice.** *Learn to draw* shows the current stroke as an orange
  dashed guide with a start arrow, strokes you already drew in dark ink, and the
  strokes still to come as a grey ghost. You trace with mouse, touch or stylus.
  - A live score (0 to 100 %) is shown as you draw.
  - A stroke is accepted at **90 % or more**. Anything lower shows
    "Try again (n)" and lets you redraw it.
  - *Undo* removes your last drawn point, *Clear* removes the whole attempt.
  - Words with several characters are drawn character by character, with
    *Redraw* and *Next character* buttons between them.
  - Short sounds tell you when a stroke is accepted, rejected, when a character
    is finished and when the whole word is finished.
- **Listen anytime.** The speaker button reads the word aloud using your
  browser's Japanese voice, with an animated soundwave while it plays.
- **Speaking practice.** *Speak* listens to you with your browser's speech
  recognition and shows a color-coded comparison of what you should have said
  and what it heard, sound by sound (see
  [pronunciation check](#how-the-pronunciation-check-works)).
- **Homophone hints.** If another word in the list sounds the same
  (in the current list, 日 "sun / day" and 火 "fire" are both "hi"), the practice page tells you so, because
  speech recognition cannot tell homophones apart.
- **Keyboard shortcuts.** `←` goes to the previous word and `→` to the next.
  On the last word `→` opens the restart dialog.

### Progress and motivation

- **Per-word progress** saved in your browser (heard, written, pronounced).
- **Daily streak graph** with month and weekday labels, tooltips, and
  accessible labels.
- **Finish line.** On the last word, once it is complete, two buttons unlock:
  - **Screenshot** saves a PNG of your streak page (`japanese-streak-YYYY-MM-DD.png`).
  - **Restart** asks for confirmation, then clears all progress and the streak
    so you can start over.

### Look and feel

- Light and dark mode.
- Optional background photos (Japanese scenery) with a preview in Settings.
- Smooth page transitions (the browser's View Transitions API where available)
  and small synthesized sound effects. All sounds are generated in code, there
  are no audio files.
- A short [guided tour](#guided-tour) on your first visit.

### Settings

Open the gear button in the top-right corner:

- **Dark mode** on or off.
- **Daily streak** on or off. When off, completions are not counted and the
  streak page explains how to turn it back on.
- **Background image** on or off, and which photo.
- **Clear all progress.**
- **About & credits**, with attributions and a privacy note.

---

## Japanese terminology

The words below are used in the app and in the code comments.

### Writing systems

| Term | Japanese | Meaning |
| --- | --- | --- |
| **Kanji** | 漢字 | Characters borrowed from Chinese. Each stands for a meaning (朝 "morning", 飯 "rice / meal"). |
| **Hiragana** | ひらがな | Phonetic syllabary used for native words, grammar and word endings (あさ, ごはん). |
| **Katakana** | カタカナ | Phonetic syllabary used mostly for foreign loanwords and names (コーヒー "coffee"). |
| **Kana** | 仮名 | Collective name for hiragana and katakana. The app stores each word's reading in kana. |
| **Okurigana** | 送り仮名 | Hiragana written after a kanji to complete a word or show how it is inflected (the ご in 朝ご飯). |
| **Romaji** | ローマ字 | Japanese written with the Latin alphabet (asagohan). Used so beginners can compare sounds. |

### Writing characters

| Term | Japanese | Meaning |
| --- | --- | --- |
| **Stroke order** | 筆順 (hitsujun) | The fixed order in which the strokes of a character are written. Learning it makes handwriting faster and more readable. |
| **Stroke** | 画 (kaku) | One continuous pen movement. A character's **stroke count** is its 画数 (kakusū). |

### Sounds

| Term | Japanese | Meaning |
| --- | --- | --- |
| **Mora** | 拍 / モーラ (haku / mōra) | The rhythmic unit of Japanese speech. Each kana is one mora, including small っ and ん. The pronunciation check compares morae, not letters. |
| **Yōon** | 拗音 | A contracted sound made of a kana plus a small ゃ, ゅ or ょ (きゃ "kya", ちゃ "cha"). |
| **Sokuon** | 促音 | The small っ. It marks a short pause and doubles the next consonant (まっちゃ "matcha"). |
| **Chōon** | 長音 | A long vowel, held for two morae. Written with ー in katakana (コーヒー "kōhī") or with extra vowels in hiragana. |
| **Dakuten** | 濁点 (゛) | The voicing mark: か "ka" → が "ga", は "ha" → ば "ba". |
| **Handakuten** | 半濁点 (゜) | The "p" mark: は "ha" → ぱ "pa". |
| **Homophone** | 同音異義語 (dōon igigo) | Different words that sound the same, such as 日 and 火 (both "hi"). |

### Words used in the interface

| Word | Reading | Meaning |
| --- | --- | --- |
| こんにちは | konnichiwa | Hello (shown on the home screen). |
| 朝ご飯 | asagohan | Breakfast, the first word in the list. |

> **A note on okurigana.** Some words are spelled with hiragana where a
> dictionary would use kanji (友だち instead of 友達) because fewer strokes make
> them easier for beginners to draw. Speech recognition often returns the
> all-kanji spelling, so the app keeps a list of kanji readings
> (`KANJI_READINGS`) to match both.

---

## How the scoring works

The stroke data comes from [KanjiVG](https://kanjivg.tagaini.net): every stroke
of a character is a vector path in a 109 × 109 square. When you finish a stroke
(lift the pen) your trace is compared to the correct path:

1. **Coverage (ordered).** The correct path is sampled into evenly spaced points
   (up to 40; fewer for short strokes). Walking along those points in order,
   each one counts as covered if your trace passes within **9 units** of it,
   *after* the point you matched before. Drawing a stroke backwards, or only
   half of it, therefore scores low.
2. **Precision.** The share of your own points that lie within 9 units of the
   correct path. Scribbling everywhere scores low.
3. **Score.** `round(100 × coverage × precision)`.
4. **Accept.** 90 or more accepts the stroke. Taps and tiny movements (fewer
   than 3 points, or shorter than 3 units) are ignored rather than counted as
   a miss.

The constants live in `src/lib/draw/config.ts` and can be tuned.

---

## How the pronunciation check works

1. **Speak.** The browser's Web Speech API (`ja-JP`) returns a transcript.
2. **Resolve.** Recognizers often return kanji (朝ご飯, 水), which cannot be
   compared by sound. The app replaces known words with their kana reading
   (朝ご飯 → あさごはん), longest match first, then single kanji from a
   reading table (朝 → あさ).
3. **Normalize.** Full-width characters are folded to normal ones and katakana is
   converted to hiragana, so コーヒー and こーひー are treated the same.
4. **Split into morae.** The text is turned into sound units with romaji:
   kana plus small kana are merged (きゃ → kya), small っ doubles the next
   consonant, ー repeats the previous vowel, ん becomes "n". Anything the app
   cannot read becomes "?" so you can see something was heard.
5. **Diff.** The expected and heard morae are compared with a longest-common-
   subsequence diff, so a whole sound is compared at a time. Missing or wrong
   sounds are shown in red on the *Expected* side and extra or wrong sounds in
   green on the *You said* side.
6. **Complete.** If what you said resolves exactly to the word's reading, the
   word's *Pronounced* badge turns on.

---

## Daily streak

- Each word that becomes complete adds one to **that day's count** (local time).
- The graph colors each day by how many words were completed:

  | Words that day | Level |
  | --- | --- |
  | 0 | empty |
  | 1 to 2 | light |
  | 3 to 5 | medium |
  | 6 or more | darkest |
- The **current streak** is the number of consecutive days with at least one
  completed word, counted back from today. If you have not practiced yet today,
  the streak still counts back from yesterday, so it is not lost until the day
  ends.
- The streak can be switched off in Settings.

---

## Guided tour

First-time visitors get a short tour of each page:

- **Home:** session length and the start button.
- **Practice:** preview, draw, speak, word navigation, listen, settings and
  streak.

Finishing the home tour continues into the practice tour; skipping it skips
both. A `?` button under the streak button replays the tour for the current
page. Tours are defined per route in `src/components/AppTour/tours.ts`, where
each step points at a `data-tour="…"` attribute. Whether a tour has been seen
is remembered in your browser. To show a tour to everyone again after editing
it, change its `id` (for example `home-v1` → `home-v2`).

---

## Getting started

Requires **Node.js 20.9 or newer**.

```bash
git clone <your-repo-url>
cd learn-japanese-by-drawing
npm install
npm run dev        # http://localhost:3000
```

| Script | What it does |
| --- | --- |
| `npm run dev` | Start the development server |
| `npm run build` | Production build (needs internet for Google Fonts) |
| `npm start` | Serve the production build |
| `npm test` | Run the test suite once (Vitest) |
| `npm run test:watch` | Run tests in watch mode |
| `npm run lint` | Lint with ESLint |

Open the app in a browser with speech support (see
[Browser support](#browser-support-and-limitations)) and allow microphone access
the first time you press **Speak**.

---

## Project structure

```
src/
├── app/                      Pages and layout (Next.js App Router)
│   ├── page.tsx              Home: session length + start
│   ├── practice/page.tsx     Practice: preview, draw, speak, listen
│   ├── streak/page.tsx       Streak graph + screenshot
│   ├── layout.tsx            Root layout
│   └── layout-client.tsx     Theme, settings button, streak button, tour
├── components/
│   ├── AppTour/              Guided tour (per-route steps, replay button)
│   ├── StrokeDrawing/        Draw-along canvas with scoring
│   ├── StrokePreview/        Animated stroke order + KanjiVG attribution
│   ├── PronunciationDiff/    Expected vs. heard comparison
│   ├── PracticeStatus/       Heard / Written / Pronounced badges
│   ├── DailyStreakGraph/     GitHub-style calendar graph
│   ├── Soundwave/            Animated bars while speaking or listening
│   ├── Background/           Optional background photo
│   ├── settings/             Settings modal and credits
│   └── ui/                   shadcn/ui primitives (button, dialog, slider)
├── hooks/
│   ├── useCompletedWords/    Per-word progress (localStorage)
│   ├── useDailyStreak/       Per-day completion counts and streak
│   ├── useKanjiStrokes/      Loads stroke data for the current characters
│   ├── useSpeechRecognition/ Web Speech API wrapper
│   ├── useTourSeen/          Remembers which tours were seen
│   ├── useConfetti/          Celebration effect
│   └── useViewTransition/    Animated page navigation
├── lib/
│   ├── draw/                 Geometry and stroke scoring
│   ├── kanjivg.ts            Fetches and parses KanjiVG stroke paths
│   ├── romaji.ts             Kana → morae/romaji, kanji reading table
│   ├── diff.ts               Longest-common-subsequence diff
│   ├── speech.ts             Text-to-speech helper
│   ├── audio.ts              Synthesized sound effects
│   └── streak/               Dates, grid building, levels, streak math
├── data/
│   ├── words.ts              The 100-word list
│   └── background-images.ts  Background photo options
├── contexts/SettingsContext  Settings store (theme-safe for SSR)
└── types/dictionary.ts       The Word type
```

Notes for contributors:

- Hooks and components each live in their own folder with an `index.ts` and a
  colocated `*.test.ts(x)` file.
- Anything that reads `localStorage` or browser-only APIs renders a safe default
  on the server and the real value after mount, to avoid hydration mismatches.

---

## Tech stack

- [Next.js](https://nextjs.org) 16 (App Router) and [React](https://react.dev) 19
- TypeScript
- [Tailwind CSS](https://tailwindcss.com) 4, [shadcn/ui](https://ui.shadcn.com)
  and [Base UI](https://base-ui.com), icons from [Lucide](https://lucide.dev)
- [next-themes](https://github.com/pacocoursey/next-themes) for dark mode
- [react-joyride](https://react-joyride.com) for the guided tour
- [svg-path-properties](https://github.com/rveciana/svg-path-properties) to
  measure and sample stroke paths
- [canvas-confetti](https://github.com/catdad/canvas-confetti),
  [sonner](https://sonner.emilkowal.ski) (toasts) and
  [modern-screenshot](https://github.com/qq15725/modern-screenshot)
- [Vitest](https://vitest.dev), Testing Library and jsdom for tests

---

## Adding or editing words

Words live in `src/data/words.ts`:

```ts
{
  id: "breakfast",                       // unique, stable (progress is saved by id)
  text: "朝ご飯",                         // how it is written
  kana: "あさごはん",                      // reading in hiragana (this is what "Speak" must match)
  romaji: "asagohan",                    // Latin spelling (also used to find homophones)
  meaning: "Breakfast",                  // English meaning
  characters: ["朝", "ご", "飯"],         // one entry per character to draw, in order
  characterMeanings: ["Morning", "Honorific prefix", "Rice / meal"]  // optional, parallel to characters
}
```

Checklist:

1. Use a **new, unique `id`**. Changing an existing id resets that word's
   progress for everyone.
2. Each entry of `characters` must be a **single character** that exists in
   KanjiVG (kanji, hiragana and katakana are all covered).
3. If the word uses okurigana or has an alternate spelling, add the all-kanji
   form to `KANJI_READINGS` in `src/lib/romaji.ts` so speech recognition results
   resolve to the right reading.
4. Words with the same `romaji` are flagged as **homophones** automatically.
5. Run `npm test`. The practice page snapshot will change if the list changes.

---

## Data and storage

All data stays in the browser's `localStorage`:

| Key | Contents |
| --- | --- |
| `learn-japanese:completed-words` | Per word: heard, written, pronounced, celebrated |
| `learn-japanese:daily-streak` | Date (`YYYY-MM-DD`) → number of words completed |
| `learn-japanese:settings` | Background image and streak on/off |
| `learn-japanese:tour:<id>` | Which guided tours have been seen |

The theme is stored by `next-themes`. Clearing site data resets everything.
Progress does not sync between browsers or devices.

---

## Testing

```bash
npm test
```

About 245 tests cover the stroke scoring and geometry, romaji conversion and the
diff, the streak math and grid, all hooks, the drawing, preview, soundwave and
settings components, page snapshots, and the guided tour (definitions,
persistence, chaining, replay). The tour's tests also check that every
`data-tour` target still exists in the app.

---

## Browser support and limitations

- **Speech recognition** needs a browser that supports the Web Speech API:
  Chrome, Edge and Safari work; **Firefox does not**. The app shows a message
  where it is unsupported, and you can still hear words and draw.
- **Stroke data is fetched online** from the KanjiVG repository the first time
  a character is shown, so previews and drawing need an internet connection.
- **Background photos** are loaded from Pexels.
- Recognition accuracy depends on the browser, your microphone and the word.
  Short words and homophones are the hardest.
- Progress is local to one browser. There are no accounts or sync.
- The word list has 100 beginner words.

---

## Privacy

- No account, analytics or tracking. Progress and settings never leave your
  browser.
- **Speech recognition is performed by your browser.** In Chrome and Edge the
  audio is sent to the browser vendor's online service for transcription.
- Stroke data and background photos are requested from GitHub and Pexels, which
  can see ordinary request information such as your IP address.

---

## License and credits

The source code is released under the [MIT License](LICENSE).

Third-party material is **not** covered by that license:

- **Stroke-order data:** [KanjiVG](https://kanjivg.tagaini.net) © Ulrich Apel,
  licensed under [CC BY-SA 3.0](https://creativecommons.org/licenses/by-sa/3.0/).
  The data is fetched at runtime from the KanjiVG repository and is not
  included in this repository. Strokes are animated and used for scoring, not
  otherwise changed. Please keep the data out of this repository.
- **Background photos:** from [Pexels](https://www.pexels.com), used under the
  [Pexels license](https://www.pexels.com/license/) and loaded from Pexels.
- **Font:** [Geist](https://vercel.com/font), SIL Open Font License 1.1.
- Built with [Next.js](https://nextjs.org), [React](https://react.dev),
  [Tailwind CSS](https://tailwindcss.com), [shadcn/ui](https://ui.shadcn.com),
  [React Joyride](https://react-joyride.com) and other open-source libraries
  under their own licenses.