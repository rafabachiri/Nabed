import Link from "next/link"
import { Mic, Headphones, PenLine } from "lucide-react"
import { Card, CardContent } from "@/components/ui/Card"
import { Button } from "@/components/ui/Button"
import { getDictionary } from "@/lib/i18n"
import { getLocale } from "@/lib/locale"

export default function PracticePage() {
  const dict = getDictionary(getLocale())
  const t = dict.practice

  const MODES = [
    {
      href: "/practice/pronunciation",
      icon: Mic,
      color: "text-primary bg-primary-highlight",
      title: t.p_pron_title,
      description: t.p_pron_desc,
      xp: t.p_pron_xp,
    },
    {
      href: "/practice/listening",
      icon: Headphones,
      color: "text-orange bg-orange-highlight",
      title: t.p_listen_title,
      description: t.p_listen_desc,
      xp: t.p_listen_xp,
    },
    {
      href: "/practice/writing",
      icon: PenLine,
      color: "text-success bg-success-highlight",
      title: t.p_write_title,
      description: t.p_write_desc,
      xp: t.p_write_xp,
    },
  ]

  return (
    <div className="p-6 lg:p-10 max-w-4xl mx-auto">
      <header className="mb-10">
        <h1 className="text-3xl font-display font-bold text-text flex items-center gap-3">
          <Mic className="text-primary" size={32} />
          {t.title}
        </h1>
        <p className="text-text-muted mt-2">{t.subtitle}</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {MODES.map(mode => (
          <Card key={mode.href} className="hover:border-primary transition-all hover:shadow-md group">
            <CardContent className="p-6 flex flex-col h-full">
              <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-4 ${mode.color}`}>
                <mode.icon size={26} />
              </div>
              <h2 className="text-xl font-display font-bold text-text mb-2 group-hover:text-primary transition-colors">{mode.title}</h2>
              <p className="text-sm text-text-muted flex-1 mb-4">{mode.description}</p>
              <div className="flex items-center justify-between mt-auto">
                <span className="text-xs font-semibold text-gold">{mode.xp}</span>
                <Button asChild size="sm" className="rounded-xl">
                  <Link href={mode.href}>{dict.common.start}</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
