"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import words from "@/data/words"
import { playSwoosh } from "@/lib/audio"
import { useViewTransition } from "@/hooks/useViewTransition"

export default function Home() {
  const { push } = useViewTransition()
  const totalWords = words.length
  const minSlider = totalWords >= 10 ? 10 : 1
  const maxSlider = Math.max(minSlider + 1, totalWords)
  const sliderStep = totalWords >= 20 ? 10 : 1

  const [selectedCount, setSelectedCount] = useState<number>(
    Math.min(minSlider, totalWords)
  )

  const handleStart = () => {
    playSwoosh()
    push(`/practice?count=${selectedCount}`, "forward")
  }

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 flex flex-col items-center justify-center p-6 antialiased overflow-hidden view-transition-name: root">
      <main className="w-full max-w-lg">
        {/* App Card */}
        <div className="bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-2xl p-8 shadow-sm space-y-8">
          {/* Header */}
          <div className="space-y-3 text-center">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-400 text-xs font-semibold tracking-wide">
              <span>こんにちは (konnichiwa)</span>
              <span>•</span>
              <span className="uppercase">Welcome</span>
            </div>

            <h1 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
              Learn Japanese by Drawing
            </h1>

            <p className="text-base text-zinc-600 dark:text-zinc-400 leading-relaxed max-w-md mx-auto">
              Master Japanese vocabulary by drawing characters stroke-by-stroke.
              Practice stroke order, kana, and kanji with real-time feedback.
            </p>
          </div>

          <div className="space-y-6 pt-2">
            {/* Slider Section */}
            <div className="space-y-3 bg-zinc-50 dark:bg-zinc-800/50 p-4 rounded-xl border border-zinc-200 dark:border-zinc-700">
              <div className="flex items-center justify-between text-sm">
                <span className="font-medium text-zinc-700 dark:text-zinc-300">
                  Session Length
                </span>
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-md bg-orange-100 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 text-orange-800 dark:text-orange-300 text-xs font-semibold">
                  {selectedCount} {selectedCount === 1 ? "word" : "words"}
                </span>
              </div>

              <div className="pt-2 pb-1">
                <Slider
                  value={selectedCount}
                  min={minSlider}
                  max={maxSlider}
                  step={sliderStep}
                  disabled={totalWords <= 1}
                  onValueChange={setSelectedCount}
                />
              </div>

              <div className="flex justify-between text-xs text-zinc-500 dark:text-zinc-400">
                <span>Min: {minSlider}</span>
                <span>
                  Available in dictionary: {totalWords}{" "}
                  {totalWords === 1 ? "word" : "words"}
                </span>
              </div>
            </div>

            {/* Start Button */}
            <Button
              onClick={handleStart}
              className="w-full h-11 text-base font-semibold bg-orange-500 hover:bg-orange-600 text-white rounded-xl shadow-sm transition-colors cursor-pointer"
            >
              Start Practice
            </Button>
          </div>
        </div>
      </main>
    </div>
  )
}
