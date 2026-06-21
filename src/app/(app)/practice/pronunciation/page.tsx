import { redirect } from "next/navigation"
import { createClient } from "@/utils/supabase/server"
import { PronunciationPractice } from "@/components/practice/PronunciationPractice"

export default async function PronunciationPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/auth/login")

  const { data: words } = await supabase
    .from("words")
    .select("id, fr_term, en_term, phonetic, en_definition")
    .not("phonetic", "is", null)
    .limit(30)
    .order("created_at", { ascending: false })

  return <PronunciationPractice words={words ?? []} />
}
