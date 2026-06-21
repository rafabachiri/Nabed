"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  Home, BookOpen, Gamepad2, Shuffle, User, Trophy, Settings,
  LogOut, Users, ClipboardList, BarChart3, Mic,
  GraduationCap, Video, Library, Heart,
} from "lucide-react"
import { signOut } from "@/app/actions"
import type { Profile } from "@/types/database"
import { getLevelFromXP } from "@/lib/constants"
import { cn } from "@/lib/utils"
import { useLang } from "@/components/i18n/LanguageProvider"

interface Props {
  profile: Profile
}

export function Sidebar({ profile }: Props) {
  const pathname = usePathname()
  const { t } = useLang()
  const levelInfo = getLevelFromXP(profile.xp)

  const isStudent = profile.role === "student"
  const isTeacher = profile.role === "teacher"
  const isAdmin   = profile.role === "admin"

  const STUDENT_NAV = [
    { href: "/dashboard",   icon: Home,          label: t.nav.home },
    { href: "/learn",       icon: BookOpen,      label: t.nav.learn },
    { href: "/advanced",    icon: GraduationCap, label: t.nav.advanced },
    { href: "/games",       icon: Gamepad2,      label: t.nav.games },
    { href: "/practice",    icon: Mic,           label: t.nav.practice },
    { href: "/translate",   icon: Shuffle,       label: t.nav.translate },
    { href: "/videos",      icon: Video,         label: t.nav.videos },
    { href: "/courses",     icon: Library,       label: t.nav.courses },
    { href: "/favorites",   icon: Heart,         label: t.nav.favorites },
    { href: "/leaderboard", icon: Trophy,        label: t.nav.leaderboard },
    { href: "/profile",     icon: User,          label: t.nav.profile },
  ]

  const TEACHER_NAV = [
    { href: "/teacher/dashboard",   icon: Home,          label: t.nav.dashboard },
    { href: "/teacher/classes",     icon: Users,         label: t.nav.classes },
    { href: "/teacher/assignments", icon: ClipboardList, label: t.nav.assignments },
    { href: "/teacher/reports",     icon: BarChart3,     label: t.nav.reports },
    { href: "/courses",             icon: Library,       label: t.nav.courses },
    { href: "/videos",              icon: Video,         label: t.nav.videos },
  ]

  const ADMIN_NAV = [
    { href: "/admin",       icon: Settings, label: t.nav.administration },
    { href: "/admin/words", icon: BookOpen, label: t.nav.vocabulary },
    { href: "/admin/users", icon: Users,    label: t.nav.users },
    { href: "/videos",      icon: Video,    label: t.nav.videos },
  ]

  const primaryNav = isTeacher ? TEACHER_NAV : isAdmin ? ADMIN_NAV : STUDENT_NAV

  function NavItem({ href, icon: Icon, label }: { href: string; icon: React.ElementType; label: string }) {
    const isActive = pathname === href || pathname.startsWith(href + "/")
    return (
      <li>
        <Link
          href={href}
          title={label}
          className={cn(
            "flex items-center p-3 rounded-xl transition-all duration-200",
            isActive
              ? "bg-primary-highlight text-primary-active font-medium"
              : "text-text-muted hover:bg-surface-offset hover:text-text"
          )}
        >
          <Icon size={22} strokeWidth={isActive ? 2.5 : 2} className={isActive ? "text-primary" : ""} />
          <span className="ml-3 hidden lg:block text-sm truncate">{label}</span>
        </Link>
      </li>
    )
  }

  return (
    <aside className="hidden md:flex flex-col w-20 lg:w-64 border-r border-border bg-surface h-screen fixed left-0 top-0 transition-all duration-300 z-40">
      {/* Logo */}
      <div className="p-5 flex items-center justify-center lg:justify-start border-b border-border">
        <Link href="/dashboard" className="flex items-center gap-3 group">
          <div className="w-9 h-9 rounded-lg bg-primary text-white flex items-center justify-center font-display font-bold text-lg shadow-sm group-hover:bg-primary-hover transition-colors shrink-0">
            N
          </div>
          <span className="font-display font-bold text-xl hidden lg:block tracking-tight text-text">{t.common.appName}</span>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 overflow-y-auto">
        <ul className="space-y-1">
          {primaryNav.map((item) => (
            <NavItem key={item.href} {...item} />
          ))}
        </ul>

        {/* Teacher's student-side access */}
        {isTeacher && (
          <>
            <div className="my-3 px-3">
              <div className="h-px bg-border" />
            </div>
            <ul className="space-y-1">
              <NavItem href="/leaderboard" icon={Trophy} label={t.nav.leaderboard} />
              <NavItem href="/favorites"   icon={Heart}  label={t.nav.favorites} />
              <NavItem href="/profile"     icon={User}   label={t.nav.myProfile} />
            </ul>
          </>
        )}
      </nav>

      {/* User footer */}
      <div className="border-t border-border p-3">
        {/* User card */}
        <Link
          href="/profile"
          className="flex items-center gap-3 p-2 rounded-xl hover:bg-surface-offset transition-colors mb-1 group"
        >
          <div className="w-9 h-9 rounded-full bg-primary-highlight border-2 border-primary/20 flex items-center justify-center text-lg shrink-0">
            {profile.role === "teacher" ? "👩‍🏫" : profile.role === "admin" ? "⚙️" : "👨‍⚕️"}
          </div>
          <div className="hidden lg:block min-w-0">
            <p className="text-sm font-semibold text-text truncate">{profile.full_name}</p>
            <p className="text-xs text-text-muted truncate">
              {isStudent ? `Niv. ${levelInfo.level} · ${levelInfo.label}` : isTeacher ? t.common.teacher : t.common.admin}
            </p>
          </div>
        </Link>

        {/* Logout */}
        <form action={signOut}>
          <button
            type="submit"
            className="w-full flex items-center gap-3 p-2 rounded-xl text-text-muted hover:bg-error-highlight hover:text-error transition-colors"
            title={t.nav.logout}
          >
            <LogOut size={20} />
            <span className="hidden lg:block text-sm">{t.nav.logout}</span>
          </button>
        </form>
      </div>
    </aside>
  )
}
