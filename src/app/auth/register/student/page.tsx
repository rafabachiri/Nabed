"use client"

import { useState } from "react"
import { createClient } from "@/utils/supabase/client"
import Link from "next/link"
import { Button } from "@/components/ui/Button"
import {
  Eye, EyeOff, Loader2, AlertCircle, CheckCircle2,
  ArrowLeft, ArrowRight, Mail,
} from "lucide-react"
import { ALGERIAN_UNIVERSITIES, SPECIALTIES, STUDY_YEARS } from "@/lib/constants"
import { cn } from "@/lib/utils"

type FormData = {
  fullName: string
  email: string
  password: string
  confirmPassword: string
  university: string
  yearOfStudy: number | null
  specialty: string
  classJoinCode: string
}

const STEP_LABELS = ["Informations", "Cursus", "Classe"]

function StepIndicator({ current, total }: { current: number; total: number }) {
  return (
    <div className="flex items-center gap-2 mb-8">
      {Array.from({ length: total }).map((_, i) => (
        <div key={i} className="flex items-center gap-2">
          <div
            className={cn(
              "w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all",
              i + 1 < current
                ? "bg-primary text-white"
                : i + 1 === current
                ? "bg-primary text-white ring-4 ring-primary/20"
                : "bg-surface-offset text-text-muted"
            )}
          >
            {i + 1 < current ? <CheckCircle2 size={16} /> : i + 1}
          </div>
          <span
            className={cn(
              "text-sm font-medium hidden sm:block",
              i + 1 === current ? "text-text" : "text-text-muted"
            )}
          >
            {STEP_LABELS[i]}
          </span>
          {i < total - 1 && (
            <div className={cn("flex-1 h-px w-8 mx-1", i + 1 < current ? "bg-primary" : "bg-border")} />
          )}
        </div>
      ))}
    </div>
  )
}

export default function StudentRegisterPage() {
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
    yearOfStudy: null,
    specialty: "",
    classJoinCode: "",
  })

  function set(field: keyof FormData, value: string | number | null) {
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
    if (!form.yearOfStudy) return "Veuillez sélectionner votre année d'étude."
    if (!form.specialty) return "Veuillez sélectionner votre filière."
    return null
  }

  function nextStep() {
    let err: string | null = null
    if (step === 1) err = validateStep1()
    if (step === 2) err = validateStep2()
    if (err) { setError(err); return }
    setError("")
    setStep((s) => s + 1)
  }

  async function handleSubmit() {
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
          role: "student",
          full_name: form.fullName,
          university: form.university,
          year_of_study: String(form.yearOfStudy),
          specialty: form.specialty,
          class_join_code: form.classJoinCode.trim().toUpperCase() || null,
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
          <div className="w-16 h-16 bg-primary-highlight rounded-full flex items-center justify-center mx-auto mb-5">
            <Mail className="text-primary" size={32} />
          </div>
          <h2 className="text-2xl font-display font-bold text-text mb-3">Vérifiez votre email</h2>
          <p className="text-text-muted mb-2">
            Un lien de confirmation a été envoyé à
          </p>
          <p className="font-semibold text-text mb-6">{form.email}</p>
          <p className="text-sm text-text-muted">
            Cliquez sur le lien dans l&apos;email pour activer votre compte et accéder à Nabed.
          </p>
        </div>
        <p className="text-center text-sm text-text-muted mt-6">
          Déjà confirmé ?{" "}
          <Link href="/auth/login" className="text-primary font-semibold hover:underline">
            Se connecter
          </Link>
        </p>
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
        <h1 className="text-2xl font-display font-bold text-text mb-1">Inscription Étudiant</h1>
        <p className="text-text-muted text-sm">Étape {step} sur {STEP_LABELS.length}</p>
      </div>

      <div className="bg-surface border border-border rounded-2xl shadow-md p-8 mt-4">
        <StepIndicator current={step} total={STEP_LABELS.length} />

        {error && (
          <div className="mb-5 flex items-start gap-3 bg-error-highlight text-error px-4 py-3 rounded-xl text-sm font-medium">
            <AlertCircle size={18} className="shrink-0 mt-0.5" />
            {error}
          </div>
        )}

        {/* Step 1: Basic info */}
        {step === 1 && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-text mb-1.5">Nom complet</label>
              <input
                type="text"
                value={form.fullName}
                onChange={(e) => set("fullName", e.target.value)}
                placeholder="Prénom Nom"
                autoComplete="name"
                className="w-full bg-bg border border-border rounded-xl px-4 py-3 text-text placeholder:text-text-faint focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-sm transition-shadow"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-text mb-1.5">Adresse email</label>
              <input
                type="email"
                value={form.email}
                onChange={(e) => set("email", e.target.value)}
                placeholder="vous@exemple.dz"
                autoComplete="email"
                className="w-full bg-bg border border-border rounded-xl px-4 py-3 text-text placeholder:text-text-faint focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-sm transition-shadow"
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
                  className="w-full bg-bg border border-border rounded-xl px-4 py-3 pr-12 text-text placeholder:text-text-faint focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-sm transition-shadow"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-text-muted hover:text-text"
                >
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
                className="w-full bg-bg border border-border rounded-xl px-4 py-3 text-text placeholder:text-text-faint focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-sm transition-shadow"
              />
            </div>
          </div>
        )}

        {/* Step 2: Academic info */}
        {step === 2 && (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-text mb-1.5">Université</label>
              <select
                value={form.university}
                onChange={(e) => set("university", e.target.value)}
                className="w-full bg-bg border border-border rounded-xl px-4 py-3 text-text focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-sm transition-shadow"
              >
                <option value="">Sélectionnez votre université</option>
                {ALGERIAN_UNIVERSITIES.map((u) => (
                  <option key={u} value={u}>{u}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-text mb-3">Année d&apos;étude</label>
              <div className="grid grid-cols-7 gap-2">
                {STUDY_YEARS.map((year) => (
                  <button
                    key={year}
                    type="button"
                    onClick={() => set("yearOfStudy", year)}
                    className={cn(
                      "h-11 rounded-xl text-sm font-bold border-2 transition-all",
                      form.yearOfStudy === year
                        ? "bg-primary text-white border-primary"
                        : "bg-bg border-border text-text-muted hover:border-primary hover:text-primary"
                    )}
                  >
                    {year}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-text mb-3">Filière</label>
              <div className="grid grid-cols-3 gap-3">
                {SPECIALTIES.map((s) => (
                  <button
                    key={s.value}
                    type="button"
                    onClick={() => set("specialty", s.value)}
                    className={cn(
                      "flex flex-col items-center gap-2 py-4 rounded-xl border-2 text-sm font-semibold transition-all",
                      form.specialty === s.value
                        ? "bg-primary/5 border-primary text-primary"
                        : "bg-bg border-border text-text-muted hover:border-primary hover:text-primary"
                    )}
                  >
                    <span className="text-2xl">{s.emoji}</span>
                    <span className="text-center leading-tight text-xs">{s.label}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Step 3: Class join code */}
        {step === 3 && (
          <div className="space-y-6">
            <div className="text-center py-2">
              <div className="w-14 h-14 bg-primary-highlight rounded-2xl flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl">🏫</span>
              </div>
              <h3 className="font-display font-bold text-lg text-text mb-2">Rejoindre une classe</h3>
              <p className="text-sm text-text-muted">
                Si votre professeur vous a donné un code de classe, entrez-le ici.
                Vous pourrez aussi le faire plus tard depuis votre profil.
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-text mb-1.5">
                Code de classe <span className="text-text-faint font-normal">(optionnel)</span>
              </label>
              <input
                type="text"
                value={form.classJoinCode}
                onChange={(e) => set("classJoinCode", e.target.value.toUpperCase().slice(0, 6))}
                placeholder="EX: MED4DZ"
                maxLength={6}
                className="w-full bg-bg border border-border rounded-xl px-4 py-3 text-text placeholder:text-text-faint focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-sm transition-shadow font-mono tracking-widest uppercase"
              />
            </div>

            <div className="bg-surface-offset rounded-xl p-4 text-sm space-y-1">
              <p className="font-semibold text-text mb-2">Récapitulatif :</p>
              <p className="text-text-muted"><span className="text-text font-medium">Nom :</span> {form.fullName}</p>
              <p className="text-text-muted"><span className="text-text font-medium">Email :</span> {form.email}</p>
              <p className="text-text-muted"><span className="text-text font-medium">Université :</span> {form.university}</p>
              <p className="text-text-muted">
                <span className="text-text font-medium">Cursus :</span>{" "}
                {SPECIALTIES.find(s => s.value === form.specialty)?.label} — {form.yearOfStudy}ème année
              </p>
            </div>
          </div>
        )}

        {/* Navigation */}
        <div className="flex items-center gap-3 mt-8">
          {step > 1 && (
            <Button
              type="button"
              variant="secondary"
              onClick={() => { setError(""); setStep((s) => s - 1) }}
              className="flex-1 rounded-xl h-12"
            >
              <ArrowLeft size={18} className="mr-2" /> Précédent
            </Button>
          )}

          {step < 3 ? (
            <Button
              type="button"
              onClick={nextStep}
              className="flex-1 rounded-xl h-12 font-semibold"
            >
              Suivant <ArrowRight size={18} className="ml-2" />
            </Button>
          ) : (
            <Button
              type="button"
              onClick={handleSubmit}
              disabled={loading}
              className="flex-1 rounded-xl h-12 font-semibold"
            >
              {loading
                ? <Loader2 className="animate-spin" size={20} />
                : "Créer mon compte"}
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
