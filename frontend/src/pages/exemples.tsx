import { useMemo, useState } from "react";
import { Link, useParams, useLocation } from "wouter";
import { ArrowLeft, ArrowRight, Search, Sparkles } from "lucide-react";
import { PortfolioView } from "@/components/portfolio/PortfolioView";
import { PreviewFrame, PhoneMockup } from "@/components/portfolio/PreviewFrame";
import { buildDemoPortfolio } from "@/lib/portfolio";
import { FAMILIES, PROFESSIONS, getProfession, searchProfessions, type FamilyId } from "@/lib/professions";
import { TEMPLATES, TEMPLATE_IDS, type TemplateId } from "@/lib/templates";
import { usePageMeta } from "@/hooks/use-page-meta";
import { SiteHeader, SiteFooter } from "@/components/site-layout";

/** /exemples/:profession — un exemple complet, avec changement de template */
export function ExampleDetail() {
  const { profession: id = "" } = useParams<{ profession: string }>();
  const profession = getProfession(id);
  const [template, setTemplate] = useState<TemplateId>(profession.template);
  const data = useMemo(() => buildDemoPortfolio(profession.id, { template }), [profession.id, template]);

  usePageMeta({ title: `Exemple de portfolio ${profession.title} — AfriFolio`, description: profession.tagline });

  return (
    <div className="min-h-screen bg-background">
      <div className="sticky top-0 z-50 border-b bg-neutral-950 text-white">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-3 px-4 py-2.5">
          <Link href="/exemples" className="inline-flex items-center gap-1.5 text-sm text-white/70 hover:text-white">
            <ArrowLeft className="h-4 w-4" /> Exemples
          </Link>
          <span className="hidden text-sm text-white/50 sm:inline">·</span>
          <p className="hidden text-sm sm:block">
            Exemple pour <strong>{profession.title}</strong>
          </p>
          <div className="ml-auto flex items-center gap-2">
            <select
              value={template}
              onChange={(e) => setTemplate(e.target.value as TemplateId)}
              className="rounded-full border border-white/20 bg-white/10 px-3 py-1.5 text-sm outline-none"
              aria-label="Changer de style"
            >
              {TEMPLATE_IDS.map((t) => (
                <option key={t} value={t} className="text-black">
                  Style {TEMPLATES[t].name}
                </option>
              ))}
            </select>
            <Link href={`/inscription?metier=${profession.id}`} className="rounded-full bg-primary px-4 py-1.5 text-sm font-semibold text-primary-foreground">
              Créer le mien
            </Link>
          </div>
        </div>
      </div>
      <PortfolioView data={data} mode="demo" templateOverride={template} />
    </div>
  );
}

/** /exemples — tous les métiers */
export default function Exemples() {
  const [query, setQuery] = useState("");
  const [family, setFamily] = useState<FamilyId | "all">("all");
  const [, navigate] = useLocation();

  usePageMeta({ title: "Exemples de portfolios par métier — AfriFolio" });

  const list = useMemo(() => {
    if (query.trim()) return searchProfessions(query, 50);
    return PROFESSIONS.filter((p) => family === "all" || p.family === family);
  }, [query, family]);

  const families = (Object.keys(FAMILIES) as FamilyId[]).filter((f) => PROFESSIONS.some((p) => p.family === f));

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <main className="mx-auto max-w-7xl px-4 pb-24 pt-28 sm:px-6">
        <div className="mx-auto max-w-2xl text-center">
          <p className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
            <Sparkles className="h-3.5 w-3.5" /> {PROFESSIONS.length} métiers, 7 styles
          </p>
          <h1 className="mt-5 text-4xl font-extrabold tracking-tight sm:text-5xl">Un portfolio pensé pour votre métier</h1>
          <p className="mt-4 text-lg text-muted-foreground">
            Chaque métier a sa mise en page : galerie pour la couturière, menu pour le restaurant, zone d'intervention pour l'électricien.
          </p>
          <div className="relative mx-auto mt-8 max-w-md">
            <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Votre métier : couturière, plombier, DJ..."
              className="w-full rounded-full border bg-card py-3.5 pl-12 pr-4 text-[15px] shadow-sm outline-none focus:border-primary focus:ring-4 focus:ring-primary/10"
            />
          </div>
        </div>

        {!query && (
          <div className="mt-10 flex gap-2 overflow-x-auto pb-2 [scrollbar-width:none] sm:flex-wrap sm:justify-center">
            <button
              onClick={() => setFamily("all")}
              className={`shrink-0 rounded-full border px-4 py-2 text-sm font-medium ${family === "all" ? "border-foreground bg-foreground text-background" : "hover:bg-muted"}`}
            >
              Tous
            </button>
            {families.map((f) => (
              <button
                key={f}
                onClick={() => setFamily(f)}
                className={`shrink-0 rounded-full border px-4 py-2 text-sm font-medium ${family === f ? "border-foreground bg-foreground text-background" : "hover:bg-muted"}`}
              >
                {FAMILIES[f].emoji} {FAMILIES[f].label}
              </button>
            ))}
          </div>
        )}

        <div className="mt-10 grid grid-cols-2 gap-x-5 gap-y-10 md:grid-cols-3 lg:grid-cols-4">
          {list.map((p) => (
            <div key={p.id} role="link" tabIndex={0} onClick={() => navigate(`/exemples/${p.id}`)} onKeyDown={(e) => e.key === "Enter" && navigate(`/exemples/${p.id}`)} className="group cursor-pointer text-left">
              <PhoneMockup className="transition-transform duration-300 group-hover:-translate-y-1.5">
                <PreviewFrame virtualWidth={390} aspect={1.9} lazy>
                  <PortfolioView data={buildDemoPortfolio(p.id)} mode="demo" />
                </PreviewFrame>
              </PhoneMockup>
              <div className="mt-4 flex items-start justify-between gap-2">
                <div>
                  <p className="font-semibold">{p.emoji} {p.label}</p>
                  <p className="text-sm text-muted-foreground">Style {TEMPLATES[p.template].name}</p>
                </div>
                <ArrowRight className="mt-1 h-4 w-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-1 group-hover:text-primary" />
              </div>
            </div>
          ))}
        </div>

        {list.length === 0 && (
          <div className="mt-16 text-center">
            <p className="text-muted-foreground">Pas encore d'exemple pour « {query} », mais AfriFolio s'adapte à tous les métiers.</p>
            <Link href="/inscription" className="mt-4 inline-flex rounded-full bg-primary px-6 py-3 font-semibold text-primary-foreground">
              Créer mon portfolio
            </Link>
          </div>
        )}
      </main>
      <SiteFooter />
    </div>
  );
}
