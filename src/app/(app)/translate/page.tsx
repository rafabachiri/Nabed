"use client"

import * as React from "react"
import { Search, Shuffle, Volume2, BookmarkPlus, BookmarkCheck, ArrowRightLeft, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/Button"
import { Card, CardContent } from "@/components/ui/Card"
import { Badge } from "@/components/ui/Badge"
import { useLang } from "@/components/i18n/LanguageProvider"
import type { Word } from "@/types/database"

export default function TranslatePage() {
  const { t: dict } = useLang()
  const t = dict.translate
  const [direction, setDirection] = React.useState<"fr-en" | "en-fr">("fr-en")
  const [query, setQuery] = React.useState("")
  const [results, setResults] = React.useState<Word[]>([])
  const [loading, setLoading] = React.useState(false)
  const [saved, setSaved] = React.useState<Record<string, boolean>>({})
  const debounceRef = React.useRef<ReturnType<typeof setTimeout> | null>(null)

  const search = React.useCallback(async (q: string, dir: string) => {
    if (q.length < 2) { setResults([]); return }
    setLoading(true)
    try {
      const res = await fetch(`/api/translate/search?q=${encodeURIComponent(q)}&dir=${dir}`)
      const data = await res.json()
      setResults(data.results ?? [])
    } finally {
      setLoading(false)
    }
  }, [])

  const handleInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value
    setQuery(val)
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => search(val, direction), 350)
  }

  const toggleDirection = () => {
    const next = direction === "fr-en" ? "en-fr" : "fr-en"
    setDirection(next)
    setResults([])
    setQuery("")
  }

  const toggleSave = async (wordId: string) => {
    const res = await fetch("/api/words/save", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ wordId }),
    })
    const data = await res.json()
    setSaved(prev => ({ ...prev, [wordId]: data.saved }))
  }

  const speak = (text: string) => {
    const utt = new SpeechSynthesisUtterance(text)
    utt.lang = "en-US"
    speechSynthesis.speak(utt)
  }

  const SYSTEM_COLORS: Record<string, string> = {
    cardiovascular: "bg-red-100 text-red-700",
    neurological: "bg-purple-100 text-purple-700",
    digestive: "bg-yellow-100 text-yellow-700",
    anatomy: "bg-blue-100 text-blue-700",
    pharmacology: "bg-green-100 text-green-700",
  }

  return (
    <div className="p-6 lg:p-10 max-w-4xl mx-auto min-h-[calc(100vh-80px)] md:min-h-screen">
      <header className="mb-8 text-center md:text-left">
        <h1 className="text-3xl font-display font-bold text-text flex items-center justify-center md:justify-start gap-3">
          <Shuffle className="text-primary" size={32} />
          {t.title}
        </h1>
        <p className="text-text-muted mt-2">{t.subtitle}</p>
      </header>

      {/* Input */}
      <Card className="mb-8 border-primary/20 shadow-md">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div className={`flex-1 text-center font-semibold text-sm ${direction === "fr-en" ? "text-primary" : "text-text-muted"}`}>
              {t.french}
            </div>
            <Button variant="ghost" size="icon" onClick={toggleDirection} className="rounded-full bg-surface-offset hover:bg-surface-2 mx-4 shrink-0">
              <ArrowRightLeft size={18} className="text-text" />
            </Button>
            <div className={`flex-1 text-center font-semibold text-sm ${direction === "en-fr" ? "text-primary" : "text-text-muted"}`}>
              {t.english}
            </div>
          </div>

          <div className="relative">
            {loading
              ? <Loader2 className="absolute left-4 top-1/2 -translate-y-1/2 text-primary animate-spin" size={22} />
              : <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted" size={22} />
            }
            <input
              type="text"
              value={query}
              onChange={handleInput}
              placeholder={direction === "fr-en" ? t.placeholderFrEn : t.placeholderEnFr}
              className="w-full bg-surface-offset border-none rounded-xl py-4 pl-12 pr-4 text-lg focus:ring-2 focus:ring-primary focus:outline-none transition-shadow text-text placeholder:text-text-faint"
              autoFocus
            />
          </div>
        </CardContent>
      </Card>

      {/* Results */}
      {results.length > 0 && (
        <div className="space-y-4">
          <p className="text-sm text-text-muted font-medium">{results.length} {results.length > 1 ? t.results : t.result}</p>
          {results.map((word) => {
            const isSaved = saved[word.id]
            const systemColor = SYSTEM_COLORS[word.body_system] ?? "bg-surface-offset text-text-muted"
            return (
              <Card key={word.id} className="border-l-4 border-l-primary overflow-hidden">
                <CardContent className="p-5">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <Badge className={`mb-2 border-transparent text-xs ${systemColor}`}>
                        {word.body_system}
                      </Badge>
                      <p className="text-base text-text-muted font-medium">
                        {direction === "fr-en" ? word.fr_term : word.en_term}
                      </p>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => toggleSave(word.id)}
                      className="shrink-0 text-text-muted hover:text-gold"
                      title={t.save}
                    >
                      {isSaved ? <BookmarkCheck size={20} className="text-gold" /> : <BookmarkPlus size={20} />}
                    </Button>
                  </div>

                  <div className="border-t border-border pt-3">
                    <div className="flex items-center gap-3 mb-1">
                      <h2 className="text-2xl font-display font-bold text-text">
                        {direction === "fr-en" ? word.en_term : word.fr_term}
                      </h2>
                      {direction === "fr-en" && (
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => speak(word.en_term)}
                          className="text-primary hover:bg-primary/10 rounded-full h-8 w-8"
                        >
                          <Volume2 size={18} />
                        </Button>
                      )}
                    </div>

                    {word.phonetic && (
                      <p className="font-mono text-xs text-text-faint mb-3">{word.phonetic}</p>
                    )}

                    <div className="bg-surface-offset p-4 rounded-xl mb-3">
                      <p className="text-text text-sm mb-2">
                        <span className="font-semibold">{t.definition}: </span>{word.en_definition}
                      </p>
                      {word.en_example && (
                        <p className="text-text-muted text-sm italic">&ldquo;{word.en_example}&rdquo;</p>
                      )}
                    </div>

                    {(word.word_root || word.prefix || word.suffix) && (
                      <div className="flex flex-wrap gap-2">
                        {word.word_root && (
                          <span className="bg-surface-2 px-3 py-1 rounded-lg text-xs border border-border">
                            <span className="text-text-faint mr-1">{t.root}:</span>
                            <span className="font-medium">{word.word_root}</span>
                          </span>
                        )}
                        {word.prefix && (
                          <span className="bg-surface-2 px-3 py-1 rounded-lg text-xs border border-border">
                            <span className="text-text-faint mr-1">{t.prefix}:</span>
                            <span className="font-medium">{word.prefix}</span>
                          </span>
                        )}
                        {word.suffix && (
                          <span className="bg-surface-2 px-3 py-1 rounded-lg text-xs border border-border">
                            <span className="text-text-faint mr-1">{t.suffix}:</span>
                            <span className="font-medium">{word.suffix}</span>
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}

      {query.length >= 2 && !loading && results.length === 0 && (
        <div className="text-center py-16 text-text-muted">
          <Search size={40} className="mx-auto mb-3 opacity-30" />
          <p className="font-medium">{t.noResult} &ldquo;{query}&rdquo;</p>
          <p className="text-sm mt-1">{t.noResultHint}</p>
        </div>
      )}

      {query.length === 0 && (
        <div className="text-center py-16 text-text-muted">
          <Shuffle size={48} className="mx-auto mb-4 opacity-20" />
          <p className="font-medium text-lg">{t.emptyTitle}</p>
          <p className="text-sm mt-1">{t.emptyHint}</p>
        </div>
      )}
    </div>
  )
}
