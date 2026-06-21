"use client"

import { useRouter } from "next/navigation"
import { BODY_SYSTEMS } from "@/lib/constants"

interface Props {
  current: string
  searchQuery?: string
}

export function SystemFilter({ current, searchQuery }: Props) {
  const router = useRouter()

  const onChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const system = e.target.value
    const params = new URLSearchParams()
    if (system) params.set("system", system)
    if (searchQuery) params.set("q", searchQuery)
    router.push(`/admin/words${params.size ? `?${params}` : ""}`)
  }

  return (
    <select
      onChange={onChange}
      defaultValue={current}
      className="bg-surface-offset border border-border rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-primary focus:outline-none text-text"
    >
      <option value="">Tous les systèmes</option>
      {BODY_SYSTEMS.map(s => (
        <option key={s.slug} value={s.slug}>{s.fr}</option>
      ))}
    </select>
  )
}
