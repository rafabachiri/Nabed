import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/utils/supabase/server"
import { createAdminClient } from "@/utils/supabase/admin"

export async function POST(req: NextRequest) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single()
  if (profile?.role !== "admin") return NextResponse.json({ error: "Forbidden" }, { status: 403 })

  const { teacherId, action } = await req.json()
  if (!teacherId || !["approve", "reject"].includes(action)) {
    return NextResponse.json({ error: "Invalid body" }, { status: 400 })
  }

  const admin = createAdminClient()
  const newStatus = action === "approve" ? "active" : "suspended"

  await admin.from("profiles").update({ status: newStatus }).eq("id", teacherId)

  return NextResponse.json({ ok: true })
}
