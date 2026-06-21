import { redirect } from "next/navigation"
import { createClient } from "@/utils/supabase/server"
import { Sidebar } from "@/components/layout/Sidebar"
import { MobileNav } from "@/components/layout/MobileNav"
import { LanguageProvider } from "@/components/i18n/LanguageProvider"
import { FloatingControls } from "@/components/ui/FloatingControls"
import { StreakTracker } from "@/components/layout/StreakTracker"
import { getLocale } from "@/lib/locale"
import type { Profile } from "@/types/database"

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect("/auth/login")

  const { data: profile } = await supabase
    .from("profiles")
    .select(
      "id, role, username, full_name, university, year_of_study, specialty, xp, level, streak, avatar_url, status, plan"
    )
    .eq("id", user.id)
    .single()

  if (!profile) redirect("/auth/login")

  if (profile.role === "teacher" && profile.status === "pending") {
    redirect("/auth/pending")
  }

  const locale = getLocale()

  return (
    <LanguageProvider locale={locale}>
      <div className="flex min-h-screen bg-bg">
        <Sidebar profile={profile as Profile} />
        <div className="flex-1 md:pl-20 lg:pl-64 flex flex-col transition-all duration-300">
          <main className="flex-1 pb-20 md:pb-0">{children}</main>
        </div>
        <MobileNav role={profile.role} />
        <FloatingControls />
        <StreakTracker />
      </div>
    </LanguageProvider>
  )
}
