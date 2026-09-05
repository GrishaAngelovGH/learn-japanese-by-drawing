/**
 * Visible attribution for the KanjiVG stroke-order data (CC BY-SA 3.0).
 * Render this wherever KanjiVG-derived graphics are shown to users, and
 * also from a permanent "Credits" place (e.g. the Settings modal).
 */
const linkClass =
  "underline underline-offset-2 hover:text-zinc-600 dark:hover:text-zinc-300"

export function KanjiVGAttribution() {
  return (
    <p className="text-center text-xs text-zinc-400 dark:text-zinc-500">
      Stroke order data:{" "}
      <a
        href="https://kanjivg.tagaini.net"
        target="_blank"
        rel="noopener noreferrer"
        className={linkClass}
      >
        KanjiVG
      </a>{" "}
      by Ulrich Apel, licensed under{" "}
      <a
        href="https://creativecommons.org/licenses/by-sa/3.0/"
        target="_blank"
        rel="noopener noreferrer"
        className={linkClass}
      >
        CC BY-SA 3.0
      </a>
      . Strokes are animated and used for scoring, not otherwise changed.
    </p>
  )
}