export type Word = {
  id: string
  text: string
  kana: string
  romaji: string
  meaning: string
  characters: string[]
  /** Optional per-character meanings, parallel to `characters`. */
  characterMeanings?: string[]
}
