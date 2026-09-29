import { useEffect, useMemo, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { Check, Loader2, Lock } from "lucide-react";
import { Link } from "wouter";
import { getGetProfileQueryKey, useGetBlocks, useGetProfile, useUpdateProfile } from "@workspace/api-client-react";
import { DashboardLayout } from "@/components/dashboard-layout";
import { PageHeader, Panel } from "@/components/dashboard/ui";
import { PortfolioView } from "@/components/portfolio/PortfolioView";
import { PhoneMockup, PreviewFrame } from "@/components/portfolio/PreviewFrame";
import { useAuth } from "@/contexts/auth";
import { useToast } from "@/hooks/use-toast";
import { FONT_OPTIONS, TEMPLATES, TEMPLATE_IDS, getTemplate, loadFonts, type TemplateId } from "@/lib/templates";
import { getProfession } from "@/lib/professions";
import type { TypedBlock } from "@/lib/blocks";
import type { PortfolioData } from "@/lib/portfolio";

export default function Appearance() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { data: profile } = useGetProfile();
  const { data: blocks } = useGetBlocks();
  const update = useUpdateProfile();

  const profession = getProfession(profile?.profession);
  const [template, setTemplate] = useState<TemplateId>("atelier");
  const [color, setColor] = useState<string | null>(null);
  const [font, setFont] = useState<string | null>(null);
  const [ready, setReady] = useState(false);
  const isPro = user?.plan === "premium";

  useEffect(() => {
    if (profile && !ready) {
      setTemplate((profile.template ?? profession.template) as TemplateId);
      setColor(profile.primaryColor);
      setFont(profile.fontFamily);
      setReady(true);
    }
  }, [profile, profession.template, ready]);

  useEffect(() => loadFonts(FONT_OPTIONS), []);

  const meta = getTemplate(template);
  const activeColor = color && /^#[0-9a-f]{6}$/i.test(color) ? color : meta.defaultColor;
  const dirty = !!profile && (template !== (profile.template ?? profession.template) || color !== profile.primaryColor || font !== profile.fontFamily);

  const data: PortfolioData | null = useMemo(
    () => (profile && user ? { username: user.username, plan: user.plan, profile: { ...profile, template, primaryColor: activeColor, fontFamily: font }, blocks: (blocks ?? []) as TypedBlock[] } : null),
    [profile, user, blocks, template, activeColor, font]
  );

  const save = () =>
    update.mutate(
      { data: { template, styleTheme: template, primaryColor: activeColor, fontFamily: font } },
      {
        onSuccess: (p) => {
          queryClient.setQueryData(getGetProfileQueryKey(), p);
          toast({ title: "Apparence enregistrée", description: "Votre page utilise maintenant ce style." });
        },
        onError: (e: any) => toast({ title: "Erreur", description: e?.message, variant: "destructive" }),
      }
    );

  const pickTemplate = (t: TemplateId) => {
    setTemplate(t);
    // La couleur du template précédent ne va pas forcément avec le nouveau
    if (!color || TEMPLATES[template].colors.includes(color)) setColor(null);
  };

  return (
    <DashboardLayout>
      <PageHeader
        title="Apparence"
        description="Choisissez le style de votre page. Votre contenu reste le même, seule la présentation change."
        actions={
          <button onClick={save} disabled={!dirty || update.isPending} className="inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground disabled:opacity-40">
            {update.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />} Enregistrer
          </button>
        }
      />

      <div className="grid grid-cols-[minmax(0,1fr)] gap-8 lg:grid-cols-[minmax(0,1fr)_340px]">
        <div className="space-y-6">
          <Panel title="Style de page" description={`Conseillé pour ${profession.title ? profession.title.toLowerCase() : "votre métier"} : ${TEMPLATES[profession.template].name}`}>
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 xl:grid-cols-4">
              {TEMPLATE_IDS.map((t) => {
                const m = TEMPLATES[t];
                const selected = t === template;
                return (
                  <div key={t} role="button" tabIndex={0} onClick={() => pickTemplate(t)} onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && pickTemplate(t)} className="group cursor-pointer text-left">
                    <div className={`relative overflow-hidden rounded-2xl border-2 transition-all ${selected ? "border-primary shadow-lg shadow-primary/15" : "border-transparent ring-1 ring-border group-hover:ring-primary/40"}`}>
                      <PreviewFrame virtualWidth={390} aspect={1.35} lazy>
                        {data ? <PortfolioView data={{ ...data, profile: { ...data.profile, primaryColor: selected ? activeColor : m.defaultColor, fontFamily: selected ? font : null } }} templateOverride={t} mode="preview" /> : <div />}
                      </PreviewFrame>
                      {selected && (
                        <span className="absolute right-2 top-2 flex h-7 w-7 items-center justify-center rounded-full bg-primary text-primary-foreground shadow">
                          <Check className="h-4 w-4" />
                        </span>
                      )}
                      {t === profession.template && (
                        <span className="absolute left-2 top-2 rounded-full bg-black/70 px-2 py-0.5 text-[10px] font-bold text-white">Conseillé</span>
                      )}
                    </div>
                    <p className="mt-2 text-sm font-semibold">{m.name}</p>
                    <p className="text-xs text-muted-foreground">{m.tagline}</p>
                  </div>
                );
              })}
            </div>
            <p className="mt-5 rounded-xl bg-muted/60 px-4 py-3 text-sm text-muted-foreground">{meta.description}</p>
          </Panel>

          <Panel title="Couleur principale" description="Boutons, titres et accents de votre page.">
            <div className="flex flex-wrap items-center gap-3">
              {meta.colors.map((c) => (
                <button
                  key={c}
                  onClick={() => setColor(c === meta.defaultColor ? null : c)}
                  className={`h-11 w-11 rounded-full border-2 transition-transform hover:scale-110 ${activeColor.toLowerCase() === c.toLowerCase() ? "border-foreground ring-2 ring-foreground/20 ring-offset-2" : "border-white shadow"}`}
                  style={{ background: c }}
                  aria-label={`Couleur ${c}`}
                />
              ))}
              <label className={`relative flex h-11 items-center gap-2 rounded-full border px-3 text-sm font-medium ${isPro ? "cursor-pointer hover:bg-muted" : "cursor-not-allowed opacity-60"}`}>
                {isPro ? <span className="h-5 w-5 rounded-full border" style={{ background: activeColor }} /> : <Lock className="h-4 w-4" />}
                Personnalisée
                {isPro && <input type="color" value={activeColor} onChange={(e) => setColor(e.target.value)} className="absolute inset-0 cursor-pointer opacity-0" />}
              </label>
            </div>
            {!isPro && (
              <p className="mt-3 text-xs text-muted-foreground">
                Couleur sur mesure (celle de votre marque) avec <Link href="/dashboard/abonnement" className="font-semibold text-primary hover:underline">AfriFolio Pro</Link>.
              </p>
            )}
          </Panel>

          <Panel title="Police des titres">
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
              <button onClick={() => setFont(null)} className={`rounded-xl border p-3 text-left transition-colors ${!font ? "border-primary bg-primary/5" : "hover:border-primary/40"}`}>
                <span className="block text-lg" style={{ fontFamily: `"${meta.displayFont}"` }}>Aa Bb</span>
                <span className="text-xs text-muted-foreground">Celle du style ({meta.displayFont})</span>
              </button>
              {FONT_OPTIONS.filter((f) => f !== meta.displayFont).map((f) => (
                <button key={f} onClick={() => setFont(f)} className={`rounded-xl border p-3 text-left transition-colors ${font === f ? "border-primary bg-primary/5" : "hover:border-primary/40"}`}>
                  <span className="block text-lg" style={{ fontFamily: `"${f}"` }}>Aa Bb</span>
                  <span className="text-xs text-muted-foreground">{f}</span>
                </button>
              ))}
            </div>
          </Panel>
        </div>

        <aside className="hidden lg:block">
          <div className="sticky top-8">
            <p className="mb-3 text-sm font-medium text-muted-foreground">Aperçu</p>
            <PhoneMockup>
              <PreviewFrame virtualWidth={390} aspect={1.95} interactive>
                {data ? <PortfolioView data={data} templateOverride={template} mode="preview" /> : <div className="h-full animate-pulse bg-muted" />}
              </PreviewFrame>
            </PhoneMockup>
          </div>
        </aside>
      </div>
    </DashboardLayout>
  );
}
