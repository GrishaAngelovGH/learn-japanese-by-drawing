"use client"

import { useState } from "react"
import { usePathname } from "next/navigation"
import { useTheme } from "next-themes"
import { CircleHelp } from "lucide-react"
import { EVENTS, Joyride, STATUS, type EventData, type Step } from "react-joyride"
import { setTourSeen, useTourSeen } from "@/hooks/useTourSeen"
import { TOURS } from "./tours"

const PRIMARY = "#ea580c" // orange-600, the app's accent

const PALETTE = {
  light: { backgroundColor: "#ffffff", arrowColor: "#ffffff", textColor: "#18181b" },
  dark: { backgroundColor: "#27272a", arrowColor: "#27272a", textColor: "#f4f4f5" }
} as const

function RouteTour({ id, steps, next }: { id: string; steps: Step[]; next?: string }) {
  const { resolvedTheme } = useTheme()
  const { seen, markSeen } = useTourSeen(id)
  const [replaying, setReplaying] = useState(false)

  // Auto-run on the first visit; the button replays it on demand.
  const run = replaying || !seen

  // Uncontrolled mode: Joyride owns the step index, skips missing targets and
  // resets itself. We only need to know when the tour is over (finished,
  // skipped or closed). Don't react to `event.action`: it is repeated on
  // every event of a step and would fire multiple times per click.
  const handleEvent = (event: EventData) => {
    if (event.type === EVENTS.TOUR_END) {
      markSeen()
      setReplaying(false)
      // Chain tours: "Done" arms the next page's tour, "Skip" dismisses it.
      if (next) setTourSeen(next, event.status !== STATUS.FINISHED)
    }
  }

  return (
    <>
      <Joyride
        run={run}
        steps={steps}
        continuous
        onEvent={handleEvent}
        locale={{ last: "Done", nextWithProgress: "Next ({current}/{total})" }}
        options={{
          ...PALETTE[resolvedTheme === "dark" ? "dark" : "light"],
          primaryColor: PRIMARY,
          overlayColor: "rgba(0, 0, 0, 0.55)",
          // The spotlighted element must not be clickable: pressing e.g. Start Practice
          // would navigate away mid-tour, so the tour would never be marked as seen.
          blockTargetInteraction: true,
          buttons: ["back", "primary", "skip"],
          closeButtonAction: "skip",
          overlayClickAction: false,
          showProgress: true,
          skipBeacon: true,
          spotlightRadius: 12,
          spotlightPadding: 6,
          targetWaitTimeout: 3000,
          width: 320,
          zIndex: 1000
        }}
      />
      <button
        onClick={() => setReplaying(true)}
        disabled={run}
        aria-label="Show the guided tour"
        className="fixed top-30 right-6 z-50 flex items-center justify-center w-8 h-8 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-default"
      >
        <CircleHelp className="size-4" />
      </button>
    </>
  )
}

/** Renders the tour for the current route (if it has one). */
export function AppTour() {
  const pathname = usePathname()
  const tour = TOURS[pathname]
  if (!tour) return null
  // `key` remounts the tour on navigation so a running tour never leaks across pages.
  return <RouteTour key={tour.id} id={tour.id} steps={tour.steps} next={tour.next} />
}
