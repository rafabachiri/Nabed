import { redirect } from "next/navigation"
import { createClient } from "@/utils/supabase/server"
import { WritingPractice } from "@/components/practice/WritingPractice"

export default async function WritingPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/auth/login")

  const { data: words } = await supabase
    .from("words")
    .select("id, fr_term, en_term, phonetic, en_definition, en_example")
    .limit(40)
    .order("created_at", { ascending: false })

  return <WritingPractice words={words ?? []} />
}
