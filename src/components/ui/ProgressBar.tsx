import * as React from "react"
import { cn } from "@/lib/utils"

export interface ProgressBarProps extends React.HTMLAttributes<HTMLDivElement> {
  value: number // 0 to 100
  max?: number
  indicatorColor?: string // e.g. "bg-primary"
}

const ProgressBar = React.forwardRef<HTMLDivElement, ProgressBarProps>(
  ({ className, value, max = 100, indicatorColor = "bg-primary", ...props }, ref) => {
    const percentage = Math.min(Math.max((value / max) * 100, 0), 100)

    return (
      <div
        ref={ref}
        className={cn(
          "relative h-2 w-full overflow-hidden rounded-full bg-surface-offset",
          className
        )}
        {...props}
      >
        <div
          className={cn("h-full w-full flex-1 transition-all duration-500 ease-in-out", indicatorColor)}
          style={{ transform: `translateX(-${100 - percentage}%)` }}
        />
      </div>
    )
  }
)
ProgressBar.displayName = "ProgressBar"

export { ProgressBar }
