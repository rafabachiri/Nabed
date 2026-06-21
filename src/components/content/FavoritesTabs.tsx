"use client"

import { useState } from "react"
import { Heart, BookMarked, Video as VideoIcon, Library, ExternalLink } from "lucide-react"
import { Card, CardContent } from "@/components/ui/Card"
import { Badge } from "@/components/ui/Badge"
import { Button } from "@/components/ui/Button"
import { FavoriteButton } from "@/components/ui/FavoriteButton"
import { useLang } from "@/components/i18n/LanguageProvider"
import { cn } from "@/lib/utils"
import type { Video, Course } from "@/types/database"
import type { SavedWordItem } from "@/app/(app)/favorites/page"

type Tab = "words" | "videos" | "courses"

export function FavoritesTabs({
  words,
  videos,
  courses,
}: {
  words: SavedWordItem[]
  videos: Video[]
  courses: Course[]
}) {
  const { t } = useLang()
  const [tab, setTab] = useState<Tab>("words")

  const tabs: { id: Tab; label: string; count: number }[] = [
    { id: "words", label: t.favorites.words, count: words.length },
    { id: "videos", label: t.favorites.videos, count: videos.length },
    { id: "courses", label: t.favorites.courses, count: courses.length },
  ]

  return (
    <div className="p-6 lg:p-10 max-w-5xl mx-auto">
      <header className="mb-6">
        <h1 className="text-3xl font-display font-bold text-text flex items-center gap-3">
          <Heart className="text-error" size={32} /> {t.favorites.title}
        </h1>
        <p className="text-text-muted mt-2">{t.favorites.subtitle}</p>
      </header>

      <div className="flex gap-2 mb-6 border-b border-border">
        {tabs.map(tb => (
          <button
            key={tb.id}
            onClick={() => setTab(tb.id)}
            className={cn(
              "px-4 py-2.5 text-sm font-semibold border-b-2 -mb-px transition-colors",
              tab === tb.id ? "border-primary text-primary" : "border-transparent text-text-muted hover:text-text"
            )}
          >
            {tb.label} <span className="text-xs text-text-faint">({tb.count})</span>
          </button>
        ))}
      </div>

      {tab === "words" && (
        words.length === 0 ? (
          <Empty icon={<BookMarked size={32} />} text={t.favorites.emptyWords} />
        ) : (
          <Card>
            <CardContent className="p-0">
              <div className="divide-y divide-border">
                {words.map(w => (
                  <div key={w.word_id} className="p-4">
                    <p className="font-bold text-text text-sm">{w.en_term}</p>
                    <p className="text-xs text-text-muted">{w.fr_term}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )
      )}

      {tab === "videos" && (
        videos.length === 0 ? (
          <Empty icon={<VideoIcon size={32} />} text={t.favorites.emptyVideos} />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {videos.map(video => (
              <Card key={video.id} className="h-full flex flex-col">
                <CardContent className="p-5 flex flex-col flex-1">
                  <div className="flex justify-between items-start mb-3">
                    <div className="w-12 h-12 rounded-xl bg-orange-highlight text-orange flex items-center justify-center">
                      <VideoIcon size={22} />
                    </div>
                    <FavoriteButton itemType="video" itemId={video.id} initial refreshOnToggle />
                  </div>
                  {video.topic && <Badge variant="secondary" className="mb-2 w-fit">{video.topic}</Badge>}
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
        )
      )}

      {tab === "courses" && (
        courses.length === 0 ? (
          <Empty icon={<Library size={32} />} text={t.favorites.emptyCourses} />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {courses.map(course => (
              <Card key={course.id} className="h-full flex flex-col">
                <CardContent className="p-6 flex flex-col flex-1">
                  <div className="flex justify-between items-start mb-4">
                    <div className="w-14 h-14 rounded-xl bg-surface-offset flex items-center justify-center text-3xl">
                      {course.cover_emoji}
                    </div>
                    <FavoriteButton itemType="course" itemId={course.id} initial refreshOnToggle />
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
        )
      )}
    </div>
  )
}

function Empty({ icon, text }: { icon: React.ReactNode; text: string }) {
  return (
    <Card>
      <CardContent className="p-12 text-center text-text-muted flex flex-col items-center gap-3">
        <span className="text-text-faint">{icon}</span>
        {text}
      </CardContent>
    </Card>
  )
}
