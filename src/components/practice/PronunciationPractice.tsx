"use client"

import { useState, useCallback } from "react"
import { Mic, MicOff, Volume2, ChevronRight, RotateCcw, CheckCircle2, XCircle } from "lucide-react"
import { Button } from "@/components/ui/Button"
import { Card, CardContent } from "@/components/ui/Card"
import { Badge } from "@/components/ui/Badge"

interface Word {
  id: string
  fr_term: string
  en_term: string
  phonetic: string | null
  en_definition: string
}

interface Props {
  words: Word[]
}

function shuffle<T>(arr: T[]): T[] {
  return [...arr].sort(() => Math.random() - 0.5)
}

export function PronunciationPractice({ words }: Props) {
  const [queue] = useState(() => shuffle(words).slice(0, 15))
  const [index, setIndex] = useState(0)
  const [listening, setListening] = useState(false)
  const [result, setResult] = useState<"correct" | "wrong" | null>(null)
  const [transcript, setTranscript] = useState("")
  const [score, setScore] = useState(0)
  const [done, setDone] = useState(false)
  const [supported] = useState(() => typeof window !== "undefined" && "SpeechRecognition" in window || "webkitSpeechRecognition" in window)

  const current = queue[index]

  const speak = useCallback((text: string) => {
    const utt = new SpeechSynthesisUtterance(text)
    utt.lang = "en-US"
    utt.rate = 0.85
    speechSynthesis.cancel()
    speechSynthesis.speak(utt)
  }, [])

  const startListening = useCallback(() => {
    if (!supported) return
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
    const recognition = new SR()
    recognition.lang = "en-US"
    recognition.interimResults = false
    recognition.maxAlternatives = 3

    setListening(true)
    setResult(null)
    setTranscript("")

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    recognition.onresult = (event: any) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const heard = Array.from(event.results[0]).map((r: any) => r.transcript.toLowerCase().trim() as string)
      const target = current.en_term.toLowerCase().trim()
      const isCorrect = heard.some(h =>
        h === target ||
        h.includes(target) ||
        target.includes(h) ||
        levenshtein(h, target) <= 2
      )
      setTranscript(heard[0] ?? "")
      setResult(isCorrect ? "correct" : "wrong")
      if (isCorrect) setScore(s => s + 1)
    }

    recognition.onerror = () => setListening(false)
    recognition.onend = () => setListening(false)
    recognition.start()
  }, [current, supported])

  const next = () => {
    if (index + 1 >= queue.length) { setDone(true); return }
    setIndex(i => i + 1)
    setResult(null)
    setTranscript("")
  }

  if (words.length === 0) {
    return (
      <div className="p-6 lg:p-10 max-w-2xl mx-auto text-center py-20">
        <Mic size={48} className="mx-auto mb-4 text-text-faint" />
        <p className="text-text-muted">Aucun mot avec phonétique disponible pour l&apos;instant.</p>
      </div>
    )
  }

  if (done) {
    const pct = Math.round((score / queue.length) * 100)
    return (
      <div className="p-6 lg:p-10 max-w-2xl mx-auto">
        <Card>
          <CardContent className="p-10 text-center">
            <CheckCircle2 size={52} className="mx-auto mb-4 text-success" />
            <h2 className="text-2xl font-display font-bold mb-2">Séance terminée !</h2>
            <p className="text-text-muted mb-4">{score} / {queue.length} correct</p>
            <div className="text-5xl font-bold mb-6" style={{ color: pct >= 70 ? "var(--color-success)" : "var(--color-error)" }}>
              {pct}%
            </div>
            <Button onClick={() => window.location.reload()} className="rounded-xl">
              <RotateCcw size={16} className="mr-2" /> Recommencer
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="p-6 lg:p-10 max-w-2xl mx-auto">
      <header className="mb-8">
        <h1 className="text-2xl font-display font-bold text-text flex items-center gap-3">
          <Mic className="text-primary" size={26} /> Prononciation
        </h1>
        <p className="text-text-muted mt-1">Répétez le terme en anglais à voix haute.</p>
      </header>

      <div className="flex items-center justify-between mb-4 text-sm text-text-muted">
        <span>{index + 1} / {queue.length}</span>
        <span className="font-semibold text-success">{score} correct</span>
      </div>

      <Card className="mb-6">
        <CardContent className="p-8 text-center">
          <p className="text-xs text-text-muted uppercase tracking-wider mb-2">Terme français</p>
          <p className="text-2xl font-display font-bold text-text mb-6">{current.fr_term}</p>

          <div className="bg-surface-offset rounded-2xl p-6 mb-4">
            <div className="flex items-center justify-center gap-3 mb-2">
              <h2 className="text-3xl font-display font-bold text-primary">{current.en_term}</h2>
              <Button variant="ghost" size="icon" onClick={() => speak(current.en_term)} className="rounded-full h-9 w-9 text-primary">
                <Volume2 size={20} />
              </Button>
            </div>
            {current.phonetic && (
              <p className="font-mono text-sm text-text-faint">{current.phonetic}</p>
            )}
          </div>

          <p className="text-sm text-text-muted mb-8">{current.en_definition.substring(0, 80)}...</p>

          {result === null ? (
            <Button
              onClick={supported ? startListening : undefined}
              disabled={listening || !supported}
              className={`rounded-full px-8 py-3 text-base ${listening ? "animate-pulse" : ""}`}
            >
              {listening ? <><MicOff size={18} className="mr-2" /> Écoute...</> : <><Mic size={18} className="mr-2" /> Parler</>}
            </Button>
          ) : (
            <div className="space-y-3">
              {result === "correct" ? (
                <div className="flex items-center justify-center gap-2 text-success font-bold">
                  <CheckCircle2 size={22} /> Parfait !
                </div>
              ) : (
                <div className="flex flex-col items-center gap-1 text-error">
                  <div className="flex items-center gap-2 font-bold"><XCircle size={22} /> Essayez encore</div>
                  {transcript && <p className="text-sm text-text-muted">Vous avez dit: &ldquo;{transcript}&rdquo;</p>}
                </div>
              )}
              <Button onClick={next} className="rounded-xl">
                Suivant <ChevronRight size={16} className="ml-1" />
              </Button>
            </div>
          )}

          {!supported && (
            <Badge variant="secondary" className="mt-4">Microphone non supporté dans ce navigateur</Badge>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

function levenshtein(a: string, b: string): number {
  const m = a.length, n = b.length
  const dp: number[][] = Array.from({ length: m + 1 }, (_, i) => [i, ...Array(n).fill(0)])
  for (let j = 0; j <= n; j++) dp[0][j] = j
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      dp[i][j] = a[i - 1] === b[j - 1]
        ? dp[i - 1][j - 1]
        : 1 + Math.min(dp[i - 1][j], dp[i][j - 1], dp[i - 1][j - 1])
    }
  }
  return dp[m][n]
}
