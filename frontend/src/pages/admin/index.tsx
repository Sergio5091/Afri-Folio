import { useState } from "react";
import { Link } from "wouter";
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis, Area, AreaChart } from "recharts";
import { Crown, Eye, FileCheck2, MessageSquareText, MousePointerClick, UserPlus, Users, Wallet } from "lucide-react";
import { useGetAdminStats, useGetAdminUsers } from "@workspace/api-client-react";
import { AdminLayout } from "@/components/admin-layout";
import { PageHeader, Panel, StatCard, trendPercent } from "@/components/dashboard/ui";
import { professionLabel } from "@/lib/professions";
import { formatNumber, timeAgo } from "@/lib/utils";

const COLOR = "#C8553D";
const GRID = "hsl(220 13% 91%)";
const AXIS = "hsl(220 9% 46%)";

const PERIODS = [
  { label: "7 j", days: 7 },
  { label: "30 j", days: 30 },
  { label: "90 j", days: 90 },
  { label: "1 an", days: 365 },
];

function Tip({ active, payload, label, unit, fmt }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-xl border bg-card px-3 py-2 text-sm shadow-lg">
      <p className="text-xs text-muted-foreground">{fmt ? fmt(label) : label}</p>
      <p className="font-semibold">{formatNumber(payload[0].value)} {unit}</p>
    </div>
  );
}

const fmtDay = (d: string) => new Date(d).toLocaleDateString("fr-FR", { day: "numeric", month: "short" });
const fmtMonth = (m: string) => {
  const [y, mo] = m.split("-");
  return new Date(Number(y), Number(mo) - 1, 1).toLocaleDateString("fr-FR", { month: "short", year: "2-digit" });
};

export default function AdminOverview() {
  const [days, setDays] = useState(30);
  const { data: s } = useGetAdminStats(days);
  const { data: recent } = useGetAdminUsers({ limit: 6 });

  // Jours sans inscription = 0 (sinon la courbe relie seulement les jours actifs)
  const registrations = (() => {
    const map = new Map((s?.registrationsByDay ?? []).map((r) => [new Date(r.date).toISOString().slice(0, 10), r.count]));
    const n = Math.min(days, 90);
    return Array.from({ length: n }, (_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - (n - 1 - i));
      const key = d.toISOString().slice(0, 10);
      return { date: key, count: map.get(key) ?? 0 };
    });
  })();
  const conversion = s?.totalUsers ? Math.round((s.premiumUsers / s.totalUsers) * 100) : 0;
  const maxProf = Math.max(1, ...(s?.topProfessions ?? []).map((p) => p.count));

  return (
    <AdminLayout>
      <PageHeader
        title="Vue d'ensemble"
        description="L'activité de la plateforme en un coup d'œil."
        actions={
          <div className="flex rounded-xl border bg-card p-1">
            {PERIODS.map((p) => (
              <button key={p.days} onClick={() => setDays(p.days)} className={`rounded-lg px-3 py-1.5 text-sm font-medium ${days === p.days ? "bg-foreground text-background" : "hover:bg-muted"}`}>
                {p.label}
              </button>
            ))}
          </div>
        }
      />

      <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
        <StatCard label="Utilisateurs" value={s ? formatNumber(s.totalUsers) : "–"} icon={Users} hint={`${s?.newUsers7d ?? 0} cette semaine`} trend={s ? trendPercent(s.newUsers7d, s.newUsersPrev7d) : null} />
        <StatCard label="Abonnés Pro" value={s ? formatNumber(s.premiumUsers) : "–"} icon={Crown} tone="amber" hint={`${conversion} % de conversion`} />
        <StatCard label="Revenus du mois" value={s ? `${formatNumber(s.revenueThisMonth)} F` : "–"} icon={Wallet} tone="green" hint={`${formatNumber(s?.totalRevenue ?? 0)} F au total`} />
        <StatCard label="Retraits à traiter" value={s?.pendingWithdrawals ?? "–"} icon={Wallet} tone="blue" hint={<Link href="/admin/retraits" className="font-semibold text-primary">Traiter</Link>} />
        <StatCard label="Pages publiées" value={s ? formatNumber(s.publishedPortfolios) : "–"} icon={FileCheck2} hint="nom et métier renseignés" />
        <StatCard label="Contacts générés" value={s ? formatNumber(s.totalContactClicks) : "–"} icon={MousePointerClick} tone="green" hint="clics WhatsApp, appel, email" />
        <StatCard label="Messages envoyés" value={s ? formatNumber(s.totalLeads) : "–"} icon={MessageSquareText} tone="blue" hint="via les formulaires" />
        <StatCard label="Commissions versées" value={s ? `${formatNumber(s.totalCommissionsPaid)} F` : "–"} icon={UserPlus} tone="amber" hint="parrainage" />
      </div>

      <div className="mt-6 grid grid-cols-[minmax(0,1fr)] gap-6 lg:grid-cols-2">
        <Panel title="Inscriptions par jour" description={days > 90 ? "90 derniers jours" : undefined}>
          <div className="h-60">
            {s ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={registrations} margin={{ top: 8, right: 8, left: -24, bottom: 0 }}>
                  <defs>
                    <linearGradient id="regFill" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor={COLOR} stopOpacity={0.2} />
                      <stop offset="100%" stopColor={COLOR} stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid vertical={false} stroke={GRID} />
                  <XAxis dataKey="date" tickFormatter={fmtDay} tick={{ fontSize: 11, fill: AXIS }} axisLine={false} tickLine={false} minTickGap={24} />
                  <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: AXIS }} axisLine={false} tickLine={false} />
                  <Tooltip content={<Tip unit="inscription(s)" fmt={fmtDay} />} />
                  <Area type="monotone" dataKey="count" stroke={COLOR} strokeWidth={2} fill="url(#regFill)" activeDot={{ r: 5, stroke: "#fff", strokeWidth: 2 }} />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <p className="flex h-full items-center justify-center text-sm text-muted-foreground">Aucune inscription sur la période.</p>
            )}
          </div>
        </Panel>

        <Panel title="Revenus par mois" description="Paiements réussis (hors abonnements offerts)">
          <div className="h-60">
            {s && s.revenueByMonth.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={s.revenueByMonth} margin={{ top: 8, right: 8, left: -8, bottom: 0 }}>
                  <CartesianGrid vertical={false} stroke={GRID} />
                  <XAxis dataKey="month" tickFormatter={fmtMonth} tick={{ fontSize: 11, fill: AXIS }} axisLine={false} tickLine={false} />
                  <YAxis tickFormatter={(v) => formatNumber(v)} tick={{ fontSize: 11, fill: AXIS }} axisLine={false} tickLine={false} />
                  <Tooltip content={<Tip unit="FCFA" fmt={fmtMonth} />} cursor={{ fill: "hsl(220 14% 95%)" }} />
                  <Bar dataKey="revenue" fill={COLOR} radius={[4, 4, 0, 0]} maxBarSize={36} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <p className="flex h-full items-center justify-center text-sm text-muted-foreground">Pas encore de revenus sur la période.</p>
            )}
          </div>
        </Panel>

        <Panel title="Métiers les plus représentés" action={<Link href="/admin/metiers" className="text-sm font-semibold text-primary hover:underline">Détails</Link>}>
          <ul className="space-y-3">
            {(s?.topProfessions ?? []).map((p) => (
              <li key={p.profession}>
                <div className="mb-1 flex justify-between text-sm"><span className="font-medium">{professionLabel(p.profession)}</span><span className="text-muted-foreground">{p.count}</span></div>
                <div className="h-2 rounded-full bg-muted"><div className="h-full rounded-full" style={{ width: `${(p.count / maxProf) * 100}%`, background: COLOR }} /></div>
              </li>
            ))}
          </ul>
        </Panel>

        <Panel title="Pages les plus vues" description={`Sur les ${days} derniers jours`}>
          {(s?.topPortfolios ?? []).length === 0 ? (
            <p className="py-6 text-center text-sm text-muted-foreground">Aucune visite sur la période.</p>
          ) : (
            <ol className="divide-y">
              {s!.topPortfolios.map((p, i) => (
                <li key={p.username} className="flex items-center gap-3 py-2.5 text-sm">
                  <span className="w-5 text-muted-foreground">{i + 1}</span>
                  <a href={`/${p.username}`} target="_blank" rel="noreferrer" className="flex-1 truncate font-medium hover:text-primary">/{p.username}</a>
                  <span className="flex items-center gap-1 text-muted-foreground"><Eye className="h-3.5 w-3.5" /> {formatNumber(p.views)}</span>
                </li>
              ))}
            </ol>
          )}
        </Panel>
      </div>

      <Panel title="Dernières inscriptions" className="mt-6" padded={false} action={<Link href="/admin/utilisateurs" className="text-sm font-semibold text-primary hover:underline">Tous les utilisateurs</Link>}>
        <ul className="divide-y">
          {(recent?.users ?? []).map((u) => (
            <li key={u.id}>
              <Link href={`/admin/utilisateurs?id=${u.id}`} className="flex items-center gap-3 px-5 py-3 hover:bg-muted/50">
                {u.photoUrl ? <img src={u.photoUrl} alt="" className="h-9 w-9 rounded-full object-cover" /> : <span className="flex h-9 w-9 items-center justify-center rounded-full bg-muted text-sm font-bold">{(u.fullName ?? u.username).charAt(0).toUpperCase()}</span>}
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-semibold">{u.fullName || u.username}</span>
                  <span className="block truncate text-xs text-muted-foreground">{professionLabel(u.profession, u.professionCustom)}{u.city ? ` · ${u.city}` : ""}</span>
                </span>
                {u.plan === "premium" && <span className="rounded-full bg-amber-500/10 px-2 py-0.5 text-xs font-semibold text-amber-700">Pro</span>}
                <span className="hidden text-xs text-muted-foreground sm:block">{timeAgo(u.createdAt)}</span>
              </Link>
            </li>
          ))}
        </ul>
      </Panel>
    </AdminLayout>
  );
}
