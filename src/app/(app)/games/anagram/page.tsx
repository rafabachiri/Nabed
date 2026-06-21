import { redirect } from "next/navigation"
import { createClient } from "@/utils/supabase/server"
import { AnagramGame } from "@/components/games/AnagramGame"

export default async function AnagramPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/auth/login")

  const { data: words } = await supabase
    .from("words")
    .select("id, fr_term, en_term, en_definition, body_system")
    .limit(100)

  const playable = (words ?? []).filter(w => w.en_term.length >= 4 && w.en_term.length <= 12 && !w.en_term.includes(" "))

  return <AnagramGame words={playable} />
}
