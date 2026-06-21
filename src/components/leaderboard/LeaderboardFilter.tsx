"use client"

import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/Button"

interface Props {
  current: string
  hasUniversity: boolean
}

export function LeaderboardFilter({ current, hasUniversity }: Props) {
  const router = useRouter()
  const searchParams = useSearchParams()

  const set = (filter: string) => {
    const params = new URLSearchParams(searchParams.toString())
    params.set("filter", filter)
    router.push(`/leaderboard?${params.toString()}`)
  }

  return (
    <div className="flex gap-2">
      <Button
        variant={current === "global" ? "default" : "outline"}
        className="rounded-full text-sm"
        onClick={() => set("global")}
      >
        Global
      </Button>
      {hasUniversity && (
        <Button
          variant={current === "university" ? "default" : "outline"}
          className="rounded-full text-sm"
          onClick={() => set("university")}
        >
          Mon Université
        </Button>
      )}
    </div>
  )
}
