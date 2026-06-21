import { redirect } from "next/navigation"
import { createClient } from "@/utils/supabase/server"
import { createAdminClient } from "@/utils/supabase/admin"
import { ShieldCheck, UserCheck } from "lucide-react"
import { Card, CardContent } from "@/components/ui/Card"
import { Badge } from "@/components/ui/Badge"
import { ApprovalActions } from "@/components/admin/ApprovalActions"

export default async function AdminApprovalsPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/auth/login")

  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single()
  if (profile?.role !== "admin") redirect("/dashboard")

  const admin = createAdminClient()
  const { data: pendingTeachers } = await admin
    .from("profiles")
    .select("id, full_name, university, department, created_at")
    .eq("role", "teacher")
    .eq("status", "pending")
    .order("created_at")

  const { data: activeTeachers } = await admin
    .from("profiles")
    .select("id, full_name, university, department, created_at")
    .eq("role", "teacher")
    .eq("status", "active")
    .order("created_at", { ascending: false })
    .limit(10)

  return (
    <div className="p-6 lg:p-10 max-w-5xl mx-auto">
      <header className="mb-8">
        <h1 className="text-3xl font-display font-bold text-text flex items-center gap-3">
          <ShieldCheck className="text-primary" size={32} /> Approbations
        </h1>
        <p className="text-text-muted mt-1">Approuvez ou refusez les comptes enseignants.</p>
      </header>

      {/* Pending */}
      <section className="mb-10">
        <h2 className="text-lg font-display font-bold mb-4 flex items-center gap-2">
          En attente
          {pendingTeachers && pendingTeachers.length > 0 && (
            <Badge className="bg-error text-white border-transparent">{pendingTeachers.length}</Badge>
          )}
        </h2>
        {pendingTeachers && pendingTeachers.length > 0 ? (
          <div className="space-y-3">
            {pendingTeachers.map(t => (
              <Card key={t.id} className="border-orange/30">
                <CardContent className="p-4 flex flex-col sm:flex-row sm:items-center gap-4">
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-text">{t.full_name}</p>
                    <p className="text-sm text-text-muted">{t.university}</p>
                    {t.department && <p className="text-xs text-text-faint">{t.department}</p>}
                    <p className="text-xs text-text-faint mt-1">
                      Inscrit le {new Date(t.created_at).toLocaleDateString("fr-DZ")}
                    </p>
                  </div>
                  <ApprovalActions teacherId={t.id} />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="border-dashed">
            <CardContent className="p-8 text-center text-text-muted text-sm">
              <UserCheck size={32} className="mx-auto mb-2 text-text-faint" />
              Aucun enseignant en attente d&apos;approbation.
            </CardContent>
          </Card>
        )}
      </section>

      {/* Recently approved */}
      <section>
        <h2 className="text-lg font-display font-bold mb-4">Récemment approuvés</h2>
        {activeTeachers && activeTeachers.length > 0 ? (
          <div className="space-y-2">
            {activeTeachers.map(t => (
              <div key={t.id} className="flex items-center gap-3 p-3 rounded-xl border border-border hover:bg-surface-offset transition-colors">
                <div className="w-8 h-8 rounded-full bg-success/10 flex items-center justify-center text-base shrink-0">👩‍🏫</div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-text text-sm truncate">{t.full_name}</p>
                  <p className="text-xs text-text-muted truncate">{t.university}</p>
                </div>
                <Badge className="bg-success/10 text-success border-transparent text-xs shrink-0">Approuvé</Badge>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-text-muted">Aucun enseignant approuvé récemment.</p>
        )}
      </section>
    </div>
  )
}
