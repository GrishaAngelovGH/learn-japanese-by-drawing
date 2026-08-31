/**
 * Tracks per-word practice progress in localStorage.
 *
 * A word is complete only after three actions are done:
 *  - heard:  the user listened to the pronunciation (text-to-speech)
 *  - written: the user drew the word correctly
 *  - pronounced: the user spoke the word and it was recognized
 *
 * Key: `learn-japanese:completed-words`
 * Value: JSON object mapping wordId -> { heard, written, pronounced }
 */
import { useCallback, useEffect, useMemo, useState } from "react"
import { useConfetti } from "@/hooks/useConfetti"

export type WordStatus = {
  heard: boolean
  written: boolean
  pronounced: boolean
  /** Whether the completion celebration has already been shown for this word. */
  celebrated: boolean
}

const STORAGE_KEY = "learn-japanese:completed-words"

const EMPTY_STATUS: WordStatus = { heard: false, written: false, pronounced: false, celebrated: false }

function loadStatuses(): Record<string, WordStatus> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return {}
    const parsed = JSON.parse(raw)
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
      return {}
    }
    const statuses: Record<string, WordStatus> = {}
    for (const [id, value] of Object.entries(parsed as Record<string, unknown>)) {
      const s = value as Partial<WordStatus> | null | undefined
      statuses[String(id)] = { ...EMPTY_STATUS, ...(s ?? {}) }
    }
    return statuses
  } catch {
    // Silently ignore corrupt localStorage
    return {}
  }
}

function persist(statuses: Record<string, WordStatus>): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(statuses))
  } catch {
    // Silently ignore if localStorage is unavailable
  }
}

export function useCompletedWords() {
  const { triggerConfetti } = useConfetti()

  // Defer reading localStorage until after hydration so the server and
  // client render identical initial HTML (empty statuses). Reading
  // localStorage during the hydration render would mismatch the server.
  const [statuses, setStatuses] = useState<Record<string, WordStatus>>({})
  // Seed persisted statuses after mount. Deferred via setTimeout so (a) the
  // initial client render matches the server (empty statuses → no hydration
  // mismatch on refresh) and (b) the setState is not synchronous within the
  // effect body (avoids cascading-renders lint).
  useEffect(() => {
    const id = setTimeout(() => {
      setStatuses(loadStatuses())
    }, 0)
    return () => clearTimeout(id)
  }, [])

  const markAction = useCallback(
    (wordId: string, action: keyof WordStatus) => {
      setStatuses((prev) => {
        const next = {
          ...prev,
          [wordId]: { ...EMPTY_STATUS, ...prev[wordId], [action]: true }
        }
        persist(next)
        return next
      })
    },
    []
  )

  const markHeard = useCallback((wordId: string) => markAction(wordId, "heard"), [markAction])
  const markWritten = useCallback((wordId: string) => markAction(wordId, "written"), [markAction])
  const markPronounced = useCallback((wordId: string) => markAction(wordId, "pronounced"), [markAction])
  const markCelebrated = useCallback((wordId: string) => markAction(wordId, "celebrated"), [markAction])

  const isHeard = useCallback((wordId: string) => !!statuses[wordId]?.heard, [statuses])
  const isWritten = useCallback((wordId: string) => !!statuses[wordId]?.written, [statuses])
  const isPronounced = useCallback((wordId: string) => !!statuses[wordId]?.pronounced, [statuses])
  const isCelebrated = useCallback((wordId: string) => !!statuses[wordId]?.celebrated, [statuses])

  const isCompleted = useCallback(
    (wordId: string) => {
      const s = statuses[wordId]
      return Boolean(s?.heard && s?.written && s?.pronounced)
    },
    [statuses]
  )

  const completed = useMemo(
    () => new Set(Object.keys(statuses).filter((id) => isCompleted(id))),
    [statuses, isCompleted]
  )

  const clearAll = useCallback(() => {
    setStatuses({})
    persist({})
  }, [])

  return {
    completed,
    isCompleted,
    isHeard,
    isWritten,
    isPronounced,
    isCelebrated,
    markHeard,
    markWritten,
    markPronounced,
    markCelebrated,
    triggerConfetti,
    clearAll
  }
}
