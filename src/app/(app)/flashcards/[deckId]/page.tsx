import { notFound, redirect } from "next/navigation"
import { createClient } from "@/utils/supabase/server"
import { FlashcardHub } from "@/components/flashcard/FlashcardHub"
import { Button } from "@/components/ui/Button"
import { Badge } from "@/components/ui/Badge"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"
import type { FlashCard } from "@/components/flashcard/FlashcardSession"

interface Props {
  params: { deckId: string }
}

export default async function DeckSessionPage({ params }: Props) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/auth/login")

  // Fetch deck info
  const { data: deck } = await supabase
    .from("decks")
    .select("id, name_fr, name_en, body_system, year_level, cover_emoji, word_count")
    .eq("id", params.deckId)
    .single()

  if (!deck) notFound()

  // Fetch all words in this deck
  const { data: deckWordRows } = await supabase
    .from("deck_words")
    .select(`
      position,
      words ( id, fr_term, en_term, en_definition, en_example, phonetic, audio_url, body_system, difficulty, word_root )
    `)
    .eq("deck_id", params.deckId)
    .order("position")

  if (!deckWordRows || deckWordRows.length === 0) {
    return (
      <div className="p-6 lg:p-10 max-w-3xl mx-auto">
        <Button variant="ghost" size="sm" asChild className="mb-6">
          <Link href="/flashcards"><ArrowLeft size={16} className="mr-2" /> Retour</Link>
        </Button>
        <p className="text-text-muted">Ce deck ne contient pas encore de mots.</p>
      </div>
    )
  }

  const wordIds = deckWordRows
    .filter((r) => r.words)
    .map((r) => (r.words as unknown as Record<string, unknown>).id as string)

  // Fetch user's existing progress for these words
  const { data: progressRows } = await supabase
    .from("user_word_progress")
    .select("word_id, srs_level, ease_factor, next_review")
    .eq("user_id", user.id)
    .in("word_id", wordIds)

  const progressMap = new Map(
    (progressRows ?? []).map((p) => [
      p.word_id,
      { srsLevel: p.srs_level, easeFactor: p.ease_factor, nextReview: p.next_review },
    ])
  )

  const today = new Date().toISOString().split("T")[0]

  // Build cards: prioritise due/new cards first, then put already-known cards at end
  const allCards: FlashCard[] = deckWordRows
    .filter((r) => r.words)
    .map((r) => {
      const w = r.words as unknown as Record<string, unknown>
      const wordId = w.id as string
      const prog = progressMap.get(wordId)
      return {
        wordId,
        frTerm:       w.fr_term as string,
        enTerm:       w.en_term as string,
        enDefinition: w.en_definition as string,
        enExample:    w.en_example as string | null,
        phonetic:     w.phonetic as string | null,
        audioUrl:     w.audio_url as string | null,
        bodySystem:   w.body_system as string,
        difficulty:   (w.difficulty as "easy" | "medium" | "hard") ?? "medium",
        wordRoot:     w.word_root as string | null,
        srsLevel:     prog?.srsLevel ?? 0,
        easeFactor:   prog?.easeFactor ?? 2.5,
        _nextReview:  prog?.nextReview ?? today,
      } as FlashCard & { _nextReview: string }
    })
    .sort((a, b) => {
      const aTyped = a as FlashCard & { _nextReview: string }
      const bTyped = b as FlashCard & { _nextReview: string }
      // New cards first (srsLevel === 0), then due cards, then future cards
      const aDue = aTyped._nextReview <= today ? -1 : 1
      const bDue = bTyped._nextReview <= today ? -1 : 1
      return aDue - bDue
    })

  // Limit to 20 cards per session
  const sessionCards = allCards.slice(0, 20)

  return (
    <div className="p-4 lg:p-8 max-w-3xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <Button variant="ghost" size="sm" asChild>
          <Link href="/flashcards"><ArrowLeft size={16} className="mr-1" /> Retour</Link>
        </Button>
        <div className="flex items-center gap-3 min-w-0">
          <span className="text-3xl">{deck.cover_emoji}</span>
          <div className="min-w-0">
            <h1 className="text-xl font-display font-bold text-text truncate">{deck.name_fr}</h1>
            <div className="flex items-center gap-2 mt-0.5">
              {deck.year_level && (
                <Badge variant="secondary" className="text-xs">{deck.year_level}ème Année</Badge>
              )}
              <span className="text-xs text-text-muted">{deck.word_count} mots dans ce deck</span>
            </div>
          </div>
        </div>
      </div>

      <FlashcardHub dueCards={sessionCards} deckName={deck.name_fr} />
    </div>
  )
}
