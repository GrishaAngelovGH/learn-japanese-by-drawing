"use client"

import { X, Image as ImageIcon, Sun, Moon, Trash2 } from "lucide-react"
import { useTheme } from "next-themes"
import { useEffect } from "react"

import { useSettings } from "@/contexts/SettingsContext"
import { BACKGROUND_OPTIONS } from "@/data/background-images"
import { useCompletedWords } from "@/hooks/useCompletedWords"

type SettingsModalProps = {
  isOpen: boolean
  onClose: () => void
}

export function SettingsModal({ isOpen, onClose }: SettingsModalProps) {
  const { theme, setTheme } = useTheme()
  const isDark = theme === "dark"
  const { backgroundImage, setBackgroundImage } = useSettings()
  const isBackgroundEnabled = backgroundImage !== "none"
  const { clearAll } = useCompletedWords()

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

  const handleBackgroundToggle = () => {
    setBackgroundImage(
      isBackgroundEnabled ? "none" : BACKGROUND_OPTIONS[1].url
    )
  }

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

        <div className="space-y-4">
          {/* Dark Mode */}
          <label className="flex items-center justify-between cursor-pointer group">
            <span className="flex items-center gap-2 text-zinc-900 dark:text-zinc-100">
              {isDark ? <Moon className="size-4" /> : <Sun className="size-4" />}
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

          {/* Background Image */}
          <div className="space-y-2">
            <label className="flex items-center justify-between cursor-pointer group">
              <span className="flex items-center gap-2 text-zinc-900 dark:text-zinc-100">
                <ImageIcon className="size-4" />
                Background Image
              </span>
              <button
                onClick={handleBackgroundToggle}
                aria-pressed={isBackgroundEnabled}
                className={`w-12 h-6 rounded-full transition-colors duration-200 ${isBackgroundEnabled ? "bg-orange-500" : "bg-zinc-300 dark:bg-zinc-600"
                  }`}
              >
                <span
                  className={`block w-5 h-5 rounded-full bg-white shadow-md transform transition-transform duration-300 ${isBackgroundEnabled ? "translate-x-6" : "translate-x-1"
                    }`}
                ></span>
              </button>
            </label>

            {isBackgroundEnabled && (
              <div className="space-y-2 pl-1">
                <div className="w-full rounded-lg border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-sm">
                  <div className="p-2 space-y-1">
                    {BACKGROUND_OPTIONS.map((option) => (
                      <button
                        key={option.id}
                        onClick={() => setBackgroundImage(option.url)}
                        className={`w-full text-left px-3 py-2 rounded-md transition-colors ${
                          backgroundImage === option.url
                            ? "bg-orange-100 dark:bg-orange-900/30 text-orange-800 dark:text-orange-300 font-medium"
                            : "text-zinc-900 dark:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-700"
                        }`}
                      >
                        {option.label}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-zinc-500 dark:text-zinc-400">
                    Preview:
                  </span>
                  <img
                    src={backgroundImage}
                    alt=""
                    className="h-12 w-16 rounded-lg object-cover object-center border border-zinc-200 dark:border-zinc-700 shadow-sm"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Clear Progress */}
          <button
            onClick={() => {
              clearAll()
              onClose()
              window.location.reload()
            }}
            className="w-full flex items-center justify-center gap-2 text-sm text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors px-3 py-2 rounded-lg border border-red-200 dark:border-red-800"
          >
            <Trash2 className="size-4" />
            Clear all progress
          </button>
        </div>
      </div>
    </div>
  )
}
