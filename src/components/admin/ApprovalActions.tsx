"use client"

import { useState } from "react"
import { Button } from "@/components/ui/Button"
import { useRouter } from "next/navigation"

export function ApprovalActions({ teacherId }: { teacherId: string }) {
  const [loading, setLoading] = useState<"approve" | "reject" | null>(null)
  const router = useRouter()

  const act = async (action: "approve" | "reject") => {
    setLoading(action)
    const res = await fetch("/api/admin/teacher-approval", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ teacherId, action }),
    })
    setLoading(null)
    if (res.ok) router.refresh()
  }

  return (
    <div className="flex gap-2 shrink-0">
      <Button
        size="sm"
        className="rounded-xl bg-success hover:bg-success/90 text-white border-transparent"
        onClick={() => act("approve")}
        disabled={loading !== null}
      >
        {loading === "approve" ? "..." : "Approuver"}
      </Button>
      <Button
        size="sm"
        variant="outline"
        className="rounded-xl text-error border-error/30 hover:bg-error/10"
        onClick={() => act("reject")}
        disabled={loading !== null}
      >
        {loading === "reject" ? "..." : "Refuser"}
      </Button>
    </div>
  )
}
