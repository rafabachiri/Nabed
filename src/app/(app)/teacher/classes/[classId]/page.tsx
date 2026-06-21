import { notFound, redirect } from "next/navigation"
import { createClient } from "@/utils/supabase/server"
import Link from "next/link"
import { ArrowLeft, Users } from "lucide-react"
import { Button } from "@/components/ui/Button"
import { Badge } from "@/components/ui/Badge"
import { Card, CardContent } from "@/components/ui/Card"
import { CopyCode } from "@/components/teacher/CopyCode"

interface Props { params: { classId: string } }

export default async function ClassDetailPage({ params }: Props) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/auth/login")

  const { data: classData } = await supabase
    .from("classes")
    .select("id, name, year_level, join_code, teacher_id")
    .eq("id", params.classId)
    .single()

  if (!classData || classData.teacher_id !== user.id) notFound()

  const { data: students } = await supabase
    .from("class_students")
    .select("joined_at, profiles(id, full_name, xp, level, streak, last_active)")
    .eq("class_id", params.classId)
    .order("joined_at")

  return (
    <div className="p-4 lg:p-8 max-w-5xl mx-auto">
      <Button asChild variant="ghost" size="sm" className="mb-6">
        <Link href="/teacher/classes"><ArrowLeft size={16} className="mr-1" />Mes classes</Link>
      </Button>

      <div className="flex flex-col md:flex-row gap-4 items-start justify-between mb-8">
        <div>
          <h1 className="text-3xl font-display font-bold text-text">{classData.name}</h1>
          <div className="flex items-center gap-3 mt-2">
            <Badge variant="secondary">{classData.year_level}ème Année</Badge>
            <div className="flex items-center gap-2">
              <span className="text-xs text-text-muted">Code d&apos;accès:</span>
              <code className="font-mono font-bold text-primary bg-primary-highlight px-2 py-0.5 rounded">{classData.join_code}</code>
              <CopyCode code={classData.join_code} />
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2 text-text-muted">
          <Users size={18} />
          <span className="font-semibold">{students?.length ?? 0} étudiants</span>
        </div>
      </div>

      {students && students.length > 0 ? (
        <Card>
          <CardContent className="p-0">
            <div className="divide-y divide-border">
              {students.map((s, i) => {
                const p = s.profiles as unknown as { id: string; full_name: string; xp: number; level: number; streak: number; last_active: string | null } | null
                if (!p) return null
                const lastSeen = p.last_active ? new Date(p.last_active).toLocaleDateString("fr-DZ") : "Jamais"
                return (
                  <div key={i} className="flex items-center gap-4 p-4 hover:bg-surface-offset transition-colors">
                    <div className="w-9 h-9 rounded-full bg-primary-highlight border-2 border-primary/20 flex items-center justify-center text-base shrink-0">
                      👨‍⚕️
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-text text-sm truncate">{p.full_name}</p>
                      <p className="text-xs text-text-muted">Vu le {lastSeen}</p>
                    </div>
                    <div className="flex flex-col items-end gap-1 text-xs shrink-0">
                      <span className="font-bold text-primary">{p.xp.toLocaleString()} XP</span>
                      <span className="text-orange font-semibold">🔥 {p.streak}j</span>
                    </div>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card className="border-dashed">
          <CardContent className="p-10 text-center">
            <Users size={40} className="mx-auto mb-3 text-text-faint" />
            <p className="font-semibold text-text mb-1">Aucun étudiant pour l&apos;instant</p>
            <p className="text-sm text-text-muted">
              Partagez le code <code className="font-mono font-bold text-primary">{classData.join_code}</code> avec vos étudiants.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
