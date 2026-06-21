import { redirect } from "next/navigation"
import Link from "next/link"
import { GraduationCap, ArrowRight } from "lucide-react"
import { createClient } from "@/utils/supabase/server"
import { Card, CardContent } from "@/components/ui/Card"
import { Badge } from "@/components/ui/Badge"
import { FavoriteButton } from "@/components/ui/FavoriteButton"
import { getLocale } from "@/lib/locale"
import { getDictionary } from "@/lib/i18n"
import type { AdvancedTopic } from "@/types/database"

export default async function AdvancedPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/auth/login")

  const locale = getLocale()
  const t = getDictionary(locale)

  const [{ data: topics }, { data: favRows }] = await Promise.all([
    supabase.from("advanced_topics").select("*").order("created_at", { ascending: true }),
    supabase.from("favorites").select("item_id").eq("user_id", user.id).eq("item_type", "topic"),
  ])

  const favSet = new Set((favRows ?? []).map(r => r.item_id))
  const list = (topics ?? []) as AdvancedTopic[]

  return (
    <div className="p-6 lg:p-10 max-w-7xl mx-auto">
      <header className="mb-8">
        <h1 className="text-3xl font-display font-bold text-text flex items-center gap-3">
          <GraduationCap className="text-primary" size={32} /> {t.advanced.title}
        </h1>
        <p className="text-text-muted mt-2">{t.advanced.subtitle}</p>
      </header>

      {list.length === 0 ? (
        <Card><CardContent className="p-10 text-center text-text-muted">{t.advanced.empty}</CardContent></Card>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {list.map(topic => {
            const title = locale === "en" ? topic.title_en : topic.title_fr
            const summary = locale === "en" ? topic.summary_en : topic.summary_fr
            return (
              <Card key={topic.id} className="hover:border-primary transition-all group h-full flex flex-col">
                <CardContent className="p-6 flex flex-col flex-1">
                  <div className="flex justify-between items-start mb-4">
                    <div className="w-14 h-14 rounded-xl bg-surface-offset flex items-center justify-center text-3xl group-hover:scale-110 transition-transform">
                      {topic.emoji}
                    </div>
                    <FavoriteButton itemType="topic" itemId={topic.id} initial={favSet.has(topic.id)} />
                  </div>
                  {topic.category && <Badge variant="secondary" className="mb-2 w-fit">{topic.category}</Badge>}
                  <h3 className="text-lg font-bold font-display mb-1 group-hover:text-primary transition-colors">{title}</h3>
                  <p className="text-text-muted text-sm mb-4 flex-1">{summary}</p>
                  <Link href={`/advanced/${topic.slug}`} className="text-sm font-semibold text-primary inline-flex items-center gap-1 hover:gap-2 transition-all">
                    {t.advanced.readMore} <ArrowRight size={16} />
                  </Link>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
