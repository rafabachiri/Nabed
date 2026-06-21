"use client"

import { useState, useCallback } from "react"
import { CheckCircle2, XCircle, RotateCcw, Trophy, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/Button"
import { Card, CardContent } from "@/components/ui/Card"
import { Badge } from "@/components/ui/Badge"
import type { Word } from "@/types/database"

interface Props {
  words: Word[]
  systemName: string
}

function shuffle<T>(arr: T[]): T[] {
  return [...arr].sort(() => Math.random() - 0.5)
}

function buildQuestion(target: Word, pool: Word[]) {
  const distractors = shuffle(pool.filter(w => w.id !== target.id)).slice(0, 3)
  const choices = shuffle([target, ...distractors])
  return { target, choices }
}

const QUIZ_SIZE = 10

export function SystemQuiz({ words, systemName }: Props) {
  const [started, setStarted] = useState(false)
  const [questions, setQuestions] = useState<ReturnType<typeof buildQuestion>[]>([])
  const [current, setCurrent] = useState(0)
  const [selected, setSelected] = useState<string | null>(null)
  const [score, setScore] = useState(0)
  const [finished, setFinished] = useState(false)

  const initQuiz = useCallback(() => {
    if (words.length < 4) return
    const pool = shuffle(words).slice(0, QUIZ_SIZE)
    const qs = pool.map(w => buildQuestion(w, words))
    setQuestions(qs)
    setCurrent(0)
    setSelected(null)
    setScore(0)
    setFinished(false)
    setStarted(true)
  }, [words])

  const handleChoice = (wordId: string) => {
    if (selected !== null) return
    setSelected(wordId)
    if (wordId === questions[current].target.id) {
      setScore(s => s + 1)
    }
    setTimeout(() => {
      if (current + 1 >= questions.length) {
        setFinished(true)
      } else {
        setCurrent(c => c + 1)
        setSelected(null)
      }
    }, 900)
  }

  if (words.length < 4) return null

  if (!started) {
    return (
      <Card className="border-primary/20 bg-primary-highlight">
        <CardContent className="p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-display font-bold text-text mb-1">Quiz rapide</h2>
            <p className="text-sm text-text-muted">
              Testez votre connaissance de {systemName} — {Math.min(QUIZ_SIZE, words.length)} questions.
            </p>
          </div>
          <Button onClick={initQuiz} className="shrink-0 rounded-xl">
            <ChevronRight size={18} className="mr-1" /> Commencer
          </Button>
        </CardContent>
      </Card>
    )
  }

  if (finished) {
    const pct = Math.round((score / questions.length) * 100)
    return (
      <Card className={`border-2 ${pct >= 70 ? "border-success/40 bg-success/5" : "border-error/30 bg-error/5"}`}>
        <CardContent className="p-8 text-center">
          <Trophy size={48} className={`mx-auto mb-4 ${pct >= 70 ? "text-gold" : "text-text-muted"}`} />
          <h2 className="text-2xl font-display font-bold text-text mb-2">Quiz terminé !</h2>
          <p className="text-text-muted mb-2">
            {score} / {questions.length} bonnes réponses
          </p>
          <div className="text-4xl font-bold mb-6" style={{ color: pct >= 70 ? "var(--color-success)" : "var(--color-error)" }}>
            {pct}%
          </div>
          <p className="text-sm text-text-muted mb-6">
            {pct === 100 ? "Parfait ! Maîtrise totale 🏆" :
             pct >= 70 ? "Bon travail ! Continuez comme ça." :
             "Continuez à pratiquer avec les flashcards."}
          </p>
          <Button onClick={initQuiz} variant="outline" className="rounded-xl">
            <RotateCcw size={16} className="mr-2" /> Recommencer
          </Button>
        </CardContent>
      </Card>
    )
  }

  const q = questions[current]

  return (
    <Card className="border-primary/20">
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-display font-bold text-text">Quiz rapide</h2>
          <Badge variant="secondary">{current + 1} / {questions.length}</Badge>
        </div>

        <div className="bg-surface-offset rounded-2xl p-6 mb-6 text-center">
          <p className="text-xs text-text-muted uppercase tracking-wider mb-2">Terme français</p>
          <p className="text-2xl font-display font-bold text-text">{q.target.fr_term}</p>
          {q.target.en_example && (
            <p className="text-xs text-text-faint mt-2 italic">{q.target.en_definition.substring(0, 60)}...</p>
          )}
        </div>

        <p className="text-sm text-text-muted mb-3 text-center">Quelle est la traduction anglaise ?</p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {q.choices.map(choice => {
            const isCorrect = choice.id === q.target.id
            const isSelected = selected === choice.id
            const showResult = selected !== null

            let className = "w-full text-left p-4 rounded-xl border-2 transition-all font-medium text-sm flex items-center justify-between gap-2 "
            if (!showResult) {
              className += "border-border hover:border-primary hover:bg-primary-highlight cursor-pointer"
            } else if (isCorrect) {
              className += "border-success bg-success/10 text-success cursor-default"
            } else if (isSelected && !isCorrect) {
              className += "border-error bg-error/10 text-error cursor-default"
            } else {
              className += "border-border opacity-50 cursor-default"
            }

            return (
              <button
                key={choice.id}
                onClick={() => handleChoice(choice.id)}
                className={className}
                disabled={selected !== null}
              >
                <span>{choice.en_term}</span>
                {showResult && isCorrect && <CheckCircle2 size={18} className="shrink-0" />}
                {showResult && isSelected && !isCorrect && <XCircle size={18} className="shrink-0" />}
              </button>
            )
          })}
        </div>

        <div className="mt-4 flex items-center gap-2">
          <div className="flex-1 bg-surface-offset rounded-full h-1.5">
            <div
              className="bg-primary h-1.5 rounded-full transition-all duration-300"
              style={{ width: `${((current) / questions.length) * 100}%` }}
            />
          </div>
          <span className="text-xs text-text-muted font-mono">{score} pts</span>
        </div>
      </CardContent>
    </Card>
  )
}
