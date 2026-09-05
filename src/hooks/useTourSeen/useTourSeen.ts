"use client"

import { useCallback, useSyncExternalStore } from "react"

const PREFIX = "learn-japanese:tour:"

// In-memory fallback so a tour still ends for the session when localStorage
// is unavailable (private mode, blocked storage) instead of restarting forever.
const seenInMemory = new Set<string>()
const listeners = new Set<() => void>()

function read(id: string): boolean {
  if (seenInMemory.has(id)) return true
  try {
    return localStorage.getItem(PREFIX + id) === "1"
  } catch {
    return false
  }
}

function subscribe(listener: () => void) {
  listeners.add(listener)
  window.addEventListener("storage", listener)
  return () => {
    listeners.delete(listener)
    window.removeEventListener("storage", listener)
  }
}

/** Set or clear the "seen" flag for a tour from anywhere (e.g. to chain tours). */
export function setTourSeen(id: string, seen: boolean) {
  if (seen) seenInMemory.add(id)
  else seenInMemory.delete(id)
  try {
    if (seen) localStorage.setItem(PREFIX + id, "1")
    else localStorage.removeItem(PREFIX + id)
  } catch {
    // ignore — the in-memory flag above covers this session
  }
  listeners.forEach((listener) => listener())
}

/**
 * Whether the user has already seen the tour with this id.
 * The server snapshot is `true`, so nothing tour-related renders during SSR
 * and the first client render matches the server (no hydration mismatch).
 */
export function useTourSeen(id: string) {
  const seen = useSyncExternalStore(
    subscribe,
    () => read(id),
    () => true
  )

  const markSeen = useCallback(() => setTourSeen(id, true), [id])

  return { seen, markSeen }
}
