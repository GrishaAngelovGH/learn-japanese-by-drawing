import { describe, expect, it } from "vitest"
import { resolveKnownWords, toRomaji } from "./romaji"
import words from "@/data/words"

describe("toRomaji", () => {
  it("matches the romaji in the word list for every word's kana", () => {
    for (const w of words) expect(toRomaji(w.kana), w.id).toBe(w.romaji)
  })

  it("treats katakana and hiragana the same", () => {
    expect(toRomaji("コーヒー")).toBe("koohii")
    expect(toRomaji("こーひー")).toBe("koohii")
  })

  it("handles small kana, geminates and ん", () => {
    expect(toRomaji("きゃく")).toBe("kyaku")
    expect(toRomaji("しゃしん")).toBe("shashin")
    expect(toRomaji("ちゃ")).toBe("cha")
    expect(toRomaji("がっこう")).toBe("gakkoo")
    expect(toRomaji("まっちゃ")).toBe("matcha")
    expect(toRomaji("ファン")).toBe("fan")
  })

  it("ignores punctuation and spaces", () => {
    expect(toRomaji("みず。")).toBe("mizu")
    expect(toRomaji("み ず")).toBe("mizu")
  })

  it("never outputs Japanese characters for unresolved kanji", () => {
    expect(toRomaji("水")).toBe("?")
  })
})

describe("resolveKnownWords", () => {
  it("replaces known written forms with their kana", () => {
    expect(resolveKnownWords("朝ご飯", words)).toBe("あさごはん")
  })

  it("resolves kanji spellings of the other vocabulary words", () => {
    const cases: Record<string, string> = { 水: "mizu", 茶: "cha", 卵: "tamago", 魚: "sakana", 牛乳: "gyuunyuu", 林檎: "ringo" }
    for (const [kanji, romaji] of Object.entries(cases)) {
      expect(toRomaji(resolveKnownWords(kanji, words)), kanji).toBe(romaji)
    }
  })

  it("resolves partly-kanji results", () => {
    expect(toRomaji(resolveKnownWords("朝ごはん", words))).toBe("asagohan")
    expect(toRomaji(resolveKnownWords("あさご飯", words))).toBe("asagohan")
  })
})