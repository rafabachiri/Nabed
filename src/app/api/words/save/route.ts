import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/utils/supabase/server"

export async function POST(req: NextRequest) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { wordId } = await req.json()
  if (!wordId) return NextResponse.json({ error: "wordId required" }, { status: 400 })

  // Toggle: delete if exists, insert if not
  const { data: existing } = await supabase
    .from("saved_words")
    .select("id")
    .eq("user_id", user.id)
    .eq("word_id", wordId)
    .single()

  if (existing) {
    await supabase.from("saved_words").delete().eq("user_id", user.id).eq("word_id", wordId)
    return NextResponse.json({ saved: false })
  }

  await supabase.from("saved_words").insert({ user_id: user.id, word_id: wordId })
  return NextResponse.json({ saved: true })
}
