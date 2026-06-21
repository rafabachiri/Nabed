"use client"

import { useState } from "react"
import { Button } from "@/components/ui/Button"
import { CheckCircle2 } from "lucide-react"
import { useRouter } from "next/navigation"
import { BODY_SYSTEMS } from "@/lib/constants"

const INPUT_CLS = "w-full bg-surface-offset border border-border rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary focus:outline-none text-text text-sm placeholder:text-text-faint"
const LABEL_CLS = "block text-xs font-semibold text-text mb-1"

export function NewDeckForm() {
  const [nameFr, setNameFr] = useState("")
  const [nameEn, setNameEn] = useState("")
  const [bodySystem, setBodySystem] = useState("cardiovascular")
  const [yearLevel, setYearLevel] = useState("2")
  const [emoji, setEmoji] = useState("📚")
  const [isPublic, setIsPublic] = useState(true)
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState("")
  const router = useRouter()

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!nameFr || !nameEn) return
    setLoading(true)
    setError("")

    const res = await fetch("/api/admin/decks", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name_fr: nameFr.trim(),
        name_en: nameEn.trim(),
        body_system: bodySystem,
        year_level: yearLevel ? parseInt(yearLevel) : null,
        cover_emoji: emoji,
        is_public: isPublic,
      }),
    })

    const data = await res.json()
    setLoading(false)
    if (!res.ok) { setError(data.error ?? "Erreur"); return }
    setSuccess(true)
    setNameFr(""); setNameEn(""); setEmoji("📚")
    setTimeout(() => { setSuccess(false); router.refresh() }, 2000)
  }

  return (
    <form onSubmit={submit} className="bg-surface border border-border rounded-2xl p-5 space-y-3">
      <div>
        <label className={LABEL_CLS}>Nom français *</label>
        <input type="text" value={nameFr} onChange={e => setNameFr(e.target.value)}
          placeholder="ex: Cardiovasculaire" required className={INPUT_CLS} />
      </div>
      <div>
        <label className={LABEL_CLS}>Nom anglais *</label>
        <input type="text" value={nameEn} onChange={e => setNameEn(e.target.value)}
          placeholder="ex: Cardiovascular" required className={INPUT_CLS} />
      </div>
      <div>
        <label className={LABEL_CLS}>Emoji</label>
        <input type="text" value={emoji} onChange={e => setEmoji(e.target.value)}
          placeholder="📚" className={INPUT_CLS} maxLength={4} />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className={LABEL_CLS}>Système</label>
          <select value={bodySystem} onChange={e => setBodySystem(e.target.value)} className={INPUT_CLS}>
            {BODY_SYSTEMS.map(s => <option key={s.slug} value={s.slug}>{s.fr}</option>)}
          </select>
        </div>
        <div>
          <label className={LABEL_CLS}>Année</label>
          <select value={yearLevel} onChange={e => setYearLevel(e.target.value)} className={INPUT_CLS}>
            <option value="">Tous niveaux</option>
            {[1,2,3,4,5,6,7].map(y => <option key={y} value={y}>{y}ème</option>)}
          </select>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <input type="checkbox" id="isPublic" checked={isPublic} onChange={e => setIsPublic(e.target.checked)}
          className="w-4 h-4 accent-primary rounded" />
        <label htmlFor="isPublic" className="text-xs font-semibold text-text">Deck public (visible par tous les étudiants)</label>
      </div>
      {error && <p className="text-xs text-error">{error}</p>}
      {success ? (
        <div className="flex items-center gap-2 text-success font-semibold text-sm p-3 bg-success/10 rounded-xl">
          <CheckCircle2 size={16} /> Deck créé !
        </div>
      ) : (
        <Button type="submit" disabled={loading} className="w-full rounded-xl">
          {loading ? "Création..." : "Créer le deck"}
        </Button>
      )}
    </form>
  )
}
