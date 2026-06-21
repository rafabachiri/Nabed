import { redirect } from "next/navigation"
import { createClient } from "@/utils/supabase/server"
import { createAdminClient } from "@/utils/supabase/admin"
import Link from "next/link"
import { Settings, Users, Database, ShieldAlert, BookOpen, Stethoscope, ShieldCheck } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card"
import { Badge } from "@/components/ui/Badge"
import { Button } from "@/components/ui/Button"
import { getDictionary } from "@/lib/i18n"
import { getLocale } from "@/lib/locale"

export default async function AdminPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/auth/login")

  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single()
  if (profile?.role !== "admin") redirect("/dashboard")

  const t = getDictionary(getLocale()).admin

  const admin = createAdminClient()

  const [
    { count: userCount },
    { count: wordCount },
    { count: pendingCount },
  ] = await Promise.all([
    admin.from("profiles").select("id", { count: "exact", head: true }).eq("role", "student"),
    admin.from("words").select("id", { count: "exact", head: true }),
    admin.from("profiles").select("id", { count: "exact", head: true }).eq("role", "teacher").eq("status", "pending"),
  ])

  return (
    <div className="p-6 lg:p-10 max-w-7xl mx-auto">
      <header className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-display font-bold text-text flex items-center gap-3">
            <Settings className="text-primary" size={32} /> {t.title}
          </h1>
          <p className="text-text-muted mt-2">{t.subtitle}</p>
        </div>
        <Badge className="bg-error text-white border-transparent px-3 py-1">{t.restricted}</Badge>
      </header>

      {/* Stats */}
      <section className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
        <Card className="border-l-4 border-l-primary">
          <CardContent className="p-4">
            <span className="text-3xl font-bold text-text">{userCount ?? 0}</span>
            <p className="text-xs text-text-muted uppercase tracking-wider font-semibold mt-1 flex items-center gap-1"><Users size={12} />{t.students}</p>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-orange">
          <CardContent className="p-4">
            <span className="text-3xl font-bold text-text">{wordCount ?? 0}</span>
            <p className="text-xs text-text-muted uppercase tracking-wider font-semibold mt-1 flex items-center gap-1"><Database size={12} />{t.words}</p>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-error">
          <CardContent className="p-4">
            <span className="text-3xl font-bold text-text">{pendingCount ?? 0}</span>
            <p className="text-xs text-text-muted uppercase tracking-wider font-semibold mt-1 flex items-center gap-1"><ShieldAlert size={12} />{t.pending}</p>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-success">
          <CardContent className="p-4">
            <span className="text-3xl font-bold text-text">—</span>
            <p className="text-xs text-text-muted uppercase tracking-wider font-semibold mt-1">{t.duelsPerDay}</p>
          </CardContent>
        </Card>
      </section>

      {/* Modules */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card className="hover:border-error transition-colors">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ShieldCheck className="text-error" size={20} /> {t.approvals}
              {(pendingCount ?? 0) > 0 && <Badge className="bg-error text-white border-transparent ml-auto">{pendingCount}</Badge>}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-text-muted text-sm mb-4">{t.approvalsDesc}</p>
            <Button asChild variant="outline" className="w-full">
              <Link href="/admin/approvals">{t.viewRequests}</Link>
            </Button>
          </CardContent>
        </Card>

        <Card className="hover:border-primary transition-colors">
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Database className="text-primary" size={20} />{t.vocabulary}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-text-muted text-sm mb-4">{t.vocabularyDesc}</p>
            <Button asChild variant="outline" className="w-full"><Link href="/admin/words">{t.manageWords}</Link></Button>
          </CardContent>
        </Card>

        <Card className="hover:border-primary transition-colors">
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Users className="text-orange" size={20} />{t.users}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-text-muted text-sm mb-4">{t.usersDesc}</p>
            <Button asChild variant="outline" className="w-full"><Link href="/admin/users">{t.manageUsers}</Link></Button>
          </CardContent>
        </Card>

        <Card className="hover:border-primary transition-colors">
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><BookOpen className="text-gold" size={20} />{t.decks}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-text-muted text-sm mb-4">{t.decksDesc}</p>
            <Button asChild variant="outline" className="w-full"><Link href="/admin/decks">{t.manageModules}</Link></Button>
          </CardContent>
        </Card>

        <Card className="hover:border-primary transition-colors">
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Stethoscope className="text-success" size={20} />{t.cases}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-text-muted text-sm mb-4">{t.casesDesc}</p>
            <Button asChild variant="outline" className="w-full"><Link href="/admin/cases">{t.manageCases}</Link></Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
