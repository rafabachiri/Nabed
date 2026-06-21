"use client"

import { useState } from "react"
import { createClient } from "@/utils/supabase/client"
import Link from "next/link"
import { Button } from "@/components/ui/Button"
import { Eye, EyeOff, Loader2, AlertCircle, ArrowLeft, ArrowRight, CheckCircle2 } from "lucide-react"
import { ALGERIAN_UNIVERSITIES } from "@/lib/constants"
import { cn } from "@/lib/utils"

type FormData = {
  fullName: string
  email: string
  password: string
  confirmPassword: string
  university: string
  department: string
  facultyId: string
}

const STEP_LABELS = ["Informations", "Établissement"]

function StepIndicator({ current, total }: { current: number; total: number }) {
  return (
    <div className="flex items-center gap-2 mb-8">
      {Array.from({ length: total }).map((_, i) => (
        <div key={i} className="flex items-center gap-2">
          <div
            className={cn(
              "w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all",
              i + 1 < current
                ? "bg-gold text-white"
                : i + 1 === current
                ? "bg-gold text-white ring-4 ring-gold/20"
                : "bg-surface-offset text-text-muted"
            )}
          >
            {i + 1 < current ? <CheckCircle2 size={16} /> : i + 1}
          </div>
          <span className={cn("text-sm font-medium hidden sm:block", i + 1 === current ? "text-text" : "text-text-muted")}>
            {STEP_LABELS[i]}
          </span>
          {i < total - 1 && (
            <div className={cn("flex-1 h-px w-8 mx-1", i + 1 < current ? "bg-gold" : "bg-border")} />
          )}
        </div>
      ))}
    </div>
  )
}

export default function TeacherRegisterPage() {
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [done, setDone] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [form, setForm] = useState<FormData>({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
    university: "",
    department: "",
    facultyId: "",
  })

  function set(field: keyof FormData, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }))
    setError("")
  }

  function validateStep1() {
    if (!form.fullName.trim()) return "Veuillez entrer votre nom complet."
    if (!form.email.trim()) return "Veuillez entrer votre email."
    if (form.password.length < 8) return "Le mot de passe doit contenir au moins 8 caractères."
    if (form.password !== form.confirmPassword) return "Les mots de passe ne correspondent pas."
    return null
  }

  function validateStep2() {
    if (!form.university) return "Veuillez sélectionner votre université."
    if (!form.department.trim()) return "Veuillez entrer votre département."
    return null
  }

  function nextStep() {
    const err = validateStep1()
    if (err) { setError(err); return }
    setError("")
    setStep(2)
  }

  async function handleSubmit() {
    const err = validateStep2()
    if (err) { setError(err); return }

    setLoading(true)
    setError("")

    const supabase = createClient()
    const origin = window.location.origin

    const { error: signUpError } = await supabase.auth.signUp({
      email: form.email,
      password: form.password,
      options: {
        emailRedirectTo: `${origin}/auth/callback`,
        data: {
          role: "teacher",
          full_name: form.fullName,
          university: form.university,
          department: form.department,
          faculty_id: form.facultyId.trim() || null,
        },
      },
    })

    if (signUpError) {
      if (signUpError.message.includes("already registered")) {
        setError("Un compte avec cet email existe déjà.")
      } else {
        setError("Une erreur est survenue. Réessayez.")
      }
      setLoading(false)
      return
    }

    setDone(true)
  }

  if (done) {
    return (
      <div className="w-full max-w-md text-center">
        <div className="bg-surface border border-border rounded-2xl shadow-md p-10">
          <div className="w-16 h-16 bg-gold-highlight rounded-full flex items-center justify-center mx-auto mb-5">
            <span className="text-4xl">⏳</span>
          </div>
          <h2 className="text-2xl font-display font-bold text-text mb-3">Demande envoyée !</h2>
          <p className="text-text-muted mb-6 leading-relaxed">
            Votre demande d&apos;inscription en tant qu&apos;enseignant a bien été reçue.
            L&apos;administrateur examinera votre dossier et vous enverra un email de confirmation.
          </p>
          <div className="bg-surface-offset rounded-xl p-4 text-sm text-left space-y-1 mb-6">
            <p className="text-text-muted"><span className="font-medium text-text">Email :</span> {form.email}</p>
            <p className="text-text-muted"><span className="font-medium text-text">Université :</span> {form.university}</p>
            <p className="text-text-muted"><span className="font-medium text-text">Département :</span> {form.department}</p>
          </div>
          <p className="text-xs text-text-faint">
            Délai habituel de validation : 24–48 heures ouvrées.
          </p>
        </div>
        <Link
          href="/"
          className="block text-center text-sm text-text-muted mt-6 hover:text-text transition-colors"
        >
          ← Retour à l&apos;accueil
        </Link>
      </div>
    )
  }

  return (
    <div className="w-full max-w-md">
      <div className="mb-2">
        <Link
          href="/auth/register"
          className="inline-flex items-center gap-1 text-sm text-text-muted hover:text-text transition-colors mb-6"
        >
          <ArrowLeft size={16} /> Retour
        </Link>
        <h1 className="text-2xl font-display font-bold text-text mb-1">Inscription Enseignant</h1>
        <p className="text-text-muted text-sm">Étape {step} sur {STEP_LABELS.length}</p>
      </div>

      <div className="bg-surface-offset border border-gold/30 rounded-xl px-4 py-3 mb-4 text-sm text-text-muted flex items-start gap-2">
        <span className="text-gold mt-0.5">ℹ️</span>
        Les comptes enseignants sont vérifiés manuellement pour garantir la qualité de la plateforme.
      </div>

      <div className="bg-surface border border-border rounded-2xl shadow-md p-8">
        <StepIndicator current={step} total={STEP_LABELS.length} />

        {error && (
          <div className="mb-5 flex items-start gap-3 bg-error-highlight text-error px-4 py-3 rounded-xl text-sm font-medium">
            <AlertCircle size={18} className="shrink-0 mt-0.5" />
            {error}
          </div>
        )}

        {/* Step 1 */}
        {step === 1 && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-text mb-1.5">Nom complet</label>
              <input
                type="text"
                value={form.fullName}
                onChange={(e) => set("fullName", e.target.value)}
                placeholder="Dr. Prénom Nom"
                autoComplete="name"
                className="w-full bg-bg border border-border rounded-xl px-4 py-3 text-text placeholder:text-text-faint focus:outline-none focus:ring-2 focus:ring-gold focus:border-transparent text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-text mb-1.5">Email universitaire</label>
              <input
                type="email"
                value={form.email}
                onChange={(e) => set("email", e.target.value)}
                placeholder="prof@univ.dz"
                autoComplete="email"
                className="w-full bg-bg border border-border rounded-xl px-4 py-3 text-text placeholder:text-text-faint focus:outline-none focus:ring-2 focus:ring-gold focus:border-transparent text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-text mb-1.5">Mot de passe</label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={form.password}
                  onChange={(e) => set("password", e.target.value)}
                  placeholder="Minimum 8 caractères"
                  autoComplete="new-password"
                  className="w-full bg-bg border border-border rounded-xl px-4 py-3 pr-12 text-text placeholder:text-text-faint focus:outline-none focus:ring-2 focus:ring-gold focus:border-transparent text-sm"
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-text-muted hover:text-text">
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-text mb-1.5">Confirmer le mot de passe</label>
              <input
                type="password"
                value={form.confirmPassword}
                onChange={(e) => set("confirmPassword", e.target.value)}
                placeholder="••••••••"
                autoComplete="new-password"
                className="w-full bg-bg border border-border rounded-xl px-4 py-3 text-text placeholder:text-text-faint focus:outline-none focus:ring-2 focus:ring-gold focus:border-transparent text-sm"
              />
            </div>
          </div>
        )}

        {/* Step 2 */}
        {step === 2 && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-text mb-1.5">Université</label>
              <select
                value={form.university}
                onChange={(e) => set("university", e.target.value)}
                className="w-full bg-bg border border-border rounded-xl px-4 py-3 text-text focus:outline-none focus:ring-2 focus:ring-gold focus:border-transparent text-sm"
              >
                <option value="">Sélectionnez votre université</option>
                {ALGERIAN_UNIVERSITIES.map((u) => (
                  <option key={u} value={u}>{u}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-text mb-1.5">Département / Spécialité</label>
              <input
                type="text"
                value={form.department}
                onChange={(e) => set("department", e.target.value)}
                placeholder="ex: Département de Médecine Interne"
                className="w-full bg-bg border border-border rounded-xl px-4 py-3 text-text placeholder:text-text-faint focus:outline-none focus:ring-2 focus:ring-gold focus:border-transparent text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-text mb-1.5">
                Numéro de matricule <span className="text-text-faint font-normal">(optionnel)</span>
              </label>
              <input
                type="text"
                value={form.facultyId}
                onChange={(e) => set("facultyId", e.target.value)}
                placeholder="Numéro d'identification facultaire"
                className="w-full bg-bg border border-border rounded-xl px-4 py-3 text-text placeholder:text-text-faint focus:outline-none focus:ring-2 focus:ring-gold focus:border-transparent text-sm"
              />
              <p className="text-xs text-text-faint mt-1">
                Aide à valider votre appartenance à l&apos;établissement.
              </p>
            </div>
          </div>
        )}

        {/* Navigation */}
        <div className="flex items-center gap-3 mt-8">
          {step > 1 && (
            <Button type="button" variant="secondary" onClick={() => { setError(""); setStep(1) }} className="flex-1 rounded-xl h-12">
              <ArrowLeft size={18} className="mr-2" /> Précédent
            </Button>
          )}
          {step === 1 ? (
            <Button type="button" onClick={nextStep} className="flex-1 rounded-xl h-12 font-semibold bg-gold hover:bg-gold-hover">
              Suivant <ArrowRight size={18} className="ml-2" />
            </Button>
          ) : (
            <Button type="button" onClick={handleSubmit} disabled={loading} className="flex-1 rounded-xl h-12 font-semibold bg-gold hover:bg-gold-hover">
              {loading ? <Loader2 className="animate-spin" size={20} /> : "Soumettre ma demande"}
            </Button>
          )}
        </div>
      </div>

      <p className="text-center text-sm text-text-muted mt-6">
        Déjà inscrit ?{" "}
        <Link href="/auth/login" className="text-primary font-semibold hover:underline">
          Se connecter
        </Link>
      </p>
    </div>
  )
}
