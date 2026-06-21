import * as React from "react"
import { ProgressBar } from "./ProgressBar"

export interface XPBarProps extends React.HTMLAttributes<HTMLDivElement> {
  level: number
  currentXP: number
  nextLevelXP: number
}

export function XPBar({ level, currentXP, nextLevelXP, className, ...props }: XPBarProps) {
  return (
    <div className={`flex flex-col space-y-1 ${className}`} {...props}>
      <div className="flex justify-between text-xs font-semibold text-gold">
        <span>Niveau {level}</span>
        <span>{currentXP} / {nextLevelXP} XP</span>
      </div>
      <ProgressBar value={currentXP} max={nextLevelXP} indicatorColor="bg-gold" />
    </div>
  )
}
