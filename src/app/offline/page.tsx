export const metadata = {
  title: "Hors ligne — Nabed",
}

export default function OfflinePage() {
  return (
    <div className="min-h-screen bg-bg flex flex-col items-center justify-center text-center px-6">
      <div className="w-16 h-16 rounded-2xl bg-primary text-white flex items-center justify-center font-display font-bold text-2xl shadow-sm mb-6">
        ✚
      </div>
      <h1 className="text-2xl font-display font-bold text-text mb-2">Vous êtes hors ligne</h1>
      <p className="text-text-muted max-w-sm mb-1">You&apos;re offline. Check your connection and try again.</p>
      <p className="text-text-muted max-w-sm">Vérifiez votre connexion internet et réessayez.</p>
    </div>
  )
}
