import Link from "next/link"
import { GraduationCap, BookOpen, ChevronRight } from "lucide-react"
import { getDictionary } from "@/lib/i18n"
import { getLocale } from "@/lib/locale"

export default function RegisterPage() {
  const t = getDictionary(getLocale()).auth
  return (
    <div className="w-full max-w-xl">
      <div className="text-center mb-10">
        <h1 className="text-3xl font-display font-bold text-text mb-2">{t.registerTitle}</h1>
        <p className="text-text-muted">{t.registerSubtitle}</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Student Card */}
        <Link
          href="/auth/register/student"
          className="group block bg-surface border-2 border-border hover:border-primary rounded-2xl p-8 transition-all hover:shadow-md"
        >
          <div className="w-14 h-14 rounded-2xl bg-primary-highlight flex items-center justify-center mb-5 group-hover:bg-primary group-hover:text-white text-primary transition-all">
            <GraduationCap size={28} />
          </div>
          <h2 className="text-xl font-display font-bold text-text mb-2 group-hover:text-primary transition-colors">
            {t.studentRole}
          </h2>
          <p className="text-sm text-text-muted mb-6 leading-relaxed">
            {t.studentDesc}
          </p>
          <div className="flex items-center text-sm font-semibold text-primary">
            {t.startBtn} <ChevronRight size={16} className="ml-1 group-hover:translate-x-1 transition-transform" />
          </div>
        </Link>

        {/* Teacher Card */}
        <Link
          href="/auth/register/teacher"
          className="group block bg-surface border-2 border-border hover:border-primary rounded-2xl p-8 transition-all hover:shadow-md"
        >
          <div className="w-14 h-14 rounded-2xl bg-gold-highlight flex items-center justify-center mb-5 group-hover:bg-gold group-hover:text-white text-gold transition-all">
            <BookOpen size={28} />
          </div>
          <h2 className="text-xl font-display font-bold text-text mb-2 group-hover:text-primary transition-colors">
            {t.teacherRole}
          </h2>
          <p className="text-sm text-text-muted mb-6 leading-relaxed">
            {t.teacherDesc}
          </p>
          <div className="flex items-center text-sm font-semibold text-gold">
            {t.submitRequest} <ChevronRight size={16} className="ml-1 group-hover:translate-x-1 transition-transform" />
          </div>
        </Link>
      </div>

      <p className="text-center text-sm text-text-muted mt-8">
        {t.alreadyRegistered}{" "}
        <Link href="/auth/login" className="text-primary font-semibold hover:underline">
          {t.signInLink}
        </Link>
      </p>
    </div>
  )
}
