"use client"

import { Check, Mic, PenTool, Volume2 } from "lucide-react"

type PracticeStatusProps = {
  /** Whether the pronunciation has been listened to. */
  heard: boolean
  /** Whether the word has been drawn correctly. */
  written: boolean
  /** Whether the word has been pronounced and recognized. */
  pronounced: boolean
  /** Whether all three actions are done. */
  complete: boolean
}

function StatusChip({
  label,
  done,
  icon
}: {
  label: string
  done: boolean
  icon: React.ReactNode
}) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium border ${done
          ? "bg-green-100 dark:bg-green-900/30 border-green-200 dark:border-green-500/40 text-green-700 dark:text-green-400"
          : "border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800/50 text-zinc-600 dark:text-zinc-400"
        }`}
    >
      {done ? <Check className="size-3.5" /> : icon}
      <span>{label}</span>
    </span>
  )
}

export function PracticeStatus({
  heard,
  written,
  pronounced,
  complete
}: PracticeStatusProps) {
  return (
    <>
      <div className="flex flex-nowrap justify-center gap-2 mt-3">
        <StatusChip
          label="Heard"
          done={heard}
          icon={<Volume2 className="size-4" />}
        />
        <StatusChip
          label="Written"
          done={written}
          icon={<PenTool className="size-4" />}
        />
        <StatusChip
          label="Pronounced"
          done={pronounced}
          icon={<Mic className="size-4" />}
        />
      </div>
      {complete && (
        <span className="mt-2 flex items-center justify-center gap-1.5 rounded-full bg-green-100 dark:bg-green-900/30 px-3 py-1 text-green-600 dark:text-green-400 font-bold text-sm">
          <Check className="size-5" />
          <span>Complete</span>
        </span>
      )}
    </>
  )
}

export default PracticeStatus
