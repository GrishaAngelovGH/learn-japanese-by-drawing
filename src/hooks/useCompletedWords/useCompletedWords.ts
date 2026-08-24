/**
 * Tracks completed words in localStorage and triggers confetti on word completion.
 *
 * Key: `learn-japanese:completed-words`
 * Value: JSON array of word IDs that have been fully drawn.
 */
import { useCallback, useState } from "react"

const STORAGE_KEY = "learn-japanese:completed-words"

export function useCompletedWords() {
  const [completed, setCompleted] = useState<Set<string>>(() => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) {
      return new Set(JSON.parse(raw))
    }
  } catch {
    // Silently ignore corrupt localStorage
  }
  return new Set()
})

  const isCompleted = useCallback((wordId: string) => completed.has(wordId), [
    completed
  ])

  const markCompleted = useCallback((wordId: string) => {
    setCompleted((prev) => {
      const next = new Set(prev)
      next.add(wordId)
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify([...next]))
      } catch {
        // Silently ignore if localStorage is unavailable
      }
      return next
    })
  }, [])

  const triggerConfetti = useCallback(() => {
    try {
      const canvas = document.createElement("canvas")
      canvas.style.position = "fixed"
      canvas.style.top = "0"
      canvas.style.left = "0"
      canvas.style.width = "100%"
      canvas.style.height = "100%"
      canvas.style.pointerEvents = "none"
      canvas.style.zIndex = "9999"
      document.body.appendChild(canvas)

      import("canvas-confetti").then((confetti) => {
        confetti.default({
          particleCount: 150,
          spread: 100,
          origin: { y: 0.6 },
          colors: ["#f97316", "#fbbf24", "#fcd34d", "#f59e0b"],
          disableForReducedMotion: true,
          zIndex: 9999
        })

        setTimeout(() => {
          document.body.removeChild(canvas)
        }, 3000)
      })
    } catch {
      // Silently fail if confetti doesn't load
    }
  }, [])

  return { completed, isCompleted, markCompleted, triggerConfetti }
}
