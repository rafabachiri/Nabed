"use client"

import { useState } from "react"
import { FlashcardSession, type FlashCard } from "./FlashcardSession"
import { Button } from "@/components/ui/Button"
import { PlayCircle, CheckCircle2 } from "lucide-react"

interface Props {
  dueCards: FlashCard[]
  deckName?: string
}

export function FlashcardHub({ dueCards, deckName }: Props) {
  const [sessionActive, setSessionActive] = useState(false)
  const [done, setDone] = useState(false)

  if (done) {
    return (
      <div className="bg-success-highlight border border-success/20 rounded-2xl p-6 flex items-center gap-4">
        <CheckCircle2 className="text-success shrink-0" size={28} />
        <div>
          <p className="font-bold text-text">Révisions du jour terminées !</p>
          <p className="text-sm text-text-muted">Revenez demain pour de nouvelles cartes.</p>
        </div>
      </div>
    )
  }

  if (sessionActive) {
    return (
      <FlashcardSession
        cards={dueCards}
        deckName={deckName}
        onComplete={() => { setSessionActive(false); setDone(true) }}
      />
    )
  }

  if (dueCards.length === 0) {
    return (
      <div className="bg-primary-highlight border border-primary/20 rounded-2xl p-6 flex items-center justify-between gap-4">
        <div>
          <p className="font-bold text-text">Aucune révision pour aujourd&apos;hui 🎉</p>
          <p className="text-sm text-text-muted">
            Choisissez un deck ci-dessous pour apprendre de nouveaux mots.
          </p>
        </div>
        <CheckCircle2 className="text-primary shrink-0" size={32} />
      </div>
    )
  }

  return (
    <div className="bg-surface border-2 border-primary/20 rounded-2xl p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5">
      <div>
        <div className="flex items-center gap-3 mb-1">
          <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-white font-bold text-lg">
            {dueCards.length}
          </div>
          <h2 className="text-xl font-display font-bold text-text">
            {dueCards.length === 1 ? "carte à réviser" : "cartes à réviser"}
          </h2>
        </div>
        <p className="text-sm text-text-muted ml-13 pl-13">
          Complétez vos révisions du jour pour maintenir votre progression.
        </p>
      </div>
      <Button
        className="rounded-xl px-6 font-semibold shrink-0"
        onClick={() => setSessionActive(true)}
      >
        <PlayCircle size={18} className="mr-2" />
        Commencer la révision
      </Button>
    </div>
  )
}
