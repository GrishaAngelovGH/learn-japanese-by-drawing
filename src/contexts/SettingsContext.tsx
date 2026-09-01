"use client"

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useSyncExternalStore,
  ReactNode
} from "react"

export type Settings = {
  backgroundImage: string
}

const STORAGE_KEY = "learn-japanese:settings"

const DEFAULT_SETTINGS: Settings = { backgroundImage: "none" }

function parseSettings(raw: string | null): Settings {
  if (!raw) return DEFAULT_SETTINGS
  try {
    const parsed = JSON.parse(raw)
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
      return DEFAULT_SETTINGS
    }
    return { ...DEFAULT_SETTINGS, ...parsed }
  } catch {
    return DEFAULT_SETTINGS
  }
}

// localStorage is exposed as an external store so React renders the server
// snapshot (defaults) during hydration and only then switches to the stored
// value. Reading localStorage directly in render makes the client's first
// render differ from the server HTML (hydration mismatch).
const listeners = new Set<() => void>()

function subscribe(listener: () => void): () => void {
  listeners.add(listener)
  window.addEventListener("storage", listener)
  return () => {
    listeners.delete(listener)
    window.removeEventListener("storage", listener)
  }
}

function getSnapshot(): string | null {
  try {
    return localStorage.getItem(STORAGE_KEY)
  } catch {
    return null
  }
}

function getServerSnapshot(): string | null {
  return null
}

function persist(settings: Settings): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings))
  } catch {
    // Silently ignore if localStorage is unavailable
  }
  listeners.forEach((l) => l())
}

interface SettingsContextType {
  settings: Settings
  setBackgroundImage: (value: string) => void
}

const SettingsContext = createContext<SettingsContextType | undefined>(
  undefined
)

export function SettingsProvider({ children }: { children: ReactNode }) {
  const raw = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot)
  const settings = useMemo(() => parseSettings(raw), [raw])

  const setBackgroundImage = useCallback(
    (value: string) =>
      persist({ ...parseSettings(getSnapshot()), backgroundImage: value }),
    []
  )

  return (
    <SettingsContext.Provider value={{ settings, setBackgroundImage }}>
      {children}
    </SettingsContext.Provider>
  )
}

export function useSettings() {
  const context = useContext(SettingsContext)
  if (!context) {
    throw new Error("useSettings must be used within SettingsProvider")
  }
  return {
    backgroundImage: context.settings.backgroundImage,
    setBackgroundImage: context.setBackgroundImage
  }
}
