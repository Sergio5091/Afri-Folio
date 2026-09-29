import { useEffect, useMemo, useRef } from "react";
import { Link, useParams } from "wouter";
import { SearchX } from "lucide-react";
import { useGetPublicPortfolio, useRecordView, trackPortfolioEvent } from "@workspace/api-client-react";
import { PortfolioView } from "@/components/portfolio/PortfolioView";
import { normalizePortfolio } from "@/lib/portfolio";
import { usePageMeta } from "@/hooks/use-page-meta";

/** Provenance de la visite : ?src=qr, ou déduite du site précédent */
function detectSource(): string {
  const params = new URLSearchParams(window.location.search);
  const src = params.get("src") || params.get("utm_source");
  if (src) return src.toLowerCase();
  const ref = document.referrer.toLowerCase();
  if (!ref) return "direct";
  if (ref.includes("whatsapp") || ref.includes("wa.me")) return "whatsapp";
  if (ref.includes("facebook") || ref.includes("fb.")) return "facebook";
  if (ref.includes("instagram")) return "instagram";
  if (ref.includes("tiktok")) return "tiktok";
  if (ref.includes("linkedin")) return "linkedin";
  if (ref.includes("t.co") || ref.includes("twitter") || ref.includes("x.com")) return "twitter";
  if (ref.includes("google")) return "google";
  if (ref.includes(window.location.host) && ref.includes("/annuaire")) return "annuaire";
  return "direct";
}

function PortfolioSkeleton() {
  return (
    <div className="min-h-screen animate-pulse bg-[#F7F4EF]">
      <div className="mx-auto max-w-5xl px-6 pt-24">
        <div className="h-4 w-40 rounded-full bg-black/10" />
        <div className="mt-6 h-14 w-3/4 rounded-2xl bg-black/10" />
        <div className="mt-4 h-5 w-1/2 rounded-full bg-black/10" />
        <div className="mt-10 grid grid-cols-3 gap-4">
          {[0, 1, 2].map((i) => (
            <div key={i} className="aspect-square rounded-2xl bg-black/10" />
          ))}
        </div>
      </div>
    </div>
  );
}

export function PortfolioNotFound({ username }: { username?: string }) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-6">
      <div className="max-w-md text-center">
        <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 text-primary">
          <SearchX className="h-8 w-8" />
        </span>
        <h1 className="mt-6 text-3xl font-bold">Ce portfolio n'existe pas</h1>
        <p className="mt-3 text-muted-foreground">
          {username ? <>Aucun professionnel n'utilise l'adresse <strong>/{username}</strong>.</> : "Cette page est introuvable."} Vérifiez le lien ou cherchez dans l'annuaire.
        </p>
        <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
          <Link href="/annuaire" className="rounded-full border px-6 py-3 text-sm font-semibold hover:bg-muted">
            Chercher un professionnel
          </Link>
          <Link href="/inscription" className="rounded-full bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground hover:bg-primary/90">
            Créer mon portfolio
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function PublicPortfolio() {
  const { username = "" } = useParams<{ username: string }>();
  const { data, isLoading, isError } = useGetPublicPortfolio(username, { query: { retry: false } });
  const recordView = useRecordView();
  const recorded = useRef(false);

  const portfolio = useMemo(() => (data ? normalizePortfolio(data) : null), [data]);

  useEffect(() => {
    if (!portfolio || recorded.current) return;
    recorded.current = true;
    recordView.mutate({ data: { portfolioUsername: portfolio.username, source: detectSource() } });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [portfolio]);

  const p = portfolio?.profile;
  usePageMeta({
    title: p ? [p.fullName, p.title].filter(Boolean).join(" — ") : "AfriFolio",
    description: p?.tagline || p?.bio?.slice(0, 160) || undefined,
    image: p?.photoUrl || undefined,
  });

  if (isLoading) return <PortfolioSkeleton />;
  if (isError || !portfolio) return <PortfolioNotFound username={username} />;

  return <PortfolioView data={portfolio} mode="public" onTrack={(type) => trackPortfolioEvent(portfolio.username, type)} />;
}
