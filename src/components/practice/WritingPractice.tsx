"use client"

import { useState, useRef } from "react"
import { PenLine, CheckCircle2, XCircle, RotateCcw, ChevronRight, Lightbulb } from "lucide-react"
import { Button } from "@/components/ui/Button"
import { Card, CardContent } from "@/components/ui/Card"

interface Word {
  id: string
  fr_term: string
  en_term: string
  phonetic: string | null
  en_definition: string
  en_example: string | null
}

interface Props { words: Word[] }

function shuffle<T>(arr: T[]): T[] { return [...arr].sort(() => Math.random() - 0.5) }

function normalize(s: string) { return s.toLowerCase().trim().replace(/[^a-z\s]/g, "") }

export function WritingPractice({ words }: Props) {
  const [queue] = useState(() => shuffle(words).slice(0, 12))
  const [index, setIndex] = useState(0)
  const [input, setInput] = useState("")
  const [result, setResult] = useState<"correct" | "close" | "wrong" | null>(null)
  const [score, setScore] = useState(0)
  const [done, setDone] = useState(false)
  const [hint, setHint] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const current = queue[index]

  const check = () => {
    if (!input.trim()) return
    const answer = normalize(current.en_term)
    const attempt = normalize(input)
    let r: "correct" | "close" | "wrong"
    if (attempt === answer) {
      r = "correct"
      setScore(s => s + 1)
    } else if (levenshtein(attempt, answer) <= 2) {
      r = "close"
    } else {
      r = "wrong"
    }
    setResult(r)
  }

  const next = () => {
    if (index + 1 >= queue.length) { setDone(true); return }
    setIndex(i => i + 1)
    setInput("")
    setResult(null)
    setHint(false)
    setTimeout(() => inputRef.current?.focus(), 100)
  }

  if (done) {
    const pct = Math.round((score / queue.length) * 100)
    return (
      <div className="p-6 lg:p-10 max-w-2xl mx-auto">
        <Card><CardContent className="p-10 text-center">
          <CheckCircle2 size={52} className="mx-auto mb-4 text-success" />
          <h2 className="text-2xl font-display font-bold mb-2">Séance terminée !</h2>
          <p className="text-text-muted mb-4">{score} / {queue.length} correct</p>
          <div className="text-5xl font-bold mb-6" style={{ color: pct >= 70 ? "var(--color-success)" : "var(--color-error)" }}>{pct}%</div>
          <Button onClick={() => window.location.reload()} className="rounded-xl"><RotateCcw size={16} className="mr-2" /> Recommencer</Button>
        </CardContent></Card>
      </div>
    )
  }

  return (
    <div className="p-6 lg:p-10 max-w-2xl mx-auto">
      <header className="mb-8">
        <h1 className="text-2xl font-display font-bold text-text flex items-center gap-3">
          <PenLine className="text-success" size={26} /> Écriture
        </h1>
        <p className="text-text-muted mt-1">Lisez la définition et écrivez le terme anglais.</p>
      </header>

      <div className="flex items-center justify-between mb-4 text-sm text-text-muted">
        <span>{index + 1} / {queue.length}</span>
        <span className="font-semibold text-success">{score} correct</span>
      </div>

      <Card className="mb-6">
        <CardContent className="p-6">
          <div className="bg-surface-offset rounded-xl p-5 mb-5">
            <p className="text-xs text-text-muted uppercase tracking-wider mb-1">Terme français</p>
            <p className="text-lg font-display font-bold text-text mb-3">{current.fr_term}</p>
            <p className="text-xs text-text-muted uppercase tracking-wider mb-1">Définition</p>
            <p className="text-sm text-text leading-relaxed">{current.en_definition}</p>
            {current.en_example && (
              <p className="text-xs text-text-faint italic mt-2">&ldquo;{current.en_example}&rdquo;</p>
            )}
          </div>

          {hint && (
            <div className="mb-4 p-3 bg-gold/10 rounded-xl border border-gold/20 text-sm text-text-muted">
              <span className="font-semibold text-gold">Indice:</span> {current.en_term[0].toUpperCase()}{current.en_term.substring(1, 3)}...
              ({current.en_term.length} lettres)
            </div>
          )}

          <div className="flex gap-2 mb-4">
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={e => { setInput(e.target.value); setResult(null) }}
              onKeyDown={e => { if (e.key === "Enter" && result === null) check(); else if (e.key === "Enter" && result !== null) next() }}
              placeholder="Écrivez le terme anglais..."
              disabled={result !== null}
              className="flex-1 bg-surface-offset border border-border rounded-xl px-4 py-3 focus:ring-2 focus:ring-primary focus:outline-none text-text placeholder:text-text-faint transition-shadow"
              autoFocus
            />
            {result === null && (
              <Button onClick={check} disabled={!input.trim()} className="rounded-xl px-5">Vérifier</Button>
            )}
          </div>

          {result === "correct" && (
            <div className="flex items-center gap-2 text-success font-bold p-3 bg-success/10 rounded-xl">
              <CheckCircle2 size={20} /> Parfait !
            </div>
          )}
          {result === "close" && (
            <div className="p-3 bg-gold/10 rounded-xl border border-gold/20">
              <div className="flex items-center gap-2 text-gold font-bold mb-1">
                <CheckCircle2 size={20} /> Presque ! La bonne réponse est :
              </div>
              <p className="text-text font-semibold">{current.en_term}</p>
              {current.phonetic && <p className="font-mono text-xs text-text-faint">{current.phonetic}</p>}
            </div>
          )}
          {result === "wrong" && (
            <div className="p-3 bg-error/10 rounded-xl border border-error/20">
              <div className="flex items-center gap-2 text-error font-bold mb-1">
                <XCircle size={20} /> Incorrect. La bonne réponse est :
              </div>
              <p className="text-text font-semibold">{current.en_term}</p>
              {current.phonetic && <p className="font-mono text-xs text-text-faint">{current.phonetic}</p>}
            </div>
          )}

          <div className="flex items-center justify-between mt-4">
            {!hint && result === null && (
              <Button variant="ghost" size="sm" onClick={() => setHint(true)} className="text-gold gap-1">
                <Lightbulb size={15} /> Indice
              </Button>
            )}
            {result !== null && (
              <Button onClick={next} className="rounded-xl ml-auto">
                Suivant <ChevronRight size={16} className="ml-1" />
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

function levenshtein(a: string, b: string): number {
  const m = a.length, n = b.length
  const dp: number[][] = Array.from({ length: m + 1 }, (_, i) => [i, ...Array(n).fill(0)])
  for (let j = 0; j <= n; j++) dp[0][j] = j
  for (let i = 1; i <= m; i++) for (let j = 1; j <= n; j++)
    dp[i][j] = a[i - 1] === b[j - 1] ? dp[i - 1][j - 1] : 1 + Math.min(dp[i - 1][j], dp[i][j - 1], dp[i - 1][j - 1])
  return dp[m][n]
}
