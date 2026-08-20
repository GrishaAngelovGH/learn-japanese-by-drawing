"use client"

import { X } from "lucide-react"
import { useTheme } from "next-themes"
import { useEffect } from "react"

type SettingsModalProps = {
  isOpen: boolean
  onClose: () => void
}

export function SettingsModal({ isOpen, onClose }: SettingsModalProps) {
  const { theme, setTheme } = useTheme()
  const isDark = theme === "dark"

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose()
      }
    }

    document.addEventListener("keydown", handleEscape)
    return () => document.removeEventListener("keydown", handleEscape)
  }, [isOpen, onClose])

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-2xl p-6 shadow-xl w-full max-w-md mx-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
            Settings
          </h2>
          <button
            onClick={onClose}
            aria-label="Close settings"
            className="w-8 h-8 rounded-full bg-zinc-100 dark:bg-zinc-700 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-600 transition-colors flex items-center justify-center"
          >
            <X className="size-4" />
          </button>
        </div>

        <div className="space-y-3">
          <label className="flex items-center justify-between cursor-pointer group">
            <span className="text-zinc-900 dark:text-zinc-100">
              Dark Mode
            </span>
            <button
              onClick={() => setTheme(isDark ? "light" : "dark")}
              className={`w-12 h-6 rounded-full transition-colors duration-200 ${isDark ? "bg-orange-500" : "bg-zinc-300 dark:bg-zinc-600"
                }`}
            >
              <span
                className={`block w-5 h-5 rounded-full bg-white shadow-md transform transition-transform duration-300 ${isDark ? "translate-x-6" : "translate-x-1"
                  }`}
              ></span>
            </button>
          </label>
        </div>
      </div>
    </div>
  )
}
