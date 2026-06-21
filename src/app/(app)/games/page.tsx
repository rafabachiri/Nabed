import Link from "next/link"
import { Gamepad2, Play, Trophy, Star, Lock } from "lucide-react"
import { Card, CardContent } from "@/components/ui/Card"
import { Badge } from "@/components/ui/Badge"
import { Button } from "@/components/ui/Button"
import { getDictionary } from "@/lib/i18n"
import { getLocale } from "@/lib/locale"

export default function GamesPage() {
  const dict = getDictionary(getLocale())
  const t = dict.games

  const GAMES = [
    {
      id: "term-blast",
      href: "/games/term-blast",
      title: "Term Blast",
      description: t.g_termblast_desc,
      icon: "🚀",
      color: "from-orange-highlight to-surface",
      badge: t.popular,
      badgeClass: "bg-orange text-white border-transparent",
      xp: t.xp_termblast,
      available: true,
    },
    {
      id: "anagram",
      href: "/games/anagram",
      title: t.g_anagram_title,
      description: t.g_anagram_desc,
      icon: "🔀",
      color: "from-purple-100 to-surface",
      badge: null as string | null,
      badgeClass: "",
      xp: t.xp_anagram,
      available: true,
    },
    {
      id: "word-roots",
      href: "/games/word-roots",
      title: t.g_roots_title,
      description: t.g_roots_desc,
      icon: "🔤",
      color: "from-gold-highlight to-surface",
      badge: null as string | null,
      badgeClass: "",
      xp: t.xp_roots,
      available: true,
    },
    {
      id: "diagnostic-match",
      href: "/games/diagnostic-match",
      title: t.g_match_title,
      description: t.g_match_desc,
      icon: "🩺",
      color: "from-green-100 to-surface",
      badge: null as string | null,
      badgeClass: "",
      xp: t.xp_match,
      available: true,
    },
    {
      id: "anatomy-drop",
      href: "/games/anatomy-drop",
      title: t.g_anatomy_title,
      description: t.g_anatomy_desc,
      icon: "🫀",
      color: "from-red-100 to-surface",
      badge: dict.common.comingSoon,
      badgeClass: "bg-surface-2 text-text-muted border-border",
      xp: t.xp_anatomy,
      available: false,
    },
  ]

  return (
    <div className="p-6 lg:p-10 max-w-7xl mx-auto">
      <header className="mb-10 text-center md:text-left">
        <h1 className="text-3xl font-display font-bold text-text flex items-center justify-center md:justify-start gap-3">
          <Gamepad2 className="text-orange" size={32} />
          {t.title}
        </h1>
        <p className="text-text-muted mt-2">{t.subtitle}</p>
      </header>

      {/* Featured: Duel */}
      <section className="mb-12">
        <Card className="bg-orange text-white border-none overflow-hidden relative group">
          <div className="absolute -right-10 -bottom-10 opacity-20 group-hover:scale-110 transition-transform duration-500">
            <Trophy size={200} />
          </div>
          <CardContent className="p-8 md:p-12 relative z-10 flex flex-col md:flex-row items-center gap-8">
            <div className="w-24 h-24 rounded-3xl bg-white/20 backdrop-blur-sm flex items-center justify-center text-6xl shadow-lg shrink-0">
              ⚔️
            </div>
            <div className="flex-1 text-center md:text-left">
              <Badge className="bg-white/20 text-white hover:bg-white/30 border-none mb-3">{t.featuredBadge}</Badge>
              <h2 className="text-3xl md:text-4xl font-display font-bold mb-2">{t.duelTitle}</h2>
              <p className="text-white/90 text-lg mb-6 max-w-xl">
                {t.duelDesc}
              </p>
              <Button className="bg-white text-orange hover:bg-white/90 font-bold text-lg px-8 rounded-full shadow-lg opacity-60 cursor-not-allowed" disabled>
                <Lock className="mr-2" size={18} /> {t.duelCta}
              </Button>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* Arcade Grid */}
      <section>
        <h2 className="text-lg font-bold font-display mb-6 flex items-center gap-2">
          <Star className="text-gold" fill="currentColor" /> {t.arcade}
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {GAMES.filter(g => g.id !== "duel").map((game) => (
            <Card key={game.id} className={`bg-gradient-to-br ${game.color} hover:shadow-md transition-shadow border-border ${!game.available ? "opacity-60" : ""} group`}>
              <CardContent className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div className="w-16 h-16 rounded-2xl bg-surface shadow-sm flex items-center justify-center text-4xl group-hover:scale-110 transition-transform">
                    {game.icon}
                  </div>
                  {game.badge && (
                    <Badge className={game.badgeClass ?? ""}>{game.badge}</Badge>
                  )}
                </div>
                <h3 className="text-xl font-bold font-display mb-2 group-hover:text-primary transition-colors">{game.title}</h3>
                <p className="text-text-muted text-sm mb-6 min-h-[40px]">{game.description}</p>
                <div className="flex items-center justify-between mt-auto">
                  <span className="text-xs font-semibold text-gold">{game.xp}</span>
                  {game.available ? (
                    <Button asChild variant="outline" size="sm" className="rounded-full bg-surface group-hover:bg-primary group-hover:text-white group-hover:border-primary transition-all">
                      <Link href={game.href}>
                        <Play size={14} className="mr-1" fill="currentColor" /> {t.play}
                      </Link>
                    </Button>
                  ) : (
                    <Button variant="outline" size="sm" className="rounded-full bg-surface" disabled>
                      <Lock size={14} className="mr-1" /> {dict.common.comingSoon}
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>
    </div>
  )
}
