import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/utils/supabase/server"

export async function GET(req: NextRequest) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { searchParams } = new URL(req.url)
  const q = searchParams.get("q")?.trim() ?? ""
  const dir = searchParams.get("dir") ?? "fr-en"

  if (!q || q.length < 2) return NextResponse.json({ results: [] })

  const column = dir === "fr-en" ? "fr_term" : "en_term"

  const { data } = await supabase
    .from("words")
    .select("id, fr_term, en_term, en_definition, en_example, phonetic, audio_url, body_system, difficulty, word_root, prefix, suffix")
    .ilike(column, `%${q}%`)
    .limit(8)

  return NextResponse.json({ results: data ?? [] })
}
