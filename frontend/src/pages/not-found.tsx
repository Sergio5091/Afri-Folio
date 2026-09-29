import { Link } from "wouter";
import { Compass } from "lucide-react";

export default function NotFound() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-6">
      <div className="max-w-md text-center">
        <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 text-primary">
          <Compass className="h-8 w-8" />
        </span>
        <h1 className="mt-6 text-3xl font-bold">Page introuvable</h1>
        <p className="mt-3 text-muted-foreground">Le lien est peut-être incorrect, ou la page a été déplacée.</p>
        <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
          <Link href="/" className="rounded-full bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground">Retour à l'accueil</Link>
          <Link href="/annuaire" className="rounded-full border px-6 py-3 text-sm font-semibold hover:bg-muted">Chercher un professionnel</Link>
        </div>
      </div>
    </div>
  );
}
