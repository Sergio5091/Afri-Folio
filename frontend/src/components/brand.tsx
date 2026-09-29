import { Link } from "wouter";

/** Symbole AfriFolio : une arche (la porte d'entrée de votre activité) sur fond terre cuite */
export function LogoMark({ className = "h-8 w-8" }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" className={className} aria-hidden>
      <rect width="32" height="32" rx="9" fill="hsl(var(--primary))" />
      <path d="M9 25V15a7 7 0 0 1 14 0v10" fill="none" stroke="#fff" strokeWidth="3.2" strokeLinecap="round" />
      <circle cx="16" cy="15.5" r="2.4" fill="#FFD27A" />
    </svg>
  );
}

export function Logo({ href = "/", className = "", light = false }: { href?: string; className?: string; light?: boolean }) {
  return (
    <Link href={href} className={`inline-flex items-center gap-2 ${className}`}>
      <LogoMark />
      <span className={`font-display text-xl font-bold tracking-tight ${light ? "text-white" : "text-foreground"}`}>
        Afri<span className="text-primary">Folio</span>
      </span>
    </Link>
  );
}
