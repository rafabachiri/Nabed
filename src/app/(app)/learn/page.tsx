import { redirect } from "next/navigation"
import Link from "next/link"
import { BookOpen } from "lucide-react"
import { createClient } from "@/utils/supabase/server"
import { Card, CardContent } from "@/components/ui/Card"
import { Badge } from "@/components/ui/Badge"
import { ProgressBar } from "@/components/ui/ProgressBar"
import { BODY_SYSTEMS } from "@/lib/constants"
import { getDictionary, yearLabel } from "@/lib/i18n"
import { getLocale } from "@/lib/locale"

export default async function LearnPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/auth/login")

  const locale = getLocale()
  const t = getDictionary(locale).learn

  const { data: profile } = await supabase
    .from("profiles")
    .select("year_of_study")
    .eq("id", user.id)
    .single()

  // Word count per body_system
  const { data: wordCounts } = await supabase
    .from("words")
    .select("body_system")

  const totalBySystem: Record<string, number> = {}
  for (const row of wordCounts ?? []) {
    totalBySystem[row.body_system] = (totalBySystem[row.body_system] ?? 0) + 1
  }

  // Words the user has started (srs_level > 0 = learned at least once)
  const { data: progressRows } = await supabase
    .from("user_word_progress")
    .select("word_id, words(body_system)")
    .eq("user_id", user.id)
    .gt("srs_level", 0)

  const learnedBySystem: Record<string, number> = {}
  for (const row of progressRows ?? []) {
    const sys = (row.words as unknown as { body_system: string } | null)?.body_system
    if (sys) learnedBySystem[sys] = (learnedBySystem[sys] ?? 0) + 1
  }

  const userYear = profile?.year_of_study ?? 1

  const modules = BODY_SYSTEMS
    .filter(s => s.slug !== "abbreviations" && s.slug !== "word-roots")
    .map(system => {
      const total = totalBySystem[system.slug] ?? 0
      const learned = learnedBySystem[system.slug] ?? 0
      const progress = total > 0 ? Math.round((learned / total) * 100) : 0
      return { ...system, total, learned, progress }
    })
    .sort((a, b) => (a.year ?? 99) - (b.year ?? 99))

  const recommended = modules.find(m => m.progress > 0 && m.progress < 100) ?? modules[0]

  const byYear: Record<number, typeof modules> = {}
  for (const m of modules) {
    const y = m.year ?? 0
    if (!byYear[y]) byYear[y] = []
    byYear[y].push(m)
  }

  return (
    <div className="p-6 lg:p-10 max-w-7xl mx-auto">
      <header className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-display font-bold text-text flex items-center gap-3">
            <BookOpen className="text-primary" size={32} />
            {t.title}
          </h1>
          <p className="text-text-muted mt-2">{t.subtitle}</p>
        </div>
      </header>

      {/* Recommended */}
      {recommended && (
        <section className="mb-12">
          <h2 className="text-xs font-bold text-text-muted uppercase tracking-wider mb-4">{t.continue}</h2>
          <Link href={`/learn/${recommended.slug}`}>
            <Card className="border-l-4 border-l-primary hover:border-primary transition-all cursor-pointer group">
              <CardContent className="p-6 flex flex-col md:flex-row items-center gap-6">
                <div className="w-20 h-20 rounded-2xl bg-surface-offset flex items-center justify-center text-4xl shadow-sm shrink-0 group-hover:scale-110 transition-transform">
                  {recommended.emoji}
                </div>
                <div className="flex-1 w-full">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      {recommended.year && <Badge variant="secondary" className="mb-2">{yearLabel(locale, recommended.year)}</Badge>}
                      <h3 className="text-2xl font-bold font-display group-hover:text-primary transition-colors">{locale === "en" ? recommended.en : recommended.fr}</h3>
                    </div>
                    <span className="text-2xl font-bold text-primary">{recommended.progress}%</span>
                  </div>
                  <p className="text-text-muted text-sm mb-3">{recommended.learned} {t.wordsLearnedOf} {recommended.total}</p>
                  <ProgressBar value={recommended.progress} className="h-3" />
                </div>
              </CardContent>
            </Card>
          </Link>
        </section>
      )}

      {/* Modules by year */}
      {Object.keys(byYear).sort().map((yearKey) => {
        const year = Number(yearKey)
        const yearModules = byYear[year]
        return (
          <section key={year} className="mb-10">
            <h2 className="text-xs font-bold text-text-muted uppercase tracking-wider mb-4">
              {year > 0 ? yearLabel(locale, year) : t.allLevels}
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {yearModules.map(module => (
                <Link key={module.slug} href={`/learn/${module.slug}`}>
                  <Card className={`hover:border-primary transition-all cursor-pointer group hover:shadow-md h-full ${userYear < (module.year ?? 1) ? "opacity-60" : ""}`}>
                    <CardContent className="p-6">
                      <div className="flex justify-between items-start mb-4">
                        <div className="w-14 h-14 rounded-xl bg-surface-offset flex items-center justify-center text-3xl group-hover:scale-110 transition-transform">
                          {module.emoji}
                        </div>
                        {module.progress === 100 ? (
                          <Badge className="bg-success text-white border-transparent">{t.completed}</Badge>
                        ) : module.progress === 0 && module.total > 0 ? (
                          <Badge className="bg-orange text-white border-transparent">{t.newBadge}</Badge>
                        ) : (
                          <Badge variant="secondary">{module.year ? yearLabel(locale, module.year) : ""}</Badge>
                        )}
                      </div>
                      <h3 className="text-lg font-bold font-display mb-1 group-hover:text-primary transition-colors">{locale === "en" ? module.en : module.fr}</h3>
                      <p className="text-text-muted text-sm mb-4">
                        {module.total > 0 ? `${module.learned} / ${module.total} ${t.wordsOf}` : t.noWordsYet}
                      </p>
                      {module.total > 0 && (
                        <ProgressBar
                          value={module.progress}
                          className="h-2"
                          indicatorColor={module.progress === 100 ? "bg-success" : "bg-primary"}
                        />
                      )}
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          </section>
        )
      })}
    </div>
  )
}
