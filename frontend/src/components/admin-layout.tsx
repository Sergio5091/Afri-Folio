import { ReactNode } from "react";
import { Link, useLocation } from "wouter";
import { LayoutDashboard, Users, Wallet, LogOut, Shield, BarChart3, ChevronRight } from "lucide-react";
import { useAuth } from "@/contexts/auth";

interface AdminLayoutProps {
  children: ReactNode;
}

export function AdminLayout({ children }: AdminLayoutProps) {
  const [location] = useLocation();
  const { logout, user } = useAuth();

  const navigation = [
    { name: "Vue d'ensemble", href: "/admin",            icon: LayoutDashboard },
    { name: "Utilisateurs",   href: "/admin/utilisateurs", icon: Users },
    { name: "Retraits",       href: "/admin/retraits",    icon: Wallet },
    { name: "Statistiques",   href: "/admin/stats",       icon: BarChart3 },
  ];

  return (
    <div className="min-h-screen bg-muted/20 flex">

      {/* Sidebar */}
      <aside className="w-64 flex-col border-r bg-background sticky top-0 h-screen hidden md:flex">
        {/* Logo admin */}
        <div className="px-5 py-5 border-b">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center">
              <Shield className="w-4 h-4 text-primary" />
            </div>
            <div>
              <p className="font-display font-bold text-base text-primary leading-none">AfriFolio</p>
              <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider">Admin Panel</p>
            </div>
          </div>
          {user && (
            <p className="text-xs text-muted-foreground mt-3 truncate">{user.email}</p>
          )}
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 space-y-0.5">
          {navigation.map((item) => {
            const isActive = location === item.href;
            return (
              <Link key={item.href} href={item.href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all text-sm font-medium ${
                  isActive ? "bg-primary/10 text-primary" : "text-muted-foreground hover:bg-muted hover:text-foreground"
                }`}
              >
                <item.icon className="w-4 h-4 shrink-0" />
                <span className="flex-1">{item.name}</span>
                {isActive && <ChevronRight className="w-3.5 h-3.5 opacity-50" />}
              </Link>
            );
          })}
        </nav>

        {/* Logout */}
        <div className="p-3 border-t space-y-1">
          <Link href="/dashboard"
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-muted-foreground hover:bg-muted transition-all">
            <LayoutDashboard className="w-4 h-4" /> Mon dashboard
          </Link>
          <button onClick={logout}
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-muted-foreground hover:bg-destructive/10 hover:text-destructive w-full transition-all">
            <LogOut className="w-4 h-4" /> Déconnexion
          </button>
        </div>
      </aside>

      {/* Mobile header */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-20 bg-background border-b px-4 h-14 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Shield className="w-5 h-5 text-primary" />
          <span className="font-display font-bold text-primary">Admin</span>
        </div>
        <div className="flex gap-1">
          {navigation.map((item) => (
            <Link key={item.href} href={item.href}
              className={`p-2 rounded-lg transition-colors ${location === item.href ? "bg-primary/10 text-primary" : "text-muted-foreground"}`}>
              <item.icon className="w-4 h-4" />
            </Link>
          ))}
        </div>
      </div>

      {/* Main */}
      <main className="flex-1 p-4 md:p-8 w-full max-w-7xl mt-14 md:mt-0">
        {children}
      </main>
    </div>
  );
}
