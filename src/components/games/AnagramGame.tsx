"use client"

import { useState, useEffect, useRef } from "react"
import { RotateCcw, CheckCircle2, XCircle, Trophy, ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/Button"
import { Card, CardContent } from "@/components/ui/Card"
import Link from "next/link"

interface Word { id: string; fr_term: string; en_term: string; en_definition: string; body_system: string }

interface Props { words: Word[] }

function shuffle<T>(arr: T[]): T[] { return [...arr].sort(() => Math.random() - 0.5) }

function scramble(word: string): string {
  if (word.length <= 1) return word
  let s = word
  let attempts = 0
  while (s === word && attempts < 20) {
    s = shuffle(word.split("")).join("")
    attempts++
  }
  return s
}

const ROUND_TIME = 30
const ROUNDS = 8
const XP_PER_CORRECT = 10

export function AnagramGame({ words }: Props) {
  const [queue] = useState(() => shuffle(words).slice(0, ROUNDS))
  const [index, setIndex] = useState(0)
  const [scrambled, setScrambled] = useState(() => scramble(queue[0]?.en_term ?? ""))
  const [input, setInput] = useState("")
  const [result, setResult] = useState<"correct" | "wrong" | null>(null)
  const [score, setScore] = useState(0)
  const [timeLeft, setTimeLeft] = useState(ROUND_TIME)
  const [done, setDone] = useState(false)
  const [started, setStarted] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const current = queue[index]

  useEffect(() => {
    if (!started || result !== null || done) return
    timerRef.current = setInterval(() => {
      setTimeLeft(t => {
        if (t <= 1) {
          clearInterval(timerRef.current!)
          setResult("wrong")
          return 0
        }
        return t - 1
      })
    }, 1000)
    return () => clearInterval(timerRef.current!)
  }, [started, index, result, done])

  const check = () => {
    if (!input.trim() || result !== null) return
    const correct = input.trim().toLowerCase() === current.en_term.toLowerCase()
    setResult(correct ? "correct" : "wrong")
    if (correct) setScore(s => s + 1)
    clearInterval(timerRef.current!)
  }

  const next = async () => {
    if (index + 1 >= queue.length) {
      setDone(true)
      await fetch("/api/games/score", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ gameType: "anagram", score, xpEarned: score * XP_PER_CORRECT }),
      })
      return
    }
    const ni = index + 1
    setIndex(ni)
    setScrambled(scramble(queue[ni].en_term))
    setInput("")
    setResult(null)
    setTimeLeft(ROUND_TIME)
    setTimeout(() => inputRef.current?.focus(), 50)
  }

  if (words.length < 4) return (
    <div className="p-6 lg:p-10 max-w-2xl mx-auto text-center py-20 text-text-muted">
      Pas assez de mots pour ce jeu.
    </div>
  )

  if (done) {
    const total = queue.length
    const pct = Math.round((score / total) * 100)
    return (
      <div className="p-6 lg:p-10 max-w-xl mx-auto">
        <Card><CardContent className="p-10 text-center">
          <Trophy size={52} className="mx-auto mb-4 text-gold" />
          <h2 className="text-3xl font-display font-bold mb-2">Jeu terminé !</h2>
          <p className="text-text-muted mb-4">{score} / {total} bonnes réponses</p>
          <div className="text-5xl font-bold text-gold mb-3">{score * XP_PER_CORRECT} XP</div>
          <p className="text-text-muted text-sm mb-8">{pct >= 75 ? "Excellent vocabulaire !" : "Continuez à pratiquer."}</p>
          <div className="flex gap-3 justify-center">
            <Button asChild variant="outline" className="rounded-xl"><Link href="/games"><ArrowLeft size={16} className="mr-1" />Jeux</Link></Button>
            <Button onClick={() => window.location.reload()} className="rounded-xl"><RotateCcw size={16} className="mr-2" />Rejouer</Button>
          </div>
        </CardContent></Card>
      </div>
    )
  }

  if (!started) return (
    <div className="p-6 lg:p-10 max-w-xl mx-auto">
      <Button asChild variant="ghost" size="sm" className="mb-6"><Link href="/games"><ArrowLeft size={16} className="mr-1" />Retour</Link></Button>
      <Card><CardContent className="p-10 text-center">
        <div className="text-6xl mb-4">🔀</div>
        <h1 className="text-3xl font-display font-bold mb-2">Anagramme</h1>
        <p className="text-text-muted mb-2">Remettez les lettres dans le bon ordre pour former le terme médical anglais.</p>
        <p className="text-sm text-text-faint mb-8">{ROUNDS} mots • {ROUND_TIME}s par mot • +{XP_PER_CORRECT} XP par bonne réponse</p>
        <Button onClick={() => setStarted(true)} className="rounded-xl px-8 text-lg">Commencer</Button>
      </CardContent></Card>
    </div>
  )

  const timerPct = (timeLeft / ROUND_TIME) * 100

  return (
    <div className="p-6 lg:p-10 max-w-xl mx-auto">
      <Button asChild variant="ghost" size="sm" className="mb-4"><Link href="/games"><ArrowLeft size={16} className="mr-1" />Quitter</Link></Button>

      <div className="flex items-center justify-between mb-4 text-sm text-text-muted">
        <span>Mot {index + 1} / {queue.length}</span>
        <span className="font-semibold text-success">{score} pts</span>
      </div>

      {/* Timer bar */}
      <div className="h-2 bg-surface-offset rounded-full mb-6 overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-1000 ${timerPct > 50 ? "bg-success" : timerPct > 25 ? "bg-gold" : "bg-error"}`}
          style={{ width: `${timerPct}%` }}
        />
      </div>

      <Card>
        <CardContent className="p-6 text-center">
          <p className="text-xs text-text-muted uppercase tracking-wider mb-1">Terme français</p>
          <p className="text-xl font-display font-bold text-text mb-1">{current.fr_term}</p>
          <p className="text-xs text-text-faint mb-6">{current.en_definition.substring(0, 70)}...</p>

          <div className="bg-surface-offset rounded-2xl p-6 mb-6">
            <p className="text-xs text-text-muted uppercase tracking-wider mb-3">Anagramme</p>
            <div className="flex justify-center flex-wrap gap-2">
              {scrambled.toUpperCase().split("").map((ch, i) => (
                <div key={i} className="w-10 h-10 rounded-lg bg-surface border-2 border-border flex items-center justify-center font-display font-bold text-lg text-text shadow-sm">
                  {ch}
                </div>
              ))}
            </div>
          </div>

          <div className="flex gap-2 mb-4">
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => { if (e.key === "Enter") { if (result === null) check(); else next() } }}
              disabled={result !== null}
              placeholder="Votre réponse..."
              autoFocus
              className="flex-1 bg-surface-offset border border-border rounded-xl px-4 py-3 focus:ring-2 focus:ring-primary focus:outline-none text-text placeholder:text-text-faint text-center font-medium tracking-wider"
            />
            {result === null && <Button onClick={check} className="rounded-xl px-5">OK</Button>}
          </div>

          {result === "correct" && (
            <div className="flex items-center justify-center gap-2 text-success font-bold mb-3 p-3 bg-success/10 rounded-xl">
              <CheckCircle2 size={20} /> Correct ! +{XP_PER_CORRECT} XP
            </div>
          )}
          {result === "wrong" && (
            <div className="p-3 bg-error/10 rounded-xl text-error font-bold mb-3 flex items-center justify-center gap-2">
              <XCircle size={20} /> Réponse : <span className="tracking-wider">{current.en_term.toUpperCase()}</span>
            </div>
          )}

          {result !== null && (
            <Button onClick={next} className="w-full rounded-xl">Suivant →</Button>
          )}

          <div className="mt-4 text-2xl font-mono font-bold text-text-muted">{timeLeft}s</div>
        </CardContent>
      </Card>
    </div>
  )
}
