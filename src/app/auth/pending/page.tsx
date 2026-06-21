import Link from "next/link"
import { Button } from "@/components/ui/Button"

export default function PendingPage() {
  return (
    <div className="w-full max-w-md text-center">
      <div className="bg-surface border border-border rounded-2xl shadow-md p-10">
        <div className="w-20 h-20 bg-gold-highlight rounded-full flex items-center justify-center mx-auto mb-6">
          <span className="text-5xl">⏳</span>
        </div>
        <h1 className="text-2xl font-display font-bold text-text mb-3">
          Compte en attente de validation
        </h1>
        <p className="text-text-muted leading-relaxed mb-8">
          Votre demande d&apos;accès enseignant est en cours d&apos;examen.
          Vous recevrez un email de confirmation une fois votre compte activé par l&apos;administrateur.
        </p>

        <div className="bg-surface-offset rounded-xl p-5 text-sm space-y-3 text-left mb-8">
          <div className="flex items-start gap-3">
            <div className="w-6 h-6 rounded-full bg-gold/20 text-gold flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">1</div>
            <p className="text-text-muted">L&apos;administrateur reçoit une notification de votre inscription.</p>
          </div>
          <div className="flex items-start gap-3">
            <div className="w-6 h-6 rounded-full bg-gold/20 text-gold flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">2</div>
            <p className="text-text-muted">Votre profil est examiné (délai : 24–48h ouvrées).</p>
          </div>
          <div className="flex items-start gap-3">
            <div className="w-6 h-6 rounded-full bg-gold/20 text-gold flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">3</div>
            <p className="text-text-muted">Vous recevez un email et accédez au tableau de bord enseignant.</p>
          </div>
        </div>

        <Button asChild variant="secondary" className="w-full rounded-xl">
          <Link href="/">Retour à l&apos;accueil</Link>
        </Button>
      </div>
    </div>
  )
}
