import * as React from "react"
import { Slider as SliderPrimitive } from "@base-ui/react/slider"
import { cn } from "cn"

export type SliderProps = Omit<
  SliderPrimitive.Root.Props,
  "value" | "defaultValue" | "onValueChange"
> & {
  value?: number
  defaultValue?: number
  onValueChange?: (value: number) => void
}

function Slider({
  className,
  defaultValue,
  value,
  min = 0,
  max = 100,
  onValueChange,
  ...props
}: SliderProps) {
  const handleValueChange = React.useCallback(
    (val: number | readonly number[]) => {
      if (!onValueChange) return
      const next = typeof val === "number" ? val : val[0]
      if (typeof next === "number") {
        onValueChange(next)
      }
    },
    [onValueChange]
  )

  return (
    <SliderPrimitive.Root
      className={cn("w-full data-[orientation=vertical]:h-full", className)}
      data-slot="slider"
      defaultValue={defaultValue}
      value={value}
      min={min}
      max={max}
      thumbAlignment="edge"
      onValueChange={handleValueChange}
      {...props}
    >
      <SliderPrimitive.Control className="relative flex w-full touch-none items-center select-none py-2 data-disabled:opacity-50 data-[orientation=vertical]:h-full data-[orientation=vertical]:min-h-40 data-[orientation=vertical]:w-auto data-[orientation=vertical]:flex-col">
        <SliderPrimitive.Track
          data-slot="slider-track"
          className="relative grow overflow-hidden rounded-full bg-zinc-200 dark:bg-zinc-800 select-none h-1.5 w-full data-[orientation=vertical]:h-full data-[orientation=vertical]:w-1.5"
        >
          <SliderPrimitive.Indicator
            data-slot="slider-range"
            className="bg-orange-500 select-none h-full data-[orientation=vertical]:w-full"
          />
        </SliderPrimitive.Track>
        <SliderPrimitive.Thumb
          data-slot="slider-thumb"
          className="relative block size-4 shrink-0 rounded-full border-2 border-orange-500 bg-white shadow-sm ring-orange-200 transition-shadow select-none after:absolute after:-inset-2 hover:ring-4 focus-visible:ring-4 focus-visible:outline-none active:ring-4 disabled:pointer-events-none disabled:opacity-50"
        />
      </SliderPrimitive.Control>
    </SliderPrimitive.Root>
  )
}

export { Slider }
