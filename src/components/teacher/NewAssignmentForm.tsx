"use client"

import { useState } from "react"
import { createClient } from "@/utils/supabase/client"
import { Button } from "@/components/ui/Button"
import { CheckCircle2 } from "lucide-react"
import { useRouter } from "next/navigation"

interface Cls { id: string; name: string; year_level: number }
interface Props { classes: Cls[] }

export function NewAssignmentForm({ classes }: Props) {
  const [title, setTitle] = useState("")
  const [desc, setDesc] = useState("")
  const [classId, setClassId] = useState(classes[0]?.id ?? "")
  const [dueDate, setDueDate] = useState("")
  const [type, setType] = useState("flashcard")
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState("")
  const router = useRouter()

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim() || !classId || !dueDate) return
    setLoading(true)
    setError("")
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { error: err } = await supabase.from("assignments").insert({
      teacher_id: user.id,
      class_id: classId,
      title: title.trim(),
      description: desc.trim() || null,
      due_date: dueDate,
      type,
    })

    setLoading(false)
    if (err) { setError(err.message); return }
    setSuccess(true)
    setTitle(""); setDesc(""); setDueDate(""); setType("flashcard")
    setTimeout(() => { setSuccess(false); router.refresh() }, 2000)
  }

  if (classes.length === 0) return (
    <div className="bg-surface border border-dashed border-border rounded-2xl p-6 text-center text-sm text-text-muted">
      Créez d&apos;abord une classe avant d&apos;assigner des devoirs.
    </div>
  )

  return (
    <form onSubmit={submit} className="bg-surface border border-border rounded-2xl p-5 space-y-4">
      <div>
        <label className="block text-sm font-semibold text-text mb-1">Titre du devoir</label>
        <input type="text" value={title} onChange={e => setTitle(e.target.value)} placeholder="ex: Réviser le système cardio" required
          className="w-full bg-surface-offset border border-border rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-primary focus:outline-none text-text text-sm placeholder:text-text-faint" />
      </div>
      <div>
        <label className="block text-sm font-semibold text-text mb-1">Description (optionnel)</label>
        <textarea value={desc} onChange={e => setDesc(e.target.value)} rows={3} placeholder="Instructions supplémentaires..."
          className="w-full bg-surface-offset border border-border rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-primary focus:outline-none text-text text-sm placeholder:text-text-faint resize-none" />
      </div>
      <div>
        <label className="block text-sm font-semibold text-text mb-1">Type de devoir</label>
        <select value={type} onChange={e => setType(e.target.value)} required
          className="w-full bg-surface-offset border border-border rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-primary focus:outline-none text-text text-sm">
          <option value="flashcard">Flashcards</option>
          <option value="quiz">Quiz</option>
          <option value="reading">Lecture</option>
          <option value="practice">Pratique</option>
        </select>
      </div>
      <div>
        <label className="block text-sm font-semibold text-text mb-1">Classe</label>
        <select value={classId} onChange={e => setClassId(e.target.value)} required
          className="w-full bg-surface-offset border border-border rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-primary focus:outline-none text-text text-sm">
          {classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
      </div>
      <div>
        <label className="block text-sm font-semibold text-text mb-1">Date limite</label>
        <input type="date" value={dueDate} onChange={e => setDueDate(e.target.value)} required min={new Date().toISOString().split("T")[0]}
          className="w-full bg-surface-offset border border-border rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-primary focus:outline-none text-text text-sm" />
      </div>
      {error && <p className="text-xs text-error">{error}</p>}
      {success ? (
        <div className="flex items-center gap-2 text-success font-semibold text-sm p-3 bg-success/10 rounded-xl">
          <CheckCircle2 size={18} /> Devoir créé !
        </div>
      ) : (
        <Button type="submit" disabled={loading} className="w-full rounded-xl">
          {loading ? "Création..." : "Créer le devoir"}
        </Button>
      )}
    </form>
  )
}
