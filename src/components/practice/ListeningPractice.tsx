"use client"

import { useState, useCallback } from "react"
import { Headphones, Volume2, CheckCircle2, XCircle, RotateCcw, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/Button"
import { Card, CardContent } from "@/components/ui/Card"

interface Word {
  id: string
  fr_term: string
  en_term: string
  phonetic: string | null
  en_definition: string
  body_system: string
}

interface Props {
  words: Word[]
}

function shuffle<T>(arr: T[]): T[] {
  return [...arr].sort(() => Math.random() - 0.5)
}

function buildQuestion(target: Word, pool: Word[]) {
  const distractors = shuffle(pool.filter(w => w.id !== target.id)).slice(0, 3)
  return { target, choices: shuffle([target, ...distractors]) }
}

export function ListeningPractice({ words }: Props) {
  const [questions] = useState(() => {
    const pool = shuffle(words).slice(0, 12)
    return pool.map(w => buildQuestion(w, words))
  })
  const [index, setIndex] = useState(0)
  const [selected, setSelected] = useState<string | null>(null)
  const [score, setScore] = useState(0)
  const [done, setDone] = useState(false)
  const [played, setPlayed] = useState(false)

  const q = questions[index]

  const speak = useCallback((text: string) => {
    const utt = new SpeechSynthesisUtterance(text)
    utt.lang = "en-US"
    utt.rate = 0.85
    speechSynthesis.cancel()
    speechSynthesis.speak(utt)
    setPlayed(true)
  }, [])

  const choose = (wordId: string) => {
    if (selected !== null || !played) return
    setSelected(wordId)
    if (wordId === q.target.id) setScore(s => s + 1)
    setTimeout(() => {
      if (index + 1 >= questions.length) { setDone(true); return }
      setIndex(i => i + 1)
      setSelected(null)
      setPlayed(false)
    }, 900)
  }

  if (words.length < 4) return (
    <div className="p-6 lg:p-10 max-w-2xl mx-auto text-center py-20 text-text-muted">
      Pas assez de mots pour ce mode.
    </div>
  )

  if (done) {
    const pct = Math.round((score / questions.length) * 100)
    return (
      <div className="p-6 lg:p-10 max-w-2xl mx-auto">
        <Card>
          <CardContent className="p-10 text-center">
            <CheckCircle2 size={52} className="mx-auto mb-4 text-success" />
            <h2 className="text-2xl font-display font-bold mb-2">Séance terminée !</h2>
            <p className="text-text-muted mb-4">{score} / {questions.length} correct</p>
            <div className="text-5xl font-bold mb-6" style={{ color: pct >= 70 ? "var(--color-success)" : "var(--color-error)" }}>{pct}%</div>
            <Button onClick={() => window.location.reload()} className="rounded-xl"><RotateCcw size={16} className="mr-2" /> Recommencer</Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="p-6 lg:p-10 max-w-2xl mx-auto">
      <header className="mb-8">
        <h1 className="text-2xl font-display font-bold text-text flex items-center gap-3">
          <Headphones className="text-orange" size={26} /> Écoute
        </h1>
        <p className="text-text-muted mt-1">Écoutez le terme et choisissez la bonne traduction.</p>
      </header>

      <div className="flex items-center justify-between mb-4 text-sm text-text-muted">
        <span>{index + 1} / {questions.length}</span>
        <span className="font-semibold text-success">{score} correct</span>
      </div>

      <Card className="mb-6">
        <CardContent className="p-8 text-center">
          <p className="text-sm text-text-muted mb-6">Écoutez le terme, puis choisissez sa traduction française.</p>

          <Button
            onClick={() => speak(q.target.en_term)}
            className="rounded-full px-10 py-4 text-lg mb-2 bg-orange hover:bg-orange/90"
          >
            <Volume2 size={24} className="mr-3" /> Écouter
          </Button>

          {q.target.phonetic && played && (
            <p className="font-mono text-xs text-text-faint mt-2 mb-4">{q.target.phonetic}</p>
          )}

          {!played && (
            <p className="text-xs text-text-faint mt-3">Cliquez sur Écouter pour révéler les choix.</p>
          )}

          {played && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-6">
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
                    <span>{choice.fr_term}</span>
                    {show && isCorrect && <CheckCircle2 size={18} className="shrink-0" />}
                    {show && isSelected && !isCorrect && <XCircle size={18} className="shrink-0" />}
                  </button>
                )
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {selected && (
        <div className="text-center">
          <Button onClick={() => { if (index + 1 >= questions.length) setDone(true); else { setIndex(i => i + 1); setSelected(null); setPlayed(false) } }} className="rounded-xl">
            Suivant <ChevronRight size={16} className="ml-1" />
          </Button>
        </div>
      )}
    </div>
  )
}
