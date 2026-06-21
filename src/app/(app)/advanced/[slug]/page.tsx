import { redirect, notFound } from "next/navigation"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { createClient } from "@/utils/supabase/server"
import { Card, CardContent } from "@/components/ui/Card"
import { Badge } from "@/components/ui/Badge"
import { FavoriteButton } from "@/components/ui/FavoriteButton"
import { getLocale } from "@/lib/locale"
import { getDictionary } from "@/lib/i18n"
import type { AdvancedTopic, KeyTerm } from "@/types/database"

export default async function AdvancedTopicPage({ params }: { params: { slug: string } }) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/auth/login")

  const locale = getLocale()
  const t = getDictionary(locale)

  const { data: topic } = await supabase
    .from("advanced_topics")
    .select("*")
    .eq("slug", params.slug)
    .maybeSingle()

  if (!topic) notFound()
  const topicData = topic as AdvancedTopic

  const { data: favRow } = await supabase
    .from("favorites")
    .select("id")
    .eq("user_id", user.id)
    .eq("item_type", "topic")
    .eq("item_id", topicData.id)
    .maybeSingle()

  const title = locale === "en" ? topicData.title_en : topicData.title_fr
  const keyTerms = (topicData.key_terms ?? []) as KeyTerm[]

  return (
    <div className="p-6 lg:p-10 max-w-3xl mx-auto">
      <Link href="/advanced" className="inline-flex items-center gap-2 text-sm text-text-muted hover:text-primary mb-6">
        <ArrowLeft size={16} /> {t.advanced.backToList}
      </Link>

      <div className="flex items-start gap-4 mb-6">
        <div className="w-16 h-16 rounded-2xl bg-surface-offset flex items-center justify-center text-4xl shrink-0">
          {topicData.emoji}
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            {topicData.category && <Badge variant="secondary">{topicData.category}</Badge>}
            <Badge className="bg-primary text-white border-transparent capitalize">{topicData.difficulty}</Badge>
          </div>
          <h1 className="text-3xl font-display font-bold text-text">{title}</h1>
        </div>
        <FavoriteButton itemType="topic" itemId={topicData.id} initial={!!favRow} />
      </div>

      <Card className="mb-8">
        <CardContent className="p-6 lg:p-8">
          <p className="text-text leading-relaxed whitespace-pre-line">{topicData.content_en}</p>
        </CardContent>
      </Card>

      {keyTerms.length > 0 && (
        <section>
          <h2 className="text-xl font-display font-bold text-text mb-4">{t.advanced.keyTerms}</h2>
          <div className="space-y-3">
            {keyTerms.map((term, i) => (
              <Card key={i}>
                <CardContent className="p-4">
                  <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1 mb-1">
                    <span className="font-bold text-text">{term.en}</span>
                    <span className="text-sm text-primary">{term.fr}</span>
                  </div>
                  <p className="text-sm text-text-muted">{term.def}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>
      )}
    </div>
  )
}
