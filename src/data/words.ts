import { Word } from "@/types/dictionary"

const words: Word[] = [
  {
    id: "breakfast",
    text: "朝ご飯",
    kana: "あさごはん",
    romaji: "asagohan",
    meaning: "Breakfast",
    characters: ["朝", "ご", "飯"],
    characterMeanings: ["Morning", "Honorific prefix", "Rice / meal"]
  },
  {
    id: "rice",
    text: "ごはん",
    kana: "ごはん",
    romaji: "gohan",
    meaning: "Rice (cooked)",
    characters: ["ご", "は", "ん"],
    characterMeanings: ["Honorific prefix", "Grammatical particle", "Sound ending"]
  },
  {
    id: "water",
    text: "みず",
    kana: "みず",
    romaji: "mizu",
    meaning: "Water",
    characters: ["み", "ず"],
    characterMeanings: ["Phonetic", "Phonetic"]
  },
  {
    id: "tea",
    text: "ちゃ",
    kana: "ちゃ",
    romaji: "cha",
    meaning: "Tea",
    characters: ["ち", "ゃ"],
    characterMeanings: ["Phonetic", "Small kana modifier"]
  },
  {
    id: "coffee",
    text: "コーヒー",
    kana: "こーひー",
    romaji: "koohii",
    meaning: "Coffee",
    characters: ["コ", "ー", "ヒ", "ー"],
    characterMeanings: ["Phonetic", "Long vowel mark", "Phonetic", "Long vowel mark"]
  },
  {
    id: "bread",
    text: "パン",
    kana: "パン",
    romaji: "pan",
    meaning: "Bread",
    characters: ["パ", "ン"],
    characterMeanings: ["Phonetic", "Phonetic"]
  },
  {
    id: "egg",
    text: "たまご",
    kana: "たまご",
    romaji: "tamago",
    meaning: "Egg",
    characters: ["た", "ま", "ご"],
    characterMeanings: ["Phonetic", "Phonetic", "Phonetic"]
  },
  {
    id: "milk",
    text: "ぎゅうにゅう",
    kana: "ぎゅうにゅう",
    romaji: "gyuunyuu",
    meaning: "Milk",
    characters: ["ぎ", "ゅ", "う", "に", "ゅ", "う"],
    characterMeanings: ["Phonetic", "Small kana modifier", "Phonetic", "Phonetic", "Small kana modifier", "Phonetic"]
  },
  {
    id: "apple",
    text: "りんご",
    kana: "りんご",
    romaji: "ringo",
    meaning: "Apple",
    characters: ["り", "ん", "ご"],
    characterMeanings: ["Phonetic", "Phonetic", "Phonetic"]
  },
  {
    id: "banana",
    text: "バナナ",
    kana: "バナナ",
    romaji: "banana",
    meaning: "Banana",
    characters: ["バ", "ナ", "ナ"],
    characterMeanings: ["Phonetic", "Phonetic", "Phonetic"]
  },
  {
    id: "fish",
    text: "さかな",
    kana: "さかな",
    romaji: "sakana",
    meaning: "Fish",
    characters: ["さ", "か", "な"],
    characterMeanings: ["Phonetic", "Phonetic", "Phonetic"]
  }
]

export default words
