import { redirect } from "next/navigation"
import { createClient } from "@/utils/supabase/server"
import { FavoritesTabs } from "@/components/content/FavoritesTabs"
import type { Video, Course } from "@/types/database"

export interface SavedWordItem {
  word_id: string
  fr_term: string
  en_term: string
}

export default async function FavoritesPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/auth/login")

  // Words live in saved_words; videos & courses live in favorites.
  const [{ data: savedRows }, { data: favRows }] = await Promise.all([
    supabase
      .from("saved_words")
      .select("word_id, words(fr_term, en_term)")
      .eq("user_id", user.id)
      .order("saved_at", { ascending: false }),
    supabase
      .from("favorites")
      .select("item_type, item_id")
      .eq("user_id", user.id)
      .in("item_type", ["video", "course"]),
  ])

  const words: SavedWordItem[] = (savedRows ?? []).map(row => {
    const w = row.words as unknown as { fr_term: string; en_term: string } | null
    return { word_id: row.word_id, fr_term: w?.fr_term ?? "", en_term: w?.en_term ?? "" }
  })

  const videoIds = (favRows ?? []).filter(r => r.item_type === "video").map(r => r.item_id)
  const courseIds = (favRows ?? []).filter(r => r.item_type === "course").map(r => r.item_id)

  const [{ data: videos }, { data: courses }] = await Promise.all([
    videoIds.length
      ? supabase.from("videos").select("*").in("id", videoIds)
      : Promise.resolve({ data: [] as Video[] }),
    courseIds.length
      ? supabase.from("courses").select("*").in("id", courseIds)
      : Promise.resolve({ data: [] as Course[] }),
  ])

  return (
    <FavoritesTabs
      words={words}
      videos={(videos ?? []) as Video[]}
      courses={(courses ?? []) as Course[]}
    />
  )
}
