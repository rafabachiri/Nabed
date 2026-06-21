import { redirect } from "next/navigation"
import { createClient } from "@/utils/supabase/server"
import { ListeningPractice } from "@/components/practice/ListeningPractice"

export default async function ListeningPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/auth/login")

  const { data: words } = await supabase
    .from("words")
    .select("id, fr_term, en_term, phonetic, en_definition, body_system")
    .limit(40)
    .order("created_at", { ascending: false })

  return <ListeningPractice words={words ?? []} />
}
