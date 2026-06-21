import { NextResponse } from "next/server"
import { createClient } from "@/utils/supabase/server"
import { calculateNextReview, xpForRating, type Rating } from "@/lib/srs"
import { getLevelFromXP } from "@/lib/constants"

export async function POST(request: Request) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const body = await request.json() as {
    wordId: string
    rating: Rating
    currentSrsLevel: number
    currentEaseFactor: number
  }
  const { wordId, rating, currentSrsLevel, currentEaseFactor } = body

  // Get word difficulty for XP calculation
  const { data: word } = await supabase
    .from("words")
    .select("difficulty")
    .eq("id", wordId)
    .single()

  const difficulty = (word?.difficulty ?? "medium") as "easy" | "medium" | "hard"
  const srsResult = calculateNextReview(currentSrsLevel, currentEaseFactor, rating)
  const xpEarned = xpForRating(rating, difficulty)

  // Fetch current progress to increment counters
  const { data: current } = await supabase
    .from("user_word_progress")
    .select("times_seen, times_correct")
    .eq("user_id", user.id)
    .eq("word_id", wordId)
    .single()

  const timesSeen = (current?.times_seen ?? 0) + 1
  const timesCorrect = (current?.times_correct ?? 0) + (rating > 0 ? 1 : 0)

  // Upsert SRS progress
  const { error: progressError } = await supabase
    .from("user_word_progress")
    .upsert(
      {
        user_id: user.id,
        word_id: wordId,
        srs_level: srsResult.srsLevel,
        ease_factor: srsResult.easeFactor,
        interval_days: srsResult.intervalDays,
        next_review: srsResult.nextReview,
        times_seen: timesSeen,
        times_correct: timesCorrect,
        last_seen: new Date().toISOString(),
      },
      { onConflict: "user_id,word_id" }
    )

  if (progressError) {
    return NextResponse.json({ error: progressError.message }, { status: 500 })
  }

  // Award XP
  if (xpEarned > 0) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("xp")
      .eq("id", user.id)
      .single()

    const newXP = (profile?.xp ?? 0) + xpEarned
    const { level } = getLevelFromXP(newXP)

    await Promise.all([
      supabase.from("profiles").update({ xp: newXP, level }).eq("id", user.id),
      supabase.from("xp_log").insert({
        user_id: user.id,
        amount: xpEarned,
        source: "flashcard",
        reference_id: wordId,
      }),
    ])
  }

  return NextResponse.json({
    xpEarned,
    nextReview: srsResult.nextReview,
    srsLevel: srsResult.srsLevel,
  })
}
