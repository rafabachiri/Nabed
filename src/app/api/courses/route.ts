import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/utils/supabase/server"

export async function POST(req: NextRequest) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single()
  if (profile?.role !== "teacher" && profile?.role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  const body = await req.json()
  const { title, description, topic, cover_emoji, content_url } = body
  if (!title) return NextResponse.json({ error: "title required" }, { status: 400 })

  const { error } = await supabase.from("courses").insert({
    title,
    description: description || null,
    topic: topic || null,
    cover_emoji: cover_emoji || "📘",
    content_url: content_url || null,
    created_by: user.id,
  })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}
