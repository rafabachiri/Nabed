import { NextResponse } from "next/server"
import { createClient } from "@/utils/supabase/server"

export async function POST() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { data: profile } = await supabase
    .from("profiles")
    .select("streak, last_active")
    .eq("id", user.id)
    .single()

  if (!profile) return NextResponse.json({ error: "Profile not found" }, { status: 404 })

  const today = new Date().toISOString().split("T")[0]
  const lastActive = profile.last_active ? profile.last_active.split("T")[0] : null

  if (lastActive === today) return NextResponse.json({ streak: profile.streak, updated: false })

  const yesterday = new Date(Date.now() - 86400000).toISOString().split("T")[0]
  const newStreak = lastActive === yesterday ? profile.streak + 1 : 1

  await supabase
    .from("profiles")
    .update({ streak: newStreak, last_active: today })
    .eq("id", user.id)

  return NextResponse.json({ streak: newStreak, updated: true })
}
