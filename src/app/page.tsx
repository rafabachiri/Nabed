import Link from "next/link"
import { Button } from "@/components/ui/Button"
import { LangToggle } from "@/components/i18n/LangToggle"
import { getLocale } from "@/lib/locale"
import { getDictionary } from "@/lib/i18n"
import {
  Brain, Trophy, ChevronRight, Gamepad2,
  GraduationCap, CheckCircle2, ArrowRight,
} from "lucide-react"

const SYSTEMS = [
  { emoji: "❤️", fr: "Cardiologie",   en: "Cardiology" },
  { emoji: "🫁", fr: "Pneumologie",   en: "Pulmonology" },
  { emoji: "🧠", fr: "Neurologie",    en: "Neurology" },
  { emoji: "🦴", fr: "Orthopédie",    en: "Orthopedics" },
  { emoji: "🩺", fr: "Sémiologie",    en: "Semiology" },
  { emoji: "💊", fr: "Pharmacologie", en: "Pharmacology" },
  { emoji: "🔬", fr: "Anatomie",      en: "Anatomy" },
]

export default function LandingPage() {
  const locale = getLocale()
  const t = getDictionary(locale).landing

  const STATS = [
    { value: "500+", label: t.statTerms },
    { value: "7",    label: t.statSystems },
    { value: "5",    label: t.statGames },
    { value: "100%", label: t.statLearning },
  ]

  const FEATURES = [
    { icon: Brain,         accent: "bg-primary-highlight text-primary", title: t.f1Title, body: t.f1Body, pills: t.f1Pills },
    { icon: Gamepad2,      accent: "bg-orange-highlight text-orange",   title: t.f2Title, body: t.f2Body, pills: t.f2Pills },
    { icon: GraduationCap, accent: "bg-gold-highlight text-gold",       title: t.f3Title, body: t.f3Body, pills: t.f3Pills },
    { icon: Trophy,        accent: "bg-success-highlight text-success", title: t.f4Title, body: t.f4Body, pills: t.f4Pills },
  ]

  const STEPS = [
    { num: "01", title: t.s1Title, desc: t.s1Desc },
    { num: "02", title: t.s2Title, desc: t.s2Desc },
    { num: "03", title: t.s3Title, desc: t.s3Desc },
  ]

  return (
    <div className="min-h-screen bg-bg flex flex-col">

      {/* ── Header ── */}
      <header className="px-6 lg:px-16 py-5 flex items-center justify-between sticky top-0 z-50 bg-bg/80 backdrop-blur border-b border-border/50">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-primary text-white flex items-center justify-center font-display font-bold text-lg shadow-sm">
            ✚
          </div>
          <span className="font-display font-bold text-xl tracking-tight text-text">Nabed</span>
        </div>
        <nav className="flex items-center gap-3">
          <LangToggle locale={locale} />
          <Link href="/auth/login" className="text-sm font-medium text-text-muted hover:text-primary transition-colors hidden sm:block">
            {t.login}
          </Link>
          <Button asChild className="rounded-full font-bold text-sm px-5">
            <Link href="/auth/register">{t.start}</Link>
          </Button>
        </nav>
      </header>

      <main className="flex-1">

        {/* ── Hero ── */}
        <section className="px-6 lg:px-16 pt-20 pb-24 text-center max-w-5xl mx-auto">
          <div className="inline-flex items-center gap-2 bg-primary-highlight text-primary-active px-4 py-1.5 rounded-full text-sm font-semibold mb-8 border border-primary/20">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-60" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-primary" />
            </span>
            {t.heroBadge}
          </div>

          <h1 className="text-5xl lg:text-7xl font-display font-bold tracking-tight text-text leading-tight mb-6">
            {t.heroTitle1}<br className="hidden lg:block" />
            <span className="text-primary"> {t.heroTitle2}</span>
          </h1>

          <p className="text-lg lg:text-xl text-text-muted max-w-2xl mx-auto mb-4">
            {t.heroSubtitle}
          </p>

          <ul className="flex flex-wrap justify-center gap-x-6 gap-y-2 text-sm text-text-muted mb-10">
            {t.heroChecks.map(f => (
              <li key={f} className="flex items-center gap-1.5">
                <CheckCircle2 size={14} className="text-primary shrink-0" />
                {f}
              </li>
            ))}
          </ul>

          <Button size="lg" asChild className="rounded-full font-bold text-base shadow-md group px-8">
            <Link href="/auth/register">
              {t.createAccount}
              <ChevronRight size={18} className="ml-1 group-hover:translate-x-1 transition-transform" />
            </Link>
          </Button>

        </section>

        {/* ── Stats bar ── */}
        <section className="border-y border-border bg-surface">
          <div className="max-w-5xl mx-auto px-6 lg:px-16 py-8 grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            {STATS.map(s => (
              <div key={s.label}>
                <p className="text-3xl font-display font-bold text-primary">{s.value}</p>
                <p className="text-sm text-text-muted mt-1">{s.label}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ── Features ── */}
        <section className="px-6 lg:px-16 py-24 max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <p className="text-sm font-semibold text-primary uppercase tracking-widest mb-2">{t.featuresKicker}</p>
            <h2 className="text-3xl lg:text-4xl font-display font-bold text-text">
              {t.featuresTitle}
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {FEATURES.map(f => {
              const Icon = f.icon
              return (
                <div key={f.title} className="bg-surface border border-border rounded-2xl p-7 hover:border-primary/40 hover:shadow-md transition-all">
                  <div className={`w-12 h-12 rounded-xl ${f.accent} flex items-center justify-center mb-5`}>
                    <Icon size={22} />
                  </div>
                  <h3 className="text-xl font-display font-bold text-text mb-2">{f.title}</h3>
                  <p className="text-text-muted text-sm leading-relaxed mb-4">{f.body}</p>
                  <div className="flex flex-wrap gap-2">
                    {f.pills.map(p => (
                      <span key={p} className="text-xs font-medium bg-surface-offset text-text-muted px-3 py-1 rounded-full border border-border">
                        {p}
                      </span>
                    ))}
                  </div>
                </div>
              )
            })}
          </div>
        </section>

        {/* ── Systems covered ── */}
        <section className="bg-surface border-y border-border">
          <div className="px-6 lg:px-16 py-16 max-w-5xl mx-auto">
            <div className="text-center mb-10">
              <p className="text-sm font-semibold text-primary uppercase tracking-widest mb-2">{t.systemsKicker}</p>
              <h2 className="text-3xl font-display font-bold text-text">{t.systemsTitle}</h2>
              <p className="text-text-muted mt-2 text-sm">{t.systemsSubtitle}</p>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-7 gap-3">
              {SYSTEMS.map(s => (
                <div key={s.fr} className="bg-bg border border-border rounded-xl p-4 text-center hover:border-primary/50 hover:bg-primary-highlight transition-all group">
                  <div className="text-3xl mb-2">{s.emoji}</div>
                  <p className="text-xs font-semibold text-text group-hover:text-primary-active">{locale === "en" ? s.en : s.fr}</p>
                  <p className="text-[10px] text-text-faint">{locale === "en" ? s.fr : s.en}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── How it works ── */}
        <section className="px-6 lg:px-16 py-24 max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <p className="text-sm font-semibold text-primary uppercase tracking-widest mb-2">{t.howKicker}</p>
            <h2 className="text-3xl lg:text-4xl font-display font-bold text-text">{t.howTitle}</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
            <div className="hidden md:block absolute top-[72px] left-1/4 right-1/4 h-0.5 bg-border" />
            {STEPS.map((step) => (
              <div key={step.num} className="text-center">
                <div className="w-16 h-16 rounded-2xl bg-primary-highlight border-2 border-primary/30 flex items-center justify-center mx-auto mb-5">
                  <span className="text-xl font-display font-bold text-primary">{step.num}</span>
                </div>
                <h3 className="font-display font-bold text-text text-lg mb-2">{step.title}</h3>
                <p className="text-sm text-text-muted leading-relaxed">{step.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ── Final CTA ── */}
        <section className="px-6 lg:px-16 py-20 bg-primary">
          <div className="max-w-3xl mx-auto text-center">
            <div className="text-4xl mb-4">🩺</div>
            <h2 className="text-3xl lg:text-4xl font-display font-bold text-white mb-4">
              {t.ctaTitle}
            </h2>
            <p className="text-primary-highlight/80 mb-8 text-lg">
              {t.ctaSubtitle}
            </p>
            <Button
              asChild
              className="bg-white text-primary hover:bg-primary-highlight font-bold text-base px-8 rounded-full shadow-lg group"
              size="lg"
            >
              <Link href="/auth/register">
                {t.createAccount}
                <ArrowRight size={18} className="ml-2 group-hover:translate-x-1 transition-transform" />
              </Link>
            </Button>
          </div>
        </section>

      </main>

      {/* ── Footer ── */}
      <footer className="border-t border-border bg-surface px-6 lg:px-16 py-8">
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-md bg-primary text-white flex items-center justify-center font-bold text-sm">
              ✚
            </div>
            <span className="font-display font-bold text-text">Nabed</span>
            <span className="text-text-faint text-sm">— نبض المعرفة الطبية</span>
          </div>
          <p className="text-xs text-text-faint text-center">
            {t.footerTagline} · &copy; {new Date().getFullYear()}
          </p>
          <div className="flex items-center gap-4 text-sm text-text-muted">
            <Link href="/auth/login" className="hover:text-primary transition-colors">{t.login}</Link>
            <Link href="/auth/register" className="hover:text-primary transition-colors">{t.register}</Link>
          </div>
        </div>
      </footer>

    </div>
  )
}
