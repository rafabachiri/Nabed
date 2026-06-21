import { redirect } from "next/navigation"
import Link from "next/link"
import { createClient } from "@/utils/supabase/server"
import { Card, CardContent } from "@/components/ui/Card"
import { Badge } from "@/components/ui/Badge"
import { Button } from "@/components/ui/Button"
import { FlashcardHub } from "@/components/flashcard/FlashcardHub"
import { BrainCircuit, BookOpen } from "lucide-react"
import type { FlashCard } from "@/components/flashcard/FlashcardSession"

export default async function FlashcardsPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/auth/login")

  const today = new Date().toISOString().split("T")[0]

  // Due cards — already in progress AND due today
  const { data: dueRows } = await supabase
    .from("user_word_progress")
    .select(`
      srs_level, ease_factor, interval_days, next_review,
      words ( id, fr_term, en_term, en_definition, en_example, phonetic, audio_url, body_system, difficulty, word_root )
    `)
    .eq("user_id", user.id)
    .lte("next_review", today)
    .limit(30)

  // All decks
  const { data: decks } = await supabase
    .from("decks")
    .select("id, name_fr, name_en, body_system, year_level, cover_emoji, word_count")
    .eq("is_public", true)
    .order("year_level", { ascending: true })

  const dueCards: FlashCard[] = (dueRows ?? [])
    .filter((row) => row.words)
    .map((row) => {
      const w = row.words as unknown as Record<string, unknown>
      return {
        wordId:       w.id as string,
        frTerm:       w.fr_term as string,
        enTerm:       w.en_term as string,
        enDefinition: w.en_definition as string,
        enExample:    w.en_example as string | null,
        phonetic:     w.phonetic as string | null,
        audioUrl:     w.audio_url as string | null,
        bodySystem:   w.body_system as string,
        difficulty:   (w.difficulty as "easy" | "medium" | "hard") ?? "medium",
        wordRoot:     w.word_root as string | null,
        srsLevel:     row.srs_level,
        easeFactor:   row.ease_factor,
      }
    })

  return (
    <div className="p-6 lg:p-10 max-w-5xl mx-auto">
      <header className="mb-8">
        <h1 className="text-3xl font-display font-bold text-text flex items-center gap-3">
          <BrainCircuit className="text-primary" size={32} />
          Flashcards
        </h1>
        <p className="text-text-muted mt-1">
          Révisez avec la répétition espacée — le bon mot, au bon moment.
        </p>
      </header>

      {/* Hub handles session state client-side */}
      <FlashcardHub dueCards={dueCards} />

      {/* Decks */}
      <section className="mt-12">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-xl font-display font-bold flex items-center gap-2">
            <BookOpen className="text-primary" size={20} /> Tous les Decks
          </h2>
        </div>

        {decks && decks.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {decks.map((deck) => (
              <Link key={deck.id} href={`/flashcards/${deck.id}`}>
                <Card className="hover:border-primary transition-all cursor-pointer group hover:shadow-md h-full">
                  <CardContent className="p-6">
                    <div className="flex justify-between items-start mb-4">
                      <div className="w-14 h-14 rounded-2xl bg-surface-offset flex items-center justify-center text-3xl group-hover:scale-110 transition-transform">
                        {deck.cover_emoji}
                      </div>
                      {deck.year_level && (
                        <Badge variant="secondary">{deck.year_level}ème Année</Badge>
                      )}
                    </div>
                    <h3 className="font-display font-bold text-lg text-text group-hover:text-primary transition-colors mb-1">
                      {deck.name_fr}
                    </h3>
                    <p className="text-sm text-text-muted">{deck.word_count} mots</p>
                    <div className="mt-4 pt-4 border-t border-border">
                      <Button variant="outline" size="sm" className="w-full rounded-xl group-hover:bg-primary group-hover:text-white group-hover:border-primary transition-all">
                        Commencer le deck
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        ) : (
          <Card className="border-dashed">
            <CardContent className="p-10 text-center">
              <p className="text-text-muted text-sm">
                Aucun deck disponible pour l&apos;instant.{" "}
                <Link href="/admin/decks" className="text-primary hover:underline">
                  Créer un deck →
                </Link>
              </p>
            </CardContent>
          </Card>
        )}
      </section>
    </div>
  )
}
