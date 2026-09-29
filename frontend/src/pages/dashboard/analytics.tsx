import { useState } from "react";
import { Link } from "wouter";
import { Area, AreaChart, Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Eye, Lock, MessageCircle, MessageSquareText, MousePointerClick, Phone, Share2, Contact, Mail } from "lucide-react";
import { useGetAnalyticsStats } from "@workspace/api-client-react";
import { DashboardLayout } from "@/components/dashboard-layout";
import { PageHeader, Panel, StatCard } from "@/components/dashboard/ui";
import { useAuth } from "@/contexts/auth";

// Palette validée (daltonisme + contraste) : une couleur par mesure, identique sur toute la page
export const CHART = { views: "#C8553D", contacts: "#2F6FD6", grid: "hsl(20 10% 90%)", axis: "hsl(20 10% 45%)" };

const SOURCE_LABELS: Record<string, string> = {
  whatsapp: "WhatsApp", facebook: "Facebook", instagram: "Instagram", tiktok: "TikTok", linkedin: "LinkedIn",
  twitter: "X / Twitter", google: "Google", qr: "QR code", annuaire: "Annuaire AfriFolio", direct: "Lien direct",
};

const fmtDay = (d: string) => new Date(d).toLocaleDateString("fr-FR", { day: "numeric", month: "short" });

function ChartTooltip({ active, payload, label, unit }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-xl border bg-card px-3 py-2 text-sm shadow-lg">
      <p className="text-xs text-muted-foreground">{fmtDay(label)}</p>
      <p className="mt-0.5 flex items-center gap-2 font-semibold">
        <span className="h-2.5 w-2.5 rounded-full" style={{ background: payload[0].color ?? payload[0].fill }} />
        {payload[0].value} {unit}
      </p>
    </div>
  );
}

function BarList({ rows, color }: { rows: { label: string; value: number }[]; color: string }) {
  const max = Math.max(1, ...rows.map((r) => r.value));
  const total = rows.reduce((s, r) => s + r.value, 0) || 1;
  if (!rows.length) return <p className="py-6 text-center text-sm text-muted-foreground">Pas encore de données sur cette période.</p>;
  return (
    <ul className="space-y-3">
      {rows.map((r) => (
        <li key={r.label} className="group" title={`${r.label} : ${r.value} (${Math.round((r.value / total) * 100)} %)`}>
          <div className="mb-1 flex justify-between text-sm">
            <span className="font-medium">{r.label}</span>
            <span className="text-muted-foreground">{r.value} · {Math.round((r.value / total) * 100)} %</span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-muted">
            <div className="h-full rounded-full transition-all group-hover:opacity-80" style={{ width: `${(r.value / max) * 100}%`, background: color }} />
          </div>
        </li>
      ))}
    </ul>
  );
}

function ProLock({ children, locked }: { children: React.ReactNode; locked: boolean }) {
  if (!locked) return <>{children}</>;
  return (
    <div className="relative">
      <div className="pointer-events-none select-none blur-[5px]" aria-hidden>{children}</div>
      <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 text-center">
        <span className="flex h-10 w-10 items-center justify-center rounded-full bg-foreground text-background"><Lock className="h-4 w-4" /></span>
        <p className="text-sm font-semibold">Disponible avec Pro</p>
        <Link href="/dashboard/abonnement" className="text-sm font-semibold text-primary hover:underline">Découvrir Pro</Link>
      </div>
    </div>
  );
}

// Données fictives affichées floutées pour le plan gratuit
const TEASER = [{ label: "WhatsApp", value: 12 }, { label: "Lien direct", value: 7 }, { label: "Facebook", value: 4 }];

export default function Analytics() {
  const { user } = useAuth();
  const isPro = user?.plan === "premium";
  const [days, setDays] = useState(isPro ? 30 : 7);
  const { data, isLoading } = useGetAnalyticsStats(days);

  const contacts = data ? data.events.whatsapp + data.events.call + data.events.email : 0;
  const rate = data && data.viewsInRange ? Math.round((contacts / data.viewsInRange) * 100) : 0;
  const series = data?.viewsByDay ?? [];
  const tickEvery = days <= 14 ? 2 : days <= 30 ? 5 : 14;

  return (
    <DashboardLayout>
      <PageHeader
        title="Statistiques"
        description="Qui visite votre page, d'où ils viennent et combien vous contactent."
        actions={
          <div className="flex rounded-xl border bg-card p-1">
            {[7, 30, 90].map((d) => {
              const locked = !isPro && d > 7;
              return (
                <button
                  key={d}
                  onClick={() => !locked && setDays(d)}
                  className={`inline-flex items-center gap-1 rounded-lg px-3.5 py-1.5 text-sm font-medium ${days === d ? "bg-foreground text-background" : locked ? "text-muted-foreground/60" : "hover:bg-muted"}`}
                  title={locked ? "Disponible avec Pro" : undefined}
                >
                  {locked && <Lock className="h-3 w-3" />} {d} j
                </button>
              );
            })}
          </div>
        }
      />

      <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
        <StatCard label={`Visites (${days} j)`} value={isLoading ? "–" : data?.viewsInRange ?? 0} icon={Eye} hint={`${data?.totalViews ?? 0} au total`} />
        <StatCard label="Contacts" value={isLoading ? "–" : contacts} icon={MousePointerClick} tone="blue" hint="WhatsApp, appels, emails" />
        <StatCard label="Taux de contact" value={isLoading ? "–" : `${rate} %`} icon={MessageCircle} tone="green" hint="contacts / visites" />
        <StatCard label="Messages" value={isLoading ? "–" : data?.events.lead ?? 0} icon={MessageSquareText} tone="amber" hint="via le formulaire" />
      </div>

      <div className="mt-6 grid grid-cols-[minmax(0,1fr)] gap-6 lg:grid-cols-2">
        <Panel title="Visites par jour">
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={series} margin={{ top: 8, right: 8, left: -24, bottom: 0 }}>
                <defs>
                  <linearGradient id="viewsFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={CHART.views} stopOpacity={0.22} />
                    <stop offset="100%" stopColor={CHART.views} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid vertical={false} stroke={CHART.grid} />
                <XAxis dataKey="date" tickFormatter={fmtDay} interval={tickEvery - 1} tick={{ fontSize: 11, fill: CHART.axis }} axisLine={false} tickLine={false} />
                <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: CHART.axis }} axisLine={false} tickLine={false} />
                <Tooltip content={<ChartTooltip unit="visites" />} cursor={{ stroke: CHART.axis, strokeDasharray: "3 3" }} />
                <Area type="monotone" dataKey="count" stroke={CHART.views} strokeWidth={2} fill="url(#viewsFill)" activeDot={{ r: 5, stroke: "#fff", strokeWidth: 2 }} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Panel>

        <Panel title="Contacts par jour" description="Clics sur WhatsApp, appel ou email">
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={series} margin={{ top: 8, right: 8, left: -24, bottom: 0 }}>
                <CartesianGrid vertical={false} stroke={CHART.grid} />
                <XAxis dataKey="date" tickFormatter={fmtDay} interval={tickEvery - 1} tick={{ fontSize: 11, fill: CHART.axis }} axisLine={false} tickLine={false} />
                <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: CHART.axis }} axisLine={false} tickLine={false} />
                <Tooltip content={<ChartTooltip unit="contacts" />} cursor={{ fill: "hsl(20 10% 94%)" }} />
                <Bar dataKey="contacts" fill={CHART.contacts} radius={[4, 4, 0, 0]} maxBarSize={18} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Panel>

        <Panel title="D'où viennent vos visiteurs" description="Astuce : partagez votre lien sur votre statut WhatsApp chaque semaine.">
          <ProLock locked={!isPro}>
            <BarList color={CHART.views} rows={isPro ? (data?.viewsBySource ?? []).map((s) => ({ label: SOURCE_LABELS[s.source] ?? s.source, value: s.count })) : TEASER} />
          </ProLock>
        </Panel>

        <Panel title="Actions des visiteurs">
          <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {[
              { icon: MessageCircle, label: "WhatsApp", value: data?.events.whatsapp },
              { icon: Phone, label: "Appels", value: data?.events.call },
              { icon: Mail, label: "Emails", value: data?.events.email },
              { icon: MessageSquareText, label: "Messages", value: data?.events.lead },
              { icon: Contact, label: "Contact enregistré", value: data?.events.vcard },
              { icon: Share2, label: "Partages", value: data?.events.share },
            ].map((e) => (
              <li key={e.label} className="rounded-xl border p-3">
                <e.icon className="h-4 w-4 text-muted-foreground" />
                <p className="mt-2 text-xl font-bold">{e.value ?? 0}</p>
                <p className="text-xs text-muted-foreground">{e.label}</p>
              </li>
            ))}
          </ul>
        </Panel>

        {(data?.viewsByCountry ?? []).some((c) => c.country !== "Inconnu") && (
          <Panel title="Pays des visiteurs">
            <ProLock locked={!isPro}>
              <BarList color={CHART.views} rows={(data?.viewsByCountry ?? []).map((c) => ({ label: c.country, value: c.count }))} />
            </ProLock>
          </Panel>
        )}
      </div>
    </DashboardLayout>
  );
}
