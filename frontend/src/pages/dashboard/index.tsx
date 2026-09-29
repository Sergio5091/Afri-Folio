import { useGetDashboardSummary, useGetProfile, useGetProjects, getGetDashboardSummaryQueryKey, getGetProfileQueryKey, getGetProjectsQueryKey } from "@workspace/api-client-react";
import { DashboardLayout } from "@/components/dashboard-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Link } from "wouter";
import { useAuth } from "@/contexts/auth";
import { Eye, Users, Wallet, ExternalLink, ArrowRight, BarChart3, CheckCircle2, Circle, ChevronRight, Zap } from "lucide-react";

const MOCK_SUMMARY = {
  plan: "premium" as const,
  portfolioUrl: "/portfolio/jean-dupont",
  totalViews: 142,
  viewsThisMonth: 38,
  activeReferrals: 3,
  walletBalance: 108,
  profileComplete: true,
  subscriptionExpiresAt: "2025-06-01",
};

/* ── Calcul du score de complétion ── */
interface CompletionStep {
  label: string;
  done: boolean;
  href: string;
  points: number;
}

function getCompletionSteps(profile: any, projects: any[]): CompletionStep[] {
  return [
    { label: "Photo de profil",         done: !!profile?.photoUrl,                          href: "/dashboard/profil",  points: 15 },
    { label: "Nom & titre professionnel", done: !!profile?.fullName && !!profile?.title,     href: "/dashboard/profil",  points: 15 },
    { label: "Bio / À propos",           done: !!profile?.bio && profile.bio.length >= 20,   href: "/dashboard/profil",  points: 15 },
    { label: "Compétences (min. 3)",     done: (profile?.skills?.length ?? 0) >= 3,          href: "/dashboard/profil",  points: 15 },
    { label: "Services proposés",        done: !!profile?.services,                          href: "/dashboard/profil",  points: 10 },
    { label: "Contact (email ou WhatsApp)", done: !!profile?.emailContact || !!profile?.whatsapp, href: "/dashboard/profil", points: 10 },
    { label: "Au moins 1 projet",        done: projects.length >= 1,                         href: "/dashboard/projets", points: 10 },
    { label: "Réseau social lié",        done: !!profile?.linkedin || !!profile?.github || !!profile?.twitter, href: "/dashboard/profil", points: 5 },
    { label: "Ville & pays",             done: !!profile?.city && !!profile?.country,        href: "/dashboard/profil",  points: 5 },
  ];
}

function getCompletionMessage(score: number): { emoji: string; title: string; desc: string; color: string } {
  if (score === 100) return {
    emoji: "🎉",
    title: "Portfolio complet !",
    desc: "Votre portfolio est optimisé. Partagez votre lien pour attirer des clients.",
    color: "text-emerald-600",
  };
  if (score >= 70) return {
    emoji: "🚀",
    title: "Presque parfait !",
    desc: "Encore quelques étapes et votre portfolio sera au top.",
    color: "text-blue-600",
  };
  if (score >= 40) return {
    emoji: "💪",
    title: "Bon début !",
    desc: "Continuez à compléter votre profil pour attirer plus de clients.",
    color: "text-amber-600",
  };
  return {
    emoji: "👋",
    title: "Commencez votre portfolio",
    desc: "Ajoutez vos informations pour que les clients puissent vous trouver.",
    color: "text-rose-600",
  };
}

export default function Dashboard() {
  const { user } = useAuth();
  const { data: fetchedSummary } = useGetDashboardSummary({
    query: { queryKey: getGetDashboardSummaryQueryKey(), retry: false, placeholderData: MOCK_SUMMARY },
  });
  const { data: profile } = useGetProfile({
    query: { queryKey: getGetProfileQueryKey(), retry: false },
  });
  const { data: projects = [] } = useGetProjects({
    query: { queryKey: getGetProjectsQueryKey(), retry: false },
  });

  const summary = fetchedSummary ?? MOCK_SUMMARY;
  // Utilise le vrai username de l'utilisateur connecté
  const portfolioUrl = user?.username ? `/portfolio/${user.username}` : summary.portfolioUrl;
  const steps = getCompletionSteps(profile, projects as any[]);
  const totalPoints = steps.reduce((acc, s) => acc + s.points, 0);
  const earnedPoints = steps.filter(s => s.done).reduce((acc, s) => acc + s.points, 0);
  const score = Math.round((earnedPoints / totalPoints) * 100);
  const msg = getCompletionMessage(score);
  const nextStep = steps.find(s => !s.done);

  return (
    <DashboardLayout>
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold font-display">Tableau de bord</h1>
          <p className="text-muted-foreground mt-1">Bienvenue sur votre espace AfriFolio.</p>
        </div>
        <div className="flex items-center gap-3">
          {portfolioUrl && (
            <a href={portfolioUrl} target="_blank" rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-md border border-input bg-background hover:bg-accent hover:text-accent-foreground h-10 px-4 text-sm font-medium transition-colors">
              Voir mon portfolio <ExternalLink className="w-4 h-4" />
            </a>
          )}
          <Link href="/dashboard/profil"
            className="inline-flex items-center gap-2 rounded-md bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 text-sm font-medium transition-colors">
            Éditer le profil
          </Link>
        </div>
      </div>

      {/* ── Banner Pro pour utilisateurs free ── */}
      {(summary.plan === "free" || user?.plan === "free") && (
        <div className="relative overflow-hidden bg-gradient-to-r from-primary/10 via-primary/5 to-transparent border border-primary/20 rounded-2xl p-5 mb-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-primary/15 flex items-center justify-center shrink-0">
              <Zap className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="font-bold text-sm">Passez au plan Pro — 360 FCFA/mois</p>
              <p className="text-xs text-muted-foreground mt-0.5">Projets illimités · Analytics · Parrainage · Paiement Mobile Money</p>
            </div>
          </div>
          <Link href="/dashboard/abonnement" className="shrink-0 inline-flex items-center gap-2 bg-primary text-primary-foreground text-sm font-semibold px-5 py-2.5 rounded-full hover:bg-primary/90 transition-all shadow-lg shadow-primary/20">
            Passer Pro <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      )}

      {/* ── Barre de complétion du portfolio ── */}
      <div className="bg-card border rounded-2xl p-5 mb-8 shadow-sm">
        {/* En-tête */}
        <div className="flex items-start justify-between gap-4 mb-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xl">{msg.emoji}</span>
              <h2 className={`font-bold text-base ${msg.color}`}>{msg.title}</h2>
            </div>
            <p className="text-sm text-muted-foreground">{msg.desc}</p>
          </div>
          <div className="text-right shrink-0">
            <span className={`text-3xl font-black ${msg.color}`}>{score}%</span>
            <p className="text-xs text-muted-foreground">complété</p>
          </div>
        </div>

        {/* Barre de progression */}
        <div className="w-full h-2.5 bg-muted rounded-full overflow-hidden mb-4">
          <div
            className="h-full rounded-full transition-all duration-700"
            style={{
              width: `${score}%`,
              background: score === 100
                ? "linear-gradient(90deg, #10b981, #059669)"
                : score >= 70
                ? "linear-gradient(90deg, #3b82f6, #6366f1)"
                : score >= 40
                ? "linear-gradient(90deg, #f59e0b, #f97316)"
                : "linear-gradient(90deg, #f43f5e, #e11d48)",
            }}
          />
        </div>

        {/* Étapes */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {steps.map((step, i) => (
            <Link key={i} href={step.href}
              className={`flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm transition-colors ${
                step.done
                  ? "text-muted-foreground"
                  : "hover:bg-muted/60 cursor-pointer"
              }`}
            >
              {step.done
                ? <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                : <Circle className="w-4 h-4 text-muted-foreground/40 shrink-0" />
              }
              <span className={step.done ? "line-through opacity-50" : "font-medium"}>
                {step.label}
              </span>
              {!step.done && (
                <span className="ml-auto text-xs text-muted-foreground">+{step.points}%</span>
              )}
            </Link>
          ))}
        </div>

        {/* CTA prochaine étape */}
        {nextStep && (
          <Link href={nextStep.href}
            className="mt-4 flex items-center justify-between w-full px-4 py-3 rounded-xl bg-primary/5 border border-primary/20 hover:bg-primary/10 transition-colors">
            <span className="text-sm font-semibold text-primary">Prochaine étape : {nextStep.label}</span>
            <ChevronRight className="w-4 h-4 text-primary" />
          </Link>
        )}
      </div>

      {/* ── Stats cards ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Vues ce mois</CardTitle>
            <Eye className="w-4 h-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{summary.viewsThisMonth}</div>
            <p className="text-xs text-muted-foreground mt-1">Total : {summary.totalViews}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Filleuls actifs</CardTitle>
            <Users className="w-4 h-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{summary.activeReferrals}</div>
            <Link href="/dashboard/parrainage" className="text-xs text-primary hover:underline mt-1 block">Gérer</Link>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Solde</CardTitle>
            <Wallet className="w-4 h-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{summary.walletBalance} <span className="text-sm font-normal">FCFA</span></div>
            <Link href="/dashboard/parrainage" className="text-xs text-primary hover:underline mt-1 block">Retirer</Link>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Plan</CardTitle>
            <div className="w-4 h-4 rounded-full bg-primary/20 flex items-center justify-center">
              <div className="w-2 h-2 rounded-full bg-primary" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold capitalize">{summary.plan}</div>
            {summary.plan === "free"
              ? <Link href="/dashboard/abonnement" className="text-xs text-primary hover:underline mt-1 block">Passer Pro</Link>
              : <p className="text-xs text-muted-foreground mt-1">Expire le {summary.subscriptionExpiresAt ? new Date(summary.subscriptionExpiresAt).toLocaleDateString("fr-FR") : "—"}</p>
            }
          </CardContent>
        </Card>
      </div>

      {/* Raccourci Analytiques */}
      <Link href="/dashboard/analytiques"
        className="flex items-center justify-between p-4 rounded-xl border bg-card hover:bg-muted/50 transition-colors mb-6">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center">
            <BarChart3 className="w-4 h-4 text-primary" />
          </div>
          <div>
            <p className="text-sm font-semibold">Analytiques</p>
            <p className="text-xs text-muted-foreground">Vues, pays, sources de trafic</p>
          </div>
        </div>
        <ArrowRight className="w-4 h-4 text-muted-foreground" />
      </Link>

    </DashboardLayout>
  );
}
