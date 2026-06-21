import { redirect } from "next/navigation"
import { createClient } from "@/utils/supabase/server"
import { Database, Plus, Search } from "lucide-react"
import { Card, CardContent } from "@/components/ui/Card"
import { Badge } from "@/components/ui/Badge"
import { AddWordForm } from "@/components/admin/AddWordForm"
import { SystemFilter } from "@/components/admin/SystemFilter"

export default async function AdminWordsPage({
  searchParams,
}: {
  searchParams: { system?: string; q?: string }
}) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/auth/login")

  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single()
  if (profile?.role !== "admin") redirect("/dashboard")

  const systemFilter = searchParams.system ?? ""

  let query = supabase
    .from("words")
    .select("id, fr_term, en_term, en_definition, body_system, difficulty, word_root, created_at")
    .order("created_at", { ascending: false })
    .limit(60)

  if (systemFilter) query = query.eq("body_system", systemFilter)
  if (searchParams.q) query = query.ilike("fr_term", `%${searchParams.q}%`)

  const { data: words } = await query

  const { count: totalCount } = await supabase.from("words").select("id", { count: "exact", head: true })

  const DIFF_COLORS: Record<string, string> = {
    easy: "bg-success/10 text-success border-transparent",
    medium: "bg-gold/10 text-gold border-transparent",
    hard: "bg-error/10 text-error border-transparent",
  }

  return (
    <div className="p-6 lg:p-10 max-w-7xl mx-auto">
      <header className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-display font-bold text-text flex items-center gap-3">
            <Database className="text-primary" size={32} /> Vocabulaire
          </h1>
          <p className="text-text-muted mt-1">{totalCount ?? 0} termes médicaux dans la base de données.</p>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Add word form */}
        <div>
          <h2 className="text-lg font-display font-bold mb-4 flex items-center gap-2">
            <Plus size={18} /> Ajouter un mot
          </h2>
          <AddWordForm />
        </div>

        {/* Words list */}
        <div className="lg:col-span-2">
          <div className="flex gap-3 mb-4 flex-wrap">
            <form className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" size={15} />
              <input type="text" name="q" defaultValue={searchParams.q} placeholder="Rechercher un terme..."
                className="w-full bg-surface-offset border border-border rounded-xl pl-9 pr-4 py-2 text-sm focus:ring-2 focus:ring-primary focus:outline-none text-text placeholder:text-text-faint" />
              {systemFilter && <input type="hidden" name="system" value={systemFilter} />}
            </form>
            <SystemFilter current={systemFilter} searchQuery={searchParams.q} />
          </div>

          <Card>
            <CardContent className="p-0">
              {words && words.length > 0 ? (
                <div className="divide-y divide-border max-h-[600px] overflow-y-auto">
                  {words.map(w => (
                    <div key={w.id} className="p-4 hover:bg-surface-offset transition-colors">
                      <div className="flex items-center gap-3 mb-1">
                        <span className="font-semibold text-text text-sm">{w.fr_term}</span>
                        <span className="text-text-faint">→</span>
                        <span className="font-bold text-primary text-sm">{w.en_term}</span>
                        <Badge className={`${DIFF_COLORS[w.difficulty] ?? ""} text-xs ml-auto shrink-0`}>
                          {w.difficulty === "easy" ? "Facile" : w.difficulty === "hard" ? "Difficile" : "Moyen"}
                        </Badge>
                      </div>
                      <p className="text-xs text-text-muted line-clamp-2">{w.en_definition}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-xs text-text-faint">{w.body_system}</span>
                        {w.word_root && <span className="text-xs text-text-faint">• Racine: {w.word_root}</span>}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-10 text-center text-text-muted text-sm">
                  Aucun mot trouvé.
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
