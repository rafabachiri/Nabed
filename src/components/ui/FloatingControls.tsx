"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Sun, Moon, Languages } from "lucide-react"
import { LOCALE_COOKIE, type Locale } from "@/lib/i18n"
import { useLang } from "@/components/i18n/LanguageProvider"

function setCookie(name: string, value: string) {
  document.cookie = `${name}=${value}; path=/; max-age=31536000; SameSite=Lax`
}

export function FloatingControls() {
  const router = useRouter()
  const { locale, t } = useLang()
  const [theme, setTheme] = useState<"light" | "dark">("light")
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    const saved = (localStorage.getItem("theme") as "light" | "dark" | null)
    const preferred = saved ?? (window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light")
    setTheme(preferred)
    document.documentElement.setAttribute("data-theme", preferred)
    setMounted(true)
  }, [])

  const toggleTheme = () => {
    const next = theme === "light" ? "dark" : "light"
    setTheme(next)
    document.documentElement.setAttribute("data-theme", next)
    localStorage.setItem("theme", next)
  }

  const toggleLang = () => {
    const next: Locale = locale === "fr" ? "en" : "fr"
    setCookie(LOCALE_COOKIE, next)
    router.refresh()
  }

  if (!mounted) return null

  return (
    <div className="fixed bottom-20 md:bottom-4 left-4 z-[60] flex flex-col gap-2">
      <button
        onClick={toggleLang}
        title={t.settings.language}
        aria-label={t.settings.language}
        className="flex items-center gap-1.5 h-11 px-3 rounded-full bg-surface border border-border shadow-md text-text-muted hover:text-primary hover:border-primary/40 transition-colors"
      >
        <Languages size={18} />
        <span className="text-xs font-bold uppercase">{locale}</span>
      </button>
      <button
        onClick={toggleTheme}
        title={theme === "light" ? t.settings.toDark : t.settings.toLight}
        aria-label={theme === "light" ? t.settings.toDark : t.settings.toLight}
        className="flex items-center justify-center w-11 h-11 rounded-full bg-surface border border-border shadow-md text-text-muted hover:text-primary hover:border-primary/40 transition-colors"
      >
        {theme === "light" ? <Moon size={18} /> : <Sun size={18} />}
      </button>
    </div>
  )
}
