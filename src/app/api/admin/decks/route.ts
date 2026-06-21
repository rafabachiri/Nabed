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
  const { name_fr, name_en, body_system, year_level, cover_emoji, is_public } = body

  if (!name_fr || !name_en) return NextResponse.json({ error: "name_fr and name_en required" }, { status: 400 })

  const admin = createAdminClient()
  const { error } = await admin.from("decks").insert({
    name_fr,
    name_en,
    body_system: body_system ?? null,
    year_level: year_level ?? null,
    cover_emoji: cover_emoji ?? "📚",
    is_public: is_public ?? true,
    word_count: 0,
    created_by: user.id,
  })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}
