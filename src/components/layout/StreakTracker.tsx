"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"

/**
 * Fires the daily streak update once per browser session. The streak endpoint
 * is idempotent per day (it no-ops if last_active is already today), so this is
 * safe to call on load. Without this, /api/streak/update was never invoked and
 * the streak never advanced.
 */
export function StreakTracker() {
  const router = useRouter()

  useEffect(() => {
    const today = new Date().toISOString().split("T")[0]
    const key = "streak-checked"
    if (sessionStorage.getItem(key) === today) return
    sessionStorage.setItem(key, today)

    fetch("/api/streak/update", { method: "POST" })
      .then(res => res.json())
      .then(data => {
        if (data?.updated) router.refresh()
      })
      .catch(() => {})
  }, [router])

  return null
}
