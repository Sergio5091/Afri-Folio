import { useEffect, useState } from "react";
import { Link, useLocation } from "wouter";
import { Menu, X } from "lucide-react";
import { useAuth } from "@/contexts/auth";
import { Logo } from "./brand";

const LINKS = [
  { href: "/exemples", label: "Exemples" },
  { href: "/annuaire", label: "Trouver un pro" },
  { href: "/#tarifs", label: "Tarifs" },
  { href: "/#faq", label: "Questions" },
];

export function SiteHeader() {
  const { isAuthenticated } = useAuth();
  const [location] = useLocation();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 12);
    fn();
    window.addEventListener("scroll", fn, { passive: true });
    return () => window.removeEventListener("scroll", fn);
  }, []);

  useEffect(() => setOpen(false), [location]);

  return (
    <header className={`fixed inset-x-0 top-0 z-50 transition-all ${scrolled || open ? "border-b bg-background/90 backdrop-blur-xl" : "bg-transparent"}`}>
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
        <Logo />
        <nav className="hidden items-center gap-8 text-sm font-medium text-muted-foreground md:flex">
          {LINKS.map((l) => (
            <a key={l.href} href={l.href} className={`transition-colors hover:text-foreground ${location === l.href ? "text-foreground" : ""}`}>
              {l.label}
            </a>
          ))}
        </nav>
        <div className="flex items-center gap-2">
          {isAuthenticated ? (
            <Link href="/dashboard" className="rounded-full bg-foreground px-5 py-2.5 text-sm font-semibold text-background hover:opacity-90">
              Mon espace
            </Link>
          ) : (
            <>
              <Link href="/connexion" className="hidden rounded-full px-4 py-2.5 text-sm font-medium text-muted-foreground hover:text-foreground sm:block">
                Connexion
              </Link>
              <Link href="/inscription" className="rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground shadow-lg shadow-primary/20 hover:bg-primary/90">
                Créer mon portfolio
              </Link>
            </>
          )}
          <button onClick={() => setOpen(!open)} className="rounded-lg p-2 md:hidden" aria-label="Menu">
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>
      {open && (
        <nav className="border-t bg-background px-4 py-3 md:hidden">
          {LINKS.map((l) => (
            <a key={l.href} href={l.href} onClick={() => setOpen(false)} className="block rounded-lg px-3 py-3 text-[15px] font-medium hover:bg-muted">
              {l.label}
            </a>
          ))}
          {!isAuthenticated && (
            <Link href="/connexion" className="block rounded-lg px-3 py-3 text-[15px] font-medium hover:bg-muted">
              Connexion
            </Link>
          )}
        </nav>
      )}
    </header>
  );
}

export function SiteFooter() {
  return (
    <footer className="border-t bg-card">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-14 sm:px-6 md:grid-cols-[1.5fr_1fr_1fr_1fr]">
        <div>
          <Logo />
          <p className="mt-4 max-w-xs text-sm text-muted-foreground">
            Le portfolio professionnel des talents d'Afrique. Créé en 5 minutes, partagé sur WhatsApp.
          </p>
        </div>
        <div>
          <p className="text-sm font-semibold">Produit</p>
          <ul className="mt-4 space-y-2.5 text-sm text-muted-foreground">
            <li><Link href="/exemples" className="hover:text-foreground">Exemples par métier</Link></li>
            <li><a href="/#tarifs" className="hover:text-foreground">Tarifs</a></li>
            <li><Link href="/inscription" className="hover:text-foreground">Créer mon portfolio</Link></li>
          </ul>
        </div>
        <div>
          <p className="text-sm font-semibold">Clients</p>
          <ul className="mt-4 space-y-2.5 text-sm text-muted-foreground">
            <li><Link href="/annuaire" className="hover:text-foreground">Trouver un professionnel</Link></li>
            <li><a href="/#faq" className="hover:text-foreground">Questions fréquentes</a></li>
          </ul>
        </div>
        <div>
          <p className="text-sm font-semibold">Compte</p>
          <ul className="mt-4 space-y-2.5 text-sm text-muted-foreground">
            <li><Link href="/connexion" className="hover:text-foreground">Connexion</Link></li>
            <li><Link href="/dashboard/parrainage" className="hover:text-foreground">Parrainage</Link></li>
          </ul>
        </div>
      </div>
      <div className="border-t">
        <p className="mx-auto max-w-7xl px-4 py-6 text-xs text-muted-foreground sm:px-6">
          © {new Date().getFullYear()} AfriFolio · Conçu pour les talents d'Afrique
        </p>
      </div>
    </footer>
  );
}
