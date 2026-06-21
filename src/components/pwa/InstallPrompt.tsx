"use client"

import { useEffect, useState } from "react"
import { Download, X } from "lucide-react"

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>
}

const DISMISS_KEY = "pwa-install-dismissed"

/** "Install app" banner shown when the browser allows installation (Android/desktop Chrome).
 *  iOS Safari has no beforeinstallprompt — users install via Share → Add to Home Screen. */
export function InstallPrompt() {
  const [deferred, setDeferred] = useState<BeforeInstallPromptEvent | null>(null)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    if (localStorage.getItem(DISMISS_KEY)) return
    const handler = (e: Event) => {
      e.preventDefault()
      setDeferred(e as BeforeInstallPromptEvent)
      setVisible(true)
    }
    window.addEventListener("beforeinstallprompt", handler)
    return () => window.removeEventListener("beforeinstallprompt", handler)
  }, [])

  const install = async () => {
    if (!deferred) return
    await deferred.prompt()
    await deferred.userChoice
    setVisible(false)
    setDeferred(null)
  }

  const dismiss = () => {
    setVisible(false)
    localStorage.setItem(DISMISS_KEY, "1")
  }

  if (!visible) return null

  return (
    <div className="fixed bottom-24 md:bottom-6 right-4 z-[65] w-[min(20rem,calc(100vw-2rem))] bg-surface border border-border rounded-2xl shadow-lg p-4 flex items-center gap-3">
      <div className="w-10 h-10 rounded-xl bg-primary text-white flex items-center justify-center shrink-0">
        <Download size={20} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-text">Installer Nabed</p>
        <p className="text-xs text-text-muted">Ajoutez l&apos;app à votre écran d&apos;accueil.</p>
      </div>
      <button onClick={install} className="text-sm font-bold text-primary hover:underline shrink-0">
        Installer
      </button>
      <button onClick={dismiss} aria-label="Fermer" className="text-text-muted hover:text-text shrink-0">
        <X size={16} />
      </button>
    </div>
  )
}
