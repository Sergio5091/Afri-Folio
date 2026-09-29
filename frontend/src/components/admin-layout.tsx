import type { ReactNode } from "react";
import { Link, useLocation } from "wouter";
import { Briefcase, CreditCard, ExternalLink, LayoutDashboard, LogOut, Shield, Users, Wallet } from "lucide-react";
import { useGetAdminStats } from "@workspace/api-client-react";
import { useAuth } from "@/contexts/auth";
import { LogoMark } from "./brand";

export function AdminLayout({ children }: { children: ReactNode }) {
  const [location] = useLocation();
  const { logout, user } = useAuth();
  const { data: stats } = useGetAdminStats(30, { query: { staleTime: 60_000 } });

  const navigation = [
    { name: "Vue d'ensemble", short: "Accueil", href: "/admin", icon: LayoutDashboard },
    { name: "Utilisateurs", short: "Users", href: "/admin/utilisateurs", icon: Users },
    { name: "Paiements", short: "Paiements", href: "/admin/paiements", icon: CreditCard },
    { name: "Retraits", short: "Retraits", href: "/admin/retraits", icon: Wallet, badge: stats?.pendingWithdrawals },
    { name: "Métiers", short: "Métiers", href: "/admin/metiers", icon: Briefcase },
  ];
  const isActive = (href: string) => (href === "/admin" ? location === href : location.startsWith(href));

  return (
    <div className="min-h-screen bg-[hsl(220_14%_97%)] md:flex">
      <aside className="sticky top-0 hidden h-screen w-60 shrink-0 flex-col bg-[#14110f] text-white md:flex">
        <div className="flex items-center gap-2.5 px-5 py-5">
          <LogoMark className="h-8 w-8" />
          <div>
            <p className="font-display text-base font-bold leading-none">AfriFolio</p>
            <p className="mt-1 flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wider text-white/50"><Shield className="h-3 w-3" /> Administration</p>
          </div>
        </div>
        <nav className="flex-1 space-y-0.5 px-3 py-2">
          {navigation.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${isActive(item.href) ? "bg-white/10 text-white" : "text-white/60 hover:bg-white/5 hover:text-white"}`}
            >
              <item.icon className="h-4 w-4" />
              {item.name}
              {!!item.badge && <span className="ml-auto rounded-full bg-primary px-1.5 py-0.5 text-[11px] font-bold leading-none">{item.badge}</span>}
            </Link>
          ))}
        </nav>
        <div className="space-y-1 border-t border-white/10 p-3">
          <p className="truncate px-3 pb-1 text-xs text-white/40">{user?.email}</p>
          <Link href="/dashboard" className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-white/60 hover:bg-white/5 hover:text-white">
            <ExternalLink className="h-4 w-4" /> Mon espace
          </Link>
          <button onClick={logout} className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm text-white/60 hover:bg-white/5 hover:text-white">
            <LogOut className="h-4 w-4" /> Déconnexion
          </button>
        </div>
      </aside>

      <header className="sticky top-0 z-30 flex h-14 items-center justify-between bg-[#14110f] px-4 text-white md:hidden">
        <span className="flex items-center gap-2 font-bold"><LogoMark className="h-7 w-7" /> Admin</span>
        <button onClick={logout} className="rounded-lg p-2 text-white/70" aria-label="Déconnexion"><LogOut className="h-4 w-4" /></button>
      </header>

      <main className="min-w-0 flex-1 px-4 pb-24 pt-6 sm:px-6 md:pb-10 lg:px-10 lg:pt-10">
        <div className="mx-auto max-w-7xl">{children}</div>
      </main>

      <nav className="fixed inset-x-0 bottom-0 z-40 grid h-16 grid-cols-5 border-t bg-card md:hidden">
        {navigation.map((item) => (
          <Link key={item.href} href={item.href} className={`relative flex flex-col items-center justify-center gap-1 text-[10px] font-medium ${isActive(item.href) ? "text-primary" : "text-muted-foreground"}`}>
            <item.icon className="h-5 w-5" />
            {item.short}
            {!!item.badge && <span className="absolute right-[25%] top-2 h-2 w-2 rounded-full bg-primary" />}
          </Link>
        ))}
      </nav>
    </div>
  );
}
