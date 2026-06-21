import { redirect } from "next/navigation"
import { Library, ExternalLink } from "lucide-react"
import { createClient } from "@/utils/supabase/server"
import { Card, CardContent } from "@/components/ui/Card"
import { Badge } from "@/components/ui/Badge"
import { Button } from "@/components/ui/Button"
import { FavoriteButton } from "@/components/ui/FavoriteButton"
import { AddCourseForm } from "@/components/content/AddCourseForm"
import { getDictionary } from "@/lib/i18n"
import { getLocale } from "@/lib/locale"
import type { Course } from "@/types/database"

export default async function CoursesPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/auth/login")

  const t = getDictionary(getLocale())

  const [{ data: profile }, { data: courses }, { data: favRows }] = await Promise.all([
    supabase.from("profiles").select("role").eq("id", user.id).single(),
    supabase.from("courses").select("*").eq("is_published", true).order("created_at", { ascending: false }),
    supabase.from("favorites").select("item_id").eq("user_id", user.id).eq("item_type", "course"),
  ])

  const canAdd = profile?.role === "teacher" || profile?.role === "admin"
  const favSet = new Set((favRows ?? []).map(r => r.item_id))
  const list = (courses ?? []) as Course[]

  return (
    <div className="p-6 lg:p-10 max-w-7xl mx-auto">
      <header className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-display font-bold text-text flex items-center gap-3">
            <Library className="text-primary" size={32} /> {t.courses.title}
          </h1>
          <p className="text-text-muted mt-2">{t.courses.subtitle}</p>
        </div>
        {canAdd && <AddCourseForm />}
      </header>

      {list.length === 0 ? (
        <Card><CardContent className="p-10 text-center text-text-muted">{t.courses.empty}</CardContent></Card>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {list.map(course => (
            <Card key={course.id} className="hover:border-primary transition-all h-full flex flex-col">
              <CardContent className="p-6 flex flex-col flex-1">
                <div className="flex justify-between items-start mb-4">
                  <div className="w-14 h-14 rounded-xl bg-surface-offset flex items-center justify-center text-3xl">
                    {course.cover_emoji}
                  </div>
                  <FavoriteButton itemType="course" itemId={course.id} initial={favSet.has(course.id)} />
                </div>
                {course.topic && <Badge variant="secondary" className="mb-2 w-fit">{course.topic}</Badge>}
                <h3 className="text-lg font-bold font-display text-text mb-1">{course.title}</h3>
                {course.description && <p className="text-text-muted text-sm mb-4 flex-1">{course.description}</p>}
                {course.content_url && (
                  <Button asChild variant="outline" className="w-full mt-auto">
                    <a href={course.content_url} target="_blank" rel="noopener noreferrer">
                      {t.courses.open} <ExternalLink size={15} className="ml-2" />
                    </a>
                  </Button>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
