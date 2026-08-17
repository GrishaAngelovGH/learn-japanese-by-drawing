"use client"

import { useState, useEffect } from "react"
import { useRouter, usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import words from "@/data/words"
import { playSwoosh } from "@/lib/audio"

export default function Home() {
  const router = useRouter()
  const pathname = usePathname()
  const totalWords = words.length
  const minSlider = totalWords >= 10 ? 10 : 1
  const maxSlider = Math.max(minSlider + 1, totalWords)
  const sliderStep = totalWords >= 20 ? 10 : 1

  const [selectedCount, setSelectedCount] = useState<number>(
    Math.min(minSlider, totalWords)
  )
  const [isStarting, setIsStarting] = useState<boolean>(false)

  // Reset starting state when navigating back to the home page so the
  // button shows "Start Practice" again instead of "Starting..."
  useEffect(() => {
    setIsStarting(false)
  }, [pathname])

  const handleStart = () => {
    if (isStarting) return
    setIsStarting(true)
    setTimeout(() => playSwoosh(), 700)
    setTimeout(() => {
      router.push(`/practice?count=${selectedCount}`)
      // keep isStarting true until navigation unmounts this page,
      // so the button stays "Starting..." through the whole transition
    }, 850)
  }

  return (
    <div className="min-h-screen bg-zinc-50 text-zinc-900 flex flex-col items-center justify-center p-6 antialiased overflow-hidden">
      <main className={`w-full max-w-lg ${isStarting ? "animate-slide-out-left" : ""}`}>
        {/* App Card */}
        <div className="bg-white border border-zinc-200/80 rounded-2xl p-8 shadow-sm space-y-8">
          {/* Header */}
          <div className="space-y-3 text-center">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-xs font-semibold tracking-wide">
              <span>こんにちは (konnichiwa)</span>
              <span>•</span>
              <span className="uppercase">Welcome</span>
            </div>

            <h1 className="text-3xl font-bold tracking-tight text-zinc-900">
              Learn Japanese by Drawing
            </h1>

            <p className="text-base text-zinc-600 leading-relaxed max-w-md mx-auto">
              Master Japanese vocabulary by drawing characters stroke-by-stroke.
              Practice stroke order, kana, and kanji with real-time feedback.
            </p>
          </div>

          <div className="space-y-6 pt-2">
            {/* Slider Section */}
            <div className="space-y-3 bg-zinc-50 p-4 rounded-xl border border-zinc-200/60">
              <div className="flex items-center justify-between text-sm">
                <span className="font-medium text-zinc-700">
                  Session Length
                </span>
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-semibold bg-orange-100 text-orange-800 border border-orange-200">
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

              <div className="flex justify-between text-xs text-zinc-500">
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
              disabled={isStarting}
              className="w-full h-11 text-base font-semibold bg-orange-500 hover:bg-orange-600 text-white rounded-xl shadow-sm transition-colors cursor-pointer disabled:opacity-80"
            >
              {isStarting ? "Starting..." : "Start Practice"}
            </Button>
          </div>
        </div>
      </main>
    </div>
  )
}
