/**
 * Pronunciation check: turn what the user said into romaji and diff it against the
 * word they were asked to say, so the learner compares English letters, not kana/kanji.
 *
 * Workflow (practice page -> this file -> diff -> UI):
 *
 *  1. Speak     The "Speak" button calls useSpeechRecognition("ja-JP"), which wraps the
 *               browser's Web Speech API and exposes the recognized `transcript`.
 *  2. Resolve   resolveKnownWords(transcript, words) runs first. Recognizers often return
 *               kanji (朝ご飯, 水) that cannot be read without a dictionary, so we replace:
 *                 a. whole written forms from words.ts (朝ご飯 -> あさごはん), longest first;
 *                 b. single kanji / short kanji words from KANJI_READINGS (朝 -> あさ),
 *                    which catches mixed results like 朝ごはん.
 *  3. Normalize toMoras() starts by applying NFKC (full-width -> normal) and converting
 *               katakana to hiragana, so コーヒー and こーひー are treated the same.
 *  4. Split     The text is walked left to right and split into morae, the sound units
 *               Japanese is spoken in. Each mora is { key, romaji }:
 *                 - punctuation and whitespace are skipped;
 *                 - kana + small kana are merged (きゃ -> kya, ふぁ -> fa);
 *                 - っ doubles the next consonant (まっちゃ -> matcha);
 *                 - ー repeats the previous vowel, and う after an "o" sound becomes "o"
 *                   (long vowels, so こうひい and コーヒー both read "koohii");
 *                 - ん -> n;
 *                 - latin letters / digits are kept as they are;
 *                 - anything else (kanji we could not resolve) becomes "?" so the learner
 *                   sees that something was heard, without seeing Japanese characters.
 *  5. Diff      PronunciationDiff calls toMoras() on both the expected kana and the resolved
 *               transcript, then diffTokens() (lib/diff.ts) runs an LCS diff comparing the
 *               `key`s, so whole sounds are compared (shi vs si does not break a letter).
 *  6. Render    The diff is printed using each mora's `romaji`: missing/wrong sounds are red
 *               on the "Expected" side and extra/wrong sounds are green on "You said".
 *
 * Limits: unresolved kanji show as "?". When adding a word that uses a new kanji, add its
 * reading to KANJI_READINGS. Recognition quality itself depends on the browser.
 */

export type Mora = {
  /** Value used to compare two morae for equality. */
  key: string
  /** What the learner sees. */
  romaji: string
}

const ROWS: Array<[string, string]> = [
  ["あいうえお", "a i u e o"],
  ["かきくけこ", "ka ki ku ke ko"],
  ["さしすせそ", "sa shi su se so"],
  ["たちつてと", "ta chi tsu te to"],
  ["なにぬねの", "na ni nu ne no"],
  ["はひふへほ", "ha hi fu he ho"],
  ["まみむめも", "ma mi mu me mo"],
  ["やゆよ", "ya yu yo"],
  ["らりるれろ", "ra ri ru re ro"],
  ["わゐゑを", "wa i e o"],
  ["ん", "n"],
  ["がぎぐげご", "ga gi gu ge go"],
  ["ざじずぜぞ", "za ji zu ze zo"],
  ["だぢづでど", "da ji zu de do"],
  ["ばびぶべぼ", "ba bi bu be bo"],
  ["ぱぴぷぺぽ", "pa pi pu pe po"],
  ["ゔ", "vu"]
]

const BASE: Record<string, string> = {}
for (const [kana, romaji] of ROWS) {
  const parts = romaji.split(" ")
    ;[...kana].forEach((ch, i) => {
      BASE[ch] = parts[i]
    })
}

const SMALL_Y: Record<string, string> = { ゃ: "a", ゅ: "u", ょ: "o" }
const SMALL_V: Record<string, string> = { ぁ: "a", ぃ: "i", ぅ: "u", ぇ: "e", ぉ: "o" }
// Small kana that stand alone (not attached to a preceding kana).
const SMALL_ALONE: Record<string, string> = {
  ゃ: "ya",
  ゅ: "yu",
  ょ: "yo",
  ゎ: "wa",
  ぁ: "a",
  ぃ: "i",
  ぅ: "u",
  ぇ: "e",
  ぉ: "o"
}

const VOWELS = "aiueo"

/** Katakana -> hiragana (the prolonged sound mark ー is left alone). */
function toHiragana(text: string): string {
  return [...text]
    .map((ch) => {
      const c = ch.codePointAt(0)!
      return c >= 0x30a1 && c <= 0x30f6 ? String.fromCodePoint(c - 0x60) : ch
    })
    .join("")
}

/** Combine a base syllable with a following small kana (きゃ -> kya, ふぁ -> fa). */
function combine(base: string, small: string): string | null {
  const y = SMALL_Y[small]
  if (y) {
    if (!base.endsWith("i") || base.length < 2) return null
    const stem = base.slice(0, -1)
    return ["sh", "ch", "j"].includes(stem) ? stem + y : stem + "y" + y
  }
  const v = SMALL_V[small]
  if (v) {
    if (base === "u") return "w" + v
    if (base.length < 2) return null
    return base.slice(0, -1) + v
  }
  return null
}

/** Characters we ignore entirely: whitespace and punctuation (Japanese and ASCII). */
const IGNORED = /[\s\p{P}\p{S}]/u

/**
 * Convert Japanese text (hiragana, katakana, or a mix) into morae with romaji.
 * Anything that is not kana (leftover kanji, say) becomes a "?" mora so the diff
 * still shows that something was heard there, without displaying Japanese characters.
 */
export function toMoras(input: string): Mora[] {
  const chars = [...toHiragana(input.normalize("NFKC")).toLowerCase()]
  const out: Mora[] = []
  let geminate = false

  const push = (romaji: string, key = romaji) => {
    if (geminate) {
      geminate = false
      if (/^[^aiueon']/.test(romaji)) {
        romaji = romaji.startsWith("ch") ? "t" + romaji : romaji[0] + romaji
        key = romaji
      } else {
        out.push({ key: "t", romaji: "t" })
      }
    }
    out.push({ key, romaji })
  }

  for (let i = 0; i < chars.length; i++) {
    const ch = chars[i]
    if (IGNORED.test(ch) && ch !== "ー") continue

    if (ch === "っ") {
      if (geminate) out.push({ key: "t", romaji: "t" })
      geminate = true
      continue
    }

    if (ch === "ー") {
      const prev = out[out.length - 1]?.romaji.slice(-1) ?? ""
      push(VOWELS.includes(prev) ? prev : "-")
      continue
    }

    const base = BASE[ch]
    if (base) {
      const next = chars[i + 1]
      const merged = next ? combine(base, next) : null
      if (merged) {
        push(merged)
        i++
        continue
      }
      // Long-vowel spellings sound like the vowel repeated: おう -> oo.
      const prev = out[out.length - 1]?.romaji.slice(-1)
      if (ch === "う" && prev === "o") push("o")
      else push(base)
      continue
    }

    if (SMALL_ALONE[ch]) {
      push(SMALL_ALONE[ch])
      continue
    }

    if (/[a-z0-9]/.test(ch)) push(ch)
    else push("?", `?${ch}`)
  }

  if (geminate) out.push({ key: "t", romaji: "t" })
  return out
}

export function toRomaji(input: string): string {
  return toMoras(input)
    .map((m) => m.romaji)
    .join("")
}

/**
 * Speech recognizers usually return kanji for words they know (朝ご飯), which we can't
 * read without a dictionary. Swap any known written forms for their kana reading first.
 */
/**
 * Readings for single kanji used in the word list, so partly-kanji results such as
 * 朝ごはん still resolve. Add an entry here when you add a word that contains a new kanji.
 */
export const KANJI_READINGS: Record<string, string> = {
  朝: "あさ",
  飯: "はん",
  水: "みず",
  茶: "ちゃ",
  卵: "たまご",
  玉子: "たまご",
  魚: "さかな",
  牛乳: "ぎゅうにゅう",
  林檎: "りんご"
}

export function resolveKnownWords(
  text: string,
  lexicon: ReadonlyArray<{ text: string; kana: string }>
): string {
  let result = text
  const sorted = [...lexicon].sort((a, b) => b.text.length - a.text.length)
  for (const w of sorted) {
    if (w.text !== w.kana) result = result.split(w.text).join(w.kana)
  }
  for (const [kanji, reading] of Object.entries(KANJI_READINGS)) {
    result = result.split(kanji).join(reading)
  }
  return result
}