import { redirect } from "next/navigation"
import { Medal, BookMarked, Edit3, Settings, Users, GraduationCap } from "lucide-react"
import { createClient } from "@/utils/supabase/server"
import { Card, CardContent } from "@/components/ui/Card"
import { Badge } from "@/components/ui/Badge"
import { XPBar } from "@/components/ui/XPBar"
import { Button } from "@/components/ui/Button"
import { getLevelFromXP } from "@/lib/constants"
import { getDictionary } from "@/lib/i18n"
import { getLocale } from "@/lib/locale"

const BADGE_CATALOG = [
  { id: "first_word",    label: "Premier Mot",    icon: "🔤",   desc: "Premier terme appris" },
  { id: "streak_7",      label: "Une Semaine",    icon: "🔥",   desc: "7 jours consécutifs" },
  { id: "streak_30",     label: "Un Mois",        icon: "🔥🔥", desc: "30 jours consécutifs" },
  { id: "words_50",      label: "50 Mots",        icon: "📖",   desc: "50 mots appris" },
  { id: "words_100",     label: "100 Mots",       icon: "📚",   desc: "100 mots appris" },
  { id: "words_500",     label: "500 Mots",       icon: "🏛️",   desc: "500 mots appris" },
  { id: "cardio_master", label: "Cardiologue",    icon: "❤️",   desc: "Système cardio complété" },
  { id: "perfect_quiz",  label: "Quiz Parfait",   icon: "⭐",   desc: "100% à un quiz" },
  { id: "duel_winner",   label: "Champion du Duel", icon: "⚔️", desc: "Premier duel gagné" },
  { id: "first_game",    label: "Joueur",         icon: "🎮",   desc: "Premier jeu joué" },
]

/** Derive which badges are earned from the user's real stats. */
function deriveEarnedBadges(stats: {
  wordsLearned: number
  streak: number
  gamesPlayed: number
  duelsWon: number
  hasPerfectQuiz: boolean
  cardioComplete: boolean
}): Set<string> {
  const earned = new Set<string>()
  if (stats.wordsLearned >= 1) earned.add("first_word")
  if (stats.wordsLearned >= 50) earned.add("words_50")
  if (stats.wordsLearned >= 100) earned.add("words_100")
  if (stats.wordsLearned >= 500) earned.add("words_500")
  if (stats.streak >= 7) earned.add("streak_7")
  if (stats.streak >= 30) earned.add("streak_30")
  if (stats.gamesPlayed >= 1) earned.add("first_game")
  if (stats.duelsWon >= 1) earned.add("duel_winner")
  if (stats.hasPerfectQuiz) earned.add("perfect_quiz")
  if (stats.cardioComplete) earned.add("cardio_master")
  return earned
}

export default async function ProfilePage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/auth/login")

  const t = getDictionary(getLocale())

  const { data: profile } = await supabase
    .from("profiles")
    .select("id, full_name, username, university, year_of_study, specialty, department, xp, level, streak, role, plan, created_at")
    .eq("id", user.id)
    .single()

  if (!profile) redirect("/auth/login")

  const isTeacher = profile.role === "teacher"
  const isAdmin = profile.role === "admin"
  const roleEmoji = isTeacher ? "👩‍🏫" : isAdmin ? "⚙️" : "👨‍⚕️"

  // ───────────────────────── TEACHER / ADMIN PROFILE ─────────────────────────
  if (isTeacher || isAdmin) {
    const { data: classRows } = await supabase
      .from("classes")
      .select("id")
      .eq("teacher_id", user.id)
    const classIds = (classRows ?? []).map(c => c.id)

    let studentCount = 0
    if (classIds.length > 0) {
      const { count } = await supabase
        .from("class_students")
        .select("student_id", { count: "exact", head: true })
        .in("class_id", classIds)
      studentCount = count ?? 0
    }

    const memberSince = new Date(profile.created_at).toLocaleDateString(getLocale() === "en" ? "en-US" : "fr-FR", { year: "numeric", month: "long" })

    return (
      <div className="p-6 lg:p-10 max-w-5xl mx-auto space-y-8">
        <Card className="overflow-hidden border-none shadow-md">
          <div className="h-32 bg-gradient-to-r from-primary to-primary-hover relative">
            <Button variant="secondary" size="sm" className="absolute top-4 right-4 bg-white/20 text-white hover:bg-white/30 border-none">
              <Settings size={16} className="mr-2" /> {t.profile.settings}
            </Button>
          </div>
          <CardContent className="p-6 sm:p-10 relative pt-0 sm:pt-0">
            <div className="flex flex-col sm:flex-row items-center sm:items-end gap-6 -mt-12 sm:-mt-16 mb-6">
              <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-full border-4 border-surface bg-surface-2 flex items-center justify-center text-5xl shadow-md">
                {roleEmoji}
              </div>
              <div className="text-center sm:text-left flex-1">
                <h1 className="text-3xl font-display font-bold text-text">{profile.full_name}</h1>
                <p className="text-text-muted mt-1 font-medium">{profile.university ?? "—"}</p>
              </div>
              <div className="hidden sm:block">
                <Badge className="bg-primary text-white px-4 py-1.5 text-sm shadow-sm border-transparent">
                  {isTeacher ? t.common.teacher : t.common.admin}
                </Badge>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-center">
              <div className="p-4 rounded-xl border border-border">
                <span className="block text-2xl font-bold text-primary mb-1">{classIds.length}</span>
                <span className="text-xs text-text-muted uppercase tracking-wider font-semibold flex items-center justify-center gap-1">
                  <GraduationCap size={13} /> {t.profile.classesTaught}
                </span>
              </div>
              <div className="p-4 rounded-xl border border-border">
                <span className="block text-2xl font-bold text-orange mb-1">{studentCount}</span>
                <span className="text-xs text-text-muted uppercase tracking-wider font-semibold flex items-center justify-center gap-1">
                  <Users size={13} /> {t.profile.studentsReached}
                </span>
              </div>
              <div className="p-4 rounded-xl border border-border">
                <span className="block text-lg font-bold text-gold mb-1">{memberSince}</span>
                <span className="text-xs text-text-muted uppercase tracking-wider font-semibold">{t.profile.teacherSince}</span>
              </div>
            </div>

            {profile.department && (
              <p className="text-sm text-text-muted mt-6">
                <span className="font-semibold text-text">{t.profile.department}:</span> {profile.department}
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    )
  }

  // ───────────────────────── STUDENT PROFILE ─────────────────────────
  const [
    { data: badgeRows },
    { data: savedRows },
    { data: progressRows },
    { data: duelRows },
    { count: gamesPlayed },
    { data: perfectQuizRows },
  ] = await Promise.all([
    supabase.from("user_badges").select("badge_id").eq("user_id", user.id),
    supabase
      .from("saved_words")
      .select("word_id, saved_at, words(fr_term, en_term)")
      .eq("user_id", user.id)
      .order("saved_at", { ascending: false })
      .limit(8),
    supabase
      .from("user_word_progress")
      .select("word_id, words(body_system)")
      .eq("user_id", user.id)
      .gt("srs_level", 0),
    supabase.from("game_scores").select("id").eq("user_id", user.id).eq("game_type", "duel").gte("score", 5),
    supabase.from("game_scores").select("id", { count: "exact", head: true }).eq("user_id", user.id),
    supabase.from("quiz_results").select("id").eq("user_id", user.id).gte("score", 100).limit(1),
  ])

  const levelInfo = getLevelFromXP(profile.xp)
  const nextLevel = getLevelFromXP(profile.xp + 1)
  const wordsLearned = progressRows?.length ?? 0
  const duelsWon = duelRows?.length ?? 0

  const cardioLearned = (progressRows ?? []).filter(
    r => (r.words as unknown as { body_system: string } | null)?.body_system === "cardiovascular"
  ).length
  const cardioComplete = cardioLearned >= 1 // best-effort with available data

  // Merge DB-awarded badges with badges derived from real achievements.
  const derived = deriveEarnedBadges({
    wordsLearned,
    streak: profile.streak,
    gamesPlayed: gamesPlayed ?? 0,
    duelsWon,
    hasPerfectQuiz: (perfectQuizRows?.length ?? 0) > 0,
    cardioComplete,
  })
  const earnedBadgeIds = new Set<string>((badgeRows ?? []).map(b => b.badge_id))
  derived.forEach(id => earnedBadgeIds.add(id))

  const badges = BADGE_CATALOG.map(b => ({ ...b, earned: earnedBadgeIds.has(b.id) }))
  const earned = badges.filter(b => b.earned)
  const notEarned = badges.filter(b => !b.earned)

  const currentLevelXP = levelInfo.xp
  const nextLevelXP = nextLevel.xp > currentLevelXP ? nextLevel.xp : currentLevelXP + 1000
  const xpIntoLevel = profile.xp - currentLevelXP
  const xpNeeded = nextLevelXP - currentLevelXP

  return (
    <div className="p-6 lg:p-10 max-w-5xl mx-auto space-y-8">
      {/* Profile Header */}
      <Card className="overflow-hidden border-none shadow-md">
        <div className="h-32 bg-gradient-to-r from-primary to-primary-hover relative">
          <Button variant="secondary" size="sm" className="absolute top-4 right-4 bg-white/20 text-white hover:bg-white/30 border-none">
            <Settings size={16} className="mr-2" /> {t.profile.settings}
          </Button>
        </div>
        <CardContent className="p-6 sm:p-10 relative pt-0 sm:pt-0">
          <div className="flex flex-col sm:flex-row items-center sm:items-end gap-6 -mt-12 sm:-mt-16 mb-6">
            <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-full border-4 border-surface bg-surface-2 flex items-center justify-center text-5xl shadow-md relative group cursor-pointer">
              {roleEmoji}
              <div className="absolute inset-0 bg-black/40 rounded-full opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity text-white">
                <Edit3 size={22} />
              </div>
            </div>
            <div className="text-center sm:text-left flex-1">
              <h1 className="text-3xl font-display font-bold text-text">{profile.full_name}</h1>
              <p className="text-text-muted mt-1 font-medium">
                {profile.university ?? "Université inconnue"}
                {profile.year_of_study ? ` • ${profile.year_of_study}ème Année` : ""}
              </p>
            </div>
            <div className="hidden sm:block">
              <Badge className="bg-gold text-white px-4 py-1.5 text-sm shadow-sm border-transparent">
                Niveau {levelInfo.level} — {levelInfo.label}
              </Badge>
            </div>
          </div>

          <div className="bg-surface-offset rounded-2xl p-5 sm:p-6 mb-6">
            <XPBar level={levelInfo.level} currentXP={xpIntoLevel} nextLevelXP={xpNeeded} className="w-full" />
            <p className="text-center text-xs text-text-muted mt-3">
              {xpNeeded - xpIntoLevel} XP {getLocale() === "en" ? `to Level ${levelInfo.level + 1}` : `restants avant le Niveau ${levelInfo.level + 1}`}
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
            <div className="p-4 rounded-xl border border-border">
              <span className="block text-2xl font-bold text-primary mb-1">{wordsLearned}</span>
              <span className="text-xs text-text-muted uppercase tracking-wider font-semibold">{t.profile.wordsLearned}</span>
            </div>
            <div className="p-4 rounded-xl border border-border">
              <span className="block text-2xl font-bold text-orange mb-1">{profile.streak}</span>
              <span className="text-xs text-text-muted uppercase tracking-wider font-semibold">{t.profile.streakDays}</span>
            </div>
            <div className="p-4 rounded-xl border border-border">
              <span className="block text-2xl font-bold text-gold mb-1">{earned.length}</span>
              <span className="text-xs text-text-muted uppercase tracking-wider font-semibold">{t.profile.badges}</span>
            </div>
            <div className="p-4 rounded-xl border border-border">
              <span className="block text-2xl font-bold text-success mb-1">{duelsWon}</span>
              <span className="text-xs text-text-muted uppercase tracking-wider font-semibold">{t.profile.duelsWon}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Badges */}
        <div className="md:col-span-2 space-y-4">
          <h2 className="text-xl font-display font-bold flex items-center gap-2">
            <Medal className="text-gold" /> {t.profile.myBadges}
          </h2>
          <Card>
            <CardContent className="p-6">
              {earned.length > 0 && (
                <>
                  <p className="text-xs text-text-muted uppercase tracking-wider font-bold mb-3">{t.profile.unlocked}</p>
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 mb-6">
                    {earned.map(badge => (
                      <div key={badge.id} className="flex flex-col items-center text-center p-4 rounded-xl border bg-gold/5 border-gold/20">
                        <div className="text-3xl mb-2">{badge.icon}</div>
                        <span className="text-xs font-bold leading-tight">{badge.label}</span>
                        <span className="text-[10px] text-text-faint mt-1">{badge.desc}</span>
                      </div>
                    ))}
                  </div>
                </>
              )}
              {notEarned.length > 0 && (
                <>
                  <p className="text-xs text-text-muted uppercase tracking-wider font-bold mb-3">{t.profile.toUnlock}</p>
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                    {notEarned.map(badge => (
                      <div key={badge.id} className="flex flex-col items-center text-center p-4 rounded-xl border border-border opacity-40 grayscale">
                        <div className="text-3xl mb-2">{badge.icon}</div>
                        <span className="text-xs font-bold leading-tight">{badge.label}</span>
                        <span className="text-[10px] text-text-faint mt-1">{badge.desc}</span>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Saved Words */}
        <div className="space-y-4">
          <h2 className="text-xl font-display font-bold flex items-center gap-2">
            <BookMarked className="text-primary" /> {t.profile.savedWords}
          </h2>
          <Card>
            {savedRows && savedRows.length > 0 ? (
              <CardContent className="p-0">
                <div className="divide-y divide-border">
                  {savedRows.map((row, i) => {
                    const word = row.words as unknown as { fr_term: string; en_term: string } | null
                    return (
                      <div key={i} className="p-4 hover:bg-surface-offset transition-colors">
                        <p className="font-bold text-text text-sm">{word?.en_term}</p>
                        <p className="text-xs text-text-muted">{word?.fr_term}</p>
                      </div>
                    )
                  })}
                </div>
              </CardContent>
            ) : (
              <CardContent className="p-8 text-center">
                <BookMarked size={32} className="mx-auto mb-2 text-text-faint" />
                <p className="text-sm text-text-muted">{t.profile.noSaved}</p>
                <p className="text-xs text-text-faint mt-1">{t.profile.noSavedHint}</p>
              </CardContent>
            )}
          </Card>
        </div>
      </div>
    </div>
  )
}
