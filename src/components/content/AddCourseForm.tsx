"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { CheckCircle2, Plus, X } from "lucide-react"
import { Button } from "@/components/ui/Button"
import { useLang } from "@/components/i18n/LanguageProvider"

const INPUT_CLS = "w-full bg-surface-offset border border-border rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary focus:outline-none text-text text-sm placeholder:text-text-faint"
const LABEL_CLS = "block text-xs font-semibold text-text mb-1"

const EMOJIS = ["📘", "📗", "📙", "📕", "🩺", "❤️", "🧠", "🫁", "💊", "🦠", "🔬", "🦴"]

export function AddCourseForm() {
  const { t } = useLang()
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [topic, setTopic] = useState("")
  const [contentUrl, setContentUrl] = useState("")
  const [emoji, setEmoji] = useState("📘")
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState("")

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!title) return
    setLoading(true)
    setError("")
    const res = await fetch("/api/courses", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, description, topic, content_url: contentUrl, cover_emoji: emoji }),
    })
    const data = await res.json()
    setLoading(false)
    if (!res.ok) { setError(data.error ?? "Error"); return }
    setSuccess(true)
    setTitle(""); setDescription(""); setTopic(""); setContentUrl("")
    setTimeout(() => { setSuccess(false); setOpen(false); router.refresh() }, 1200)
  }

  if (!open) {
    return (
      <Button onClick={() => setOpen(true)} className="rounded-xl">
        <Plus size={18} className="mr-2" /> {t.courses.addCourse}
      </Button>
    )
  }

  return (
    <form onSubmit={submit} className="bg-surface border border-border rounded-2xl p-5 space-y-3 w-full max-w-lg">
      <div className="flex items-center justify-between">
        <h3 className="font-display font-bold text-text">{t.courses.addCourse}</h3>
        <button type="button" onClick={() => setOpen(false)} className="text-text-muted hover:text-text"><X size={18} /></button>
      </div>
      <div>
        <label className={LABEL_CLS}>{t.courses.titleField} *</label>
        <input value={title} onChange={e => setTitle(e.target.value)} required className={INPUT_CLS} />
      </div>
      <div>
        <label className={LABEL_CLS}>{t.courses.descField}</label>
        <textarea value={description} onChange={e => setDescription(e.target.value)} rows={3} className={INPUT_CLS + " resize-none"} />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className={LABEL_CLS}>{t.courses.systemField}</label>
          <input value={topic} onChange={e => setTopic(e.target.value)} className={INPUT_CLS} />
        </div>
        <div>
          <label className={LABEL_CLS}>Emoji</label>
          <select value={emoji} onChange={e => setEmoji(e.target.value)} className={INPUT_CLS}>
            {EMOJIS.map(em => <option key={em} value={em}>{em}</option>)}
          </select>
        </div>
      </div>
      <div>
        <label className={LABEL_CLS}>{t.courses.linkField}</label>
        <input value={contentUrl} onChange={e => setContentUrl(e.target.value)} placeholder="https://..." className={INPUT_CLS} />
      </div>
      {error && <p className="text-xs text-error">{error}</p>}
      {success ? (
        <div className="flex items-center gap-2 text-success font-semibold text-sm p-3 bg-success/10 rounded-xl">
          <CheckCircle2 size={16} /> {t.courses.added}
        </div>
      ) : (
        <Button type="submit" disabled={loading} className="w-full rounded-xl">
          {loading ? t.common.loading : t.common.add}
        </Button>
      )}
    </form>
  )
}
