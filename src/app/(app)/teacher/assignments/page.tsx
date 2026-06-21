import { redirect } from "next/navigation"
import { createClient } from "@/utils/supabase/server"
import { ClipboardList } from "lucide-react"
import { Card, CardContent } from "@/components/ui/Card"
import { Badge } from "@/components/ui/Badge"
import { NewAssignmentForm } from "@/components/teacher/NewAssignmentForm"

export default async function TeacherAssignmentsPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/auth/login")

  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single()
  if (profile?.role !== "teacher") redirect("/dashboard")

  const [{ data: assignments }, { data: classes }] = await Promise.all([
    supabase
      .from("assignments")
      .select("id, title, due_date, description, classes(name)")
      .eq("teacher_id", user.id)
      .order("due_date", { ascending: false }),
    supabase
      .from("classes")
      .select("id, name, year_level")
      .eq("teacher_id", user.id),
  ])

  const today = new Date().toISOString().split("T")[0]

  return (
    <div className="p-6 lg:p-10 max-w-5xl mx-auto">
      <header className="mb-8">
        <h1 className="text-3xl font-display font-bold text-text flex items-center gap-3">
          <ClipboardList className="text-orange" size={32} /> Devoirs
        </h1>
        <p className="text-text-muted mt-1">Créez et gérez les devoirs pour vos classes.</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div>
          <h2 className="text-lg font-display font-bold mb-4">Nouveau devoir</h2>
          <NewAssignmentForm classes={classes ?? []} />
        </div>

        <div>
          <h2 className="text-lg font-display font-bold mb-4">Devoirs créés</h2>
          {assignments && assignments.length > 0 ? (
            <div className="space-y-3">
              {assignments.map(a => {
                const cl = a.classes as unknown as { name: string } | null
                const isPast = a.due_date < today
                return (
                  <Card key={a.id} className={isPast ? "opacity-60" : ""}>
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between gap-3 mb-1">
                        <p className="font-bold text-text text-sm">{a.title}</p>
                        <Badge variant={isPast ? "secondary" : "default"} className="shrink-0 text-xs">
                          {isPast ? "Terminé" : "Actif"}
                        </Badge>
                      </div>
                      <p className="text-xs text-text-muted">{cl?.name}</p>
                      {a.description && <p className="text-xs text-text-faint mt-1 line-clamp-2">{a.description}</p>}
                      <p className="text-xs text-text-muted mt-2">
                        Date limite: {new Date(a.due_date).toLocaleDateString("fr-DZ")}
                      </p>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          ) : (
            <Card className="border-dashed">
              <CardContent className="p-8 text-center text-text-muted text-sm">
                Aucun devoir créé.
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
