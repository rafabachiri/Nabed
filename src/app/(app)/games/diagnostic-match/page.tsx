import { redirect } from "next/navigation"
import { createClient } from "@/utils/supabase/server"
import { DiagnosticMatchGame } from "@/components/games/DiagnosticMatchGame"

export default async function DiagnosticMatchPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/auth/login")

  const { data: words } = await supabase
    .from("words")
    .select("id, fr_term, en_term, en_definition, en_example, body_system")
    .limit(60)

  return <DiagnosticMatchGame words={words ?? []} />
}
