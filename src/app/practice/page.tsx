"use client"

import { Suspense, useState, useSyncExternalStore, useEffect, useRef } from "react"
import { toast } from "sonner"
import { useSearchParams, useRouter } from "next/navigation"
import { ArrowLeft, ArrowRight, RotateCcw, Volume2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { StrokePreview } from "@/components/StrokePreview"
import { StrokeDrawing } from "@/components/StrokeDrawing"
import { PracticeStatus } from "@/components/PracticeStatus"
import Soundwave from "@/components/Soundwave"
import words from "@/data/words"
import { playNext, playPrev, playRestart, playSwoosh } from "@/lib/audio"
import { speakJapanese } from "@/lib/speech"
import { resolveKnownWords } from "@/lib/romaji"
import useViewTransition from "@/hooks/useViewTransition"
import { useSpeechRecognition } from "@/hooks/useSpeechRecognition"
import PronunciationDiff from "@/components/PronunciationDiff"
import { useCompletedWords } from "@/hooks/useCompletedWords"

/** Words grouped by their romaji pronunciation, so we can flag homophones. */
const homophoneMap = new Map<string, typeof words>()
for (const w of words) {
  const group = homophoneMap.get(w.romaji) ?? []
  group.push(w)
  homophoneMap.set(w.romaji, group)
}

function PracticeContent() {
  const { push } = useViewTransition()
  const router = useRouter()
  const searchParams = useSearchParams()
  const countParam = searchParams.get("count")
  const indexParam = searchParams.get("index")
  const sessionCount = Math.min(countParam ? parseInt(countParam, 10) : words.length, words.length)
  const parsedIndex = indexParam ? parseInt(indexParam, 10) : 0
  // When there is no explicit index in the URL (a fresh start / reload), we
  // resume at the first incomplete word once persisted statuses load. Until
  // then we start at the first word to avoid a hydration mismatch.
  const hasIndexParam = indexParam !== null
  const [currentIndex, setCurrentIndex] = useState<number>(
    hasIndexParam
      ? Math.min(Math.max(parsedIndex, 0), sessionCount - 1)
      : 0
  )
  const currentWord = words[currentIndex]

  const homophones = (homophoneMap.get(currentWord.romaji) ?? []).filter(
    (w) => w.id !== currentWord.id
  )

  const {
    isCompleted,
    isHeard,
    isWritten,
    isPronounced,
    isCelebrated,
    markHeard,
    markWritten,
    markPronounced,
    markCelebrated,
    triggerConfetti
  } = useCompletedWords()

  const speech = useSpeechRecognition("ja-JP")
  // Browser support can only be known on the client; rendering it during SSR would cause a hydration mismatch.
  const isClient = useSyncExternalStore(
    () => () => { },
    () => true,
    () => false
  )

  const [isSpeaking, setIsSpeaking] = useState<boolean>(false)
  // Timer that auto-hides the stroke-order preview 2s after it finishes playing,
  // giving the learner a moment to see the completed character.
  const hidePreviewTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const resolved = speech.transcript ? resolveKnownWords(speech.transcript, words) : ""
  useEffect(() => {
    if (resolved && resolved === currentWord.kana) {
      markPronounced(currentWord.id)
    }
  }, [resolved, currentWord.id, currentWord.kana, markPronounced])

  const [mode, setMode] = useState<"idle" | "preview" | "draw">("idle")

  const updateIndex = (next: number) => {
    const clamped = Math.min(Math.max(next, 0), sessionCount - 1)
    setCurrentIndex(clamped)
    const params = new URLSearchParams(searchParams.toString())
    params.set("index", String(clamped))
    router.push(`?${params.toString()}`)
  }

  const handleNext = () => {
    playNext()
    updateIndex(currentIndex + 1)
    setMode("idle")
    speech.reset()
  }

  const handleRestart = () => {
    playRestart()
    setCurrentIndex(0)
    updateIndex(0)
    setMode("idle")
    speech.reset()
  }

  // Auto-hide the stroke-order preview a short while after it finishes playing.
  const handleStrokePreviewComplete = () => {
    // Clear any pending hide so a restart/navigate doesn't trigger a late hide.
    if (hidePreviewTimerRef.current) {
      clearTimeout(hidePreviewTimerRef.current)
    }
    hidePreviewTimerRef.current = setTimeout(() => {
      hidePreviewTimerRef.current = null
      setMode("idle")
    }, 2000)
  }

  const handlePrev = () => {
    playPrev()
    updateIndex(currentIndex - 1)
    setMode("idle")
    speech.reset()
  }

  const handlersRef = useRef({ handlePrev, handleNext, handleRestart })
  useEffect(() => {
    handlersRef.current = { handlePrev, handleNext, handleRestart }
  })

  // Arrow key navigation between words (prev/next only, never preview/draw toggle)
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (document.activeElement?.tagName === "INPUT" || document.activeElement?.tagName === "TEXTAREA") {
        return
      }
      if (event.key === "ArrowLeft") {
        event.preventDefault()
        handlersRef.current.handlePrev()
      } else if (event.key === "ArrowRight") {
        event.preventDefault()
        if (currentIndex >= sessionCount - 1) {
          handlersRef.current.handleRestart()
        } else {
          handlersRef.current.handleNext()
        }
      }
    }
    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [currentIndex, sessionCount])

  // Clear any pending auto-hide timer when the page unmounts.
  useEffect(() => {
    return () => {
      if (hidePreviewTimerRef.current) {
        clearTimeout(hidePreviewTimerRef.current)
        hidePreviewTimerRef.current = null
      }
    }
  }, [])

  const handleBack = () => {
    playSwoosh()
    push("/", "back")
  }

  const handleSpeak = () => {
    if (isSpeaking) return
    setIsSpeaking(true)
    speakJapanese(
      currentWord.kana,
      "ja-JP",
      () => {
        setIsSpeaking(true)
        markHeard(currentWord.id)
      },
      () => setIsSpeaking(false)
    )
  }

  // Celebrate only once per word — when it transitions to complete.
  // Persisted in localStorage so the celebration doesn't repeat on refresh.
  useEffect(() => {
    const done = isCompleted(currentWord.id)
    if (done && !isCelebrated(currentWord.id)) {
      triggerConfetti()
      toast.success("Word complete!", {
        style: { background: "#16a34a", color: "#fff", fontSize: "1.125rem" }
      })
      markCelebrated(currentWord.id)
    }
  }, [currentWord.id, isCompleted, isCelebrated, markCelebrated, triggerConfetti])

  // On a fresh reload (no explicit index in the URL), resume at the first
  // incomplete word instead of always starting at the first word. Persisted
  // statuses load asynchronously after mount, so this effect re-runs once they
  // are available and jumps forward if the current word is already done.
  useEffect(() => {
    if (hasIndexParam) return
    const firstIncomplete = words.findIndex((w) => !isCompleted(w.id))
    const target = firstIncomplete === -1 ? Math.max(sessionCount - 1, 0) : firstIncomplete
    if (target !== currentIndex) {
      const id = setTimeout(() => {
        setCurrentIndex(target)
        const params = new URLSearchParams(searchParams.toString())
        params.set("index", String(target))
        router.push(`?${params.toString()}`)
      }, 0)
      return () => clearTimeout(id)
    }
  }, [hasIndexParam, isCompleted, sessionCount, currentIndex, searchParams, router])

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 flex flex-col items-center justify-center p-6 antialiased overflow-hidden view-transition-name: root">
      <main className="w-full max-w-2xl">
        <div className="relative bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-2xl p-8 shadow-sm min-h-160">
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
            <div className="h-135 rounded-xl border-2 border-dashed border-zinc-200 dark:border-zinc-700 bg-zinc-50/50 dark:bg-zinc-900/20 flex flex-col items-center justify-center text-center p-6 space-y-2">
              {isSpeaking ? (
                <>
                  <Soundwave />
                  <p className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                    Speaking…
                  </p>
                </>
              ) : speech.status === "listening" ? (
                <>
                  <Soundwave />
                  <p className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                    Listening…
                  </p>
                </>
              ) : mode === "draw" ? (
                <StrokeDrawing
                  characters={currentWord.characters}
                  wordId={currentWord.id}
                  characterMeanings={currentWord.characterMeanings}
                  onWordWritten={(wordId) => {
                    markWritten(wordId)
                    setMode("idle")
                  }}
                />
              ) : mode === "preview" ? (
                <StrokePreview
                  characters={currentWord.characters}
                  characterMeanings={currentWord.characterMeanings}
                  strokeDelayMs={700}
                  onComplete={handleStrokePreviewComplete}
                />
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
                  Japanese Word
                </span>
                <h1
                  className={`font-bold tracking-tight text-zinc-900 dark:text-zinc-100 mt-1 whitespace-nowrap ${currentWord.text.length > 5
                    ? "text-4xl md:text-5xl"
                    : "text-5xl md:text-6xl"
                    }`}
                >
                  {currentWord.text}
                </h1>
                <PracticeStatus
                  heard={isHeard(currentWord.id)}
                  written={isWritten(currentWord.id)}
                  pronounced={isPronounced(currentWord.id)}
                  complete={isCompleted(currentWord.id)}
                />
              </div>
              <div>
                <span className="text-xs uppercase tracking-wider text-zinc-400 dark:text-zinc-500 font-medium">
                  Japanese Pronunciation
                </span>
                <div className="text-sm uppercase tracking-wider text-zinc-500 dark:text-zinc-400 font-medium md:text-base mt-1">
                  {currentWord.kana}
                </div>
              </div>
              <div>
                <span className="text-xs uppercase tracking-wider text-zinc-400 dark:text-zinc-500 font-medium">
                  Romaji (Latin letters)
                </span>
                <div className="text-sm text-zinc-600 dark:text-zinc-400 md:text-base mt-1">
                  {currentWord.romaji}
                </div>
              </div>
              <div>
                <span className="text-xs uppercase tracking-wider text-zinc-400 dark:text-zinc-500 font-medium">
                  Meaning in English
                </span>
                <p className="text-sm font-medium text-orange-600 dark:text-orange-400 md:text-base mt-1">
                  {currentWord.meaning}
                </p>
              </div>
              <p
                className="text-xs leading-4 h-8 line-clamp-2 text-zinc-400 dark:text-zinc-500 mt-1 italic"
                aria-hidden={homophones.length === 0}
              >
                {homophones.length > 0 ? `Homophone — also pronounced “${currentWord.romaji}” as ${homophones.map((h) => h.meaning).join(", ")}` : null}
              </p>
            </div>
          </div>

          {/* Preview stroke order button (below the canvas) */}
          <div className="mt-6 flex flex-wrap justify-between gap-2">
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setMode((prev) => (prev === "preview" ? "idle" : "preview"))}
                className="gap-1.5 cursor-pointer"
              >
                {mode === "preview" ? "Hide stroke order" : "Preview stroke order"}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setMode((prev) => (prev === "draw" ? "idle" : "draw"))}
                className="gap-1.5 cursor-pointer"
              >
                {mode === "draw" ? "Stop drawing" : "Learn to draw"}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={speech.start}
                disabled={speech.status === "listening"}
                className="gap-1.5 cursor-pointer"
              >
                Speak
              </Button>
            </div>
            <div className="flex gap-2 pr-12">
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
          </div>

          {/* Pronunciation diff (shown only after speaking) */}
          {speech.transcript && (
            <div className="mt-4 pr-12">
              <PronunciationDiff
                expected={currentWord.kana}
                actual={resolveKnownWords(speech.transcript, words)}
              />
            </div>
          )}

          {isClient && !speech.isSupported && (
            <p className="mt-4 text-center text-xs text-zinc-500 dark:text-zinc-400">
              Speech recognition isn&apos;t supported in this browser. Try Chrome, Edge or Safari.
            </p>
          )}
          {speech.status === "error" && speech.error && (
            <p className="mt-4 text-center text-xs text-red-600 dark:text-red-400">
              Couldn&apos;t hear you ({speech.error}). Check microphone permission and try again.
            </p>
          )}

          {/* Play pronunciation button (bottom-right of card) */}
          <button
            onClick={handleSpeak}
            disabled={isSpeaking}
            aria-label="Listen to pronunciation"
            className={`absolute bottom-4 right-4 flex items-center justify-center w-10 h-10 rounded-full transition-all duration-200 cursor-pointer ${isSpeaking
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
