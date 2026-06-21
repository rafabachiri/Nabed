"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  Home, BookOpen, Gamepad2, Heart, User, LayoutDashboard, Users,
  Menu, X, GraduationCap, Mic, Shuffle, Video, Library, Trophy,
  ClipboardList, BarChart3, Settings, LogOut,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { signOut } from "@/app/actions"
import type { Role } from "@/types/database"
import { useLang } from "@/components/i18n/LanguageProvider"

interface Props {
  role: Role
}

export function MobileNav({ role }: Props) {
  const pathname = usePathname()
  const { t } = useLang()
  const [open, setOpen] = useState(false)

  // Bottom-bar quick items (4) — the rest live in the hamburger drawer.
  const STUDENT_BAR = [
    { href: "/dashboard", icon: Home,     label: t.nav.home },
    { href: "/learn",     icon: BookOpen, label: t.nav.learn },
    { href: "/games",     icon: Gamepad2, label: t.nav.games },
    { href: "/favorites", icon: Heart,    label: t.nav.favorites },
  ]
  const TEACHER_BAR = [
    { href: "/teacher/dashboard",   icon: LayoutDashboard, label: t.nav.home },
    { href: "/teacher/classes",     icon: Users,           label: t.nav.classes },
    { href: "/teacher/assignments", icon: ClipboardList,   label: t.nav.assignments },
    { href: "/courses",             icon: Library,         label: t.nav.courses },
  ]
  const ADMIN_BAR = [
    { href: "/admin",       icon: Settings, label: t.nav.administration },
    { href: "/admin/words", icon: BookOpen, label: t.nav.vocabulary },
    { href: "/admin/users", icon: Users,    label: t.nav.users },
    { href: "/videos",      icon: Video,    label: t.nav.videos },
  ]

  // Full drawer menus (everything for the role).
  const STUDENT_MENU = [
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
  const TEACHER_MENU = [
    { href: "/teacher/dashboard",   icon: LayoutDashboard, label: t.nav.dashboard },
    { href: "/teacher/classes",     icon: Users,           label: t.nav.classes },
    { href: "/teacher/assignments", icon: ClipboardList,   label: t.nav.assignments },
    { href: "/teacher/reports",     icon: BarChart3,       label: t.nav.reports },
    { href: "/courses",             icon: Library,         label: t.nav.courses },
    { href: "/videos",              icon: Video,           label: t.nav.videos },
    { href: "/leaderboard",         icon: Trophy,          label: t.nav.leaderboard },
    { href: "/favorites",           icon: Heart,           label: t.nav.favorites },
    { href: "/profile",             icon: User,            label: t.nav.myProfile },
  ]
  const ADMIN_MENU = [
    { href: "/admin",       icon: Settings, label: t.nav.administration },
    { href: "/admin/words", icon: BookOpen, label: t.nav.vocabulary },
    { href: "/admin/users", icon: Users,    label: t.nav.users },
    { href: "/videos",      icon: Video,    label: t.nav.videos },
    { href: "/courses",     icon: Library,  label: t.nav.courses },
    { href: "/profile",     icon: User,     label: t.nav.profile },
  ]

  const bar  = role === "teacher" ? TEACHER_BAR  : role === "admin" ? ADMIN_BAR  : STUDENT_BAR
  const menu = role === "teacher" ? TEACHER_MENU : role === "admin" ? ADMIN_MENU : STUDENT_MENU

  const isActive = (href: string) => pathname === href || pathname.startsWith(href + "/")

  return (
    <>
      {/* Bottom bar */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-border bg-surface/95 backdrop-blur-sm pb-safe pt-2 px-2 md:hidden">
        <ul className="flex items-center justify-between">
          {bar.map((item) => {
            const Icon = item.icon
            const active = isActive(item.href)
            return (
              <li key={item.href} className="flex-1">
                <Link
                  href={item.href}
                  className={cn(
                    "flex flex-col items-center justify-center gap-1 py-1.5 px-2 rounded-xl transition-colors",
                    active ? "text-primary" : "text-text-muted hover:text-text"
                  )}
                >
                  <Icon size={22} strokeWidth={active ? 2.5 : 2} />
                  <span className="text-[10px] font-medium">{item.label}</span>
                </Link>
              </li>
            )
          })}
          {/* Hamburger (right side) */}
          <li className="flex-1">
            <button
              onClick={() => setOpen(true)}
              aria-label="Menu"
              className="w-full flex flex-col items-center justify-center gap-1 py-1.5 px-2 rounded-xl text-text-muted hover:text-text transition-colors"
            >
              <Menu size={22} />
              <span className="text-[10px] font-medium">Menu</span>
            </button>
          </li>
        </ul>
      </nav>

      {/* Drawer overlay */}
      {open && (
        <div className="fixed inset-0 z-[70] md:hidden" role="dialog" aria-modal="true">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-0 h-full w-72 max-w-[80%] bg-surface border-l border-border shadow-xl flex flex-col animate-[slideIn_0.2s_ease-out]">
            <div className="flex items-center justify-between p-4 border-b border-border">
              <span className="font-display font-bold text-lg text-text">{t.common.appName}</span>
              <button onClick={() => setOpen(false)} aria-label="Close" className="p-2 rounded-lg text-text-muted hover:bg-surface-offset hover:text-text">
                <X size={20} />
              </button>
            </div>

            <nav className="flex-1 overflow-y-auto p-3">
              <ul className="space-y-1">
                {menu.map((item) => {
                  const Icon = item.icon
                  const active = isActive(item.href)
                  return (
                    <li key={item.href}>
                      <Link
                        href={item.href}
                        onClick={() => setOpen(false)}
                        className={cn(
                          "flex items-center gap-3 p-3 rounded-xl transition-colors",
                          active
                            ? "bg-primary-highlight text-primary-active font-medium"
                            : "text-text-muted hover:bg-surface-offset hover:text-text"
                        )}
                      >
                        <Icon size={20} className={active ? "text-primary" : ""} />
                        <span className="text-sm">{item.label}</span>
                      </Link>
                    </li>
                  )
                })}
              </ul>
            </nav>

            <div className="border-t border-border p-3">
              <form action={signOut}>
                <button
                  type="submit"
                  className="w-full flex items-center gap-3 p-3 rounded-xl text-text-muted hover:bg-error-highlight hover:text-error transition-colors"
                >
                  <LogOut size={20} />
                  <span className="text-sm">{t.nav.logout}</span>
                </button>
              </form>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
