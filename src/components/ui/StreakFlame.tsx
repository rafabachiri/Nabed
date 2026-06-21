"use client"

import * as React from "react"
import { motion } from "framer-motion"
import { Flame } from "lucide-react"

interface StreakFlameProps {
  streak: number
  className?: string
}

export function StreakFlame({ streak, className }: StreakFlameProps) {
  const hasStreak = streak > 0

  return (
    <div className={`flex items-center space-x-1 ${className}`}>
      <motion.div
        animate={
          hasStreak
            ? { scale: [1, 1.1, 1], rotate: [-5, 5, -5] }
            : { scale: 1, rotate: 0 }
        }
        transition={{
          repeat: hasStreak ? Infinity : 0,
          duration: 2,
          ease: "easeInOut",
        }}
      >
        <Flame
          className={hasStreak ? "text-orange fill-orange" : "text-text-muted"}
          size={20}
        />
      </motion.div>
      <span
        className={`font-semibold text-sm ${
          hasStreak ? "text-orange" : "text-text-muted"
        }`}
      >
        {streak}
      </span>
    </div>
  )
}
