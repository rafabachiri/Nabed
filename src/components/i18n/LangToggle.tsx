"use client"

import { useRouter } from "next/navigation"
import { Languages } from "lucide-react"
import { LOCALE_COOKIE, type Locale } from "@/lib/i18n"

function setCookie(name: string, value: string) {
  document.cookie = `${name}=${value}; path=/; max-age=31536000; SameSite=Lax`
}

/** Self-contained language toggle (does not require LanguageProvider). */
export function LangToggle({ locale, className }: { locale: Locale; className?: string }) {
  const router = useRouter()
  const toggle = () => {
    const next: Locale = locale === "fr" ? "en" : "fr"
    setCookie(LOCALE_COOKIE, next)
    router.refresh()
  }
  return (
    <button
      onClick={toggle}
      title="FR / EN"
      aria-label="Switch language"
      className={
        className ??
        "inline-flex items-center gap-1.5 h-9 px-3 rounded-full border border-border bg-surface text-text-muted hover:text-primary hover:border-primary/40 transition-colors text-sm font-medium"
      }
    >
      <Languages size={16} />
      <span className="uppercase font-bold text-xs">{locale === "fr" ? "EN" : "FR"}</span>
    </button>
  )
}
