"use client"

import { useState } from "react"
import { Button } from "@/components/ui/Button"
import { CheckCircle2 } from "lucide-react"
import { useRouter } from "next/navigation"
import { BODY_SYSTEMS } from "@/lib/constants"

const INPUT_CLS = "w-full bg-surface-offset border border-border rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary focus:outline-none text-text text-sm placeholder:text-text-faint"
const LABEL_CLS = "block text-xs font-semibold text-text mb-1"

export function AddWordForm() {
  const [frTerm, setFrTerm] = useState("")
  const [enTerm, setEnTerm] = useState("")
  const [definition, setDefinition] = useState("")
  const [example, setExample] = useState("")
  const [phonetic, setPhonetic] = useState("")
  const [wordRoot, setWordRoot] = useState("")
  const [bodySystem, setBodySystem] = useState("cardiovascular")
  const [difficulty, setDifficulty] = useState("medium")
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState("")
  const router = useRouter()

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!frTerm || !enTerm || !definition) return
    setLoading(true)
    setError("")

    const res = await fetch("/api/admin/words", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        fr_term: frTerm, en_term: enTerm, en_definition: definition,
        en_example: example, phonetic, body_system: bodySystem,
        difficulty, word_root: wordRoot,
      }),
    })

    const data = await res.json()
    setLoading(false)

    if (!res.ok) { setError(data.error ?? "Erreur inconnue"); return }

    setSuccess(true)
    setFrTerm(""); setEnTerm(""); setDefinition(""); setExample("")
    setPhonetic(""); setWordRoot("")
    setTimeout(() => { setSuccess(false); router.refresh() }, 2000)
  }

  return (
    <form onSubmit={submit} className="bg-surface border border-border rounded-2xl p-5 space-y-3">
      <div>
        <label className={LABEL_CLS}>Terme français *</label>
        <input type="text" value={frTerm} onChange={e => setFrTerm(e.target.value)}
          placeholder="ex: infarctus du myocarde" required className={INPUT_CLS} />
      </div>
      <div>
        <label className={LABEL_CLS}>Terme anglais *</label>
        <input type="text" value={enTerm} onChange={e => setEnTerm(e.target.value)}
          placeholder="ex: myocardial infarction" required className={INPUT_CLS} />
      </div>
      <div>
        <label className={LABEL_CLS}>Définition *</label>
        <textarea value={definition} onChange={e => setDefinition(e.target.value)}
          required rows={3} placeholder="English definition..."
          className={INPUT_CLS + " resize-none"} />
      </div>
      <div>
        <label className={LABEL_CLS}>Exemple</label>
        <input type="text" value={example} onChange={e => setExample(e.target.value)}
          placeholder="Example sentence..." className={INPUT_CLS} />
      </div>
      <div>
        <label className={LABEL_CLS}>Phonétique</label>
        <input type="text" value={phonetic} onChange={e => setPhonetic(e.target.value)}
          placeholder="/ˌmaɪ.oʊˈkɑːr.di.əl/" className={INPUT_CLS} />
      </div>
      <div>
        <label className={LABEL_CLS}>Racine du mot</label>
        <input type="text" value={wordRoot} onChange={e => setWordRoot(e.target.value)}
          placeholder="myo, card..." className={INPUT_CLS} />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className={LABEL_CLS}>Système *</label>
          <select value={bodySystem} onChange={e => setBodySystem(e.target.value)} required className={INPUT_CLS}>
            {BODY_SYSTEMS.map(s => <option key={s.slug} value={s.slug}>{s.fr}</option>)}
          </select>
        </div>
        <div>
          <label className={LABEL_CLS}>Difficulté</label>
          <select value={difficulty} onChange={e => setDifficulty(e.target.value)} className={INPUT_CLS}>
            <option value="easy">Facile</option>
            <option value="medium">Moyen</option>
            <option value="hard">Difficile</option>
          </select>
        </div>
      </div>
      {error && <p className="text-xs text-error">{error}</p>}
      {success ? (
        <div className="flex items-center gap-2 text-success font-semibold text-sm p-3 bg-success/10 rounded-xl">
          <CheckCircle2 size={16} /> Mot ajouté !
        </div>
      ) : (
        <Button type="submit" disabled={loading} className="w-full rounded-xl">
          {loading ? "Ajout..." : "Ajouter le mot"}
        </Button>
      )}
    </form>
  )
}
