/**
 * Confetti celebration hook.
 *
 * Triggers a confetti burst via canvas-confetti.
 * Dynamically imports the library to avoid SSR issues, and renders into
 * a full-screen canvas that is removed after the animation finishes.
 */
import { useCallback } from "react"

export function useConfetti() {
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

      // Dynamically import canvas-confetti to avoid SSR issues
      import("canvas-confetti").then((confetti) => {
        confetti.default({
          particleCount: 150,
          spread: 100,
          origin: { y: 0.6 },
          colors: ["#f97316", "#fbbf24", "#fcd34d", "#f59e0b"],
          disableForReducedMotion: true,
          zIndex: 9999
        })

        // Remove canvas after animation
        setTimeout(() => {
          document.body.removeChild(canvas)
        }, 3000)
      })
    } catch {
      // Silently fail if confetti doesn't load
    }
  }, [])

  return { triggerConfetti }
}
