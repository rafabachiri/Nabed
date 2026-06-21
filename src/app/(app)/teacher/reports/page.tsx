import { redirect } from "next/navigation"
import { createClient } from "@/utils/supabase/server"
import { BarChart3 } from "lucide-react"
import { Card, CardContent } from "@/components/ui/Card"

export default async function TeacherReportsPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/auth/login")

  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single()
  if (profile?.role !== "teacher") redirect("/dashboard")

  const { data: classes } = await supabase
    .from("classes")
    .select("id, name, year_level, class_students(profiles(xp, streak, last_active))")
    .eq("teacher_id", user.id)

  return (
    <div className="p-6 lg:p-10 max-w-5xl mx-auto">
      <header className="mb-8">
        <h1 className="text-3xl font-display font-bold text-text flex items-center gap-3">
          <BarChart3 className="text-success" size={32} /> Rapports
        </h1>
        <p className="text-text-muted mt-1">Suivez la progression de vos étudiants.</p>
      </header>

      {classes && classes.length > 0 ? (
        <div className="space-y-6">
          {classes.map(c => {
            const students = c.class_students as unknown as { profiles: { xp: number; streak: number; last_active: string | null } | null }[]
            const activeToday = students.filter(s => {
              const la = s.profiles?.last_active
              if (!la) return false
              return la.split("T")[0] === new Date().toISOString().split("T")[0]
            }).length
            const avgXP = students.length > 0
              ? Math.round(students.reduce((sum, s) => sum + (s.profiles?.xp ?? 0), 0) / students.length)
              : 0
            const avgStreak = students.length > 0
              ? Math.round(students.reduce((sum, s) => sum + (s.profiles?.streak ?? 0), 0) / students.length)
              : 0

            return (
              <Card key={c.id}>
                <CardContent className="p-6">
                  <h2 className="text-lg font-display font-bold mb-4">{c.name} <span className="text-text-muted font-normal text-sm">({c.year_level}ème Année)</span></h2>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="bg-surface-offset p-4 rounded-xl text-center">
                      <p className="text-2xl font-bold text-primary">{students.length}</p>
                      <p className="text-xs text-text-muted mt-1">Étudiants</p>
                    </div>
                    <div className="bg-surface-offset p-4 rounded-xl text-center">
                      <p className="text-2xl font-bold text-success">{activeToday}</p>
                      <p className="text-xs text-text-muted mt-1">Actifs aujourd&apos;hui</p>
                    </div>
                    <div className="bg-surface-offset p-4 rounded-xl text-center">
                      <p className="text-2xl font-bold text-gold">{avgXP.toLocaleString()}</p>
                      <p className="text-xs text-text-muted mt-1">XP moyen</p>
                    </div>
                    <div className="bg-surface-offset p-4 rounded-xl text-center">
                      <p className="text-2xl font-bold text-orange">{avgStreak}j</p>
                      <p className="text-xs text-text-muted mt-1">Série moyenne</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      ) : (
        <Card className="border-dashed">
          <CardContent className="p-12 text-center text-text-muted">
            Créez des classes pour voir les rapports de progression.
          </CardContent>
        </Card>
      )}
    </div>
  )
}
