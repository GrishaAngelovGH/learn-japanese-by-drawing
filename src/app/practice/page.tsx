"use client"

import { Suspense, useState } from "react"
import { useSearchParams } from "next/navigation"
import { ArrowLeft, ArrowRight, RotateCcw, Volume2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { StrokePreview } from "@/components/StrokePreview"
import Soundwave from "@/components/Soundwave"
import words from "@/data/words"
import { playNext, playPrev, playRestart, playSwoosh } from "@/lib/audio"
import { speakJapanese } from "@/lib/speech"
import useViewTransition from "@/hooks/useViewTransition"

function PracticeContent() {
  const { push } = useViewTransition()
  const searchParams = useSearchParams()
  const countParam = searchParams.get("count")
  const sessionCount = Math.min(countParam ? parseInt(countParam, 10) : words.length, words.length)
  const [currentIndex, setCurrentIndex] = useState<number>(0)
  const currentWord = words[currentIndex]

  const [isSpeaking, setIsSpeaking] = useState<boolean>(false)
  const [showPreview, setShowPreview] = useState<boolean>(false)

  const handleNext = () => {
    playNext()
    setCurrentIndex((prev) => Math.min(prev + 1, sessionCount - 1))
    setShowPreview(false)
  }

  const handleRestart = () => {
    playRestart()
    setCurrentIndex(0)
    setShowPreview(false)
  }

  const handlePrev = () => {
    playPrev()
    setCurrentIndex((prev) => Math.max(prev - 1, 0))
    setShowPreview(false)
  }

  const handleBack = () => {
    playSwoosh()
    push("/", "back")
  }

  const handleSpeak = () => {
    setIsSpeaking(true)
    speakJapanese(
      currentWord.kana,
      "ja-JP",
      () => setIsSpeaking(true),
      () => setIsSpeaking(false)
    )
  }

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 flex flex-col items-center justify-center p-6 antialiased overflow-hidden view-transition-name: root">
      <main className="w-full max-w-2xl">
        <div className="relative bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-2xl p-8 shadow-sm">
          {/* Practice Header */}
          <div className="flex items-center justify-between border-b border-zinc-100 dark:border-zinc-700 pb-6 mb-6">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleBack}
              className="gap-1.5 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 -ml-2 cursor-pointer"
            >
              <ArrowLeft className="size-4" />
              <span>Back</span>
            </Button>

            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-400 text-xs font-semibold">
              <span>Word {currentIndex + 1} of {sessionCount}</span>
            </div>
          </div>

          {/* Two-column layout: canvas left, word info right */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            {/* Left Column: Drawing Canvas / Soundwave / Stroke preview */}
            <div className="h-96 rounded-xl border-2 border-dashed border-zinc-200 dark:border-zinc-700 bg-zinc-50/50 dark:bg-zinc-900/20 flex flex-col items-center justify-center text-center p-6 space-y-2">
              {showPreview ? (
                <StrokePreview characters={currentWord.characters} strokeDelayMs={700} />
              ) : isSpeaking ? (
                <>
                  <Soundwave />
                  <p className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                    Speaking…
                  </p>
                </>
              ) : (
                <>
                  <p className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                    Drawing Canvas Area
                  </p>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400 max-w-xs">
                    Character drawing & stroke order engine will be added here next.
                  </p>
                </>
              )}
            </div>

            {/* Right Column: Word Information */}
            <div className="space-y-4">
              <div>
                <span className="text-xs uppercase tracking-wider text-zinc-400 dark:text-zinc-500 font-medium">
                  Japanese Character
                </span>
                <h1
                  className={`font-bold tracking-tight text-zinc-900 dark:text-zinc-100 mt-1 whitespace-nowrap ${currentWord.text.length > 5
                    ? "text-4xl md:text-5xl"
                    : "text-5xl md:text-6xl"
                    }`}
                >
                  {currentWord.text}
                </h1>
              </div>
              <div>
                <span className="text-xs uppercase tracking-wider text-zinc-400 dark:text-zinc-500 font-medium">
                  Pronunciation
                </span>
                <div className="text-sm uppercase tracking-wider text-zinc-500 dark:text-zinc-400 font-medium md:text-base mt-1">
                  {currentWord.kana}
                </div>
              </div>
              <div>
                <span className="text-xs uppercase tracking-wider text-zinc-400 dark:text-zinc-500 font-medium">
                  Romaji
                </span>
                <div className="text-sm text-zinc-600 dark:text-zinc-400 md:text-base mt-1">
                  {currentWord.romaji}
                </div>
              </div>
              <div>
                <span className="text-xs uppercase tracking-wider text-zinc-400 dark:text-zinc-500 font-medium">
                  Meaning
                </span>
                <p className="text-sm font-medium text-orange-600 dark:text-orange-400 md:text-base mt-1">
                  {currentWord.meaning}
                </p>
              </div>
            </div>
          </div>

          {/* Preview stroke order button (below the canvas) */}
          <div className="mt-6 flex justify-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowPreview((prev) => !prev)}
              className="gap-1.5 cursor-pointer"
            >
              {showPreview ? "Hide stroke order" : "Preview stroke order"}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handlePrev}
              disabled={currentIndex <= 0}
              className="gap-1.5 cursor-pointer min-w-22 justify-center"
            >
              <ArrowLeft className="size-4" />
              Prev
            </Button>
            <Button
              variant="default"
              size="sm"
              onClick={currentIndex >= sessionCount - 1 ? handleRestart : handleNext}
              className="gap-1.5 cursor-pointer bg-orange-500 hover:bg-orange-600 text-white min-w-22 justify-center"
            >
              {currentIndex >= sessionCount - 1 ? (
                <>
                  Restart
                  <RotateCcw className="size-4" />
                </>
              ) : (
                <>
                  Next
                  <ArrowRight className="size-4" />
                </>
              )}
            </Button>
          </div>

          {/* Play pronunciation button (bottom-right of card) */}
          <button
            onClick={handleSpeak}
            aria-label="Listen to pronunciation"
            className={`absolute bottom-4 right-4 flex items-center justify-center w-10 h-10 rounded-full transition-all duration-200 ${isSpeaking
              ? "bg-orange-500 border border-orange-400 text-white shadow-lg shadow-orange-200"
              : "bg-white dark:bg-zinc-700 border border-zinc-200 dark:border-zinc-600 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-600 shadow-sm"
              }`}
          >
            <Volume2 className="size-5" />
          </button>
        </div>
      </main>
    </div>
  )
}

export default function PracticePage() {
  return (
    <Suspense fallback={null}>
      <PracticeContent />
    </Suspense>
  )
}
