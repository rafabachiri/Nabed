import { redirect } from "next/navigation"
import Link from "next/link"
import { createClient } from "@/utils/supabase/server"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/Card"
import { Badge } from "@/components/ui/Badge"
import { XPBar } from "@/components/ui/XPBar"
import { StreakFlame } from "@/components/ui/StreakFlame"
import { Button } from "@/components/ui/Button"
import {
  PlayCircle, Award, BrainCircuit, Gamepad2,
  HeartPulse, Stethoscope, ChevronRight, BookOpen, Mic,
} from "lucide-react"
import { getLevelFromXP, LEVEL_THRESHOLDS, BODY_SYSTEMS } from "@/lib/constants"
import { getDictionary, yearLabel } from "@/lib/i18n"
import { getLocale } from "@/lib/locale"

function getWeekStart(): string {
  const now = new Date()
  const day = now.getDay()
  const diff = now.getDate() - day + (day === 0 ? -6 : 1)
  const monday = new Date(now)
  monday.setDate(diff)
  monday.setHours(0, 0, 0, 0)
  return monday.toISOString()
}

export default async function DashboardPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect("/auth/login")

  const { data: profile } = await supabase
    .from("profiles")
    .select("id, full_name, university, year_of_study, specialty, xp, level, streak, role")
    .eq("id", user.id)
    .single()

  if (!profile) redirect("/auth/login")

  const locale = getLocale()
  const t = getDictionary(locale).dashboard

  const weekStart = getWeekStart()

  const [
    { count: wordsLearned },
    { count: duelsWon },
    { data: weeklyXpRows },
    { data: leaderboard },
  ] = await Promise.all([
    supabase
      .from("user_word_progress")
      .select("*", { count: "exact", head: true })
      .eq("user_id", user.id)
      .gt("times_correct", 0),

    supabase
      .from("duel_sessions")
      .select("*", { count: "exact", head: true })
      .eq("winner_id", user.id),

    supabase
      .from("xp_log")
      .select("amount")
      .eq("user_id", user.id)
      .gte("created_at", weekStart),

    supabase
      .from("leaderboard_weekly")
      .select("user_id, xp_earned, rank")
      .eq("week_start", weekStart.split("T")[0])
      .order("xp_earned", { ascending: false })
      .limit(5),
  ])

  const weeklyXP = weeklyXpRows?.reduce((sum, r) => sum + r.amount, 0) ?? 0
  const levelInfo = getLevelFromXP(profile.xp)
  const nextLevel = LEVEL_THRESHOLDS.find((t) => t.xp > profile.xp)

  // Body systems relevant to this user
  const yearFilter = profile.year_of_study ?? 1
  const relevantSystems = BODY_SYSTEMS.filter(
    (s) => s.year === null || s.year <= yearFilter
  ).slice(0, 4)

  // Map module progress (just count per system is enough for now; real join comes with content)
  const firstName = profile.full_name.split(" ")[0]

  return (
    <div className="p-6 lg:p-10 max-w-7xl mx-auto">
      {/* Header */}
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-display font-bold text-text tracking-tight">
            {t.hello}, {firstName} 👋
          </h1>
          <p className="text-text-muted mt-1">
            {profile.university ?? "Nabed"}
            {profile.year_of_study ? ` • ${yearLabel(locale, profile.year_of_study)}` : ""}
            {profile.specialty ? ` · ${profile.specialty}` : ""}
          </p>
        </div>
        <div className="flex items-center gap-6 bg-surface-2 p-3 px-5 rounded-2xl border border-border">
          <StreakFlame streak={profile.streak} />
          <div className="w-px h-6 bg-divider" />
          <div className="flex flex-col min-w-[130px]">
            <XPBar
              level={levelInfo.level}
              currentXP={profile.xp}
              nextLevelXP={nextLevel?.xp ?? profile.xp}
            />
          </div>
        </div>
      </header>

      {/* Daily Challenge */}
      <section className="mb-10">
        <Card className="bg-primary text-white border-none relative overflow-hidden">
          <div className="absolute top-0 right-0 p-6 opacity-10 pointer-events-none">
            <Award size={140} />
          </div>
          <CardHeader>
            <div className="flex justify-between items-center relative z-10">
              <Badge className="bg-white/20 text-white hover:bg-white/30 border-none">
                {t.dailyChallenge}
              </Badge>
              <span className="text-sm font-medium text-white/80">
                {t.resetsMidnight}
              </span>
            </div>
            <CardTitle className="text-white text-2xl mt-4 relative z-10">
              {t.challengeTitle}
            </CardTitle>
            <CardDescription className="text-white/80 relative z-10">
              {t.challengeDesc}
            </CardDescription>
          </CardHeader>
          <CardContent className="relative z-10 flex items-center justify-between">
            <span className="font-semibold text-gold-highlight flex items-center gap-1">
              +40 XP
            </span>
            <Button
              variant="secondary"
              className="bg-white text-primary hover:bg-white/90"
              asChild
            >
              <Link href="/flashcards">
                {t.startBtn} <PlayCircle className="ml-2" size={18} />
              </Link>
            </Button>
          </CardContent>
        </Card>
      </section>

      {/* Stats Row */}
      <section className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
        <Card>
          <CardContent className="p-4 flex flex-col items-center justify-center text-center">
            <span className="text-3xl font-bold text-orange mb-1">{profile.streak}</span>
            <span className="text-xs text-text-muted font-medium uppercase tracking-wider">
              {t.statStreak}
            </span>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex flex-col items-center justify-center text-center">
            <span className="text-3xl font-bold text-primary mb-1">
              {wordsLearned ?? 0}
            </span>
            <span className="text-xs text-text-muted font-medium uppercase tracking-wider">
              {t.statWords}
            </span>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex flex-col items-center justify-center text-center">
            <span className="text-3xl font-bold text-gold mb-1">
              {weeklyXP >= 1000 ? `${(weeklyXP / 1000).toFixed(1)}k` : weeklyXP}
            </span>
            <span className="text-xs text-text-muted font-medium uppercase tracking-wider">
              {t.statWeeklyXp}
            </span>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex flex-col items-center justify-center text-center">
            <span className="text-3xl font-bold text-success mb-1">{duelsWon ?? 0}</span>
            <span className="text-xs text-text-muted font-medium uppercase tracking-wider">
              {t.statDuels}
            </span>
          </CardContent>
        </Card>
      </section>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left: Learning + Cases */}
        <div className="lg:col-span-2 space-y-8">

          {/* Continue Learning */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-display font-bold flex items-center gap-2">
                <BrainCircuit className="text-primary" size={22} />
                {(wordsLearned ?? 0) > 0 ? t.resumeLearning : t.startLearning}
              </h2>
              <Button variant="ghost" size="sm" className="text-text-muted" asChild>
                <Link href="/learn">
                  {t.seeAll} <ChevronRight size={16} className="ml-1" />
                </Link>
              </Button>
            </div>

            {relevantSystems.length > 0 ? (
              <div className="grid sm:grid-cols-2 gap-4">
                {relevantSystems.map((system) => (
                  <Link key={system.slug} href={`/learn/${system.slug}`}>
                    <Card className="hover:border-primary transition-colors cursor-pointer group h-full">
                      <CardHeader className="pb-3">
                        <div className="flex justify-between items-start">
                          <div className="w-10 h-10 rounded-lg bg-surface-offset flex items-center justify-center text-xl">
                            {system.emoji}
                          </div>
                          <Badge variant="secondary">
                            {system.year ? yearLabel(locale, system.year) : t.allLevels}
                          </Badge>
                        </div>
                        <CardTitle className="mt-4 text-base group-hover:text-primary transition-colors">
                          {locale === "en" ? system.en : system.fr}
                        </CardTitle>
                        <CardDescription className="text-xs">
                          {(wordsLearned ?? 0) === 0 ? t.notStarted : t.inProgress}
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="w-full bg-surface-offset h-1.5 rounded-full overflow-hidden">
                          <div className="bg-primary h-full rounded-full w-0 group-hover:w-1 transition-all duration-500" />
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>
            ) : (
              <Card className="border-dashed">
                <CardContent className="p-8 text-center text-text-muted">
                  <BookOpen size={32} className="mx-auto mb-3 opacity-40" />
                  <p className="font-medium mb-2">{t.noModules}</p>
                  <p className="text-sm">{t.noModulesHint}</p>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Practice Hub */}
          <div>
            <h2 className="text-xl font-display font-bold flex items-center gap-2 mb-4">
              <Mic className="text-primary" size={22} /> {t.practice}
            </h2>
            <div className="grid grid-cols-3 gap-3">
              {[
                { href: "/practice/pronunciation", emoji: "🎙️", label: t.pronunciation },
                { href: "/practice/listening",     emoji: "👂", label: t.listening },
                { href: "/practice/writing",       emoji: "✍️", label: t.writing },
              ].map((item) => (
                <Link key={item.href} href={item.href}>
                  <Card className="hover:border-primary transition-colors cursor-pointer group text-center">
                    <CardContent className="p-4">
                      <div className="text-3xl mb-2 group-hover:scale-110 transition-transform inline-block">
                        {item.emoji}
                      </div>
                      <p className="text-xs font-semibold text-text-muted group-hover:text-primary transition-colors">
                        {item.label}
                      </p>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          </div>

          {/* Clinical Cases */}
          <div>
            <h2 className="text-xl font-display font-bold flex items-center gap-2 mb-4">
              <Stethoscope className="text-primary" size={22} /> {t.clinicalCases}
            </h2>
            <Link href="/cases">
              <Card className="group cursor-pointer hover:border-primary transition-colors">
                <CardContent className="p-0 flex sm:flex-row flex-col">
                  <div className="sm:w-1/3 bg-surface-offset h-28 sm:h-auto rounded-t-xl sm:rounded-l-xl sm:rounded-tr-none flex items-center justify-center">
                    <HeartPulse className="text-primary/40" size={44} />
                  </div>
                  <div className="p-5 flex-1">
                    <Badge variant="outline" className="mb-2 text-[10px]">
                      {t.caseSampleTag}
                    </Badge>
                    <h3 className="font-bold text-base mb-1">{t.caseSampleTitle}</h3>
                    <p className="text-sm text-text-muted line-clamp-2 mb-3">
                      {t.caseSampleDesc}
                    </p>
                    <span className="text-xs font-semibold text-primary flex items-center gap-1 group-hover:underline">
                      {t.readCase} <ChevronRight size={13} />
                    </span>
                  </div>
                </CardContent>
              </Card>
            </Link>
          </div>
        </div>

        {/* Right: Games + Leaderboard */}
        <div className="space-y-8">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-display font-bold flex items-center gap-2">
                <Gamepad2 className="text-orange" size={22} /> {t.miniGames}
              </h2>
            </div>
            <div className="flex flex-col gap-3">
              <Link href="/games/term-blast">
                <Card className="bg-gradient-to-r from-orange-highlight to-surface cursor-pointer hover:shadow-md transition-shadow">
                  <CardContent className="p-4 flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-orange text-white flex items-center justify-center text-xl shrink-0">
                      🚀
                    </div>
                    <div>
                      <h3 className="font-bold text-text">Term Blast</h3>
                      <p className="text-xs text-text-muted">{t.termBlastDesc}</p>
                    </div>
                  </CardContent>
                </Card>
              </Link>
              <Link href="/games/duel">
                <Card className="bg-gradient-to-r from-primary-highlight to-surface cursor-pointer hover:shadow-md transition-shadow">
                  <CardContent className="p-4 flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-primary text-white flex items-center justify-center text-xl shrink-0">
                      ⚔️
                    </div>
                    <div>
                      <h3 className="font-bold text-text">{t.duelName}</h3>
                      <p className="text-xs text-text-muted">{t.duelDesc}</p>
                    </div>
                  </CardContent>
                </Card>
              </Link>
              <Button variant="outline" size="sm" className="w-full rounded-xl" asChild>
                <Link href="/games">{t.seeAllGames} <ChevronRight size={14} className="ml-1" /></Link>
              </Button>
            </div>
          </div>

          {/* Leaderboard Peek */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-display font-bold">{t.weeklyRanking}</h2>
            </div>
            <Card>
              {leaderboard && leaderboard.length > 0 ? (
                <CardContent className="p-0">
                  <div className="divide-y divide-border">
                    {leaderboard.map((entry, i) => (
                      <div
                        key={entry.user_id}
                        className={`flex items-center gap-3 p-4 ${i === 0 ? "bg-gold/5" : ""} ${entry.user_id === user.id ? "bg-primary/5" : ""}`}
                      >
                        <span
                          className={`font-display font-bold w-5 text-sm ${
                            i === 0 ? "text-gold" : i === 1 ? "text-text-muted" : i === 2 ? "text-orange" : "text-text-faint"
                          }`}
                        >
                          {i + 1}
                        </span>
                        <div className="w-8 h-8 rounded-full bg-surface-offset flex items-center justify-center text-sm">
                          👨‍⚕️
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-bold truncate">
                            {entry.user_id === user.id ? t.you : `${t.player} ${i + 1}`}
                          </p>
                        </div>
                        <span className={`text-sm font-bold ${i === 0 ? "text-gold" : ""}`}>
                          {entry.xp_earned} XP
                        </span>
                      </div>
                    ))}
                  </div>
                  <Link
                    href="/leaderboard"
                    className="block p-3 text-center text-xs font-semibold text-primary hover:bg-surface-offset transition-colors rounded-b-xl"
                  >
                    {t.seeFullRanking}
                  </Link>
                </CardContent>
              ) : (
                <CardContent className="p-6 text-center">
                  <p className="text-sm font-semibold text-text mb-1">{t.beFirst}</p>
                  <p className="text-xs text-text-muted mb-4">
                    {t.beFirstHint}
                  </p>
                  <Button size="sm" variant="secondary" className="rounded-xl" asChild>
                    <Link href="/flashcards">{t.startToLearn}</Link>
                  </Button>
                </CardContent>
              )}
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
