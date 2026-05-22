import { useGetAdminStats, getGetAdminStatsQueryKey } from "@workspace/api-client-react";
import { AdminLayout } from "@/components/admin-layout";
import { Users, Crown, TrendingUp, Wallet, Eye, Loader2, Calendar } from "lucide-react";
import {
  AreaChart, Area, BarChart, Bar, LineChart, Line,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from "recharts";
import { useState } from "react";

const PERIODS = [
  { label: "7 jours",  days: 7 },
  { label: "30 jours", days: 30 },
  { label: "90 jours", days: 90 },
  { label: "6 mois",   days: 180 },
  { label: "1 an",     days: 365 },
];

/* ── Helpers ── */
function formatMonth(m: string) {
  const [year, month] = m.split("-");
  const names = ["Jan","Fév","Mar","Avr","Mai","Jun","Jul","Aoû","Sep","Oct","Nov","Déc"];
  return names[parseInt(month) - 1] + " " + year.slice(2);
}
function formatDate(d: string) {
  const date = new Date(d);
  return `${date.getDate()}/${date.getMonth() + 1}`;
}

/* ── Tooltip custom ── */
const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-card border rounded-xl px-4 py-3 shadow-xl text-sm">
      <p className="font-bold mb-1 text-muted-foreground">{label}</p>
      {payload.map((p: any, i: number) => (
        <p key={i} style={{ color: p.color }} className="font-semibold">
          {p.name} : {p.value.toLocaleString("fr-FR")}{p.name.includes("FCFA") ? " FCFA" : ""}
        </p>
      ))}
    </div>
  );
};

/* ── Mock data pour quand il n'y a pas encore de données ── */
function generateMockDays(days = 30) {
  return Array.from({ length: days }, (_, i) => {
    const d = new Date(); d.setDate(d.getDate() - (days - 1 - i));
    return { date: d.toISOString().split("T")[0], count: Math.floor(Math.random() * 5) };
  });
}
function generateMockMonths(months = 6) {
  const names = ["Jan","Fév","Mar","Avr","Mai","Jun","Jul","Aoû","Sep","Oct","Nov","Déc"];
  return Array.from({ length: months }, (_, i) => {
    const d = new Date(); d.setMonth(d.getMonth() - (months - 1 - i));
    return {
      month: names[d.getMonth()] + " " + String(d.getFullYear()).slice(2),
      total: Math.floor(Math.random() * 20) + 5,
      premium: Math.floor(Math.random() * 8),
      revenue: Math.floor(Math.random() * 5000) + 1000,
      subscriptions: Math.floor(Math.random() * 10),
    };
  });
}

export default function AdminStats() {
  const [days, setDays] = useState(30);
  const { data: stats, isLoading } = useGetAdminStats(days, {
    query: { queryKey: getGetAdminStatsQueryKey(days), retry: false },
  });

  if (isLoading) return (
    <AdminLayout>
      <div className="flex justify-center py-24"><Loader2 className="w-6 h-6 animate-spin text-muted-foreground" /></div>
    </AdminLayout>
  );

  const freeUsers = (stats?.totalUsers ?? 0) - (stats?.premiumUsers ?? 0);
  const conversionRate = stats?.totalUsers ? Math.round(((stats.premiumUsers) / stats.totalUsers) * 100) : 0;

  // Données graphiques — utilise les vraies ou le mock si vide
  const regDays = (stats?.registrationsByDay?.length ?? 0) > 0
    ? stats!.registrationsByDay.map(r => ({ ...r, date: formatDate(r.date) }))
    : generateMockDays(30);

  const viewDays = (stats?.viewsByDay?.length ?? 0) > 0
    ? stats!.viewsByDay.map(r => ({ ...r, date: formatDate(r.date) }))
    : generateMockDays(30).map(r => ({ ...r, count: r.count * 3 }));

  const monthlyUsers = (stats?.usersByMonth?.length ?? 0) > 0
    ? stats!.usersByMonth.map(r => ({ ...r, month: formatMonth(r.month) }))
    : generateMockMonths(6);

  const monthlyRevenue = (stats?.revenueByMonth?.length ?? 0) > 0
    ? stats!.revenueByMonth.map(r => ({ ...r, month: formatMonth(r.month) }))
    : generateMockMonths(6);

  const topPortfolios = (stats?.topPortfolios?.length ?? 0) > 0
    ? stats!.topPortfolios
    : [{ username: "jean-dupont", views: 142 }, { username: "aminata-d", views: 98 }, { username: "kofi-m", views: 76 }];

  return (
    <AdminLayout>
      <div className="mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-display font-black">Statistiques</h1>
          <p className="text-muted-foreground mt-1">Vue globale des performances de la plateforme</p>
        </div>
        {/* Filtre période */}
        <div className="flex items-center gap-2 bg-card border rounded-xl p-1">
          <Calendar className="w-4 h-4 text-muted-foreground ml-2" />
          {PERIODS.map((p) => (
            <button
              key={p.days}
              onClick={() => setDays(p.days)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                days === p.days
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted"
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {/* ── KPIs ── */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
        {[
          { label: "Utilisateurs",    value: stats?.totalUsers ?? 0,           icon: Users,      color: "text-blue-500",    bg: "bg-blue-500/10",    suffix: "" },
          { label: "Comptes Pro",     value: stats?.premiumUsers ?? 0,         icon: Crown,      color: "text-amber-500",   bg: "bg-amber-500/10",   suffix: "" },
          { label: "Revenus totaux",  value: stats?.totalRevenue ?? 0,         icon: TrendingUp, color: "text-emerald-500", bg: "bg-emerald-500/10", suffix: " FCFA" },
          { label: "Commissions",     value: stats?.totalCommissionsPaid ?? 0, icon: Wallet,     color: "text-violet-500",  bg: "bg-violet-500/10",  suffix: " FCFA" },
          { label: "Conversion",      value: conversionRate,                   icon: Eye,        color: "text-primary",     bg: "bg-primary/10",     suffix: "%" },
        ].map((s, i) => (
          <div key={i} className="bg-card border rounded-2xl p-5">
            <div className="flex items-center justify-between mb-3">
              <p className="text-xs font-medium text-muted-foreground">{s.label}</p>
              <div className={`w-8 h-8 ${s.bg} rounded-lg flex items-center justify-center`}>
                <s.icon className={`w-4 h-4 ${s.color}`} />
              </div>
            </div>
            <p className="text-2xl font-display font-black">{s.value.toLocaleString("fr-FR")}{s.suffix}</p>
          </div>
        ))}
      </div>

      {/* ── Graphiques ligne 1 ── */}
      <div className="grid lg:grid-cols-2 gap-6 mb-6">

        {/* Inscriptions par jour */}
        <div className="bg-card border rounded-2xl p-6">
          <h2 className="font-display font-bold mb-1">Inscriptions ({PERIODS.find(p => p.days === days)?.label})</h2>
          <p className="text-xs text-muted-foreground mb-5">Nouveaux utilisateurs par jour</p>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={regDays} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="gradReg" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(14 60% 50%)" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="hsl(14 60% 50%)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="date" tick={{ fontSize: 10 }} tickLine={false} axisLine={false} interval={4} />
              <YAxis tick={{ fontSize: 10 }} tickLine={false} axisLine={false} allowDecimals={false} />
              <Tooltip content={<CustomTooltip />} />
              <Area type="monotone" dataKey="count" name="Inscriptions" stroke="hsl(14 60% 50%)" fill="url(#gradReg)" strokeWidth={2} dot={false} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Vues portfolios par jour */}
        <div className="bg-card border rounded-2xl p-6">
          <h2 className="font-display font-bold mb-1">Vues portfolios ({PERIODS.find(p => p.days === days)?.label})</h2>
          <p className="text-xs text-muted-foreground mb-5">Total des visites sur tous les portfolios</p>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={viewDays} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="gradViews" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(200 60% 50%)" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="hsl(200 60% 50%)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="date" tick={{ fontSize: 10 }} tickLine={false} axisLine={false} interval={4} />
              <YAxis tick={{ fontSize: 10 }} tickLine={false} axisLine={false} allowDecimals={false} />
              <Tooltip content={<CustomTooltip />} />
              <Area type="monotone" dataKey="count" name="Vues" stroke="hsl(200 60% 50%)" fill="url(#gradViews)" strokeWidth={2} dot={false} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* ── Graphiques ligne 2 ── */}
      <div className="grid lg:grid-cols-2 gap-6 mb-6">

        {/* Utilisateurs par mois Free vs Pro */}
        <div className="bg-card border rounded-2xl p-6">
          <h2 className="font-display font-bold mb-1">Croissance utilisateurs (6 mois)</h2>
          <p className="text-xs text-muted-foreground mb-5">Free vs Pro par mois</p>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={monthlyUsers} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="month" tick={{ fontSize: 10 }} tickLine={false} axisLine={false} />
              <YAxis tick={{ fontSize: 10 }} tickLine={false} axisLine={false} allowDecimals={false} />
              <Tooltip content={<CustomTooltip />} />
              <Legend wrapperStyle={{ fontSize: 11 }} />
              <Bar dataKey="total" name="Total" fill="hsl(var(--muted-foreground))" opacity={0.4} radius={[4,4,0,0]} />
              <Bar dataKey="premium" name="Pro" fill="hsl(14 60% 50%)" radius={[4,4,0,0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Revenus par mois */}
        <div className="bg-card border rounded-2xl p-6">
          <h2 className="font-display font-bold mb-1">Revenus mensuels (6 mois)</h2>
          <p className="text-xs text-muted-foreground mb-5">Abonnements encaissés en FCFA</p>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={monthlyRevenue} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="month" tick={{ fontSize: 10 }} tickLine={false} axisLine={false} />
              <YAxis tick={{ fontSize: 10 }} tickLine={false} axisLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Legend wrapperStyle={{ fontSize: 11 }} />
              <Line type="monotone" dataKey="revenue" name="Revenus FCFA" stroke="hsl(150 40% 35%)" strokeWidth={2.5} dot={{ r: 4, fill: "hsl(150 40% 35%)" }} />
              <Line type="monotone" dataKey="subscriptions" name="Abonnements" stroke="hsl(35 80% 45%)" strokeWidth={2} strokeDasharray="5 5" dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* ── Ligne 3 : Répartition + Top portfolios ── */}
      <div className="grid lg:grid-cols-2 gap-6">

        {/* Répartition Free / Pro */}
        <div className="bg-card border rounded-2xl p-6">
          <h2 className="font-display font-bold mb-5">Répartition des plans</h2>
          <div className="space-y-5">
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span className="font-medium text-muted-foreground">Plan Gratuit</span>
                <span className="font-bold">{freeUsers} ({100 - conversionRate}%)</span>
              </div>
              <div className="w-full h-3 bg-muted rounded-full overflow-hidden">
                <div className="h-full bg-muted-foreground/40 rounded-full transition-all duration-700" style={{ width: `${100 - conversionRate}%` }} />
              </div>
            </div>
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span className="font-medium">Plan Pro ⭐</span>
                <span className="font-bold text-primary">{stats?.premiumUsers ?? 0} ({conversionRate}%)</span>
              </div>
              <div className="w-full h-3 bg-muted rounded-full overflow-hidden">
                <div className="h-full bg-primary rounded-full transition-all duration-700" style={{ width: `${conversionRate}%` }} />
              </div>
            </div>
            <div className="pt-4 border-t grid grid-cols-2 gap-4">
              <div className="bg-muted/30 rounded-xl p-4 text-center">
                <p className="text-2xl font-display font-black text-primary">{conversionRate}%</p>
                <p className="text-xs text-muted-foreground mt-1">Taux de conversion</p>
              </div>
              <div className="bg-muted/30 rounded-xl p-4 text-center">
                <p className="text-2xl font-display font-black text-emerald-600">
                  {((stats?.premiumUsers ?? 0) * 360).toLocaleString("fr-FR")}
                </p>
                <p className="text-xs text-muted-foreground mt-1">FCFA/mois estimé</p>
              </div>
            </div>
          </div>
        </div>

        {/* Top portfolios */}
        <div className="bg-card border rounded-2xl p-6">
          <h2 className="font-display font-bold mb-5">Top 5 portfolios les plus vus</h2>
          <div className="space-y-3">
            {topPortfolios.map((p, i) => {
              const maxViews = topPortfolios[0]?.views ?? 1;
              const pct = Math.round((p.views / maxViews) * 100);
              return (
                <div key={i} className="flex items-center gap-3">
                  <span className="text-xs font-bold text-muted-foreground w-5 shrink-0">#{i + 1}</span>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between text-sm mb-1">
                      <a href={`/portfolio/${p.username}`} target="_blank" rel="noreferrer"
                        className="font-semibold hover:text-primary transition-colors truncate">
                        @{p.username}
                      </a>
                      <span className="font-bold shrink-0 ml-2">{p.views} vues</span>
                    </div>
                    <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                      <div className="h-full bg-primary rounded-full transition-all duration-700" style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

    </AdminLayout>
  );
}
