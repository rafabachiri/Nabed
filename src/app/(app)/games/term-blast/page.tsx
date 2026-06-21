import { redirect } from "next/navigation"
import { createClient } from "@/utils/supabase/server"
import { TermBlastGame } from "@/components/games/TermBlastGame"

export default async function TermBlastPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/auth/login")

  const { data: words } = await supabase
    .from("words")
    .select("id, fr_term, en_term, en_definition, body_system, difficulty")
    .limit(80)

  return <TermBlastGame words={words ?? []} />
}
