"use client"

import { useState } from "react"
import { Trophy, ArrowLeft, RotateCcw, CheckCircle2 } from "lucide-react"
import { Button } from "@/components/ui/Button"
import { Card, CardContent } from "@/components/ui/Card"
import Link from "next/link"

interface Word { id: string; fr_term: string; en_term: string; en_definition: string; en_example: string | null; body_system: string }
interface Props { words: Word[] }

function shuffle<T>(arr: T[]): T[] { return [...arr].sort(() => Math.random() - 0.5) }

const PAIRS = 6
const XP = 15

export function DiagnosticMatchGame({ words }: Props) {
  const [pairs] = useState(() => shuffle(words).slice(0, PAIRS))
  const [leftOrder] = useState(() => shuffle(Array.from({ length: PAIRS }, (_, i) => i)))
  const [rightOrder] = useState(() => shuffle(Array.from({ length: PAIRS }, (_, i) => i)))
  const [leftSel, setLeftSel] = useState<number | null>(null)
  const [rightSel, setRightSel] = useState<number | null>(null)
  const [matched, setMatched] = useState<number[]>([])
  const [mistakes, setMistakes] = useState(0)
  const [started, setStarted] = useState(false)
  const [wrong, setWrong] = useState(false)

  const done = matched.length === PAIRS

  const pickLeft = (idx: number) => {
    if (matched.includes(idx)) return
    setLeftSel(idx)
  }

  const pickRight = (idx: number) => {
    if (matched.includes(idx)) return
    setRightSel(idx)
    if (leftSel === null) return
    if (leftSel === idx) {
      setMatched(m => [...m, idx])
      setLeftSel(null)
      setRightSel(null)
      if (matched.length + 1 === PAIRS) {
        fetch("/api/games/score", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ gameType: "diagnostic-match", score: PAIRS - mistakes, xpEarned: Math.max(0, (PAIRS - mistakes)) * XP }),
        })
      }
    } else {
      setWrong(true)
      setMistakes(m => m + 1)
      setTimeout(() => { setLeftSel(null); setRightSel(null); setWrong(false) }, 700)
    }
  }

  if (!started) return (
    <div className="p-6 lg:p-10 max-w-2xl mx-auto">
      <Button asChild variant="ghost" size="sm" className="mb-6"><Link href="/games"><ArrowLeft size={16} className="mr-1" />Retour</Link></Button>
      <Card><CardContent className="p-10 text-center">
        <div className="text-6xl mb-4">🩺</div>
        <h1 className="text-3xl font-display font-bold mb-2">Diagnostic Match</h1>
        <p className="text-text-muted mb-2">Reliez chaque terme français à sa définition en anglais.</p>
        <p className="text-sm text-text-faint mb-8">{PAIRS} paires • Moins d&apos;erreurs = plus d&apos;XP</p>
        <Button onClick={() => setStarted(true)} className="rounded-xl px-8 text-lg">Commencer</Button>
      </CardContent></Card>
    </div>
  )

  if (done) {
    const xpEarned = Math.max(0, (PAIRS - mistakes)) * XP
    return (
      <div className="p-6 lg:p-10 max-w-xl mx-auto">
        <Card><CardContent className="p-10 text-center">
          <Trophy size={52} className="mx-auto mb-4 text-gold" />
          <h2 className="text-3xl font-display font-bold mb-2">Parfait !</h2>
          <p className="text-text-muted mb-4">{mistakes} erreur{mistakes !== 1 ? "s" : ""}</p>
          <div className="text-5xl font-bold text-gold mb-3">{xpEarned} XP</div>
          <div className="flex gap-3 justify-center mt-8">
            <Button asChild variant="outline" className="rounded-xl"><Link href="/games"><ArrowLeft size={16} className="mr-1" />Jeux</Link></Button>
            <Button onClick={() => window.location.reload()} className="rounded-xl"><RotateCcw size={16} className="mr-2" />Rejouer</Button>
          </div>
        </CardContent></Card>
      </div>
    )
  }

  return (
    <div className="p-6 lg:p-10 max-w-3xl mx-auto">
      <Button asChild variant="ghost" size="sm" className="mb-4"><Link href="/games"><ArrowLeft size={16} className="mr-1" />Quitter</Link></Button>

      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-display font-bold text-text flex items-center gap-2">🩺 Diagnostic Match</h1>
        <div className="flex items-center gap-3 text-sm">
          <span className="text-success font-semibold">{matched.length}/{PAIRS}</span>
          {mistakes > 0 && <span className="text-error">❌ {mistakes}</span>}
        </div>
      </div>

      <p className="text-sm text-text-muted mb-6">Cliquez sur un terme français, puis sur sa définition anglaise correspondante.</p>

      <div className="grid grid-cols-2 gap-4">
        {/* Left: FR terms */}
        <div className="space-y-3">
          <p className="text-xs font-bold text-text-muted uppercase tracking-wider text-center mb-3">Français</p>
          {leftOrder.map(i => {
            const word = pairs[i]
            const isMatched = matched.includes(i)
            const isSel = leftSel === i
            return (
              <button
                key={i}
                onClick={() => pickLeft(i)}
                disabled={isMatched}
                className={`w-full p-3 rounded-xl border-2 text-sm font-medium text-left transition-all ${
                  isMatched ? "border-success bg-success/10 text-success cursor-default" :
                  isSel ? "border-primary bg-primary-highlight text-primary" :
                  "border-border hover:border-primary hover:bg-surface-offset cursor-pointer"
                }`}
              >
                <div className="flex items-center justify-between gap-2">
                  <span>{word.fr_term}</span>
                  {isMatched && <CheckCircle2 size={16} className="shrink-0 text-success" />}
                </div>
              </button>
            )
          })}
        </div>

        {/* Right: EN definitions */}
        <div className="space-y-3">
          <p className="text-xs font-bold text-text-muted uppercase tracking-wider text-center mb-3">English</p>
          {rightOrder.map(i => {
            const word = pairs[i]
            const isMatched = matched.includes(i)
            const isSel = rightSel === i
            const isWrong = wrong && isSel
            return (
              <button
                key={i}
                onClick={() => pickRight(i)}
                disabled={isMatched || leftSel === null}
                className={`w-full p-3 rounded-xl border-2 text-xs text-left transition-all leading-relaxed ${
                  isMatched ? "border-success bg-success/10 text-success cursor-default" :
                  isWrong ? "border-error bg-error/10 text-error" :
                  leftSel !== null && !isMatched ? "border-dashed border-primary/40 hover:border-primary hover:bg-primary-highlight cursor-pointer" :
                  "border-border bg-surface-offset cursor-default"
                }`}
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="flex-1">{word.en_definition.substring(0, 60)}...</span>
                  {isMatched && <CheckCircle2 size={16} className="shrink-0 text-success" />}
                </div>
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}
