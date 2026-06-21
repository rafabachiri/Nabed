"use client"

import { useState } from "react"
import { Heart } from "lucide-react"
import { useRouter } from "next/navigation"
import type { FavoriteType } from "@/types/database"
import { cn } from "@/lib/utils"

interface Props {
  itemType: FavoriteType
  itemId: string
  initial: boolean
  /** Refresh the route after toggling (use on the favorites page so removed items disappear). */
  refreshOnToggle?: boolean
  className?: string
}

export function FavoriteButton({ itemType, itemId, initial, refreshOnToggle, className }: Props) {
  const [favorited, setFavorited] = useState(initial)
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const toggle = async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (loading) return
    setLoading(true)
    const optimistic = !favorited
    setFavorited(optimistic)

    const res = await fetch("/api/favorites", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ itemType, itemId }),
    })

    setLoading(false)
    if (!res.ok) {
      setFavorited(!optimistic) // revert
      return
    }
    if (refreshOnToggle) router.refresh()
  }

  return (
    <button
      onClick={toggle}
      disabled={loading}
      aria-label={favorited ? "Retirer des favoris" : "Ajouter aux favoris"}
      title={favorited ? "Retirer des favoris" : "Ajouter aux favoris"}
      className={cn(
        "flex items-center justify-center rounded-full transition-colors w-9 h-9 border",
        favorited
          ? "bg-error-highlight text-error border-error/30"
          : "bg-surface text-text-muted border-border hover:text-error hover:border-error/30",
        className
      )}
    >
      <Heart size={18} className={favorited ? "fill-current" : ""} />
    </button>
  )
}
