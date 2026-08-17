let speechSynthesis: SpeechSynthesis | null = null

function getSpeechSynthesis() {
  if (typeof window === "undefined") return null
  if (!speechSynthesis) {
    speechSynthesis = window.speechSynthesis
  }
  return speechSynthesis
}

/**
 * Speak Japanese text using the browser's built-in text-to-speech.
 * Pass kana (e.g. あさごはん) with lang="ja-JP" so it sounds like a
 * native speaker rather than an English reading of romaji.
 * Safe to call from user gesture handlers (click).
 */
export function speakJapanese(text: string, lang = "ja-JP") {
  try {
    const synth = getSpeechSynthesis()
    if (!synth) return

    // Stop any utterance currently playing
    synth.cancel()

    const utterance = new SpeechSynthesisUtterance(text)
    utterance.lang = lang
    utterance.rate = 0.9 // slightly slower for learners
    utterance.pitch = 1

    synth.speak(utterance)
  } catch {
    // Silently fail if speech synthesis is not available or blocked
  }
}
