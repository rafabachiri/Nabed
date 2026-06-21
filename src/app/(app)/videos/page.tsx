import { redirect } from "next/navigation"
import { Video as VideoIcon, ExternalLink, Clock } from "lucide-react"
import { createClient } from "@/utils/supabase/server"
import { Card, CardContent } from "@/components/ui/Card"
import { Badge } from "@/components/ui/Badge"
import { Button } from "@/components/ui/Button"
import { FavoriteButton } from "@/components/ui/FavoriteButton"
import { AddVideoForm } from "@/components/content/AddVideoForm"
import { getDictionary } from "@/lib/i18n"
import { getLocale } from "@/lib/locale"
import type { Video } from "@/types/database"

export default async function VideosPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/auth/login")

  const t = getDictionary(getLocale())

  const [{ data: profile }, { data: videos }, { data: favRows }] = await Promise.all([
    supabase.from("profiles").select("role").eq("id", user.id).single(),
    supabase.from("videos").select("*").order("created_at", { ascending: false }),
    supabase.from("favorites").select("item_id").eq("user_id", user.id).eq("item_type", "video"),
  ])

  const canAdd = profile?.role === "teacher" || profile?.role === "admin"
  const favSet = new Set((favRows ?? []).map(r => r.item_id))
  const list = (videos ?? []) as Video[]

  return (
    <div className="p-6 lg:p-10 max-w-7xl mx-auto">
      <header className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-display font-bold text-text flex items-center gap-3">
            <VideoIcon className="text-primary" size={32} /> {t.videos.title}
          </h1>
          <p className="text-text-muted mt-2">{t.videos.subtitle}</p>
        </div>
        {canAdd && <AddVideoForm />}
      </header>

      {list.length === 0 ? (
        <Card><CardContent className="p-10 text-center text-text-muted">{t.videos.empty}</CardContent></Card>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {list.map(video => (
            <Card key={video.id} className="hover:border-primary transition-all h-full flex flex-col">
              <CardContent className="p-5 flex flex-col flex-1">
                <div className="flex justify-between items-start mb-3">
                  <div className="w-12 h-12 rounded-xl bg-orange-highlight text-orange flex items-center justify-center">
                    <VideoIcon size={22} />
                  </div>
                  <FavoriteButton itemType="video" itemId={video.id} initial={favSet.has(video.id)} />
                </div>
                <div className="flex items-center gap-2 mb-2 flex-wrap">
                  {video.topic && <Badge variant="secondary">{video.topic}</Badge>}
                  <Badge variant="secondary" className="uppercase">{video.language}</Badge>
                  {video.duration_min && (
                    <span className="text-xs text-text-faint inline-flex items-center gap-1"><Clock size={12} />{video.duration_min} min</span>
                  )}
                </div>
                <h3 className="font-bold font-display text-text mb-1">{video.title}</h3>
                {video.description && <p className="text-text-muted text-sm mb-4 flex-1">{video.description}</p>}
                <Button asChild variant="outline" className="w-full mt-auto">
                  <a href={video.url} target="_blank" rel="noopener noreferrer">
                    {t.videos.watch} <ExternalLink size={15} className="ml-2" />
                  </a>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
