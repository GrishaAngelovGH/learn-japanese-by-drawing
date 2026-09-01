"use client"

import { useSettings } from "@/contexts/SettingsContext"
import { BACKGROUND_OPTIONS } from "@/data/background-images"
import { useEffect } from "react"

/**
 * Renders the user-selected background image as a full-bleed, subtle layer
 * behind the app content. Only renders when a background image is selected.
 *
 * Settings come from a `useSyncExternalStore`-backed context that returns
 * defaults on the server/hydration pass, so the first client render matches the
 * server HTML.
 */
export function Background() {
  const { backgroundImage } = useSettings()
  const option = BACKGROUND_OPTIONS.find((o) => o.url === backgroundImage)
  const hasBackground = !!option && option.url !== "none"

  useEffect(() => {
    if (!hasBackground) return
    document.body.classList.add("has-background-image")
    return () => {
      document.body.classList.remove("has-background-image")
    }
  }, [hasBackground])

  if (!hasBackground) return null

  return (
    <div
      key={backgroundImage}
      className="fixed inset-0 pointer-events-none"
      style={{ zIndex: -1 }}
      aria-hidden="true"
    >
      <div
        className="absolute inset-0 w-full h-full"
        style={{
          backgroundImage: `url(${option.url})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundAttachment: "fixed",
        }}
      />
      {/* Subtle overlay so text stays readable over the image. */}
      <div className="absolute inset-0 bg-linear-to-t from-black/25 via-transparent to-transparent dark:from-zinc-900/40" />
    </div>
  )
}
