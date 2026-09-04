"use client"

import { Suspense, useEffect, useRef } from "react"
import { toast } from "sonner"
import { useSettings } from "@/contexts/SettingsContext"
import { useCompletedWords } from "@/hooks/useCompletedWords"
import { useDailyStreak } from "@/hooks/useDailyStreak"
import { DailyStreakGraph } from "@/components/DailyStreakGraph"
import words from "@/data/words"
import { playSwoosh } from "@/lib/audio"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import useViewTransition from "@/hooks/useViewTransition"
import { domToPng } from "modern-screenshot"
import { useSearchParams, useRouter } from "next/navigation"

function StreakContent() {
  const { push } = useViewTransition()
  const router = useRouter()
  const searchParams = useSearchParams()
  const { dailyStreak } = useSettings()
  const { counts, currentStreak, reset } = useDailyStreak()
  const { isCompleted } = useCompletedWords()
  const hasTakenScreenshot = useRef(false)

  const allWordsCompleted = words.every((w) => isCompleted(w.id))
  const shouldScreenshot = searchParams.get("screenshot") === "true"

  useEffect(() => {
    if (shouldScreenshot && !hasTakenScreenshot.current) {
      hasTakenScreenshot.current = true

      // Wait for the page to fully render
      setTimeout(async () => {
        const element = document.querySelector("main") as HTMLElement
        if (!element) {
          toast.error("Could not find streak page to capture")
          router.push("/practice")
          return
        }

        try {
          const dataUrl = await domToPng(element, {
            scale: 2,
            backgroundColor: "#fafaf9",
          })
          const link = document.createElement("a")
          link.download = `japanese-streak-${new Date().toISOString().split("T")[0]}.png`
          link.href = dataUrl
          link.click()
          toast.success("Screenshot saved!")
        } catch (error) {
          console.error("Screenshot error:", error)
          toast.error("Failed to take screenshot")
        }

        // Navigate back to practice page
        router.push("/practice")
      }, 1000)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [shouldScreenshot])

  const handleBack = () => {
    playSwoosh()
    if (typeof window !== "undefined" && window.history.length > 1) {
      router.back()
    } else {
      push("/", "back")
    }
  }

  if (!dailyStreak) {
    return (
      <div className="min-h-screen bg-zinc-50 dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 flex flex-col items-center justify-center p-6 antialiased overflow-hidden view-transition-name: root">
        <main className="w-full max-w-6xl">
          <div className="bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-2xl p-8 shadow-sm space-y-8">
            <div className="flex items-center justify-between mb-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleBack}
                className="gap-1.5 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 cursor-pointer"
              >
                <ArrowLeft className="size-4" />
                <span>Back</span>
              </Button>
            </div>
            <h1 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
              Daily Streak
            </h1>
            <p className="text-base text-zinc-600 dark:text-zinc-400 leading-relaxed max-w-md mx-auto">
              The daily streak is currently disabled. Enable it in settings to
              start tracking your practice streak.
            </p>
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 flex flex-col items-center justify-center p-6 antialiased overflow-hidden view-transition-name: root">
      <main className="w-full max-w-6xl">
        <div className="bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-2xl p-8 pb-12 shadow-sm space-y-6">
          <div className="flex items-center justify-between mb-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleBack}
              className="gap-1.5 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 cursor-pointer"
            >
              <ArrowLeft className="size-4" />
              <span>Back</span>
            </Button>
          </div>

          <h1 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
            Daily Streak
          </h1>

          {/* whitespace-nowrap + shrink-0: the screenshot renderer measures text
              slightly wider than the browser and would otherwise wrap the label. */}
          <div className="inline-flex items-center gap-2 px-4 py-3 rounded-full whitespace-nowrap leading-none bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-400 text-xs font-semibold tracking-wide">
            <span className="shrink-0">{currentStreak}</span>
            <span className="shrink-0">•</span>
            <span className="uppercase shrink-0">day streak</span>
          </div>

          <DailyStreakGraph counts={counts} />

          {allWordsCompleted && (
            <div className="space-y-2">
              <p className="text-sm text-zinc-600 dark:text-zinc-400 text-center">
                All words completed &mdash; reset streak to keep going.
              </p>
              <Button
                onClick={() => {
                  reset()
                  handleBack()
                }}
                className="w-full text-sm text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors px-3 py-2 rounded-lg border border-red-200 dark:border-red-800"
              >
                Reset streak
              </Button>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}

export default function StreakPage() {
  return (
    <Suspense fallback={null}>
      <StreakContent />
    </Suspense>
  )
}