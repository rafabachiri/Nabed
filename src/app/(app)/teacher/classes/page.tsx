import { redirect } from "next/navigation"
import { createClient } from "@/utils/supabase/server"
import Link from "next/link"
import { Users, Plus } from "lucide-react"
import { Card, CardContent } from "@/components/ui/Card"
import { Badge } from "@/components/ui/Badge"
import { NewClassForm } from "@/components/teacher/NewClassForm"

export default async function TeacherClassesPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/auth/login")

  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single()
  if (profile?.role !== "teacher") redirect("/dashboard")

  const { data: classes } = await supabase
    .from("classes")
    .select("id, name, year_level, join_code, class_students(count)")
    .eq("teacher_id", user.id)
    .order("created_at", { ascending: false })

  return (
    <div className="p-6 lg:p-10 max-w-5xl mx-auto">
      <header className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-display font-bold text-text flex items-center gap-3">
            <Users className="text-primary" size={32} /> Mes Classes
          </h1>
          <p className="text-text-muted mt-1">Gérez vos classes et suivez la progression des étudiants.</p>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Create new class */}
        <div>
          <h2 className="text-lg font-display font-bold mb-4 flex items-center gap-2">
            <Plus size={18} /> Nouvelle classe
          </h2>
          <NewClassForm />
        </div>

        {/* Existing classes */}
        <div>
          <h2 className="text-lg font-display font-bold mb-4">Classes existantes</h2>
          {classes && classes.length > 0 ? (
            <div className="space-y-3">
              {classes.map(c => {
                const cnt = c.class_students as unknown as { count: number }[]
                return (
                  <Link key={c.id} href={`/teacher/classes/${c.id}`}>
                    <Card className="hover:border-primary transition-all cursor-pointer group">
                      <CardContent className="p-4 flex items-center justify-between gap-4">
                        <div className="min-w-0">
                          <p className="font-bold text-text group-hover:text-primary transition-colors truncate">{c.name}</p>
                          <p className="text-xs text-text-muted">{c.year_level}ème Année</p>
                          <div className="mt-1 flex items-center gap-2">
                            <span className="text-xs text-text-faint">Code:</span>
                            <code className="text-xs font-mono bg-surface-offset px-1.5 py-0.5 rounded">{c.join_code}</code>
                          </div>
                        </div>
                        <Badge variant="secondary" className="shrink-0">{cnt?.[0]?.count ?? 0} étudiants</Badge>
                      </CardContent>
                    </Card>
                  </Link>
                )
              })}
            </div>
          ) : (
            <Card className="border-dashed">
              <CardContent className="p-8 text-center text-text-muted text-sm">
                Aucune classe créée. Commencez par créer votre première classe.
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
