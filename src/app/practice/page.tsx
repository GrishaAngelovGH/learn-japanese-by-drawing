"use client"

import { Suspense, useState } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import words from "@/data/words"

function PracticeContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const countParam = searchParams.get("count")
  const sessionCount = countParam ? parseInt(countParam, 10) : 1
  const currentWord = words[0]

  const [isGoingBack, setIsGoingBack] = useState<boolean>(false)

  const handleBack = () => {
    if (isGoingBack) return
    setIsGoingBack(true)
    setTimeout(() => {
      router.push("/")
      setIsGoingBack(false)
    }, 850)
  }

  return (
    <div className="min-h-screen bg-zinc-50 text-zinc-900 flex flex-col items-center justify-center p-6 antialiased overflow-hidden">
      <main className={`w-full max-w-lg ${isGoingBack ? "animate-slide-out-right" : "animate-slide-in-right"}`}>
        <div className="bg-white border border-zinc-200/80 rounded-2xl p-8 shadow-sm space-y-8">
          {/* Practice Header */}
          <div className="flex items-center justify-between border-b border-zinc-100 pb-4">
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

          {/* Sample Word Header */}
          <div className="space-y-2 text-center">
            <div className="text-xs uppercase tracking-wider text-zinc-500 font-medium">
              {currentWord.romaji} • {currentWord.kana}
            </div>

            <h1 className="text-4xl font-bold tracking-tight text-zinc-900">
              {currentWord.text}
            </h1>

            <p className="text-sm font-medium text-orange-600">
              {currentWord.meaning}
            </p>
          </div>

          {/* Placeholder for Drawing Canvas */}
          <div className="h-64 rounded-xl border-2 border-dashed border-zinc-200 bg-zinc-50/50 flex flex-col items-center justify-center text-center p-6 space-y-2">
            <p className="text-sm font-medium text-zinc-700">
              Drawing Canvas Area
            </p>
            <p className="text-xs text-zinc-500 max-w-xs">
              Character drawing & stroke order engine will be added here next.
            </p>
          </div>
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
