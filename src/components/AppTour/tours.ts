import type { Step } from "react-joyride"

export interface TourDefinition {
  /** Stable id, used as the persistence key. Changing it re-shows the tour. */
  id: string
  steps: Step[]
  /**
   * Tour that continues this one. Finishing this tour (not skipping it)
   * re-arms the next one so it auto-starts on its page; skipping it
   * dismisses the next one too.
   */
  next?: string
}

/**
 * Tours keyed by route. Targets are `data-tour="..."` attributes in the app.
 * Steps whose target isn't on screen (e.g. the Next button on the last word)
 * are skipped automatically.
 */
export const TOURS: Record<string, TourDefinition> = {
  "/": {
    id: "home-v1",
    next: "practice-v1",
    steps: [
      {
        target: '[data-tour="session-length"]',
        placement: "top",
        title: "Choose your session length",
        content: "Slide to pick how many words you want to practice."
      },
      {
        target: '[data-tour="start-practice"]',
        placement: "top",
        title: "Start practicing",
        content: "Tap Start Practice to begin your first lesson."
      }
    ]
  },
  "/practice": {
    id: "practice-v1",
    steps: [
      {
        target: '[data-tour="preview-stroke"]',
        placement: "top",
        title: "Preview stroke order",
        content: "Watch an animation of the character before drawing it yourself."
      },
      {
        target: '[data-tour="learn-to-draw"]',
        placement: "top",
        title: "Learn to draw",
        content:
          "Trace the character on the canvas. We check your stroke order and give feedback."
      },
      {
        target: '[data-tour="speak"]',
        placement: "top",
        title: "Practice speaking",
        content: "Say the word out loud and see how close you were."
      },
      {
        target: '[data-tour="word-nav"]',
        placement: "top",
        title: "Move between words",
        content: "Go back to the previous word, or on to the next once you're done."
      },
      {
        target: '[data-tour="listen"]',
        placement: "left",
        title: "Listen anytime",
        content: "Hear the word pronounced again."
      },
      {
        target: '[data-tour="settings"]',
        placement: "left",
        title: "Settings",
        content: "Change the background image or turn on the daily streak graph."
      },
      {
        target: '[data-tour="streak"]',
        placement: "left",
        title: "Daily streak",
        content: "See your streak and keep practicing every day."
      }
    ]
  }
}
