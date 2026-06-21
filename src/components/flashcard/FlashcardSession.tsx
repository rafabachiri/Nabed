"use client"

import { useState, useCallback } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/Button"
import { ProgressBar } from "@/components/ui/ProgressBar"
import { Badge } from "@/components/ui/Badge"
import { Volume2, RotateCcw, CheckCircle2, XCircle, Trophy } from "lucide-react"
import type { Rating } from "@/lib/srs"

export interface FlashCard {
  wordId: string
  frTerm: string
  enTerm: string
  enDefinition: string
  enExample: string | null
  phonetic: string | null
  audioUrl: string | null
  bodySystem: string
  difficulty: "easy" | "medium" | "hard"
  wordRoot: string | null
  srsLevel: number
  easeFactor: number
}

interface SessionResult {
  wordId: string
  rating: Rating
  xpEarned: number
}

interface Props {
  cards: FlashCard[]
  deckName?: string
  onComplete?: () => void
}

const DIFFICULTY_LABELS: Record<string, string> = {
  easy: "Facile",
  medium: "Moyen",
  hard: "Difficile",
}

const RATING_XP: Record<string, Record<string, number>> = {
  easy:   { "0": 0, "1": 3, "2": 5  },
  medium: { "0": 0, "1": 3, "2": 10 },
  hard:   { "0": 0, "1": 3, "2": 15 },
}

export function FlashcardSession({ cards, deckName, onComplete }: Props) {
  const router = useRouter()
  const [index, setIndex] = useState(0)
  const [flipped, setFlipped] = useState(false)
  const [results, setResults] = useState<SessionResult[]>([])
  const [submitting, setSubmitting] = useState(false)
  const [direction, setDirection] = useState(1)

  const current = cards[index]
  const isDone = index >= cards.length
  const totalXP = results.reduce((sum, r) => sum + r.xpEarned, 0)
  const correctCount = results.filter((r) => r.rating === 2).length

  const playAudio = useCallback(() => {
    if (!current?.audioUrl) return
    new Audio(current.audioUrl).play().catch(() => {})
  }, [current?.audioUrl])

  const speak = useCallback(() => {
    if (!current?.enTerm) return
    const utterance = new SpeechSynthesisUtterance(current.enTerm)
    utterance.lang = "en-US"
    speechSynthesis.speak(utterance)
  }, [current?.enTerm])

  async function rate(rating: Rating) {
    if (submitting) return
    setSubmitting(true)

    const xpEarned = RATING_XP[current.difficulty]?.[String(rating)] ?? 0

    try {
      await fetch("/api/flashcards/review", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          wordId: current.wordId,
          rating,
          currentSrsLevel: current.srsLevel,
          currentEaseFactor: current.easeFactor,
        }),
      })
    } catch {
      // Continue session even if network fails — results are still shown
    }

    setResults((prev) => [...prev, { wordId: current.wordId, rating, xpEarned }])
    setDirection(1)
    setFlipped(false)

    setTimeout(() => {
      setIndex((i) => i + 1)
      setSubmitting(false)
    }, 150)
  }

  function handleFinish() {
    router.refresh()
    onComplete?.()
  }

  // ── Session complete ──────────────────────────────────────────────
  if (isDone) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh] p-6 text-center">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="bg-surface border border-border rounded-3xl p-10 max-w-md w-full shadow-lg"
        >
          <div className="w-20 h-20 bg-gold-highlight rounded-full flex items-center justify-center mx-auto mb-6">
            <Trophy className="text-gold" size={40} />
          </div>
          <h2 className="text-2xl font-display font-bold text-text mb-1">Session terminée !</h2>
          <p className="text-text-muted mb-8">
            {deckName ? `Deck : ${deckName}` : "Révisions du jour"}
          </p>

          <div className="grid grid-cols-3 gap-4 mb-8">
            <div className="bg-surface-offset rounded-xl p-4">
              <p className="text-2xl font-bold text-text">{cards.length}</p>
              <p className="text-xs text-text-muted mt-1">Cartes<br />révisées</p>
            </div>
            <div className="bg-success-highlight rounded-xl p-4">
              <p className="text-2xl font-bold text-success">{correctCount}</p>
              <p className="text-xs text-text-muted mt-1">Correctes</p>
            </div>
            <div className="bg-gold-highlight rounded-xl p-4">
              <p className="text-2xl font-bold text-gold">+{totalXP}</p>
              <p className="text-xs text-text-muted mt-1">XP<br />gagnés</p>
            </div>
          </div>

          <div className="space-y-3">
            <Button className="w-full rounded-xl" onClick={handleFinish}>
              Retour au tableau de bord
            </Button>
            <Button variant="secondary" className="w-full rounded-xl" onClick={() => {
              setIndex(0)
              setFlipped(false)
              setResults([])
            }}>
              <RotateCcw size={16} className="mr-2" /> Recommencer
            </Button>
          </div>
        </motion.div>
      </div>
    )
  }

  // ── Active session ────────────────────────────────────────────────
  return (
    <div className="max-w-xl mx-auto px-4 py-8 flex flex-col gap-6 min-h-[70vh]">
      {/* Progress */}
      <div className="flex items-center gap-4">
        <ProgressBar value={Math.round((index / cards.length) * 100)} className="flex-1 h-2" />
        <span className="text-sm font-medium text-text-muted shrink-0">
          {index + 1} / {cards.length}
        </span>
      </div>

      {/* Card */}
      <div className="flex-1 flex flex-col justify-center">
        <AnimatePresence mode="wait">
          <motion.div
            key={`${current.wordId}-${flipped ? "back" : "front"}`}
            initial={{ opacity: 0, y: direction * 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -direction * 20 }}
            transition={{ duration: 0.2 }}
            className="bg-surface border-2 border-border rounded-3xl p-8 shadow-md min-h-[320px] flex flex-col"
          >
            {/* Card header */}
            <div className="flex items-center justify-between mb-6">
              <Badge variant="secondary" className="capitalize">
                {current.bodySystem}
              </Badge>
              <div className="flex items-center gap-2">
                <Badge
                  className={
                    current.difficulty === "easy"
                      ? "bg-success/10 text-success border-transparent"
                      : current.difficulty === "hard"
                      ? "bg-error/10 text-error border-transparent"
                      : "bg-gold/10 text-gold border-transparent"
                  }
                >
                  {DIFFICULTY_LABELS[current.difficulty]}
                </Badge>
                <button
                  onClick={current.audioUrl ? playAudio : speak}
                  className="w-8 h-8 rounded-full bg-surface-offset hover:bg-primary-highlight text-text-muted hover:text-primary flex items-center justify-center transition-colors"
                  title="Écouter la prononciation"
                >
                  <Volume2 size={16} />
                </button>
              </div>
            </div>

            {!flipped ? (
              /* Front — FR term */
              <div className="flex-1 flex flex-col items-center justify-center text-center gap-4">
                <p className="text-xs font-semibold uppercase tracking-widest text-text-faint">
                  Terme français
                </p>
                <h2 className="text-4xl font-display font-bold text-text leading-tight">
                  {current.frTerm}
                </h2>
                {current.srsLevel === 0 && (
                  <Badge className="bg-orange/10 text-orange border-transparent text-xs">
                    Nouveau mot
                  </Badge>
                )}
                <button
                  onClick={() => setFlipped(true)}
                  className="mt-4 text-sm font-semibold text-primary hover:underline"
                >
                  Afficher la traduction →
                </button>
              </div>
            ) : (
              /* Back — EN term + details */
              <div className="flex-1 flex flex-col gap-4">
                <div className="text-center">
                  <p className="text-xs font-semibold uppercase tracking-widest text-text-faint mb-1">
                    Terme anglais
                  </p>
                  <h2 className="text-3xl font-display font-bold text-primary leading-tight">
                    {current.enTerm}
                  </h2>
                  {current.phonetic && (
                    <p className="text-text-muted text-sm mt-1 font-mono">{current.phonetic}</p>
                  )}
                </div>

                <div className="bg-surface-offset rounded-xl p-4 flex-1">
                  <p className="text-sm text-text leading-relaxed">{current.enDefinition}</p>
                  {current.enExample && (
                    <p className="text-xs text-text-muted mt-3 italic border-t border-border pt-3">
                      &ldquo;{current.enExample}&rdquo;
                    </p>
                  )}
                </div>

                {current.wordRoot && (
                  <p className="text-xs text-text-faint text-center">
                    Racine : <span className="font-semibold text-text-muted">{current.wordRoot}</span>
                  </p>
                )}
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Rating buttons — only after flip */}
      <AnimatePresence>
        {flipped && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="grid grid-cols-3 gap-3"
          >
            <button
              onClick={() => rate(0)}
              disabled={submitting}
              className="flex flex-col items-center gap-2 py-4 rounded-2xl border-2 border-error/30 bg-error-highlight text-error hover:border-error transition-all disabled:opacity-50"
            >
              <XCircle size={24} />
              <span className="text-xs font-bold">Je ne sais pas</span>
            </button>
            <button
              onClick={() => rate(1)}
              disabled={submitting}
              className="flex flex-col items-center gap-2 py-4 rounded-2xl border-2 border-gold/30 bg-gold-highlight text-gold hover:border-gold transition-all disabled:opacity-50"
            >
              <span className="text-2xl">🤔</span>
              <span className="text-xs font-bold">Presque</span>
            </button>
            <button
              onClick={() => rate(2)}
              disabled={submitting}
              className="flex flex-col items-center gap-2 py-4 rounded-2xl border-2 border-success/30 bg-success-highlight text-success hover:border-success transition-all disabled:opacity-50"
            >
              <CheckCircle2 size={24} />
              <span className="text-xs font-bold">Je sais !</span>
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Hint when not flipped */}
      {!flipped && (
        <p className="text-center text-xs text-text-faint">
          Appuyez sur &ldquo;Afficher la traduction&rdquo; pour révéler la réponse
        </p>
      )}
    </div>
  )
}
