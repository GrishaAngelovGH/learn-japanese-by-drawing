"use client"

type Props = {
  characters: string[]
}

export function StrokeDrawing({ characters }: Props) {
  return (
    <div className="flex flex-col items-center gap-4">
      <svg
        viewBox="0 0 109 109"
        className="w-44 h-44 border border-zinc-200 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-800"
        data-testid="draw-canvas"
        aria-label="Draw the current stroke here"
        xmlns="http://www.w3.org/2000/svg"
      />
      <p className="text-xs text-zinc-500 dark:text-zinc-400 max-w-xs">
        Drawing canvas
      </p>
    </div>
  )
}

export default StrokeDrawing
