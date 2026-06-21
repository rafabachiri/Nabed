import { redirect } from "next/navigation"
import { Trophy, Crown, Flame } from "lucide-react"
import { createClient } from "@/utils/supabase/server"
import { Card, CardContent } from "@/components/ui/Card"
import { Badge } from "@/components/ui/Badge"
import { LeaderboardFilter } from "@/components/leaderboard/LeaderboardFilter"
import { getDictionary } from "@/lib/i18n"
import { getLocale } from "@/lib/locale"

export default async function LeaderboardPage({
  searchParams,
}: {
  searchParams: { filter?: string }
}) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/auth/login")

  const t = getDictionary(getLocale()).leaderboard

  const { data: currentProfile } = await supabase
    .from("profiles")
    .select("university")
    .eq("id", user.id)
    .single()

  const filter = searchParams.filter ?? "global"

  let query = supabase
    .from("profiles")
    .select("id, full_name, university, xp, level, streak, role")
    .eq("role", "student")
    .order("xp", { ascending: false })
    .limit(50)

  if (filter === "university" && currentProfile?.university) {
    query = query.eq("university", currentProfile.university)
  }

  const { data: users } = await query

  const ranked = (users ?? []).map((u, i) => ({ ...u, rank: i + 1 }))
  const top3 = ranked.slice(0, 3)
  const currentUserRank = ranked.findIndex(u => u.id === user.id)

  function xpLabel(xp: number) {
    if (xp >= 1000) return `${(xp / 1000).toFixed(1)}k`
    return xp.toLocaleString()
  }

  const PODIUM_ORDER = top3.length >= 3
    ? [top3[1], top3[0], top3[2]]
    : top3

  return (
    <div className="p-6 lg:p-10 max-w-5xl mx-auto">
      <header className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-display font-bold text-text flex items-center gap-3">
            <Trophy className="text-gold" size={32} fill="currentColor" />
            {t.title}
          </h1>
          <p className="text-text-muted mt-2">{t.subtitle}</p>
        </div>
        <LeaderboardFilter current={filter} hasUniversity={!!currentProfile?.university} />
      </header>

      {/* Podium */}
      {top3.length === 3 && (
        <div className="hidden sm:flex justify-center items-end gap-4 mb-12 mt-8 h-52 px-4">
          {PODIUM_ORDER.map((u) => {
            const actualRank = u.rank
            const isFirst = actualRank === 1
            const heightClass = isFirst ? "h-36" : actualRank === 2 ? "h-24" : "h-20"
            const colorClass = isFirst
              ? "bg-gold/20 border-gold/30"
              : actualRank === 2
              ? "bg-surface-offset border-border"
              : "bg-orange/10 border-orange/20"
            const rankBadge = isFirst
              ? <Badge className="absolute -top-3 -right-3 bg-gold text-white border-transparent font-bold">#{actualRank}</Badge>
              : actualRank === 2
              ? <Badge className="absolute -top-3 -right-3 bg-surface-offset text-text-muted border-border font-bold">#{actualRank}</Badge>
              : <Badge className="absolute -top-3 -right-3 bg-orange text-white border-transparent font-bold">#{actualRank}</Badge>

            return (
              <div key={u.id} className={`flex flex-col items-center ${isFirst ? "w-1/3 max-w-[200px]" : "w-1/3 max-w-[160px]"}`}>
                {isFirst && <Crown className="text-gold mb-1" size={28} fill="currentColor" />}
                <div className={`${isFirst ? "text-5xl" : "text-4xl"} mb-2 relative`}>
                  👨‍⚕️
                  {rankBadge}
                </div>
                <p className="font-bold text-center text-sm truncate w-full">{u.full_name}</p>
                <p className="text-xs text-text-muted text-center truncate w-full mb-2">
                  {u.university?.split(" ").slice(0, 2).join(" ")}
                </p>
                <div className={`w-full ${heightClass} rounded-t-xl border border-b-0 ${colorClass} flex items-center justify-center`}>
                  <span className={`font-bold text-sm ${isFirst ? "text-gold" : actualRank === 3 ? "text-orange" : "text-text-muted"}`}>
                    {xpLabel(u.xp)} XP
                  </span>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* List */}
      <Card className="shadow-md border-none">
        <CardContent className="p-0">
          {ranked.length === 0 ? (
            <div className="p-10 text-center text-text-muted">
              {t.empty}
            </div>
          ) : (
            <div className="divide-y divide-border">
              {ranked.map(u => {
                const isMe = u.id === user.id
                return (
                  <div
                    key={u.id}
                    className={`flex items-center gap-4 p-4 transition-colors ${
                      isMe ? "bg-primary/5 border-l-4 border-l-primary" : "hover:bg-surface-offset"
                    }`}
                  >
                    <div className="w-8 text-center shrink-0">
                      {u.rank === 1 ? <Crown size={20} className="text-gold mx-auto" fill="currentColor" /> :
                       u.rank === 2 ? <span className="font-display font-bold text-text-muted text-lg">2</span> :
                       u.rank === 3 ? <span className="font-display font-bold text-orange text-lg">3</span> :
                       <span className="font-display font-bold text-text-muted">{u.rank}</span>}
                    </div>

                    <div className="w-11 h-11 rounded-full bg-surface-2 flex items-center justify-center text-xl shrink-0 shadow-sm border border-border">
                      👨‍⚕️
                    </div>

                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-text flex items-center gap-2 truncate text-sm">
                        {u.full_name}
                        {isMe && <Badge variant="secondary" className="text-[10px] py-0 px-1.5 bg-primary/10 text-primary border-transparent">{t.you}</Badge>}
                      </p>
                      <p className="text-xs text-text-muted truncate">{u.university}</p>
                    </div>

                    <div className="flex flex-col items-end shrink-0 gap-1">
                      <span className="font-bold text-text text-sm">{xpLabel(u.xp)} <span className="text-xs text-text-muted font-normal">XP</span></span>
                      <div className="flex items-center gap-1 text-xs font-semibold text-orange bg-orange/10 px-2 py-0.5 rounded-full">
                        <Flame size={11} fill="currentColor" /> {u.streak}
                      </div>
                    </div>
                  </div>
                )
              })}

              {/* Current user callout if not in top 50 */}
              {currentUserRank === -1 && (
                <div className="flex items-center gap-4 p-4 bg-primary/5 border-l-4 border-l-primary border-t-2 border-t-primary/20">
                  <div className="w-8 text-center shrink-0">
                    <span className="font-display font-bold text-text-muted">?</span>
                  </div>
                  <div className="flex-1">
                    <p className="font-bold text-sm text-text">{t.notInTop}</p>
                    <p className="text-xs text-text-muted">{t.keepLearning}</p>
                  </div>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
