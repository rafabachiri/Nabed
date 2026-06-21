"use client"

import { Suspense, useState } from "react"
import { createClient } from "@/utils/supabase/client"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/Button"
import { Eye, EyeOff, Loader2, AlertCircle } from "lucide-react"
import { useLang } from "@/components/i18n/LanguageProvider"

function LoginForm() {
  const { t: dict } = useLang()
  const t = dict.auth
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const router = useRouter()
  const searchParams = useSearchParams()
  const next = searchParams.get("next") ?? "/dashboard"
  const urlError = searchParams.get("error")

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError("")

    const supabase = createClient()
    const { data, error: authError } = await supabase.auth.signInWithPassword({ email, password })

    if (authError) {
      setError(t.wrongCreds)
      setLoading(false)
      return
    }

    // Check if teacher is still pending
    if (data.user) {
      const { data: profile } = await supabase
        .from("profiles")
        .select("role, status")
        .eq("id", data.user.id)
        .single()

      if (profile?.role === "teacher" && profile?.status === "pending") {
        router.push("/auth/pending")
        return
      }

      if (profile?.role === "teacher" && profile?.status === "active") {
        router.push("/teacher/dashboard")
        router.refresh()
        return
      }
    }

    router.push(next)
    router.refresh()
  }

  const errorMessage = urlError === "verification_failed"
    ? t.verifFailed
    : urlError === "missing_code"
    ? t.invalidLink
    : error

  return (
    <div className="w-full max-w-md">
      <div className="bg-surface border border-border rounded-2xl shadow-md p-8">
        <h1 className="text-2xl font-display font-bold text-text mb-1">{t.login}</h1>
        <p className="text-text-muted text-sm mb-8">
          {t.welcome}
        </p>

        {errorMessage && (
          <div className="mb-6 flex items-start gap-3 bg-error-highlight text-error px-4 py-3 rounded-xl text-sm font-medium">
            <AlertCircle size={18} className="shrink-0 mt-0.5" />
            {errorMessage}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-text mb-1.5">
              {t.email}
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="vous@exemple.dz"
              required
              autoComplete="email"
              className="w-full bg-bg border border-border rounded-xl px-4 py-3 text-text placeholder:text-text-faint focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-shadow text-sm"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-sm font-medium text-text">{t.password}</label>
              <Link
                href="/auth/forgot-password"
                className="text-xs text-primary hover:underline"
              >
                {t.forgot}
              </Link>
            </div>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                autoComplete="current-password"
                className="w-full bg-bg border border-border rounded-xl px-4 py-3 pr-12 text-text placeholder:text-text-faint focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-shadow text-sm"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-text-muted hover:text-text transition-colors"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <Button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl h-12 text-base font-semibold mt-2"
          >
            {loading ? <Loader2 className="animate-spin" size={20} /> : t.signIn}
          </Button>
        </form>
      </div>

      <p className="text-center text-sm text-text-muted mt-6">
        {t.noAccount}{" "}
        <Link href="/auth/register" className="text-primary font-semibold hover:underline">
          {t.createAccount}
        </Link>
      </p>
    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="w-full max-w-md h-96 bg-surface rounded-2xl animate-pulse" />}>
      <LoginForm />
    </Suspense>
  )
}
