"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/utils/supabase/client"
import { Button } from "@/components/ui/Button"
import { Lock, CheckCircle2 } from "lucide-react"

export default function ResetPasswordPage() {
  const [password, setPassword] = useState("")
  const [confirm, setConfirm] = useState("")
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)
  const [error, setError] = useState("")
  const router = useRouter()

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (password !== confirm) { setError("Les mots de passe ne correspondent pas."); return }
    if (password.length < 8) { setError("Le mot de passe doit contenir au moins 8 caractères."); return }
    setLoading(true)
    setError("")
    const supabase = createClient()
    const { error: err } = await supabase.auth.updateUser({ password })
    setLoading(false)
    if (err) { setError(err.message); return }
    setDone(true)
    setTimeout(() => router.push("/auth/login"), 3000)
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="w-14 h-14 rounded-2xl bg-primary text-white flex items-center justify-center font-display font-bold text-2xl mx-auto mb-4 shadow-sm">
            N
          </div>
          <h1 className="text-2xl font-display font-bold text-text">Nouveau mot de passe</h1>
          <p className="text-text-muted text-sm mt-2">Choisissez un nouveau mot de passe sécurisé.</p>
        </div>

        {done ? (
          <div className="bg-success-highlight border border-success/20 rounded-2xl p-6 text-center">
            <CheckCircle2 className="text-success mx-auto mb-3" size={36} />
            <p className="font-bold text-text mb-1">Mot de passe mis à jour !</p>
            <p className="text-sm text-text-muted">Redirection vers la connexion...</p>
          </div>
        ) : (
          <form onSubmit={submit} className="bg-surface border border-border rounded-2xl p-6 space-y-4 shadow-sm">
            <div>
              <label className="block text-sm font-semibold text-text mb-1.5">Nouveau mot de passe</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" size={18} />
                <input
                  type="password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="Minimum 8 caractères"
                  required
                  className="w-full bg-surface-offset border border-border rounded-xl py-2.5 pl-10 pr-4 focus:ring-2 focus:ring-primary focus:outline-none text-text placeholder:text-text-faint"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-semibold text-text mb-1.5">Confirmer le mot de passe</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" size={18} />
                <input
                  type="password"
                  value={confirm}
                  onChange={e => setConfirm(e.target.value)}
                  placeholder="Répétez le mot de passe"
                  required
                  className="w-full bg-surface-offset border border-border rounded-xl py-2.5 pl-10 pr-4 focus:ring-2 focus:ring-primary focus:outline-none text-text placeholder:text-text-faint"
                />
              </div>
            </div>
            {error && <p className="text-sm text-error">{error}</p>}
            <Button type="submit" disabled={loading} className="w-full rounded-xl">
              {loading ? "Mise à jour..." : "Mettre à jour le mot de passe"}
            </Button>
          </form>
        )}
      </div>
    </div>
  )
}
