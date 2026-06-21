import { redirect } from "next/navigation"
import { createClient } from "@/utils/supabase/server"
import { BookOpen, Plus } from "lucide-react"
import { Card, CardContent } from "@/components/ui/Card"
import { Badge } from "@/components/ui/Badge"
import { NewDeckForm } from "@/components/admin/NewDeckForm"

export default async function AdminDecksPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/auth/login")

  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single()
  if (profile?.role !== "admin") redirect("/dashboard")

  const { data: decks } = await supabase
    .from("decks")
    .select("id, name_fr, name_en, body_system, year_level, cover_emoji, word_count, is_public")
    .order("year_level", { ascending: true })

  return (
    <div className="p-6 lg:p-10 max-w-6xl mx-auto">
      <header className="mb-8">
        <h1 className="text-3xl font-display font-bold text-text flex items-center gap-3">
          <BookOpen className="text-gold" size={32} /> Decks & Modules
        </h1>
        <p className="text-text-muted mt-1">Organisez le vocabulaire en decks par système et année.</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Create new deck */}
        <div>
          <h2 className="text-lg font-display font-bold mb-4 flex items-center gap-2">
            <Plus size={18} /> Nouveau deck
          </h2>
          <NewDeckForm />
        </div>

        {/* Existing decks */}
        <div className="lg:col-span-2">
          <h2 className="text-lg font-display font-bold mb-4">Decks existants</h2>
          {decks && decks.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {decks.map(deck => (
                <Card key={deck.id} className="hover:border-primary transition-colors">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="text-2xl">{deck.cover_emoji}</span>
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-text text-sm truncate">{deck.name_fr}</p>
                        <p className="text-xs text-text-muted truncate">{deck.name_en}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 flex-wrap">
                      {deck.year_level && (
                        <Badge variant="secondary" className="text-xs">{deck.year_level}ème An</Badge>
                      )}
                      <Badge variant="secondary" className="text-xs">{deck.word_count} mots</Badge>
                      <Badge className={`text-xs border-transparent ${deck.is_public ? "bg-success/10 text-success" : "bg-error/10 text-error"}`}>
                        {deck.is_public ? "Public" : "Privé"}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card className="border-dashed">
              <CardContent className="p-8 text-center text-text-muted text-sm">
                Aucun deck créé.
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
