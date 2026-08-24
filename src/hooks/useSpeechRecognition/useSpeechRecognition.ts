export type SpeechStatus = "idle" | "listening" | "result" | "error" | "unsupported"

export type UseSpeechRecognitionResult = {
  status: SpeechStatus
  transcript: string
  error: string | null
  isSupported: boolean
  start: () => void
  stop: () => void
  reset: () => void
}

// Minimal typing for the Web Speech API (not in lib.dom by default in all setups)
interface SpeechRecognitionEventLike {
  results: { [index: number]: { [index: number]: { transcript: string } }; length: number }
  resultIndex: number
}

interface SpeechRecognitionErrorEventLike {
  error: string
}

interface SpeechRecognitionLike {
  lang: string
  interimResults: boolean
  continuous: boolean
  onstart: (() => void) | null
  onresult: ((e: SpeechRecognitionEventLike) => void) | null
  onerror: ((e: SpeechRecognitionErrorEventLike) => void) | null
  onend: (() => void) | null
  start: () => void
  stop: () => void
  abort: () => void
}

type SpeechRecognitionCtor = new () => SpeechRecognitionLike

function getCtor(): SpeechRecognitionCtor | null {
  if (typeof window === "undefined") return null
  const w = window as unknown as {
    SpeechRecognition?: SpeechRecognitionCtor
    webkitSpeechRecognition?: SpeechRecognitionCtor
  }
  return w.SpeechRecognition ?? w.webkitSpeechRecognition ?? null
}

import { useCallback, useEffect, useRef, useState } from "react"

export function useSpeechRecognition(lang = "ja-JP"): UseSpeechRecognitionResult {
  const ctor = getCtor()
  const isSupported = ctor !== null

  const [status, setStatus] = useState<SpeechStatus>(isSupported ? "idle" : "unsupported")
  const [transcript, setTranscript] = useState("")
  const [error, setError] = useState<string | null>(null)

  const recRef = useRef<SpeechRecognitionLike | null>(null)
  const finalRef = useRef("")

  const stop = useCallback(() => {
    recRef.current?.stop()
  }, [])

  const reset = useCallback(() => {
    setTranscript("")
    setError(null)
    finalRef.current = ""
    setStatus(isSupported ? "idle" : "unsupported")
  }, [isSupported])

  const start = useCallback(() => {
    if (!ctor) {
      setStatus("unsupported")
      return
    }
    setError(null)
    finalRef.current = ""
    setTranscript("")

    const rec = new ctor()
    rec.lang = lang
    rec.interimResults = true
    rec.continuous = false

    rec.onstart = () => setStatus("listening")
    rec.onresult = (e) => {
      let interim = ""
      for (let i = e.resultIndex; i < e.results.length; i++) {
        const r = e.results[i][0].transcript
        // Heuristic: results without isFinal are interim; treat last as interim
        if (i === e.results.length - 1) interim = r
        else finalRef.current += r
      }
      setTranscript((finalRef.current + interim).trim())
    }
    rec.onerror = (e) => {
      setError(e.error)
      setStatus("error")
    }
    rec.onend = () => {
      if (finalRef.current) setTranscript(finalRef.current.trim())
      setStatus((s) => (s === "error" ? "error" : "result"))
    }

    recRef.current = rec
    try {
      rec.start()
    } catch {
      setStatus("error")
      setError("start-failed")
    }
  }, [ctor, lang])

  useEffect(() => {
    return () => {
      recRef.current?.abort()
    }
  }, [])

  return { status, transcript, error, isSupported, start, stop, reset }
}
