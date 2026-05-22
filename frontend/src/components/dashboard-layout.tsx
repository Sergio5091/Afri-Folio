import { ReactNode } from "react";
import { Link, useLocation } from "wouter";
import {
  LayoutDashboard, UserCircle, Users, BarChart3,
  CreditCard, LogOut, Briefcase, ChevronRight, Sparkles,
} from "lucide-react";
import { useAuth } from "@/contexts/auth";

interface DashboardLayoutProps {
  children: ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const [location] = useLocation();
  const { logout, user } = useAuth();

  const navigation = [
    { name: "Accueil",    short: "Accueil",  href: "/dashboard",             icon: LayoutDashboard },
    { name: "Profil",     short: "Profil",   href: "/dashboard/profil",      icon: UserCircle },
    { name: "Projets",    short: "Projets",  href: "/dashboard/projets",     icon: Briefcase },
    { name: "Parrainage", short: "Parrain",  href: "/dashboard/parrainage",  icon: Users },
    { name: "Abonnement", short: "Abo",      href: "/dashboard/abonnement",  icon: CreditCard },
  ];

  // Sidebar desktop : inclut Stats en plus
  const sidebarNav = [
    ...navigation.slice(0, 4),
    { name: "Analytiques", short: "Stats", href: "/dashboard/analytiques", icon: BarChart3 },
    navigation[4],
  ];

  return (
    <div className="min-h-screen bg-muted/20 flex flex-col md:flex-row">

      {/* ── Desktop Sidebar ── */}
      <aside className="hidden md:flex w-64 flex-col border-r bg-background sticky top-0 h-screen">
        {/* Logo */}
        <div className="px-5 py-6 border-b">
          <Link href="/" className="font-display font-bold text-2xl text-primary block">
            AfriFolio
          </Link>
          {user?.plan === "premium" && (
            <span className="inline-flex items-center gap-1 mt-2 text-[10px] font-bold uppercase tracking-wider text-amber-500 bg-amber-500/10 px-2 py-0.5 rounded-full">
              <Sparkles className="w-3 h-3" /> Premium
            </span>
          )}
        </div>

        {/* Nav links */}
        <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
          {sidebarNav.map((item) => {
            const isActive = location === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all text-sm font-medium group ${
                  isActive
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                }`}
              >
                <item.icon className={`w-4.5 h-4.5 shrink-0 ${isActive ? "text-primary" : ""}`} />
                <span className="flex-1">{item.name}</span>
                {isActive && <ChevronRight className="w-3.5 h-3.5 opacity-50" />}
              </Link>
            );
          })}
        </nav>

        {/* Logout */}
        <div className="p-3 border-t">
          <button
            onClick={logout}
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all text-sm font-medium text-muted-foreground hover:bg-destructive/10 hover:text-destructive w-full"
          >
            <LogOut className="w-4.5 h-4.5 shrink-0" />
            Déconnexion
          </button>
        </div>
      </aside>

      {/* ── Mobile Top Header ── */}
      <header className="md:hidden flex items-center justify-between px-5 py-3 border-b bg-background sticky top-0 z-20">
        <Link href="/" className="font-display font-bold text-xl text-primary">
          AfriFolio
        </Link>
        {user?.plan === "premium" && (
          <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-amber-500 bg-amber-500/10 px-2 py-0.5 rounded-full">
            <Sparkles className="w-3 h-3" /> Pro
          </span>
        )}
      </header>

      {/* ── Main Content ── */}
      <main className="flex-1 p-4 md:p-8 w-full max-w-6xl mx-auto pb-28 md:pb-8">
        {children}
      </main>

      {/* ── Mobile Bottom Navigation ── */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-30">
        <div className="bg-background/95 backdrop-blur-xl border-t relative">
          <div className="flex items-stretch h-16">

            {/* 2 items gauche */}
            {navigation.slice(0, 2).map((item) => {
              const isActive = location === item.href;
              return (
                <Link key={item.href} href={item.href} className="flex-1 flex flex-col items-center justify-center gap-0.5 relative">
                  {isActive && <span className="absolute top-0 left-1/2 -translate-x-1/2 w-6 h-0.5 rounded-full bg-primary" />}
                  <span className={`flex items-center justify-center w-8 h-6 rounded-lg transition-all ${isActive ? "bg-primary/10" : ""}`}>
                    <item.icon className={`w-[18px] h-[18px] transition-colors ${isActive ? "text-primary" : "text-muted-foreground"}`} />
                  </span>
                  <span className={`text-[9px] font-medium leading-none mt-0.5 ${isActive ? "text-primary" : "text-muted-foreground"}`}>
                    {item.short}
                  </span>
                </Link>
              );
            })}

            {/* Espace central */}
            <div className="w-20 shrink-0" />

            {/* 2 items droite */}
            {navigation.slice(3, 5).map((item) => {
              const isActive = location === item.href;
              return (
                <Link key={item.href} href={item.href} className="flex-1 flex flex-col items-center justify-center gap-0.5 relative">
                  {isActive && <span className="absolute top-0 left-1/2 -translate-x-1/2 w-6 h-0.5 rounded-full bg-primary" />}
                  <span className={`flex items-center justify-center w-8 h-6 rounded-lg transition-all ${isActive ? "bg-primary/10" : ""}`}>
                    <item.icon className={`w-[18px] h-[18px] transition-colors ${isActive ? "text-primary" : "text-muted-foreground"}`} />
                  </span>
                  <span className={`text-[9px] font-medium leading-none mt-0.5 ${isActive ? "text-primary" : "text-muted-foreground"}`}>
                    {item.short}
                  </span>
                </Link>
              );
            })}
          </div>
          <div className="h-safe-area-inset-bottom bg-background" />
        </div>

        {/* Bouton central surélevé — Projets */}
        {(() => {
          const centerItem = navigation[2];
          const isActive = location === centerItem.href;
          return (
            <Link
              href={centerItem.href}
              className="absolute left-1/2 -translate-x-1/2 -top-6 flex flex-col items-center gap-1"
            >
              {/* Fond blanc pour l'effet découpe */}
              <span className="absolute -top-2 w-20 h-20 rounded-full bg-background" />
              {/* Bouton */}
              <span
                className={`relative w-14 h-14 rounded-2xl flex items-center justify-center transition-all active:scale-90 bg-primary`}
                style={{ boxShadow: "0 6px 24px -4px rgba(79,70,229,0.6)" }}
              >
                <centerItem.icon className="w-6 h-6 text-white" />
              </span>
              <span className={`relative text-[9px] font-semibold leading-none ${isActive ? "text-primary" : "text-muted-foreground"}`}>
                {centerItem.short}
              </span>
            </Link>
          );
        })()}
      </nav>

    </div>
  );
}
