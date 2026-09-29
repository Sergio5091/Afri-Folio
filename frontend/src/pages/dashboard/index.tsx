import { useMemo, useState } from "react";
import { Link } from "wouter";
import {
  ArrowRight, Check, Copy, Eye, MessageCircle, MessageSquareText, MousePointerClick, QrCode, Sparkles, X, ExternalLink, Inbox,
} from "lucide-react";
import { useGetBlocks, useGetDashboardSummary, useGetLeads, useGetProfile } from "@workspace/api-client-react";
import { DashboardLayout } from "@/components/dashboard-layout";
import { EmptyState, Panel, ProgressRing, StatCard, trendPercent } from "@/components/dashboard/ui";
import { PortfolioQrCode } from "@/components/qr-code";
import { useAuth } from "@/contexts/auth";
import { completion } from "@/lib/portfolio";
import { copyText, portfolioDisplayUrl, portfolioUrl, shareMessage, whatsappShare } from "@/lib/share";
import type { TypedBlock } from "@/lib/blocks";
import { timeAgo } from "@/lib/utils";


export default function Dashboard() {
  const { user } = useAuth();
  const { data: summary } = useGetDashboardSummary();
  const { data: profile } = useGetProfile();
  const { data: blocks } = useGetBlocks();
  const { data: leads } = useGetLeads();
  const [copied, setCopied] = useState(false);
  const [qrOpen, setQrOpen] = useState(false);

  const username = summary?.username ?? user?.username ?? "";
  const { score, tips } = useMemo(() => completion(profile, (blocks ?? []) as TypedBlock[]), [profile, blocks]);
  const firstName = (profile?.fullName ?? "").split(" ")[0];
  const trend = summary ? trendPercent(summary.viewsLast7Days, summary.viewsPrevious7Days) : null;

  const copy = async () => {
    if (await copyText(portfolioUrl(username))) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <DashboardLayout>
      <div className="mb-6 sm:mb-8">
        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Bonjour{firstName ? ` ${firstName}` : ""} 👋</h1>
        <p className="mt-1 text-muted-foreground">Voici ce qui se passe sur votre page.</p>
      </div>

      {/* ── Lien & partage ── */}
      <section className="relative overflow-hidden rounded-3xl bg-[#1a1410] p-5 text-white sm:p-7">
        <div className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-primary/40 blur-[90px]" />
        <div className="relative flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="min-w-0">
            <p className="text-sm text-white/60">Votre page est en ligne</p>
            <a href={`/${username}`} target="_blank" rel="noreferrer" className="mt-1 flex items-center gap-2 text-xl font-bold hover:underline sm:text-2xl">
              <span className="truncate">{username ? portfolioDisplayUrl(username) : "…"}</span>
              <ExternalLink className="h-4 w-4 shrink-0 opacity-60" />
            </a>
          </div>
          <div className="grid grid-cols-3 gap-2 sm:flex">
            <a
              href={whatsappShare(shareMessage(username, profile?.fullName, profile?.title))}
              target="_blank"
              rel="noreferrer"
              className="col-span-3 inline-flex items-center justify-center gap-2 rounded-xl bg-[#25D366] px-5 py-3 text-sm font-semibold text-white sm:col-span-1"
            >
              <MessageCircle className="h-4 w-4" /> Partager sur WhatsApp
            </a>
            <button onClick={copy} className="inline-flex items-center justify-center gap-2 rounded-xl bg-white/10 px-4 py-3 text-sm font-semibold hover:bg-white/15">
              {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />} {copied ? "Copié" : "Copier"}
            </button>
            <button onClick={() => setQrOpen(true)} className="inline-flex items-center justify-center gap-2 rounded-xl bg-white/10 px-4 py-3 text-sm font-semibold hover:bg-white/15">
              <QrCode className="h-4 w-4" /> QR code
            </button>
            <Link href="/dashboard/ma-page" className="inline-flex items-center justify-center gap-2 rounded-xl bg-white/10 px-4 py-3 text-sm font-semibold hover:bg-white/15">
              Modifier
            </Link>
          </div>
        </div>
      </section>

      {/* ── Chiffres ── */}
      <div className="mt-6 grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
        <StatCard label="Visites (7 jours)" value={summary?.viewsLast7Days ?? "–"} icon={Eye} trend={trend} hint="vs semaine d'avant" />
        <StatCard label="Contacts ce mois" value={summary?.contactClicksThisMonth ?? "–"} icon={MousePointerClick} tone="green" hint="WhatsApp, appels, emails" />
        <StatCard label="Messages reçus" value={summary?.totalLeads ?? "–"} icon={MessageSquareText} tone="blue" hint={summary?.unreadLeads ? `${summary.unreadLeads} non lu(s)` : "via votre page"} />
        <StatCard label="Visites au total" value={summary?.totalViews ?? "–"} icon={Sparkles} tone="amber" hint={`${summary?.viewsThisMonth ?? 0} ce mois-ci`} />
      </div>

      <div className="mt-6 grid grid-cols-[minmax(0,1fr)] gap-6 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)]">
        {/* ── Complétion ── */}
        <Panel
          title="Améliorez votre page"
          description={score >= 100 ? "Votre page est complète. Bravo !" : "Une page complète attire jusqu'à 3× plus de contacts."}
          action={<ProgressRing value={score} size={56} />}
        >
          {tips.length === 0 ? (
            <p className="flex items-center gap-2 text-sm text-emerald-700"><Check className="h-4 w-4" /> Tout est en place. Pensez à partager votre lien régulièrement.</p>
          ) : (
            <ul className="-my-1 divide-y">
              {tips.slice(0, 5).map((t) => (
                <li key={t.id}>
                  <Link href={t.href} className="group flex items-center gap-3 py-3">
                    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border-2 border-dashed border-muted-foreground/30" />
                    <span className="flex-1 text-sm font-medium">{t.label}</span>
                    <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs font-semibold text-primary">+{t.points}%</span>
                    <ArrowRight className="h-4 w-4 text-muted-foreground transition-transform group-hover:translate-x-0.5" />
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </Panel>

        {/* ── Derniers messages ── */}
        <Panel
          title="Derniers messages"
          action={<Link href="/dashboard/messages" className="text-sm font-semibold text-primary hover:underline">Tout voir</Link>}
          padded={false}
        >
          {!leads || leads.length === 0 ? (
            <EmptyState icon={Inbox} title="Pas encore de message" description="Les visiteurs peuvent vous écrire depuis votre page. Partagez votre lien pour recevoir vos premières demandes." />
          ) : (
            <ul className="divide-y">
              {leads.slice(0, 4).map((l) => (
                <li key={l.id}>
                  <Link href="/dashboard/messages" className="flex gap-3 px-5 py-3.5 hover:bg-muted/50">
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-bold text-primary">{l.name.charAt(0).toUpperCase()}</span>
                    <span className="min-w-0 flex-1">
                      <span className="flex items-center gap-2">
                        <span className={`truncate text-sm ${l.isRead ? "font-medium" : "font-bold"}`}>{l.name}</span>
                        {!l.isRead && <span className="h-2 w-2 shrink-0 rounded-full bg-primary" />}
                        <span className="ml-auto shrink-0 text-xs text-muted-foreground">{timeAgo(l.createdAt)}</span>
                      </span>
                      <span className="mt-0.5 block truncate text-sm text-muted-foreground">{l.message}</span>
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </Panel>
      </div>

      {user?.plan !== "premium" && (
        <section className="mt-6 flex flex-col items-start justify-between gap-4 rounded-2xl border border-amber-500/30 bg-gradient-to-r from-amber-500/10 to-primary/10 p-5 sm:flex-row sm:items-center">
          <div className="flex gap-3">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-500 text-white">
              <Sparkles className="h-5 w-5" />
            </span>
            <div>
              <p className="font-semibold">Passez Pro</p>
              <p className="text-sm text-muted-foreground">Photos illimitées, statistiques détaillées, badge vérifié et page sans mention AfriFolio.</p>
            </div>
          </div>
          <Link href="/dashboard/abonnement" className="shrink-0 rounded-xl bg-foreground px-5 py-2.5 text-sm font-semibold text-background">
            Découvrir Pro
          </Link>
        </section>
      )}

      {qrOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={() => setQrOpen(false)}>
          <div className="w-full max-w-sm rounded-3xl bg-card p-6 text-center" onClick={(e) => e.stopPropagation()}>
            <div className="mb-2 flex justify-end">
              <button onClick={() => setQrOpen(false)} className="rounded-lg p-1.5 hover:bg-muted" aria-label="Fermer">
                <X className="h-5 w-5" />
              </button>
            </div>
            <p className="text-lg font-bold">Votre QR code</p>
            <p className="mb-5 mt-1 text-sm text-muted-foreground">Imprimez-le sur vos cartes de visite, flyers ou affichez-le dans votre boutique.</p>
            <PortfolioQrCode url={`${portfolioUrl(username)}?src=qr`} filename={`qr-${username}`} size={200} />
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
