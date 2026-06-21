import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/utils/supabase/server"
import { createAdminClient } from "@/utils/supabase/admin"

export async function POST(req: NextRequest) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single()
  if (profile?.role !== "admin") return NextResponse.json({ error: "Forbidden" }, { status: 403 })

  const body = await req.json()
  const { fr_term, en_term, en_definition, en_example, phonetic, body_system, difficulty, word_root } = body

  if (!fr_term || !en_term || !en_definition || !body_system) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
  }

  const admin = createAdminClient()
  const { error } = await admin.from("words").insert({
    fr_term: fr_term.trim(),
    en_term: en_term.trim(),
    en_definition: en_definition.trim(),
    en_example: en_example?.trim() || null,
    phonetic: phonetic?.trim() || null,
    body_system,
    difficulty: difficulty ?? "medium",
    word_root: word_root?.trim() || null,
  })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}
