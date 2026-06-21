import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/utils/supabase/server"

const VALID_TYPES = ["video", "course", "word", "topic"]

export async function POST(req: NextRequest) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { itemType, itemId } = await req.json()
  if (!itemType || !itemId || !VALID_TYPES.includes(itemType)) {
    return NextResponse.json({ error: "itemType and itemId required" }, { status: 400 })
  }

  // Toggle: delete if exists, insert otherwise
  const { data: existing } = await supabase
    .from("favorites")
    .select("id")
    .eq("user_id", user.id)
    .eq("item_type", itemType)
    .eq("item_id", itemId)
    .maybeSingle()

  if (existing) {
    await supabase.from("favorites").delete().eq("id", existing.id)
    return NextResponse.json({ favorited: false })
  }

  const { error } = await supabase
    .from("favorites")
    .insert({ user_id: user.id, item_type: itemType, item_id: itemId })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ favorited: true })
}
