import { notFound, redirect } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, BookOpen, BrainCircuit } from "lucide-react"
import { createClient } from "@/utils/supabase/server"
import { Button } from "@/components/ui/Button"
import { Badge } from "@/components/ui/Badge"
import { Card, CardContent } from "@/components/ui/Card"
import { ProgressBar } from "@/components/ui/ProgressBar"
import { BODY_SYSTEMS } from "@/lib/constants"
import { SystemQuiz } from "@/components/learn/SystemQuiz"
import { getDictionary, yearLabel } from "@/lib/i18n"
import { getLocale } from "@/lib/locale"
import type { Word } from "@/types/database"

interface Props {
  params: { systemSlug: string }
}

export default async function SystemPage({ params }: Props) {
  const system = BODY_SYSTEMS.find(s => s.slug === params.systemSlug)
  if (!system) notFound()

  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/auth/login")

  const locale = getLocale()
  const dict = getDictionary(locale)
  const t = dict.learnDetail
  const systemName = locale === "en" ? system.en : system.fr

  const [{ data: words }, { data: progressRows }] = await Promise.all([
    supabase
      .from("words")
      .select("id, fr_term, en_term, en_definition, en_example, phonetic, body_system, difficulty, word_root, prefix, suffix, audio_url, year_level, specialty, tags, created_at")
      .eq("body_system", system.slug)
      .order("difficulty"),
    supabase
      .from("user_word_progress")
      .select("word_id, srs_level, times_seen, times_correct")
      .eq("user_id", user.id),
  ])

  const progressMap = new Map(
    (progressRows ?? []).map(p => [p.word_id, p])
  )

  const allWords: Word[] = words ?? []
  const learnedCount = allWords.filter(w => (progressMap.get(w.id)?.srs_level ?? 0) > 0).length
  const progress = allWords.length > 0 ? Math.round((learnedCount / allWords.length) * 100) : 0

  // Find matching deck for flashcard shortcut
  const { data: deck } = await supabase
    .from("decks")
    .select("id, name_fr")
    .eq("body_system", system.slug)
    .eq("is_public", true)
    .limit(1)
    .single()

  return (
    <div className="p-4 lg:p-8 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <Button variant="ghost" size="sm" asChild>
          <Link href="/learn"><ArrowLeft size={16} className="mr-1" /> {t.back}</Link>
        </Button>
      </div>

      <div className="flex flex-col md:flex-row gap-6 items-start mb-8">
        <div className="w-20 h-20 rounded-2xl bg-surface-offset flex items-center justify-center text-5xl shrink-0 shadow-sm">
          {system.emoji}
        </div>
        <div className="flex-1">
          <div className="flex flex-wrap items-center gap-2 mb-2">
            {system.year && <Badge variant="secondary">{yearLabel(locale, system.year)}</Badge>}
            <Badge variant="secondary">{allWords.length} {t.words}</Badge>
          </div>
          <h1 className="text-3xl font-display font-bold text-text mb-1">{systemName}</h1>
          <p className="text-text-muted text-sm mb-3">{locale === "en" ? system.fr : system.en}</p>
          {allWords.length > 0 && (
            <div className="max-w-sm">
              <div className="flex justify-between text-xs text-text-muted mb-1">
                <span>{learnedCount} {t.learned}</span>
                <span>{progress}%</span>
              </div>
              <ProgressBar value={progress} className="h-2" />
            </div>
          )}
        </div>
        {deck && (
          <Button asChild className="shrink-0">
            <Link href={`/flashcards/${deck.id}`}>
              <BrainCircuit size={16} className="mr-2" /> Flashcards
            </Link>
          </Button>
        )}
      </div>

      {allWords.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="p-10 text-center">
            <BookOpen size={40} className="mx-auto mb-3 text-text-faint" />
            <p className="text-text-muted">{t.noWords}</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-8">
          {/* Quick Quiz */}
          <SystemQuiz words={allWords} systemName={systemName} />

          {/* Word list */}
          <section>
            <h2 className="text-lg font-display font-bold mb-4 flex items-center gap-2">
              <BookOpen size={18} className="text-primary" /> {t.glossary}
            </h2>
            <div className="space-y-3">
              {allWords.map((word) => {
                const prog = progressMap.get(word.id)
                const isLearned = (prog?.srs_level ?? 0) > 0
                return (
                  <Card
                    key={word.id}
                    className={`transition-all ${isLearned ? "border-success/30 bg-success/5" : ""}`}
                  >
                    <CardContent className="p-4 flex flex-col sm:flex-row sm:items-start gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap mb-1">
                          <span className="font-semibold text-text">{word.fr_term}</span>
                          <span className="text-text-muted">→</span>
                          <span className="font-bold text-primary">{word.en_term}</span>
                          {word.phonetic && (
                            <span className="text-xs font-mono text-text-faint">{word.phonetic}</span>
                          )}
                        </div>
                        <p className="text-sm text-text-muted leading-relaxed">{word.en_definition}</p>
                        {word.word_root && (
                          <p className="text-xs text-text-faint mt-1">
                            {t.root}: <span className="font-medium">{word.word_root}</span>
                          </p>
                        )}
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <Badge
                          variant="secondary"
                          className={`text-xs ${
                            word.difficulty === "easy" ? "bg-success/10 text-success border-transparent" :
                            word.difficulty === "hard" ? "bg-error/10 text-error border-transparent" :
                            ""
                          }`}
                        >
                          {word.difficulty === "easy" ? dict.common.diffEasy : word.difficulty === "hard" ? dict.common.diffHard : dict.common.diffMedium}
                        </Badge>
                        {isLearned && (
                          <span className="text-success text-xs font-semibold">✓ {t.learnedTag}</span>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          </section>
        </div>
      )}
    </div>
  )
}
