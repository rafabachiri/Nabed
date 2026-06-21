"use client"

import { useState } from "react"
import { createClient } from "@/utils/supabase/client"
import { Button } from "@/components/ui/Button"
import { CheckCircle2 } from "lucide-react"
import { useRouter } from "next/navigation"

const YEARS = [1, 2, 3, 4, 5, 6, 7]

export function NewClassForm() {
  const [name, setName] = useState("")
  const [year, setYear] = useState(2)
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState("")
  const router = useRouter()

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) return
    setLoading(true)
    setError("")
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const joinCode = Math.random().toString(36).substring(2, 8).toUpperCase()

    const { error: err } = await supabase.from("classes").insert({
      teacher_id: user.id,
      name: name.trim(),
      year_level: year,
      join_code: joinCode,
    })

    setLoading(false)
    if (err) { setError(err.message); return }
    setSuccess(true)
    setName("")
    setTimeout(() => { setSuccess(false); router.refresh() }, 2000)
  }

  return (
    <form onSubmit={submit} className="bg-surface border border-border rounded-2xl p-5 space-y-4">
      <div>
        <label className="block text-sm font-semibold text-text mb-1">Nom de la classe</label>
        <input
          type="text"
          value={name}
          onChange={e => setName(e.target.value)}
          placeholder="ex: Cardiologie - Groupe A"
          className="w-full bg-surface-offset border border-border rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-primary focus:outline-none text-text placeholder:text-text-faint text-sm"
          required
        />
      </div>
      <div>
        <label className="block text-sm font-semibold text-text mb-2">Année d&apos;étude</label>
        <div className="flex flex-wrap gap-2">
          {YEARS.map(y => (
            <button
              key={y}
              type="button"
              onClick={() => setYear(y)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium border-2 transition-all ${year === y ? "border-primary bg-primary text-white" : "border-border text-text-muted hover:border-primary"}`}
            >
              {y}ème
            </button>
          ))}
        </div>
      </div>
      {error && <p className="text-xs text-error">{error}</p>}
      {success ? (
        <div className="flex items-center gap-2 text-success font-semibold text-sm p-3 bg-success/10 rounded-xl">
          <CheckCircle2 size={18} /> Classe créée avec succès !
        </div>
      ) : (
        <Button type="submit" disabled={loading || !name.trim()} className="w-full rounded-xl">
          {loading ? "Création..." : "Créer la classe"}
        </Button>
      )}
    </form>
  )
}
