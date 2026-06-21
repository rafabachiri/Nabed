"use client"

import { useState } from "react"
import { CheckCircle2, XCircle, Trophy, ArrowLeft, RotateCcw } from "lucide-react"
import { Button } from "@/components/ui/Button"
import { Card, CardContent } from "@/components/ui/Card"
import Link from "next/link"

interface Word { id: string; fr_term: string; en_term: string; en_definition: string; word_root: string | null; prefix: string | null; suffix: string | null; body_system: string }
interface Props { words: Word[] }

function shuffle<T>(arr: T[]): T[] { return [...arr].sort(() => Math.random() - 0.5) }

// Build question: show word, ask which root/prefix/suffix matches
function buildQ(target: Word, allWords: Word[]) {
  const field = target.word_root ? "word_root" : target.prefix ? "prefix" : "suffix"
  const correctVal = (target[field] ?? "") as string
  const label = field === "word_root" ? "Racine" : field === "prefix" ? "Préfixe" : "Suffixe"
  const wrongPool = shuffle(allWords.filter(w => w.id !== target.id && w[field] && w[field] !== correctVal))
  const distractors = wrongPool.slice(0, 3).map(w => w[field] as string)
  const choices = shuffle([correctVal, ...distractors])
  return { target, correctVal, label, choices, field }
}

const ROUNDS = 10
const XP_PER_CORRECT = 12

export function WordRootsGame({ words }: Props) {
  const [questions] = useState(() => {
    const eligible = words.filter(w => w.word_root || w.prefix || w.suffix)
    return shuffle(eligible).slice(0, ROUNDS).map(w => buildQ(w, eligible))
  })
  const [index, setIndex] = useState(0)
  const [selected, setSelected] = useState<string | null>(null)
  const [score, setScore] = useState(0)
  const [done, setDone] = useState(false)
  const [started, setStarted] = useState(false)

  const q = questions[index]

  const choose = (val: string) => {
    if (selected !== null) return
    setSelected(val)
    if (val === q.correctVal) setScore(s => s + 1)
    setTimeout(() => {
      if (index + 1 >= questions.length) {
        setDone(true)
        fetch("/api/games/score", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ gameType: "word-roots", score, xpEarned: score * XP_PER_CORRECT }),
        })
        return
      }
      setIndex(i => i + 1)
      setSelected(null)
    }, 900)
  }

  if (questions.length < 4) return (
    <div className="p-6 lg:p-10 max-w-2xl mx-auto text-center py-20 text-text-muted">
      Pas assez de mots avec racines dans la base de données.
    </div>
  )

  if (done) {
    const pct = Math.round((score / questions.length) * 100)
    return (
      <div className="p-6 lg:p-10 max-w-xl mx-auto">
        <Card><CardContent className="p-10 text-center">
          <Trophy size={52} className="mx-auto mb-4 text-gold" />
          <h2 className="text-3xl font-display font-bold mb-2">Jeu terminé !</h2>
          <p className="text-text-muted mb-4">{score} / {questions.length} bonnes réponses</p>
          <div className="text-5xl font-bold text-gold mb-3">{score * XP_PER_CORRECT} XP</div>
          <p className="text-sm text-text-muted mb-8">{pct >= 70 ? "Maître des racines médicales !" : "Continuez à explorer les racines."}</p>
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
        <div className="text-6xl mb-4">🔤</div>
        <h1 className="text-3xl font-display font-bold mb-2">Racines Médicales</h1>
        <p className="text-text-muted mb-2">Identifiez la racine, le préfixe ou le suffixe du terme médical.</p>
        <p className="text-sm text-text-faint mb-8">{questions.length} questions • +{XP_PER_CORRECT} XP / bonne réponse</p>
        <Button onClick={() => setStarted(true)} className="rounded-xl px-8 text-lg">Commencer</Button>
      </CardContent></Card>
    </div>
  )

  return (
    <div className="p-6 lg:p-10 max-w-xl mx-auto">
      <Button asChild variant="ghost" size="sm" className="mb-4"><Link href="/games"><ArrowLeft size={16} className="mr-1" />Quitter</Link></Button>

      <div className="flex items-center justify-between mb-4 text-sm text-text-muted">
        <span>Question {index + 1} / {questions.length}</span>
        <span className="font-semibold text-gold">{score * XP_PER_CORRECT} XP</span>
      </div>

      <div className="h-1.5 bg-surface-offset rounded-full mb-6">
        <div className="h-full bg-gold rounded-full transition-all" style={{ width: `${(index / questions.length) * 100}%` }} />
      </div>

      <Card className="mb-5">
        <CardContent className="p-6 text-center">
          <div className="bg-surface-offset rounded-xl p-5 mb-4">
            <p className="text-xs text-text-muted uppercase tracking-wider mb-1">Terme médical</p>
            <p className="text-2xl font-display font-bold text-text">{q.target.en_term}</p>
            <p className="text-sm text-text-muted mt-2">{q.target.fr_term}</p>
          </div>
          <p className="text-base text-text mb-1">
            Quelle est la <span className="font-bold text-gold">{q.label.toLowerCase()}</span> de ce terme ?
          </p>
          <p className="text-xs text-text-faint">{q.target.en_definition.substring(0, 70)}...</p>
        </CardContent>
      </Card>

      <div className="grid grid-cols-2 gap-3">
        {q.choices.map((choice, i) => {
          const isCorrect = choice === q.correctVal
          const isSelected = selected === choice
          const show = selected !== null
          let cls = "w-full text-center p-4 rounded-xl border-2 transition-all font-bold text-lg flex items-center justify-center gap-2 "
          if (!show) cls += "border-border hover:border-gold hover:bg-gold/5 cursor-pointer"
          else if (isCorrect) cls += "border-success bg-success/10 text-success cursor-default"
          else if (isSelected) cls += "border-error bg-error/10 text-error cursor-default"
          else cls += "border-border opacity-50 cursor-default"

          return (
            <button key={i} onClick={() => choose(choice)} className={cls} disabled={selected !== null}>
              {choice}
              {show && isCorrect && <CheckCircle2 size={18} className="shrink-0" />}
              {show && isSelected && !isCorrect && <XCircle size={18} className="shrink-0" />}
            </button>
          )
        })}
      </div>
    </div>
  )
}
