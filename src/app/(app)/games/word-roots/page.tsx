import { redirect } from "next/navigation"
import { createClient } from "@/utils/supabase/server"
import { WordRootsGame } from "@/components/games/WordRootsGame"

export default async function WordRootsPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/auth/login")

  const { data: words } = await supabase
    .from("words")
    .select("id, fr_term, en_term, en_definition, word_root, prefix, suffix, body_system")
    .not("word_root", "is", null)
    .limit(50)

  return <WordRootsGame words={words ?? []} />
}
