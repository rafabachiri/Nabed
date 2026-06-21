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
  const { title, url, description, topic, language, duration_min } = body
  if (!title || !url) return NextResponse.json({ error: "title and url required" }, { status: 400 })

  const { error } = await supabase.from("videos").insert({
    title,
    url,
    description: description || null,
    topic: topic || null,
    language: language || "en",
    duration_min: duration_min ? Number(duration_min) : null,
    created_by: user.id,
  })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}
