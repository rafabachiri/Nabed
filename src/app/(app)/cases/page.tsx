import { redirect } from "next/navigation"
import { createClient } from "@/utils/supabase/server"
import Link from "next/link"
import { Stethoscope, Clock, Lock } from "lucide-react"
import { Card, CardContent } from "@/components/ui/Card"
import { Badge } from "@/components/ui/Badge"
import { Button } from "@/components/ui/Button"
import { getDictionary } from "@/lib/i18n"
import { getLocale } from "@/lib/locale"

export default async function CasesPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/auth/login")

  const locale = getLocale()
  const dict = getDictionary(locale)
  const t = dict.cases

  const { data: cases } = await supabase
    .from("clinical_cases")
    .select("id, title_fr, title_en, body_system, difficulty, specialty, is_published, year_level, estimated_time_min")
    .eq("is_published", true)
    .order("created_at", { ascending: false })

  const { data: profile } = await supabase
    .from("profiles")
    .select("plan, year_of_study")
    .eq("id", user.id)
    .single()

  const isPremium = profile?.plan !== "free"

  const DIFF_COLORS: Record<string, string> = {
    easy: "bg-success/10 text-success border-transparent",
    medium: "bg-gold/10 text-gold border-transparent",
    hard: "bg-error/10 text-error border-transparent",
  }

  return (
    <div className="p-6 lg:p-10 max-w-5xl mx-auto">
      <header className="mb-8">
        <h1 className="text-3xl font-display font-bold text-text flex items-center gap-3">
          <Stethoscope className="text-success" size={32} />
          {t.title}
        </h1>
        <p className="text-text-muted mt-2">{t.subtitle}</p>
      </header>

      {cases && cases.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {cases.map((c, i) => {
            const locked = i >= 2 && !isPremium
            return (
              <Card key={c.id} className={`transition-all hover:shadow-md group ${locked ? "opacity-60" : "hover:border-success"}`}>
                <CardContent className="p-6">
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex flex-wrap gap-2">
                      <Badge className={DIFF_COLORS[c.difficulty] ?? ""}>
                        {c.difficulty === "easy" ? dict.common.diffEasy : c.difficulty === "hard" ? dict.common.diffHard : dict.common.diffMedium}
                      </Badge>
                      {c.body_system && <Badge variant="secondary" className="text-xs">{c.body_system}</Badge>}
                    </div>
                    {locked && <Lock size={16} className="text-text-faint shrink-0" />}
                  </div>
                  <h2 className="text-lg font-display font-bold text-text mb-1 group-hover:text-success transition-colors">
                    {locale === "en" ? c.title_en : c.title_fr}
                  </h2>
                  <p className="text-sm text-text-muted mb-4">{locale === "en" ? c.title_fr : c.title_en}</p>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1 text-xs text-text-faint">
                      <Clock size={13} />
                      <span>{c.estimated_time_min ?? 15} min</span>
                    </div>
                    {locked ? (
                      <Button variant="outline" size="sm" disabled className="rounded-xl text-xs">
                        <Lock size={12} className="mr-1" /> {t.premium}
                      </Button>
                    ) : (
                      <Button asChild size="sm" variant="outline" className="rounded-xl text-xs group-hover:bg-success group-hover:text-white group-hover:border-success transition-all">
                        <Link href={`/cases/${c.id}`}>{t.start}</Link>
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      ) : (
        <Card className="border-dashed">
          <CardContent className="p-16 text-center">
            <Stethoscope size={48} className="mx-auto mb-4 text-text-faint" />
            <h2 className="text-xl font-display font-bold text-text mb-2">{t.comingSoonTitle}</h2>
            <p className="text-text-muted text-sm">
              {t.comingSoonDesc}
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
