"use client"

import { Suspense, useState, useEffect, useRef } from "react"
import { useSearchParams, useRouter, usePathname } from "next/navigation"
import { ArrowLeft, Volume2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import Soundwave from "@/components/Soundwave"
import words from "@/data/words"
import { playSwoosh } from "@/lib/audio"
import { speakJapanese } from "@/lib/speech"

function resetGoingBackState(setIsGoingBack: (value: boolean) => void) {
  setIsGoingBack(false)
}

function PracticeContent() {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const countParam = searchParams.get("count")
  const sessionCount = countParam ? parseInt(countParam, 10) : 1
  const currentWord = words[0]

  const [isGoingBack, setIsGoingBack] = useState<boolean>(false)
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false)
  const isInitialMountRef = useRef(true)

  // Reset goingBack state when arriving at practice so the
  // button shows "Back" again instead of being stuck disabled
  useEffect(() => {
    if (isInitialMountRef.current) {
      isInitialMountRef.current = false
      return
    }
    if (pathname === "/practice") {
      resetGoingBackState(setIsGoingBack)
    }
  }, [pathname])

  const handleBack = () => {
    if (isGoingBack) return
    setIsGoingBack(true)
    setTimeout(() => playSwoosh(), 700)
    setTimeout(() => {
      router.push("/")
    }, 850)
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
    <div className="min-h-screen bg-zinc-50 text-zinc-900 flex flex-col items-center justify-center p-6 antialiased overflow-hidden">
      <main className={`w-full max-w-2xl ${isGoingBack ? "animate-slide-out-right" : "animate-slide-in-right"}`}>
        <div className="relative bg-white border border-zinc-200/80 rounded-2xl p-8 shadow-sm">
          {/* Practice Header */}
          <div className="flex items-center justify-between border-b border-zinc-100 pb-6 mb-6">
            <Button
              variant="ghost"
              size="sm"
              disabled={isGoingBack}
              onClick={handleBack}
              className="gap-1.5 text-zinc-600 hover:text-zinc-900 -ml-2 cursor-pointer disabled:opacity-50"
            >
              <ArrowLeft className="size-4" />
              <span>Back</span>
            </Button>

            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-xs font-semibold">
              <span>Word 1 of {sessionCount}</span>
            </div>
          </div>

          {/* Two-column layout: canvas left, word info right */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            {/* Left Column: Drawing Canvas / Soundwave */}
            <div className="h-96 rounded-xl border-2 border-dashed border-zinc-200 bg-zinc-50/50 flex flex-col items-center justify-center text-center p-6 space-y-2">
              {isSpeaking ? (
                <>
                  <Soundwave />
                  <p className="text-sm font-medium text-zinc-700">
                    Speaking…
                  </p>
                </>
              ) : (
                <>
                  <p className="text-sm font-medium text-zinc-700">
                    Drawing Canvas Area
                  </p>
                  <p className="text-xs text-zinc-500 max-w-xs">
                    Character drawing & stroke order engine will be added here next.
                  </p>
                </>
              )}
            </div>

            {/* Right Column: Word Information */}
            <div className="space-y-4">
              <div>
                <span className="text-xs uppercase tracking-wider text-zinc-400 font-medium">
                  Japanese Character
                </span>
                <h1 className="text-5xl font-bold tracking-tight text-zinc-900 md:text-6xl mt-1">
                  {currentWord.text}
                </h1>
              </div>
              <div>
                <span className="text-xs uppercase tracking-wider text-zinc-400 font-medium">
                  Pronunciation
                </span>
                <div className="text-sm uppercase tracking-wider text-zinc-500 font-medium md:text-base mt-1">
                  {currentWord.kana}
                </div>
              </div>
              <div>
                <span className="text-xs uppercase tracking-wider text-zinc-400 font-medium">
                  Romaji
                </span>
                <div className="text-sm text-zinc-600 md:text-base mt-1">
                  {currentWord.romaji}
                </div>
              </div>
              <div>
                <span className="text-xs uppercase tracking-wider text-zinc-400 font-medium">
                  Meaning
                </span>
                <p className="text-sm font-medium text-orange-600 md:text-base mt-1">
                  {currentWord.meaning}
                </p>
              </div>
            </div>
          </div>

          {/* Play pronunciation button (bottom-right of card) */}
          <button
            onClick={handleSpeak}
            aria-label="Listen to pronunciation"
            className={`absolute bottom-4 right-4 flex items-center justify-center w-10 h-10 rounded-full transition-all duration-200 ${
              isSpeaking
                ? "bg-orange-500 border border-orange-400 text-white shadow-lg shadow-orange-200"
                : "bg-white border border-zinc-200 text-zinc-600 hover:bg-zinc-50 shadow-sm"
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
