"use client"

import { useState } from "react"
import Link from "next/link"
import { createClient } from "@/utils/supabase/client"
import { Button } from "@/components/ui/Button"
import { ArrowLeft, Mail, CheckCircle2 } from "lucide-react"

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("")
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState("")

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")
    const supabase = createClient()
    const { error: err } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/reset-password`,
    })
    setLoading(false)
    if (err) { setError(err.message); return }
    setSent(true)
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="w-14 h-14 rounded-2xl bg-primary text-white flex items-center justify-center font-display font-bold text-2xl mx-auto mb-4 shadow-sm">
            N
          </div>
          <h1 className="text-2xl font-display font-bold text-text">Mot de passe oublié</h1>
          <p className="text-text-muted text-sm mt-2">Entrez votre email pour recevoir un lien de réinitialisation.</p>
        </div>

        {sent ? (
          <div className="bg-success-highlight border border-success/20 rounded-2xl p-6 text-center">
            <CheckCircle2 className="text-success mx-auto mb-3" size={36} />
            <p className="font-bold text-text mb-1">Email envoyé !</p>
            <p className="text-sm text-text-muted">Vérifiez votre boîte mail et cliquez sur le lien pour réinitialiser votre mot de passe.</p>
          </div>
        ) : (
          <form onSubmit={submit} className="bg-surface border border-border rounded-2xl p-6 space-y-4 shadow-sm">
            <div>
              <label className="block text-sm font-semibold text-text mb-1.5">Adresse email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" size={18} />
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="votre@email.com"
                  required
                  className="w-full bg-surface-offset border border-border rounded-xl py-2.5 pl-10 pr-4 focus:ring-2 focus:ring-primary focus:outline-none text-text placeholder:text-text-faint"
                />
              </div>
            </div>
            {error && <p className="text-sm text-error">{error}</p>}
            <Button type="submit" disabled={loading} className="w-full rounded-xl">
              {loading ? "Envoi..." : "Envoyer le lien"}
            </Button>
          </form>
        )}

        <div className="text-center mt-6">
          <Link href="/auth/login" className="text-sm text-text-muted hover:text-primary flex items-center justify-center gap-1">
            <ArrowLeft size={15} /> Retour à la connexion
          </Link>
        </div>
      </div>
    </div>
  )
}
