"use client"

import { createContext, useContext, useState, useEffect, ReactNode } from "react"

export type Settings = {
  backgroundImage: string
}

const STORAGE_KEY = "learn-japanese:settings"

const DEFAULT_SETTINGS: Settings = { backgroundImage: "none" }

function loadSettings(): Settings {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return DEFAULT_SETTINGS
    const parsed = JSON.parse(raw)
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
      return DEFAULT_SETTINGS
    }
    return { ...DEFAULT_SETTINGS, ...parsed }
  } catch {
    return DEFAULT_SETTINGS
  }
}

function persist(settings: Settings): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings))
  } catch {
    // Silently ignore if localStorage is unavailable
  }
}

interface SettingsContextType {
  settings: Settings
  setBackgroundImage: (value: string) => void
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined)

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<Settings>(DEFAULT_SETTINGS)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    setSettings(loadSettings())
  }, [])

  const setBackgroundImage = (value: string) => {
    setSettings((prev) => {
      const next = { ...prev, backgroundImage: value }
      persist(next)
      return next
    })
  }

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
    setBackgroundImage: context.setBackgroundImage,
  }
}
