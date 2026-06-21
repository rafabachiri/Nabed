import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/utils/supabase/server"

export async function POST(req: NextRequest) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { gameType, score, xpEarned } = await req.json()
  if (!gameType || score === undefined) return NextResponse.json({ error: "Invalid body" }, { status: 400 })

  await supabase.from("game_scores").insert({
    user_id: user.id,
    game_type: gameType,
    score,
    played_at: new Date().toISOString(),
  })

  if (xpEarned > 0) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("xp, level")
      .eq("id", user.id)
      .single()

    if (profile) {
      const newXP = profile.xp + xpEarned
      await supabase
        .from("profiles")
        .update({ xp: newXP })
        .eq("id", user.id)

      await supabase.from("xp_log").insert({
        user_id: user.id,
        xp_delta: xpEarned,
        reason: `game:${gameType}`,
      })
    }
  }

  return NextResponse.json({ ok: true })
}
