import { redirect } from "next/navigation"
import { createClient } from "@/utils/supabase/server"
import Link from "next/link"
import { Home, Users, ClipboardList, TrendingUp, BookOpen } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card"
import { Button } from "@/components/ui/Button"
import { Badge } from "@/components/ui/Badge"
import { getDictionary, yearLabel } from "@/lib/i18n"
import { getLocale } from "@/lib/locale"

export default async function TeacherDashboard() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/auth/login")

  const locale = getLocale()
  const t = getDictionary(locale).teacher

  const { data: profile } = await supabase
    .from("profiles")
    .select("role, full_name, department")
    .eq("id", user.id)
    .single()

  if (profile?.role !== "teacher") redirect("/dashboard")

  const [{ data: classes }, { data: assignments }] = await Promise.all([
    supabase
      .from("classes")
      .select("id, name, year_level, class_students(count)")
      .eq("teacher_id", user.id)
      .order("created_at", { ascending: false }),
    supabase
      .from("assignments")
      .select("id, title, due_date, class_id, classes(name)")
      .eq("teacher_id", user.id)
      .gte("due_date", new Date().toISOString().split("T")[0])
      .order("due_date")
      .limit(5),
  ])

  const totalStudents = classes?.reduce((sum, c) => {
    const cnt = c.class_students as unknown as { count: number }[]
    return sum + (cnt?.[0]?.count ?? 0)
  }, 0) ?? 0

  return (
    <div className="p-6 lg:p-10 max-w-7xl mx-auto">
      <header className="mb-8">
        <h1 className="text-3xl font-display font-bold text-text flex items-center gap-3">
          <Home className="text-primary" size={32} />
          {t.dashboard}
        </h1>
        <p className="text-text-muted mt-1">{t.welcome}, {profile.full_name} !</p>
      </header>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
        <Card className="border-l-4 border-l-primary">
          <CardContent className="p-4">
            <span className="text-3xl font-bold text-text">{classes?.length ?? 0}</span>
            <p className="text-xs text-text-muted uppercase tracking-wider font-semibold mt-1 flex items-center gap-1">
              <Users size={12} /> {t.classes}
            </p>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-success">
          <CardContent className="p-4">
            <span className="text-3xl font-bold text-text">{totalStudents}</span>
            <p className="text-xs text-text-muted uppercase tracking-wider font-semibold mt-1">{t.students}</p>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-orange">
          <CardContent className="p-4">
            <span className="text-3xl font-bold text-text">{assignments?.length ?? 0}</span>
            <p className="text-xs text-text-muted uppercase tracking-wider font-semibold mt-1">{t.activeAssignments}</p>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-gold">
          <CardContent className="p-4">
            <span className="text-3xl font-bold text-text">—</span>
            <p className="text-xs text-text-muted uppercase tracking-wider font-semibold mt-1">{t.completionRate}</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Classes */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <CardTitle className="text-lg font-display flex items-center gap-2">
              <Users size={18} className="text-primary" /> {t.myClasses}
            </CardTitle>
            <Button asChild size="sm" variant="outline" className="rounded-xl text-xs">
              <Link href="/teacher/classes">{t.manage}</Link>
            </Button>
          </CardHeader>
          <CardContent className="p-0">
            {classes && classes.length > 0 ? (
              <div className="divide-y divide-border">
                {classes.slice(0, 5).map(c => {
                  const cnt = c.class_students as unknown as { count: number }[]
                  return (
                    <Link key={c.id} href={`/teacher/classes/${c.id}`} className="flex items-center justify-between p-4 hover:bg-surface-offset transition-colors">
                      <div>
                        <p className="font-semibold text-text text-sm">{c.name}</p>
                        <p className="text-xs text-text-muted">{c.year_level ? yearLabel(locale, c.year_level) : ""}</p>
                      </div>
                      <Badge variant="secondary">{cnt?.[0]?.count ?? 0} {t.studentsCount}</Badge>
                    </Link>
                  )
                })}
              </div>
            ) : (
              <div className="p-8 text-center">
                <Users size={32} className="mx-auto mb-2 text-text-faint" />
                <p className="text-sm text-text-muted mb-3">{t.noClasses}</p>
                <Button asChild size="sm" className="rounded-xl">
                  <Link href="/teacher/classes">{t.createClass}</Link>
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Upcoming assignments */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <CardTitle className="text-lg font-display flex items-center gap-2">
              <ClipboardList size={18} className="text-orange" /> {t.upcomingAssignments}
            </CardTitle>
            <Button asChild size="sm" variant="outline" className="rounded-xl text-xs">
              <Link href="/teacher/assignments">{t.manage}</Link>
            </Button>
          </CardHeader>
          <CardContent className="p-0">
            {assignments && assignments.length > 0 ? (
              <div className="divide-y divide-border">
                {assignments.map(a => {
                  const cl = a.classes as unknown as { name: string } | null
                  return (
                    <div key={a.id} className="flex items-center justify-between p-4">
                      <div>
                        <p className="font-semibold text-text text-sm">{a.title}</p>
                        <p className="text-xs text-text-muted">{cl?.name}</p>
                      </div>
                      <span className="text-xs text-text-muted">{new Date(a.due_date).toLocaleDateString(locale === "en" ? "en-GB" : "fr-DZ")}</span>
                    </div>
                  )
                })}
              </div>
            ) : (
              <div className="p-8 text-center">
                <ClipboardList size={32} className="mx-auto mb-2 text-text-faint" />
                <p className="text-sm text-text-muted mb-3">{t.noAssignments}</p>
                <Button asChild size="sm" className="rounded-xl">
                  <Link href="/teacher/assignments">{t.createAssignment}</Link>
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Quick actions */}
      <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Button asChild variant="outline" className="rounded-xl h-auto py-4 flex-col gap-2">
          <Link href="/teacher/classes">
            <Users size={20} className="text-primary" />
            <span className="text-sm font-semibold">{t.manageClasses}</span>
          </Link>
        </Button>
        <Button asChild variant="outline" className="rounded-xl h-auto py-4 flex-col gap-2">
          <Link href="/teacher/assignments">
            <BookOpen size={20} className="text-orange" />
            <span className="text-sm font-semibold">{t.createAssignment}</span>
          </Link>
        </Button>
        <Button asChild variant="outline" className="rounded-xl h-auto py-4 flex-col gap-2">
          <Link href="/teacher/reports">
            <TrendingUp size={20} className="text-success" />
            <span className="text-sm font-semibold">{t.viewReports}</span>
          </Link>
        </Button>
      </div>
    </div>
  )
}
