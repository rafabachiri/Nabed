"use client"

import { useEffect, useState } from "react"
import { Sun, Moon } from "lucide-react"

export function ThemeToggle({ compact = false }: { compact?: boolean }) {
  const [theme, setTheme] = useState<"light" | "dark">("light")

  useEffect(() => {
    const saved = localStorage.getItem("theme") as "light" | "dark" | null
    const preferred = saved ?? (window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light")
    setTheme(preferred)
    document.documentElement.setAttribute("data-theme", preferred)
  }, [])

  const toggle = () => {
    const next = theme === "light" ? "dark" : "light"
    setTheme(next)
    document.documentElement.setAttribute("data-theme", next)
    localStorage.setItem("theme", next)
  }

  return (
    <button
      onClick={toggle}
      title={theme === "light" ? "Passer en mode sombre" : "Passer en mode clair"}
      className={`flex items-center gap-2 rounded-xl transition-colors text-text-muted hover:bg-surface-offset hover:text-text ${compact ? "p-2" : "p-3 w-full"}`}
    >
      {theme === "light"
        ? <Moon size={20} strokeWidth={2} />
        : <Sun size={20} strokeWidth={2} />}
      {!compact && <span className="hidden lg:block text-sm">Mode {theme === "light" ? "sombre" : "clair"}</span>}
    </button>
  )
}
