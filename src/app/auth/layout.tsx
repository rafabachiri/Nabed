import Link from "next/link"
import { LanguageProvider } from "@/components/i18n/LanguageProvider"
import { LangToggle } from "@/components/i18n/LangToggle"
import { getLocale } from "@/lib/locale"

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  const locale = getLocale()
  return (
    <LanguageProvider locale={locale}>
      <div className="min-h-screen bg-bg flex flex-col">
        <header className="px-6 py-5 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-9 h-9 rounded-lg bg-primary text-white flex items-center justify-center font-display font-bold text-lg shadow-sm group-hover:bg-primary-hover transition-colors">
              N
            </div>
            <span className="font-display font-bold text-xl tracking-tight text-text">Nabed</span>
          </Link>
          <LangToggle locale={locale} />
        </header>
        <main className="flex-1 flex items-center justify-center px-4 py-10">
          {children}
        </main>
      </div>
    </LanguageProvider>
  )
}
