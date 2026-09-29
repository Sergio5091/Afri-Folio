import { useState, type ReactNode } from "react";
import { Link, useLocation } from "wouter";
import {
  LayoutDashboard, LayoutTemplate, UserRound, Palette, MessageSquareText, BarChart3, CreditCard, Gift, Settings,
  LogOut, ExternalLink, MoreHorizontal, Sparkles, X, Shield,
} from "lucide-react";
import { useGetDashboardSummary, useGetProfile } from "@workspace/api-client-react";
import { useAuth } from "@/contexts/auth";
import { Logo } from "./brand";

interface NavItem {
  name: string;
  short: string;
  href: string;
  icon: typeof LayoutDashboard;
  badge?: number;
}

function useNav() {
  const { data: summary } = useGetDashboardSummary({ query: { staleTime: 60_000 } });
  const unread = summary?.unreadLeads ?? 0;
  const groups: { title: string; items: NavItem[] }[] = [
    {
      title: "Ma page",
      items: [
        { name: "Accueil", short: "Accueil", href: "/dashboard", icon: LayoutDashboard },
        { name: "Contenu de ma page", short: "Ma page", href: "/dashboard/ma-page", icon: LayoutTemplate },
        { name: "Infos & contact", short: "Infos", href: "/dashboard/profil", icon: UserRound },
        { name: "Apparence", short: "Style", href: "/dashboard/apparence", icon: Palette },
      ],
    },
    {
      title: "Mes clients",
      items: [
        { name: "Messages", short: "Messages", href: "/dashboard/messages", icon: MessageSquareText, badge: unread },
        { name: "Statistiques", short: "Stats", href: "/dashboard/statistiques", icon: BarChart3 },
      ],
    },
    {
      title: "Compte",
      items: [
        { name: "Abonnement", short: "Pro", href: "/dashboard/abonnement", icon: CreditCard },
        { name: "Parrainage", short: "Parrainage", href: "/dashboard/parrainage", icon: Gift },
        { name: "Paramètres", short: "Paramètres", href: "/dashboard/compte", icon: Settings },
      ],
    },
  ];
  return { groups, flat: groups.flatMap((g) => g.items), unread };
}

function Badge({ n }: { n?: number }) {
  if (!n) return null;
  return <span className="ml-auto min-w-5 rounded-full bg-primary px-1.5 py-0.5 text-center text-[11px] font-bold leading-none text-primary-foreground">{n > 99 ? "99+" : n}</span>;
}

export function DashboardLayout({ children }: { children: ReactNode }) {
  const [location] = useLocation();
  const { logout, user } = useAuth();
  const { data: profile } = useGetProfile({ query: { staleTime: 60_000 } });
  const { groups, flat, unread } = useNav();
  const [moreOpen, setMoreOpen] = useState(false);

  const isActive = (href: string) => (href === "/dashboard" ? location === href : location.startsWith(href));
  const publicHref = user ? `/${user.username}` : "/";
  const bottom = [flat[0], flat[1], flat[4], flat[5]];

  return (
    <div className="min-h-screen bg-[hsl(40_30%_97%)] md:flex">
      {/* ── Barre latérale ── */}
      <aside className="sticky top-0 hidden h-screen w-64 shrink-0 flex-col border-r bg-card md:flex">
        <div className="px-5 pb-4 pt-5">
          <Logo href="/dashboard" />
        </div>

        <div className="mx-3 mb-2 flex items-center gap-3 rounded-xl border bg-background p-2.5">
          {profile?.photoUrl ? (
            <img src={profile.photoUrl} alt="" className="h-9 w-9 rounded-full object-cover" />
          ) : (
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/15 text-sm font-bold text-primary">
              {(profile?.fullName ?? user?.username ?? "?").charAt(0).toUpperCase()}
            </span>
          )}
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold">{profile?.fullName || user?.username}</p>
            <p className="truncate text-xs text-muted-foreground">
              {user?.plan === "premium" ? (
                <span className="inline-flex items-center gap-1 font-semibold text-amber-600"><Sparkles className="h-3 w-3" /> Pro</span>
              ) : (
                "Gratuit"
              )}
            </p>
          </div>
        </div>

        <nav className="flex-1 space-y-5 overflow-y-auto px-3 py-3">
          {groups.map((g) => (
            <div key={g.title}>
              <p className="mb-1.5 px-3 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/80">{g.title}</p>
              <div className="space-y-0.5">
                {g.items.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                      isActive(item.href) ? "bg-primary/10 text-primary" : "text-muted-foreground hover:bg-muted hover:text-foreground"
                    }`}
                  >
                    <item.icon className="h-[18px] w-[18px] shrink-0" />
                    {item.name}
                    <Badge n={item.badge} />
                  </Link>
                ))}
              </div>
            </div>
          ))}
          {user?.isAdmin && (
            <Link href="/admin" className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground">
              <Shield className="h-[18px] w-[18px]" /> Administration
            </Link>
          )}
        </nav>

        <div className="space-y-1 border-t p-3">
          <a href={publicHref} target="_blank" rel="noreferrer" className="flex items-center justify-center gap-2 rounded-lg bg-foreground px-3 py-2.5 text-sm font-semibold text-background hover:opacity-90">
            Voir ma page <ExternalLink className="h-3.5 w-3.5" />
          </a>
          <button onClick={logout} className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground hover:bg-destructive/10 hover:text-destructive">
            <LogOut className="h-[18px] w-[18px]" /> Déconnexion
          </button>
        </div>
      </aside>

      {/* ── En-tête mobile ── */}
      <header className="sticky top-0 z-30 flex h-14 items-center justify-between border-b bg-card/95 px-4 backdrop-blur md:hidden">
        <Logo href="/dashboard" />
        <a href={publicHref} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm font-semibold">
          Ma page <ExternalLink className="h-3.5 w-3.5" />
        </a>
      </header>

      <main className="min-w-0 flex-1 px-4 pb-28 pt-6 sm:px-6 md:pb-10 lg:px-10 lg:pt-10">
        <div className="mx-auto max-w-6xl">{children}</div>
      </main>

      {/* ── Navigation mobile ── */}
      <nav className="fixed inset-x-0 bottom-0 z-40 border-t bg-card/95 pb-[env(safe-area-inset-bottom)] backdrop-blur md:hidden">
        <div className="grid h-16 grid-cols-5">
          {bottom.map((item) => (
            <Link key={item.href} href={item.href} className={`relative flex flex-col items-center justify-center gap-1 text-[11px] font-medium ${isActive(item.href) ? "text-primary" : "text-muted-foreground"}`}>
              <item.icon className="h-5 w-5" />
              {item.short}
              {item.href === "/dashboard/messages" && unread > 0 && <span className="absolute right-[22%] top-2 h-2 w-2 rounded-full bg-primary" />}
            </Link>
          ))}
          <button onClick={() => setMoreOpen(true)} className="flex flex-col items-center justify-center gap-1 text-[11px] font-medium text-muted-foreground">
            <MoreHorizontal className="h-5 w-5" /> Plus
          </button>
        </div>
      </nav>

      {moreOpen && (
        <div className="fixed inset-0 z-50 flex items-end bg-black/40 md:hidden" onClick={() => setMoreOpen(false)}>
          <div className="w-full rounded-t-3xl bg-card p-4 pb-[calc(1rem+env(safe-area-inset-bottom))]" onClick={(e) => e.stopPropagation()}>
            <div className="mb-2 flex items-center justify-between px-2">
              <p className="font-semibold">Menu</p>
              <button onClick={() => setMoreOpen(false)} className="rounded-lg p-2 hover:bg-muted" aria-label="Fermer">
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="grid grid-cols-3 gap-2">
              {flat.filter((i) => !bottom.includes(i)).map((item) => (
                <Link key={item.href} href={item.href} onClick={() => setMoreOpen(false)} className={`flex flex-col items-center gap-2 rounded-2xl border p-4 text-center text-xs font-medium ${isActive(item.href) ? "border-primary text-primary" : ""}`}>
                  <item.icon className="h-5 w-5" />
                  {item.name}
                </Link>
              ))}
              {user?.isAdmin && (
                <Link href="/admin" className="flex flex-col items-center gap-2 rounded-2xl border p-4 text-center text-xs font-medium">
                  <Shield className="h-5 w-5" /> Admin
                </Link>
              )}
              <button onClick={logout} className="flex flex-col items-center gap-2 rounded-2xl border p-4 text-center text-xs font-medium text-destructive">
                <LogOut className="h-5 w-5" /> Déconnexion
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
