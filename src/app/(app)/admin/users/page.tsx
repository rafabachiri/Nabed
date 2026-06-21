import { redirect } from "next/navigation"
import { createClient } from "@/utils/supabase/server"
import { createAdminClient } from "@/utils/supabase/admin"
import { Users, Search } from "lucide-react"
import { Card, CardContent } from "@/components/ui/Card"
import { Badge } from "@/components/ui/Badge"

export default async function AdminUsersPage({
  searchParams,
}: {
  searchParams: { role?: string; q?: string }
}) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/auth/login")

  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single()
  if (profile?.role !== "admin") redirect("/dashboard")

  const admin = createAdminClient()
  const roleFilter = searchParams.role ?? "student"

  let query = admin
    .from("profiles")
    .select("id, full_name, university, xp, level, streak, role, status, plan, created_at")
    .eq("role", roleFilter)
    .order("created_at", { ascending: false })
    .limit(50)

  if (searchParams.q) {
    query = query.ilike("full_name", `%${searchParams.q}%`)
  }

  const { data: users } = await query

  const ROLE_TABS = ["student", "teacher", "admin"]
  const STATUS_COLORS: Record<string, string> = {
    active: "bg-success/10 text-success border-transparent",
    pending: "bg-gold/10 text-gold border-transparent",
    suspended: "bg-error/10 text-error border-transparent",
  }

  return (
    <div className="p-6 lg:p-10 max-w-6xl mx-auto">
      <header className="mb-8">
        <h1 className="text-3xl font-display font-bold text-text flex items-center gap-3">
          <Users className="text-primary" size={32} /> Utilisateurs
        </h1>
        <p className="text-text-muted mt-1">Gérez les comptes utilisateurs.</p>
      </header>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="flex gap-2">
          {ROLE_TABS.map(r => (
            <a
              key={r}
              href={`/admin/users?role=${r}`}
              className={`px-4 py-1.5 rounded-full text-sm font-semibold transition-all border ${roleFilter === r ? "bg-primary text-white border-primary" : "border-border text-text-muted hover:border-primary"}`}
            >
              {r.charAt(0).toUpperCase() + r.slice(1)}
            </a>
          ))}
        </div>
        <form className="relative flex-1 max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" size={16} />
          <input
            type="text"
            name="q"
            defaultValue={searchParams.q}
            placeholder="Rechercher..."
            className="w-full bg-surface-offset border border-border rounded-xl pl-9 pr-4 py-2 text-sm focus:ring-2 focus:ring-primary focus:outline-none text-text"
          />
          <input type="hidden" name="role" value={roleFilter} />
        </form>
      </div>

      <Card>
        <CardContent className="p-0">
          {users && users.length > 0 ? (
            <div className="divide-y divide-border">
              {users.map(u => (
                <div key={u.id} className="flex items-center gap-4 p-4 hover:bg-surface-offset transition-colors">
                  <div className="w-9 h-9 rounded-full bg-primary-highlight flex items-center justify-center text-base shrink-0">
                    {u.role === "teacher" ? "👩‍🏫" : u.role === "admin" ? "⚙️" : "👨‍⚕️"}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-text text-sm truncate">{u.full_name}</p>
                    <p className="text-xs text-text-muted truncate">{u.university ?? "—"}</p>
                  </div>
                  <div className="hidden md:flex items-center gap-3 text-xs text-text-muted shrink-0">
                    <span>{u.xp.toLocaleString()} XP</span>
                    <span>Niv. {u.level}</span>
                    <span>🔥 {u.streak}</span>
                  </div>
                  <Badge className={STATUS_COLORS[u.status ?? "active"] ?? ""}>
                    {u.status ?? "active"}
                  </Badge>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-10 text-center text-text-muted text-sm">
              Aucun utilisateur trouvé.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
