import { useMemo, useState } from "react";
import { Link, useLocation } from "wouter";
import {
  ArrowRight, BarChart3, Check, ChevronDown, Feather, MessageCircle, MessageSquareText, QrCode, Search, Smartphone, Sparkles, Users, Wallet,
} from "lucide-react";
import { useGetFeatured, useGetPlans } from "@workspace/api-client-react";
import { SiteFooter, SiteHeader } from "@/components/site-layout";
import { PortfolioView } from "@/components/portfolio/PortfolioView";
import { PhoneMockup, PreviewFrame } from "@/components/portfolio/PreviewFrame";
import { buildDemoPortfolio, SHOWCASE_PROFESSIONS } from "@/lib/portfolio";
import { POPULAR_PROFESSIONS, PROFESSIONS, getProfession, searchProfessions } from "@/lib/professions";
import { TEMPLATES } from "@/lib/templates";
import { usePageMeta } from "@/hooks/use-page-meta";
import { formatNumber, slugify } from "@/lib/utils";

function MetierSearch({ size = "lg" }: { size?: "lg" | "md" }) {
  const [q, setQ] = useState("");
  const [, navigate] = useLocation();
  const results = useMemo(() => searchProfessions(q, 6), [q]);
  const go = (id?: string) => navigate(id ? `/inscription?metier=${id}` : "/inscription");
  return (
    <div className="relative w-full max-w-xl">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          go(results[0]?.id);
        }}
        className={`flex items-center gap-2 rounded-2xl border bg-card p-2 shadow-xl shadow-black/5 ${size === "lg" ? "" : ""}`}
      >
        <Search className="ml-3 h-5 w-5 shrink-0 text-muted-foreground" />
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Votre métier : couturière, électricien..."
          className="min-w-0 flex-1 bg-transparent py-2.5 text-[16px] outline-none"
          aria-label="Votre métier"
        />
        <button type="submit" className="inline-flex shrink-0 items-center gap-1.5 rounded-xl bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground sm:px-5">
          <span className="hidden sm:inline">Créer ma page</span> <ArrowRight className="h-4 w-4" />
        </button>
      </form>
      {q.trim() && results.length > 0 && (
        <div className="absolute inset-x-0 top-full z-20 mt-2 overflow-hidden rounded-2xl border bg-card text-left shadow-xl">
          {results.map((p) => (
            <button key={p.id} onClick={() => go(p.id)} className="flex w-full items-center gap-3 px-4 py-3 hover:bg-muted">
              <span className="text-lg">{p.emoji}</span>
              <span className="flex-1 text-sm font-medium">{p.label}</span>
              <span className="text-xs text-muted-foreground">Style {TEMPLATES[p.template].name}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function Phone({ profession, className = "" }: { profession: string; className?: string }) {
  return (
    <PhoneMockup className={className}>
      <PreviewFrame virtualWidth={390} aspect={1.95}>
        <PortfolioView data={buildDemoPortfolio(profession)} mode="demo" />
      </PreviewFrame>
    </PhoneMockup>
  );
}

const FEATURES = [
  { icon: MessageCircle, title: "WhatsApp en un clic", desc: "Chaque prestation a son bouton « Demander » avec un message déjà rédigé. Vos clients vous écrivent sans effort." },
  { icon: Feather, title: "Léger en données", desc: "Photos compressées, vidéos chargées au clic : votre page s'ouvre vite, même en 3G." },
  { icon: QrCode, title: "QR code prêt à imprimer", desc: "Sur vos cartes de visite, vos flyers, votre vitrine ou votre camion." },
  { icon: MessageSquareText, title: "Messages de clients", desc: "Les visiteurs qui préfèrent écrire vous laissent un message, rangé dans votre espace." },
  { icon: BarChart3, title: "Statistiques claires", desc: "Combien de visites, d'où elles viennent, combien de personnes vous ont contacté." },
  { icon: Users, title: "Annuaire des pros", desc: "Les clients qui cherchent votre métier dans votre ville peuvent vous trouver." },
  { icon: Wallet, title: "Paiement Mobile Money", desc: "MTN, Moov, Wave. Pas besoin de carte bancaire." },
  { icon: Smartphone, title: "Tout depuis le téléphone", desc: "Créez et modifiez votre page depuis votre téléphone, en quelques minutes." },
];

const FAQS = [
  { q: "C'est vraiment gratuit ?", a: "Oui. Le plan gratuit vous donne une page complète, sans limite de durée : tous les styles, le bouton WhatsApp, les messages et jusqu'à 12 photos. Le plan Pro ajoute les photos illimitées, les statistiques détaillées et le badge vérifié." },
  { q: "Je ne suis pas à l'aise avec l'informatique. Je vais y arriver ?", a: "Oui. Vous répondez à quelques questions simples depuis votre téléphone (votre métier, votre nom, vos photos, vos prix) et la page est créée pour vous. Les textes sont déjà rédigés, vous n'avez qu'à les ajuster." },
  { q: "Mon métier n'est pas dans la liste, ça marche quand même ?", a: "Oui. Tapez simplement votre métier : nous choisissons la mise en page la plus adaptée, et vous ajoutez les sections dont vous avez besoin (galerie, tarifs, horaires, zone d'intervention...)." },
  { q: "Comment mes clients me contactent ?", a: "Par WhatsApp en un clic (avec un message prérempli), par téléphone, par email ou via le formulaire de message. Vous voyez tout dans votre espace." },
  { q: "Comment je paie le plan Pro ?", a: "Par Mobile Money (MTN, Moov, Wave), au mois ou à l'année. Sans engagement." },
  { q: "Je peux changer de style plus tard ?", a: "À tout moment. Votre contenu reste le même, seule la présentation change." },
];

const STEPS = [
  { n: "1", title: "Dites-nous votre métier", desc: "Couturière, électricien, chef... Votre page s'adapte automatiquement.", time: "10 s" },
  { n: "2", title: "Ajoutez photos et prix", desc: "Choisissez vos photos dans la galerie du téléphone, cochez vos prestations.", time: "2 min" },
  { n: "3", title: "Partagez votre lien", desc: "Sur votre statut WhatsApp, vos réseaux, vos cartes de visite avec le QR code.", time: "1 clic" },
];

export default function Home() {
  const { data: plans } = useGetPlans();
  const { data: featured } = useGetFeatured();
  const [showcase, setShowcase] = useState(SHOWCASE_PROFESSIONS[0]);
  const [faqOpen, setFaqOpen] = useState<number | null>(0);
  const showcaseProfession = getProfession(showcase);
  const tpl = TEMPLATES[showcaseProfession.template];

  usePageMeta({
    title: "AfriFolio — Le portfolio professionnel pour votre métier, en 5 minutes",
    description: "Créez gratuitement une page pro adaptée à votre métier : vos réalisations, vos prix, votre WhatsApp. Pensé pour les professionnels d'Afrique.",
  });

  return (
    <div className="min-h-screen overflow-x-hidden bg-background">
      <SiteHeader />

      {/* ── Héros ── */}
      <section className="relative px-4 pb-16 pt-28 sm:px-6 sm:pt-36">
        <div className="pointer-events-none absolute left-1/2 top-0 h-[520px] w-[900px] -translate-x-1/2 rounded-full bg-primary/10 blur-[120px]" />
        <div className="relative mx-auto grid max-w-7xl grid-cols-[minmax(0,1fr)] items-center gap-14 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)]">
          <div className="text-center lg:text-left">
            <p className="inline-flex items-center gap-2 rounded-full border bg-card px-3.5 py-1.5 text-xs font-semibold text-muted-foreground">
              <Sparkles className="h-3.5 w-3.5 text-primary" /> {PROFESSIONS.length} métiers · 7 styles · 100 % mobile
            </p>
            <h1 className="mt-6 text-[2.6rem] font-extrabold leading-[1.02] tracking-tight sm:text-6xl lg:text-7xl">
              Votre métier mérite une <span className="relative whitespace-nowrap text-primary">vraie vitrine<svg viewBox="0 0 300 12" className="absolute -bottom-2 left-0 w-full" aria-hidden><path d="M2 9c60-6 180-8 296-2" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" opacity=".35" /></svg></span>.
            </h1>
            <p className="mx-auto mt-6 max-w-xl text-lg text-muted-foreground lg:mx-0">
              Une page professionnelle pensée pour votre métier : vos réalisations, vos prix et un bouton WhatsApp. Prête en 5 minutes, depuis votre téléphone.
            </p>
            <div className="mt-8 flex justify-center lg:justify-start">
              <MetierSearch />
            </div>
            <div className="mt-4 flex flex-wrap justify-center gap-2 lg:justify-start">
              {POPULAR_PROFESSIONS.slice(0, 6).map((id) => {
                const p = getProfession(id);
                return (
                  <Link key={id} href={`/exemples/${id}`} className="rounded-full border bg-card px-3 py-1.5 text-xs font-medium text-muted-foreground hover:border-primary hover:text-foreground">
                    {p.emoji} {p.title}
                  </Link>
                );
              })}
            </div>
            <ul className="mt-8 flex flex-wrap justify-center gap-x-6 gap-y-2 text-sm text-muted-foreground lg:justify-start">
              {["Gratuit, sans limite de durée", "Sans carte bancaire", "Paiement Pro par Mobile Money"].map((t) => (
                <li key={t} className="flex items-center gap-1.5"><Check className="h-4 w-4 text-emerald-600" /> {t}</li>
              ))}
            </ul>
          </div>

          <div className="relative mx-auto h-[520px] w-full max-w-[520px] sm:h-[600px]">
            <div className="absolute left-0 top-16 w-[44%] -rotate-6"><Phone profession="electricien" /></div>
            <div className="absolute right-0 top-16 w-[44%] rotate-6"><Phone profession="restaurant" /></div>
            <div className="absolute left-1/2 top-0 z-10 w-[52%] -translate-x-1/2"><Phone profession="couturiere" /></div>
          </div>
        </div>
      </section>

      {/* ── Un style par métier ── */}
      <section className="bg-[#1a1410] px-4 py-20 text-white sm:px-6 sm:py-28">
        <div className="mx-auto max-w-7xl">
          <div className="max-w-2xl">
            <p className="text-sm font-semibold uppercase tracking-widest text-primary">Pas un modèle unique</p>
            <h2 className="mt-3 text-4xl font-extrabold tracking-tight sm:text-5xl">Une page pensée pour votre métier</h2>
            <p className="mt-4 text-lg text-white/70">Un restaurant a besoin d'une carte et d'horaires. Un électricien, d'un bouton d'appel et d'une zone d'intervention. Une couturière, d'une belle galerie. AfriFolio le sait.</p>
          </div>
          <div className="mt-10 flex gap-2 overflow-x-auto pb-2 [scrollbar-width:none]">
            {SHOWCASE_PROFESSIONS.map((id) => {
              const p = getProfession(id);
              return (
                <button key={id} onClick={() => setShowcase(id)} className={`shrink-0 rounded-full px-4 py-2 text-sm font-medium transition-colors ${showcase === id ? "bg-white text-black" : "bg-white/10 text-white/80 hover:bg-white/15"}`}>
                  {p.emoji} {p.title}
                </button>
              );
            })}
          </div>
          <div className="mt-10 grid grid-cols-[minmax(0,1fr)] items-center gap-12 lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)]">
            <div>
              <p className="text-sm font-semibold text-white/60">Style {tpl.name}</p>
              <p className="mt-2 text-3xl font-bold">{tpl.tagline}</p>
              <p className="mt-4 text-white/70">{tpl.description}</p>
              <p className="mt-4 text-sm text-white/50">Idéal pour : {tpl.bestFor}</p>
              <div className="mt-8 flex flex-wrap gap-3">
                <Link href={`/inscription?metier=${showcase}`} className="inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground">
                  Créer la mienne <ArrowRight className="h-4 w-4" />
                </Link>
                <Link href={`/exemples/${showcase}`} className="inline-flex items-center gap-2 rounded-full border border-white/20 px-6 py-3 text-sm font-semibold hover:bg-white/10">
                  Voir l'exemple complet
                </Link>
              </div>
            </div>
            <div className="grid grid-cols-[minmax(0,1fr)] items-end gap-5 sm:grid-cols-[minmax(0,1.7fr)_minmax(0,1fr)]">
              <div className="overflow-hidden rounded-2xl border border-white/10 shadow-2xl">
                <div className="flex items-center gap-1.5 bg-white/10 px-3 py-2">
                  <span className="h-2.5 w-2.5 rounded-full bg-white/30" /><span className="h-2.5 w-2.5 rounded-full bg-white/30" /><span className="h-2.5 w-2.5 rounded-full bg-white/30" />
                  <span className="ml-3 rounded bg-white/10 px-2 py-0.5 text-[10px] text-white/60">afrifolio.com/{slugify(buildDemoPortfolio(showcase).profile.fullName ?? "")}</span>
                </div>
                <PreviewFrame key={`d-${showcase}`} virtualWidth={1200} aspect={0.62}>
                  <PortfolioView data={buildDemoPortfolio(showcase)} mode="demo" />
                </PreviewFrame>
              </div>
              <PhoneMockup key={`m-${showcase}`} className="hidden sm:block">
                <PreviewFrame virtualWidth={390} aspect={1.95}>
                  <PortfolioView data={buildDemoPortfolio(showcase)} mode="demo" />
                </PreviewFrame>
              </PhoneMockup>
            </div>
          </div>
          <div className="mt-12 text-center">
            <Link href="/exemples" className="inline-flex items-center gap-2 text-sm font-semibold text-white/80 hover:text-white">
              Voir les {PROFESSIONS.length} métiers <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* ── Comment ça marche ── */}
      <section className="px-4 py-20 sm:px-6 sm:py-28">
        <div className="mx-auto max-w-6xl">
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-sm font-semibold uppercase tracking-widest text-primary">Simple comme un message WhatsApp</p>
            <h2 className="mt-3 text-4xl font-extrabold tracking-tight sm:text-5xl">En ligne en moins de 5 minutes</h2>
          </div>
          <ol className="mt-14 grid gap-5 md:grid-cols-3">
            {STEPS.map((s) => (
              <li key={s.n} className="relative rounded-3xl border bg-card p-7">
                <span className="text-6xl font-extrabold text-primary/15">{s.n}</span>
                <span className="absolute right-6 top-7 rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-bold text-emerald-700">{s.time}</span>
                <h3 className="mt-2 text-xl font-bold">{s.title}</h3>
                <p className="mt-2 text-muted-foreground">{s.desc}</p>
              </li>
            ))}
          </ol>
          <div className="mt-10 text-center">
            <Link href="/inscription" className="inline-flex items-center gap-2 rounded-full bg-primary px-8 py-4 font-semibold text-primary-foreground shadow-xl shadow-primary/25">
              Commencer maintenant <ArrowRight className="h-5 w-5" />
            </Link>
          </div>
        </div>
      </section>

      {/* ── Fonctionnalités ── */}
      <section className="border-y bg-card px-4 py-20 sm:px-6 sm:py-28">
        <div className="mx-auto max-w-7xl">
          <div className="max-w-2xl">
            <p className="text-sm font-semibold uppercase tracking-widest text-primary">Fait pour ici</p>
            <h2 className="mt-3 text-4xl font-extrabold tracking-tight sm:text-5xl">Pensé pour la façon dont vos clients vous trouvent</h2>
          </div>
          <div className="mt-12 grid gap-x-8 gap-y-10 sm:grid-cols-2 lg:grid-cols-4">
            {FEATURES.map((f) => (
              <div key={f.title}>
                <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary"><f.icon className="h-5 w-5" /></span>
                <h3 className="mt-4 font-bold">{f.title}</h3>
                <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Vrais portfolios mis en avant ── */}
      {featured && featured.length > 0 && (
        <section className="px-4 py-20 sm:px-6">
          <div className="mx-auto max-w-7xl">
            <div className="flex items-end justify-between gap-4">
              <h2 className="text-3xl font-extrabold tracking-tight sm:text-4xl">Ils ont créé leur page</h2>
              <Link href="/annuaire" className="shrink-0 text-sm font-semibold text-primary hover:underline">Voir l'annuaire</Link>
            </div>
            <div className="mt-8 grid grid-cols-2 gap-4 md:grid-cols-4">
              {featured.slice(0, 8).map((p) => (
                <Link key={p.username} href={`/${p.username}`} className="group overflow-hidden rounded-2xl border bg-card">
                  <div className="aspect-[4/3] overflow-hidden bg-muted">
                    {(p.coverUrl || p.photoUrl) && <img src={p.coverUrl || p.photoUrl!} alt="" loading="lazy" className="h-full w-full object-cover transition-transform group-hover:scale-105" />}
                  </div>
                  <div className="p-4">
                    <p className="truncate font-semibold">{p.fullName}</p>
                    <p className="truncate text-sm text-muted-foreground">{p.title} {p.city && `· ${p.city}`}</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── Tarifs ── */}
      <section id="tarifs" className="scroll-mt-20 px-4 py-20 sm:px-6 sm:py-28">
        <div className="mx-auto max-w-5xl">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-4xl font-extrabold tracking-tight sm:text-5xl">Commencez gratuitement</h2>
            <p className="mt-4 text-lg text-muted-foreground">Passez Pro quand vous voulez aller plus loin. Paiement par Mobile Money.</p>
          </div>
          <div className="mt-12 grid gap-6 md:grid-cols-2">
            <div className="flex flex-col rounded-3xl border bg-card p-8">
              <p className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Gratuit</p>
              <p className="mt-3 text-5xl font-extrabold">0 <span className="text-lg font-semibold text-muted-foreground">FCFA</span></p>
              <p className="mt-1 text-sm text-muted-foreground">Pour toujours</p>
              <ul className="mt-8 flex-1 space-y-3 text-sm">
                {["Page complète adaptée à votre métier", "Les 7 styles", "Bouton WhatsApp, appel et messages", `Jusqu'à ${plans?.freeLimits.photos ?? 12} photos`, "QR code et lien personnalisé", "Statistiques sur 7 jours"].map((t) => (
                  <li key={t} className="flex gap-2.5"><Check className="h-4 w-4 shrink-0 text-emerald-600" /> {t}</li>
                ))}
              </ul>
              <Link href="/inscription" className="mt-8 rounded-xl border py-3 text-center font-semibold hover:bg-muted">Créer ma page</Link>
            </div>
            <div className="relative flex flex-col rounded-3xl border-2 border-primary bg-card p-8 shadow-xl shadow-primary/10">
              <span className="absolute -top-3 right-8 rounded-full bg-primary px-3 py-1 text-xs font-bold text-primary-foreground">Recommandé</span>
              <p className="text-sm font-bold uppercase tracking-wider text-primary">Pro</p>
              <p className="mt-3 text-5xl font-extrabold">{plans ? formatNumber(plans.monthly) : "–"} <span className="text-lg font-semibold text-muted-foreground">FCFA/mois</span></p>
              <p className="mt-1 text-sm text-muted-foreground">ou {plans ? formatNumber(plans.yearly) : "–"} FCFA/an (2 mois offerts)</p>
              <ul className="mt-8 flex-1 space-y-3 text-sm">
                {["Tout le plan gratuit", "Photos illimitées", "Statistiques 30 et 90 jours, provenance des visiteurs", "Badge Pro vérifié, prioritaire dans l'annuaire", "Couleur de votre marque", "Page sans mention AfriFolio"].map((t) => (
                  <li key={t} className="flex gap-2.5"><Check className="h-4 w-4 shrink-0 text-primary" /> {t}</li>
                ))}
              </ul>
              <Link href="/inscription" className="mt-8 rounded-xl bg-primary py-3 text-center font-semibold text-primary-foreground">Commencer</Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── FAQ ── */}
      <section id="faq" className="scroll-mt-20 border-t bg-card px-4 py-20 sm:px-6 sm:py-28">
        <div className="mx-auto max-w-3xl">
          <h2 className="text-center text-4xl font-extrabold tracking-tight">Questions fréquentes</h2>
          <div className="mt-12 divide-y border-y">
            {FAQS.map((f, i) => (
              <div key={i}>
                <button onClick={() => setFaqOpen(faqOpen === i ? null : i)} className="flex w-full items-center justify-between gap-4 py-5 text-left font-semibold" aria-expanded={faqOpen === i}>
                  {f.q}
                  <ChevronDown className={`h-5 w-5 shrink-0 text-muted-foreground transition-transform ${faqOpen === i ? "rotate-180" : ""}`} />
                </button>
                {faqOpen === i && <p className="-mt-1 pb-5 leading-relaxed text-muted-foreground">{f.a}</p>}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Appel final ── */}
      <section className="px-4 py-20 sm:px-6 sm:py-28">
        <div className="relative mx-auto max-w-5xl overflow-hidden rounded-[2rem] bg-primary px-6 py-16 text-center text-primary-foreground sm:px-12">
          <div className="pointer-events-none absolute -right-20 -top-20 h-72 w-72 rounded-full bg-white/10" />
          <div className="pointer-events-none absolute -bottom-24 -left-10 h-72 w-72 rounded-full bg-black/10" />
          <h2 className="relative text-4xl font-extrabold tracking-tight sm:text-5xl">Votre talent mérite d'être vu.</h2>
          <p className="relative mx-auto mt-4 max-w-xl text-lg text-primary-foreground/85">Créez votre page maintenant. Vos prochains clients vous cherchent déjà sur leur téléphone.</p>
          <div className="relative mt-8 flex justify-center">
            <MetierSearch size="md" />
          </div>
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}
