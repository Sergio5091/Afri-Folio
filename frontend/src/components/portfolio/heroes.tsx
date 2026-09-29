import { ArrowDown, ArrowRight, BadgeCheck, Clock, MapPin, MessageCircle, Phone, ShieldCheck, Sparkles, Star, Wrench } from "lucide-react";
import type { TypedBlock } from "@/lib/blocks";
import { openStatus, telLink } from "@/lib/portfolio";
import { usePortfolio } from "./context";
import { Avatar, Stars } from "./ui";

export interface HeroProps {
  blocks: TypedBlock[];
  /** Ancre de la première section (bouton secondaire) */
  firstAnchor?: string;
  firstLabel?: string;
}

function firstImages(blocks: TypedBlock[], n = 3): string[] {
  const urls: string[] = [];
  for (const b of blocks) {
    if (b.type === "gallery") urls.push(...(b.data as any).items.map((i: any) => i.url).filter(Boolean));
    if (b.type === "projects") urls.push(...(b.data as any).items.map((i: any) => i.image).filter(Boolean));
    if (b.type === "menu") for (const c of (b.data as any).categories) urls.push(...c.items.map((i: any) => i.image).filter(Boolean));
    if (b.type === "beforeAfter") urls.push(...(b.data as any).items.map((i: any) => i.after).filter(Boolean));
  }
  return urls.slice(0, n);
}

const findBlock = (blocks: TypedBlock[], type: string) => blocks.find((b) => b.type === type);

function useHero(blocks: TypedBlock[]) {
  const { profile, profession, whatsapp, track } = usePortfolio();
  const place = [profile.city, profile.country].filter(Boolean).join(", ");
  const hours = findBlock(blocks, "hours");
  const status = hours ? openStatus((hours.data as any).days) : null;
  const tel = telLink(profile.whatsapp);
  const wa = whatsapp(profession.cta.message);
  const stats = (findBlock(blocks, "stats")?.data as any)?.items?.filter((s: any) => s.value && s.label) ?? [];
  const testimonial = (findBlock(blocks, "testimonials")?.data as any)?.items?.find((t: any) => t.text);
  const title = profile.title || profession.title;
  return { profile, profession, place, status, tel, wa, stats, testimonial, title, track };
}

function WhatsAppButton({ wa, label, className = "" }: { wa: string | null; label: string; className?: string }) {
  if (!wa) return null;
  return (
    <a href={wa} target="_blank" rel="noreferrer" className={`pf-btn pf-btn-primary ${className}`}>
      <MessageCircle className="h-4 w-4" /> {label}
    </a>
  );
}

// ============================================================
// ATELIER — papier, arche, collage de réalisations
// ============================================================
export function HeroAtelier({ blocks, firstAnchor, firstLabel }: HeroProps) {
  const { profile, place, wa, profession, title, stats } = useHero(blocks);
  const imgs = firstImages(blocks, 2);
  return (
    <header className="relative overflow-hidden">
      <div className="mx-auto grid max-w-6xl items-center gap-12 px-5 pb-16 pt-10 @2xl:px-8 @4xl:grid-cols-[1.1fr_0.9fr] @4xl:pb-24 @4xl:pt-16">
        <div className="order-2 @4xl:order-1">
          <p className="mb-5 inline-flex items-center gap-2 rounded-full border border-[var(--pf-border)] bg-[var(--pf-surface)] px-3.5 py-1.5 text-xs font-medium">
            <span>{profession.emoji}</span> {title}
            {place && <span className="pf-muted">· {profile.city || place}</span>}
          </p>
          <h1 className="pf-display text-[clamp(2.6rem,9cqw,5.2rem)] font-semibold leading-[0.95] tracking-tight">{profile.fullName}</h1>
          {profile.tagline && <p className="pf-display mt-5 max-w-lg text-xl italic text-[var(--pf-primary-strong)] @2xl:text-2xl">{profile.tagline}</p>}
          <div className="mt-8 flex flex-wrap gap-3">
            <WhatsAppButton wa={wa} label={profession.cta.label} />
            {firstAnchor && (
              <a href={firstAnchor} className="pf-btn pf-btn-ghost">
                {firstLabel ?? "Voir mon travail"} <ArrowDown className="h-4 w-4" />
              </a>
            )}
          </div>
          {stats.length > 0 && (
            <dl className="mt-10 flex gap-8">
              {stats.slice(0, 3).map((s: any, i: number) => (
                <div key={i}>
                  <dt className="pf-display text-3xl font-semibold">{s.value}</dt>
                  <dd className="text-xs pf-muted">{s.label}</dd>
                </div>
              ))}
            </dl>
          )}
        </div>
        <div className="relative order-1 mx-auto w-full max-w-sm @4xl:order-2 @4xl:max-w-none">
          <div className="relative mx-auto aspect-[4/5] w-[78%]">
            <Avatar className="h-full w-full" rounded="rounded-t-full rounded-b-[var(--pf-radius)]" />
            {profile.availableForWork && (
              <span className="absolute -left-4 top-10 rotate-[-6deg] rounded-full bg-[var(--pf-surface)] px-3 py-1.5 text-xs font-semibold shadow-lg">
                <span className="mr-1.5 inline-block h-2 w-2 rounded-full bg-emerald-500" />
                Prend des commandes
              </span>
            )}
          </div>
          {imgs[0] && (
            <img src={imgs[0]} alt="" className="absolute -bottom-6 -left-2 w-[38%] rotate-[-5deg] rounded-[var(--pf-radius)] border-4 border-[var(--pf-surface)] object-cover shadow-xl aspect-square" />
          )}
          {imgs[1] && (
            <img src={imgs[1]} alt="" className="absolute -right-2 bottom-16 w-[32%] rotate-[6deg] rounded-[var(--pf-radius)] border-4 border-[var(--pf-surface)] object-cover shadow-xl aspect-[3/4]" />
          )}
        </div>
      </div>
    </header>
  );
}

// ============================================================
// CHANTIER — bandeau sombre, appel en 1 geste, badges de confiance
// ============================================================
export function HeroChantier({ blocks }: HeroProps) {
  const { profile, place, wa, tel, title, stats, status, track } = useHero(blocks);
  const years = stats.find((s: any) => /an/.test(s.label))?.value;
  return (
    <header className="relative overflow-hidden bg-[#0F172A] text-white">
      <div className="mx-auto grid max-w-6xl items-center gap-10 px-5 py-12 @2xl:px-8 @4xl:grid-cols-[1.2fr_0.8fr] @4xl:py-20">
        <div>
          <div className="mb-6 flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1.5 text-xs font-semibold">
              <span className={`h-2 w-2 rounded-full ${profile.availableForWork ? "bg-emerald-400 animate-pulse" : "bg-amber-400"}`} />
              {profile.availableForWork ? "Disponible · intervention rapide" : "Sur rendez-vous"}
            </span>
            {status && (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1.5 text-xs">
                <Clock className="h-3.5 w-3.5" /> {status.label}
              </span>
            )}
          </div>
          <h1 className="pf-display text-[clamp(2.3rem,8cqw,4.6rem)] font-black uppercase leading-[0.95] tracking-tight">
            {title}
            {profile.city && (
              <>
                <br />
                <span style={{ color: "var(--pf-primary)" }}>à {profile.city}</span>
              </>
            )}
          </h1>
          <div className="mt-6 flex items-center gap-3">
            <Avatar className="h-12 w-12 border-2 border-white/20" />
            <div>
              <p className="font-semibold">{profile.fullName}</p>
              {place && <p className="text-sm text-white/60">{place}</p>}
            </div>
          </div>
          {profile.tagline && <p className="mt-5 max-w-lg text-lg text-white/75">{profile.tagline}</p>}
          <div className="mt-8 grid gap-3 @md:flex">
            {tel && (
              <a href={tel} onClick={() => track("call")} className="pf-btn pf-btn-primary justify-center !py-4 text-base">
                <Phone className="h-5 w-5" /> Appeler maintenant
              </a>
            )}
            {wa && (
              <a href={wa} target="_blank" rel="noreferrer" className="pf-btn justify-center !py-4 text-base bg-[#25D366] text-white hover:bg-[#1ebe5b]">
                <MessageCircle className="h-5 w-5" /> WhatsApp
              </a>
            )}
          </div>
          <ul className="mt-8 flex flex-wrap gap-x-6 gap-y-2 text-sm text-white/80">
            <li className="flex items-center gap-2"><ShieldCheck className="h-4 w-4" style={{ color: "var(--pf-primary)" }} /> Devis gratuit</li>
            <li className="flex items-center gap-2"><Wrench className="h-4 w-4" style={{ color: "var(--pf-primary)" }} /> Travail garanti</li>
            {years && <li className="flex items-center gap-2"><BadgeCheck className="h-4 w-4" style={{ color: "var(--pf-primary)" }} /> {years} ans d'expérience</li>}
          </ul>
        </div>
        <div className="relative hidden @4xl:block">
          <div className="overflow-hidden rounded-[var(--pf-radius)] border border-white/10">
            {firstImages(blocks, 1)[0] ? (
              <img src={firstImages(blocks, 1)[0]} alt="" className="aspect-[4/5] w-full object-cover" />
            ) : (
              <Avatar className="aspect-[4/5] w-full" rounded="rounded-none" />
            )}
          </div>
        </div>
      </div>
      {/* Bande de chantier */}
      <div
        className="h-3 w-full"
        style={{ backgroundImage: "repeating-linear-gradient(-45deg, var(--pf-primary) 0 18px, #0F172A 18px 36px)" }}
      />
    </header>
  );
}

// ============================================================
// TABLE — photo plein écran, ambiance restaurant
// ============================================================
export function HeroTable({ blocks, firstAnchor, firstLabel }: HeroProps) {
  const { profile, wa, profession, status, place } = useHero(blocks);
  const cover = firstImages(blocks, 1)[0] ?? profile.photoUrl;
  return (
    <header className="relative flex min-h-[88svh] items-end overflow-hidden @4xl:items-center">
      {cover && <img src={cover} alt="" className="absolute inset-0 h-full w-full object-cover" />}
      <div className="absolute inset-0 bg-gradient-to-t from-[var(--pf-bg)] via-black/55 to-black/30" />
      <div className="relative mx-auto w-full max-w-4xl px-5 pb-14 pt-32 text-center @2xl:px-8">
        <p className="mb-5 text-xs font-semibold uppercase tracking-[0.35em] text-white/80">
          {profession.title || profile.title} {place && `· ${profile.city || place}`}
        </p>
        <h1 className="pf-display text-[clamp(2.8rem,11cqw,6.5rem)] leading-[0.95] text-white">{profile.fullName}</h1>
        {profile.tagline && <p className="pf-display mx-auto mt-5 max-w-xl text-xl italic text-white/85">{profile.tagline}</p>}
        {status && (
          <p className="mt-6 inline-flex items-center gap-2 rounded-full bg-black/40 px-4 py-2 text-sm text-white backdrop-blur">
            <span className={`h-2 w-2 rounded-full ${status.open ? "bg-emerald-400 animate-pulse" : "bg-red-400"}`} />
            {status.label}
          </p>
        )}
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <WhatsAppButton wa={wa} label={profession.cta.label} />
          {firstAnchor && (
            <a href={firstAnchor} className="pf-btn border border-white/40 text-white hover:bg-white/10">
              {firstLabel ?? "Voir la carte"}
            </a>
          )}
        </div>
      </div>
    </header>
  );
}

// ============================================================
// GALERIE — nom monumental, image de couverture
// ============================================================
export function HeroGalerie({ blocks }: HeroProps) {
  const { profile, wa, profession, place, title } = useHero(blocks);
  const cover = firstImages(blocks, 1)[0];
  // Taille calculée sur le mot le plus long : le nom ne se coupe jamais en plein mot
  const longest = Math.max(4, ...(profile.fullName ?? "").split(/s+/).map((w) => w.length));
  const size = `min(9rem, ${(100 / (longest * 0.92)).toFixed(1)}cqw)`;
  return (
    <header className="mx-auto max-w-[1400px] px-5 pb-6 pt-10 @2xl:px-8">
      <h1 className="pf-display font-extrabold uppercase leading-[0.85] tracking-[-0.04em]" style={{ fontSize: size }}>
        {profile.fullName}
      </h1>
      <div className="mt-6 flex flex-col gap-4 border-t border-[var(--pf-fg)] pt-4 @2xl:flex-row @2xl:items-center @2xl:justify-between">
        <div className="flex flex-wrap items-center gap-x-6 gap-y-1 text-sm">
          <span className="font-semibold uppercase tracking-wider">{title}</span>
          {place && <span className="pf-muted">{place}</span>}
          {profile.tagline && <span className="pf-muted">{profile.tagline}</span>}
        </div>
        {wa && (
          <a href={wa} target="_blank" rel="noreferrer" className="group inline-flex items-center gap-2 text-sm font-bold uppercase tracking-wider">
            {profession.cta.label}
            <span className="flex h-9 w-9 items-center justify-center rounded-full transition-transform group-hover:translate-x-1" style={{ background: "var(--pf-primary)", color: "var(--pf-on-primary)" }}>
              <ArrowRight className="h-4 w-4" />
            </span>
          </a>
        )}
      </div>
      {cover && <img src={cover} alt="" className="mt-8 aspect-[4/5] w-full rounded-[var(--pf-radius)] object-cover @2xl:aspect-[16/8]" />}
    </header>
  );
}

// ============================================================
// CABINET — sobre, informations pratiques, carte de disponibilité
// ============================================================
export function HeroCabinet({ blocks }: HeroProps) {
  const { profile, place, wa, tel, profession, status, title, track } = useHero(blocks);
  const credentials = (findBlock(blocks, "credentials")?.data as any)?.items?.filter((c: any) => c.title) ?? [];
  const hours = (findBlock(blocks, "hours")?.data as any)?.days;
  const today = hours?.find((d: any) => d.day === new Date().getDay());
  return (
    <header className="border-b border-[var(--pf-border)] bg-[var(--pf-surface)]">
      <div className="mx-auto grid max-w-6xl items-center gap-12 px-5 py-12 @2xl:px-8 @4xl:grid-cols-[1.15fr_0.85fr] @4xl:py-20">
        <div>
          <p className="mb-4 inline-flex items-center gap-2 text-sm font-semibold text-[var(--pf-primary-strong)]">
            <span className="flex h-7 w-7 items-center justify-center rounded-full" style={{ background: "var(--pf-primary-soft)" }}>{profession.emoji}</span>
            {title}
          </p>
          <h1 className="pf-display text-[clamp(2.3rem,7cqw,4rem)] font-semibold leading-[1.05]">{profile.fullName}</h1>
          {profile.tagline && <p className="mt-4 max-w-lg text-lg pf-muted">{profile.tagline}</p>}
          <ul className="mt-7 space-y-3 text-sm">
            {place && (
              <li className="flex items-center gap-3"><MapPin className="h-4 w-4 text-[var(--pf-primary-strong)]" /> {place}</li>
            )}
            {status && (
              <li className="flex items-center gap-3">
                <Clock className="h-4 w-4 text-[var(--pf-primary-strong)]" />
                <span className={status.open ? "font-medium text-emerald-600" : ""}>{status.label}</span>
              </li>
            )}
            {credentials[0] && (
              <li className="flex items-center gap-3"><BadgeCheck className="h-4 w-4 text-[var(--pf-primary-strong)]" /> {credentials[0].title}</li>
            )}
          </ul>
          <div className="mt-8 flex flex-wrap gap-3">
            <WhatsAppButton wa={wa} label={profession.cta.label} />
            {tel && (
              <a href={tel} onClick={() => track("call")} className="pf-btn pf-btn-ghost">
                <Phone className="h-4 w-4" /> Appeler
              </a>
            )}
          </div>
        </div>
        <div className="relative mx-auto w-full max-w-sm">
          <Avatar className="aspect-[4/5] w-full" rounded="rounded-[calc(var(--pf-radius)*1.6)]" />
          {today && (
            <div className="absolute -bottom-5 -left-4 right-8 rounded-[var(--pf-radius)] border border-[var(--pf-border)] bg-[var(--pf-surface)] p-4 shadow-xl @4xl:-left-10">
              <p className="text-xs font-semibold uppercase tracking-wider pf-muted">Aujourd'hui</p>
              <p className="mt-1 font-semibold">
                {today.open ? `${today.from.replace(":", "h")} – ${today.to.replace(":", "h")}` : "Fermé — prenez rendez-vous"}
              </p>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

// ============================================================
// STUDIO — sombre, grille, halo de couleur
// ============================================================
export function HeroStudio({ blocks, firstAnchor, firstLabel }: HeroProps) {
  const { profile, wa, profession, title, place, stats } = useHero(blocks);
  return (
    <header className="relative overflow-hidden">
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.35]"
        style={{
          backgroundImage: "linear-gradient(var(--pf-border) 1px, transparent 1px), linear-gradient(90deg, var(--pf-border) 1px, transparent 1px)",
          backgroundSize: "48px 48px",
          maskImage: "radial-gradient(ellipse at 30% 20%, black 20%, transparent 70%)",
        }}
      />
      <div className="pointer-events-none absolute -top-40 left-1/4 h-[480px] w-[480px] rounded-full blur-[120px]" style={{ background: "var(--pf-primary)", opacity: 0.25 }} />
      <div className="relative mx-auto max-w-6xl px-5 pb-16 pt-14 @2xl:px-8 @4xl:pb-24 @4xl:pt-24">
        <div className="flex items-center gap-3">
          <Avatar className="h-12 w-12 ring-2 ring-[var(--pf-border)]" />
          <div>
            <p className="font-semibold">{profile.fullName}</p>
            <p className="text-sm pf-muted">{[title, place].filter(Boolean).join(" · ")}</p>
          </div>
        </div>
        {profile.availableForWork && (
          <p className="mt-8 inline-flex items-center gap-2 rounded-full border border-[var(--pf-border)] bg-[var(--pf-surface)] px-3 py-1 font-mono text-xs">
            <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" /> Disponible pour de nouveaux projets
          </p>
        )}
        <h1 className="pf-display mt-5 max-w-4xl text-[clamp(2.4rem,7.5cqw,5rem)] font-semibold leading-[1.02] tracking-tight">
          {profile.tagline || `${title}.`}
        </h1>
        <div className="mt-9 flex flex-wrap gap-3">
          <WhatsAppButton wa={wa} label={profession.cta.label} />
          {firstAnchor && (
            <a href={firstAnchor} className="pf-btn pf-btn-ghost">
              {firstLabel ?? "Voir les projets"} <ArrowRight className="h-4 w-4" />
            </a>
          )}
        </div>
        {stats.length > 0 && (
          <dl className="mt-14 grid max-w-2xl grid-cols-3 gap-6 border-t border-[var(--pf-border)] pt-6">
            {stats.slice(0, 3).map((s: any, i: number) => (
              <div key={i}>
                <dt className="pf-display text-3xl font-semibold">{s.value}</dt>
                <dd className="mt-1 text-xs pf-muted">{s.label}</dd>
              </div>
            ))}
          </dl>
        )}
      </div>
    </header>
  );
}

// ============================================================
// SCÈNE — grande accroche, portrait, avis flottant
// ============================================================
export function HeroScene({ blocks, firstAnchor, firstLabel }: HeroProps) {
  const { profile, wa, profession, title, place, testimonial, stats } = useHero(blocks);
  return (
    <header className="relative overflow-hidden">
      <div className="mx-auto grid max-w-6xl items-center gap-12 px-5 pb-16 pt-10 @2xl:px-8 @4xl:grid-cols-2 @4xl:pb-24 @4xl:pt-16">
        <div>
          <p className="mb-5 inline-flex items-center gap-2 rounded-full px-3.5 py-1.5 text-xs font-bold uppercase tracking-wider" style={{ background: "var(--pf-primary-soft)", color: "var(--pf-primary-strong)" }}>
            <Sparkles className="h-3.5 w-3.5" /> {title}
          </p>
          <h1 className="pf-display text-[clamp(2.5rem,8cqw,4.8rem)] font-extrabold leading-[0.98] tracking-tight">
            {profile.tagline || profile.fullName}
          </h1>
          <p className="mt-5 text-lg pf-muted">
            {profile.tagline ? <>Avec <strong className="text-[var(--pf-fg)]">{profile.fullName}</strong>{place && `, ${place}`}</> : place}
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <WhatsAppButton wa={wa} label={profession.cta.label} />
            {firstAnchor && (
              <a href={firstAnchor} className="pf-btn pf-btn-ghost">
                {firstLabel ?? "Voir les offres"}
              </a>
            )}
          </div>
        </div>
        <div className="relative mx-auto w-full max-w-md">
          <div className="absolute inset-6 rounded-full" style={{ background: "var(--pf-primary)" }} />
          <Avatar className="relative aspect-square w-full" rounded="rounded-[42%_58%_55%_45%/48%_42%_58%_52%]" />
          {testimonial && (
            <div className="absolute -bottom-6 -left-2 max-w-[240px] rounded-[calc(var(--pf-radius)*0.7)] bg-[var(--pf-surface)] p-4 shadow-xl @4xl:-left-10">
              <Stars value={testimonial.rating ?? 5} size={12} />
              <p className="mt-2 line-clamp-3 text-sm">« {testimonial.text} »</p>
              <p className="mt-1.5 text-xs font-semibold pf-muted">— {testimonial.name}</p>
            </div>
          )}
          {stats[0] && (
            <div className="absolute -right-2 top-6 rounded-2xl bg-[var(--pf-surface)] px-4 py-3 text-center shadow-xl">
              <p className="pf-display text-2xl font-extrabold text-[var(--pf-primary-strong)]">{stats[0].value}</p>
              <p className="text-[11px] pf-muted">{stats[0].label}</p>
            </div>
          )}
          {!stats[0] && (
            <div className="absolute -right-2 top-6 flex items-center gap-1 rounded-full bg-[var(--pf-surface)] px-3 py-2 shadow-xl">
              <Star className="h-4 w-4 fill-[#F5B400] text-[#F5B400]" /> <span className="text-sm font-bold">5,0</span>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

export const HEROES = {
  atelier: HeroAtelier,
  chantier: HeroChantier,
  table: HeroTable,
  galerie: HeroGalerie,
  cabinet: HeroCabinet,
  studio: HeroStudio,
  scene: HeroScene,
};
