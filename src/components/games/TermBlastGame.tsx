"use client"

import { useState } from "react"
import { CheckCircle2, XCircle, Trophy, ArrowLeft, RotateCcw, Zap } from "lucide-react"
import { Button } from "@/components/ui/Button"
import { Card, CardContent } from "@/components/ui/Card"
import { Badge } from "@/components/ui/Badge"
import Link from "next/link"

interface Word { id: string; fr_term: string; en_term: string; en_definition: string; body_system: string; difficulty: string }
interface Props { words: Word[] }

function shuffle<T>(arr: T[]): T[] { return [...arr].sort(() => Math.random() - 0.5) }

function buildQ(target: Word, pool: Word[]) {
  const distractors = shuffle(pool.filter(w => w.id !== target.id)).slice(0, 3)
  return { target, choices: shuffle([target, ...distractors]) }
}

const ROUNDS = 10
const XP_PER_CORRECT = 8

export function TermBlastGame({ words }: Props) {
  const [questions] = useState(() => {
    const pool = shuffle(words).slice(0, ROUNDS)
    return pool.map(w => buildQ(w, words))
  })
  const [index, setIndex] = useState(0)
  const [selected, setSelected] = useState<string | null>(null)
  const [score, setScore] = useState(0)
  const [done, setDone] = useState(false)
  const [started, setStarted] = useState(false)

  const q = questions[index]

  const choose = async (wordId: string) => {
    if (selected !== null) return
    setSelected(wordId)
    const correct = wordId === q.target.id
    if (correct) setScore(s => s + 1)
    setTimeout(() => {
      if (index + 1 >= questions.length) {
        setDone(true)
        fetch("/api/games/score", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ gameType: "term-blast", score: correct ? score + 1 : score, xpEarned: (correct ? score + 1 : score) * XP_PER_CORRECT }),
        })
        return
      }
      setIndex(i => i + 1)
      setSelected(null)
    }, 800)
  }

  if (words.length < 4) return (
    <div className="p-6 lg:p-10 max-w-2xl mx-auto text-center py-20 text-text-muted">Pas assez de mots.</div>
  )

  if (done) {
    const pct = Math.round((score / ROUNDS) * 100)
    return (
      <div className="p-6 lg:p-10 max-w-xl mx-auto">
        <Card><CardContent className="p-10 text-center">
          <Trophy size={52} className="mx-auto mb-4 text-gold" />
          <h2 className="text-3xl font-display font-bold mb-2">Jeu terminé !</h2>
          <p className="text-text-muted mb-4">{score} / {ROUNDS} bonnes réponses</p>
          <div className="text-5xl font-bold text-gold mb-3">{score * XP_PER_CORRECT} XP</div>
          <p className="text-text-muted text-sm mb-8">{pct >= 70 ? "Excellent !" : "Continuez à pratiquer !"}</p>
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
        <div className="text-6xl mb-4">🚀</div>
        <h1 className="text-3xl font-display font-bold mb-2">Term Blast</h1>
        <p className="text-text-muted mb-2">Lisez le terme français et choisissez la bonne traduction anglaise.</p>
        <p className="text-sm text-text-faint mb-8">{ROUNDS} questions • +{XP_PER_CORRECT} XP / bonne réponse</p>
        <Button onClick={() => setStarted(true)} className="rounded-xl px-8 text-lg">Commencer</Button>
      </CardContent></Card>
    </div>
  )

  const diffColor = q.target.difficulty === "easy" ? "bg-success/10 text-success" : q.target.difficulty === "hard" ? "bg-error/10 text-error" : "bg-gold/10 text-gold"

  return (
    <div className="p-6 lg:p-10 max-w-xl mx-auto">
      <Button asChild variant="ghost" size="sm" className="mb-4"><Link href="/games"><ArrowLeft size={16} className="mr-1" />Quitter</Link></Button>

      <div className="flex items-center justify-between mb-4">
        <span className="text-sm text-text-muted">Question {index + 1} / {ROUNDS}</span>
        <div className="flex items-center gap-2">
          <Zap size={16} className="text-gold" />
          <span className="font-bold text-gold">{score * XP_PER_CORRECT} XP</span>
        </div>
      </div>

      <div className="h-1.5 bg-surface-offset rounded-full mb-6">
        <div className="h-full bg-primary rounded-full transition-all" style={{ width: `${((index) / ROUNDS) * 100}%` }} />
      </div>

      <Card className="mb-5">
        <CardContent className="p-6 text-center">
          <Badge className={`mb-3 border-transparent text-xs ${diffColor}`}>
            {q.target.difficulty === "easy" ? "Facile" : q.target.difficulty === "hard" ? "Difficile" : "Moyen"}
          </Badge>
          <p className="text-xs text-text-muted mb-2">Terme français</p>
          <h2 className="text-3xl font-display font-bold text-text mb-3">{q.target.fr_term}</h2>
          <p className="text-sm text-text-muted">{q.target.en_definition.substring(0, 80)}...</p>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {q.choices.map(choice => {
          const isCorrect = choice.id === q.target.id
          const isSelected = selected === choice.id
          const show = selected !== null
          let cls = "w-full text-left p-4 rounded-xl border-2 transition-all font-medium text-sm flex items-center justify-between gap-2 "
          if (!show) cls += "border-border hover:border-primary hover:bg-primary-highlight cursor-pointer"
          else if (isCorrect) cls += "border-success bg-success/10 text-success cursor-default"
          else if (isSelected) cls += "border-error bg-error/10 text-error cursor-default"
          else cls += "border-border opacity-50 cursor-default"

          return (
            <button key={choice.id} onClick={() => choose(choice.id)} className={cls} disabled={selected !== null}>
              <span>{choice.en_term}</span>
              {show && isCorrect && <CheckCircle2 size={18} className="shrink-0" />}
              {show && isSelected && !isCorrect && <XCircle size={18} className="shrink-0" />}
            </button>
          )
        })}
      </div>
    </div>
  )
}
