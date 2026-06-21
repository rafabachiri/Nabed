import { notFound, redirect } from "next/navigation"
import { createClient } from "@/utils/supabase/server"
import Link from "next/link"
import { ArrowLeft, BookOpen, Stethoscope } from "lucide-react"
import { Button } from "@/components/ui/Button"
import { Badge } from "@/components/ui/Badge"
import { Card, CardContent } from "@/components/ui/Card"

interface Props { params: { caseId: string } }

export default async function CaseDetailPage({ params }: Props) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/auth/login")

  const { data: clinicalCase } = await supabase
    .from("clinical_cases")
    .select("*")
    .eq("id", params.caseId)
    .eq("is_published", true)
    .single()

  if (!clinicalCase) notFound()

  const DIFF_COLORS: Record<string, string> = {
    easy: "bg-success/10 text-success border-transparent",
    medium: "bg-gold/10 text-gold border-transparent",
    hard: "bg-error/10 text-error border-transparent",
  }

  return (
    <div className="p-4 lg:p-8 max-w-4xl mx-auto">
      <Button asChild variant="ghost" size="sm" className="mb-6">
        <Link href="/cases"><ArrowLeft size={16} className="mr-1" />Retour aux cas</Link>
      </Button>

      <div className="flex flex-wrap items-center gap-2 mb-4">
        <Badge className={DIFF_COLORS[clinicalCase.difficulty] ?? ""}>{clinicalCase.difficulty}</Badge>
        {clinicalCase.body_system && <Badge variant="secondary">{clinicalCase.body_system}</Badge>}
      </div>

      <h1 className="text-3xl font-display font-bold text-text mb-1">{clinicalCase.title_fr}</h1>
      <p className="text-text-muted mb-8 italic">{clinicalCase.title_en}</p>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* French version */}
        <Card className="border-l-4 border-l-primary">
          <CardContent className="p-6">
            <h2 className="text-sm font-bold text-primary uppercase tracking-wider mb-4 flex items-center gap-2">
              <Stethoscope size={16} /> Version Française
            </h2>
            <div className="prose prose-sm max-w-none text-text leading-relaxed whitespace-pre-wrap">
              {clinicalCase.content_fr ?? "Contenu en cours de rédaction..."}
            </div>
          </CardContent>
        </Card>

        {/* English version */}
        <Card className="border-l-4 border-l-success">
          <CardContent className="p-6">
            <h2 className="text-sm font-bold text-success uppercase tracking-wider mb-4 flex items-center gap-2">
              <BookOpen size={16} /> English Version
            </h2>
            <div className="prose prose-sm max-w-none text-text leading-relaxed whitespace-pre-wrap">
              {clinicalCase.content_en ?? "Content being written..."}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Vocabulary in this case */}
      {clinicalCase.vocabulary && Array.isArray(clinicalCase.vocabulary) && clinicalCase.vocabulary.length > 0 && (
        <section className="mt-8">
          <h2 className="text-lg font-display font-bold mb-4 flex items-center gap-2">
            <BookOpen size={18} className="text-primary" /> Vocabulaire clé
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {(clinicalCase.vocabulary as { fr: string; en: string; def?: string }[]).map((v, i) => (
              <div key={i} className="bg-surface-offset rounded-xl p-4 border border-border">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-semibold text-text text-sm">{v.fr}</span>
                  <span className="text-text-faint">→</span>
                  <span className="font-bold text-primary text-sm">{v.en}</span>
                </div>
                {v.def && <p className="text-xs text-text-muted">{v.def}</p>}
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  )
}
