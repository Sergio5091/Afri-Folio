import { useCallback, useEffect, useMemo, useState, type CSSProperties } from "react";
import {
  ChevronLeft, ChevronRight, Contact, Github, Globe, Instagram, Facebook, Linkedin, Mail, MessageCircle,
  MessageSquareText, Music2, Phone, Share2, Twitter, X, Youtube, Check, Loader2, MapPin, Clock,
} from "lucide-react";
import { useSendLead } from "@workspace/api-client-react";
import { getTemplate, loadFonts, luminance, readableOn, withAlpha, type TemplateId } from "@/lib/templates";
import { getProfession } from "@/lib/professions";
import { buildVCard, telLink, visibleBlocks, whatsappLink, type PortfolioData } from "@/lib/portfolio";
import { PortfolioContext, type PortfolioCtx, type PortfolioMode } from "./context";
import { HEROES } from "./heroes";
import { BlockSection, sectionTitle } from "./blocks";
import { Avatar, Reveal, Section, SectionHeading } from "./ui";

// ── Couleurs ────────────────────────────────────────────────
function mix(hex: string, target: string, t: number) {
  const p = (h: string) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16));
  const [a, b] = [p(hex), p(target)];
  const c = a.map((v, i) => Math.round(v + (b[i] - v) * t));
  return `#${c.map((v) => v.toString(16).padStart(2, "0")).join("")}`;
}

function themeVars(tpl: TemplateId, primary: string, displayFont?: string | null): CSSProperties {
  const meta = getTemplate(tpl);
  const bgLum = luminance(meta.palette.bg);
  const pLum = luminance(primary);
  // Version lisible de la couleur principale quand elle sert de couleur de texte
  let strong = primary;
  if (bgLum > 0.5 && pLum > 0.35) strong = mix(primary, "#000000", 0.45);
  if (bgLum < 0.2 && pLum < 0.1) strong = mix(primary, "#FFFFFF", 0.5);
  return {
    "--pf-bg": meta.palette.bg,
    "--pf-fg": meta.palette.fg,
    "--pf-muted": meta.palette.muted,
    "--pf-surface": meta.palette.surface,
    "--pf-surface2": meta.palette.surface2,
    "--pf-border": meta.palette.border,
    "--pf-primary": primary,
    "--pf-primary-strong": strong,
    "--pf-primary-soft": withAlpha(primary, meta.dark ? 0.18 : 0.12),
    "--pf-on-primary": readableOn(primary),
    "--pf-radius": `${meta.radius}px`,
    "--pf-display": `"${displayFont || meta.displayFont}", ${/Serif|Fraunces|Playfair|Lora|Cormorant/.test(displayFont || meta.displayFont) ? "Georgia, serif" : "system-ui, sans-serif"}`,
    "--pf-body": `"${meta.bodyFont}", system-ui, sans-serif`,
  } as CSSProperties;
}

// ── Visionneuse photo ───────────────────────────────────────
function Lightbox({ images, index, onClose }: { images: { url: string; caption?: string }[]; index: number; onClose: () => void }) {
  const [i, setI] = useState(index);
  const [touchX, setTouchX] = useState<number | null>(null);
  const prev = useCallback(() => setI((v) => (v - 1 + images.length) % images.length), [images.length]);
  const next = useCallback(() => setI((v) => (v + 1) % images.length), [images.length]);
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowLeft") prev();
      if (e.key === "ArrowRight") next();
    };
    document.addEventListener("keydown", onKey);
    const overflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = overflow;
    };
  }, [onClose, prev, next]);
  const img = images[i];
  return (
    <div
      className="fixed inset-0 z-[100] flex flex-col bg-black/95 text-white"
      role="dialog"
      aria-modal="true"
      onTouchStart={(e) => setTouchX(e.touches[0].clientX)}
      onTouchEnd={(e) => {
        if (touchX == null) return;
        const dx = e.changedTouches[0].clientX - touchX;
        if (Math.abs(dx) > 50) (dx > 0 ? prev : next)();
        setTouchX(null);
      }}
    >
      <div className="flex items-center justify-between p-4 text-sm">
        <span className="text-white/70">{i + 1} / {images.length}</span>
        <button onClick={onClose} className="rounded-full p-2 hover:bg-white/10" aria-label="Fermer">
          <X className="h-6 w-6" />
        </button>
      </div>
      <div className="relative flex flex-1 items-center justify-center px-4 pb-4" onClick={onClose}>
        <img src={img.url} alt={img.caption ?? ""} className="max-h-full max-w-full object-contain" onClick={(e) => e.stopPropagation()} />
        {images.length > 1 && (
          <>
            <button onClick={(e) => { e.stopPropagation(); prev(); }} className="absolute left-2 top-1/2 hidden -translate-y-1/2 rounded-full bg-white/10 p-3 hover:bg-white/20 sm:block" aria-label="Précédente">
              <ChevronLeft className="h-6 w-6" />
            </button>
            <button onClick={(e) => { e.stopPropagation(); next(); }} className="absolute right-2 top-1/2 hidden -translate-y-1/2 rounded-full bg-white/10 p-3 hover:bg-white/20 sm:block" aria-label="Suivante">
              <ChevronRight className="h-6 w-6" />
            </button>
          </>
        )}
      </div>
      {img.caption && <p className="px-4 pb-6 text-center text-sm text-white/80">{img.caption}</p>}
    </div>
  );
}

// ── Formulaire de message ───────────────────────────────────
function LeadForm({ username, mode, onClose, name }: { username: string; mode: PortfolioMode; onClose: () => void; name: string }) {
  const [form, setForm] = useState({ name: "", phone: "", message: "", website: "" });
  const [error, setError] = useState<string | null>(null);
  const send = useSendLead(username, {
    onError: (e) => setError(e.message),
  });
  const disabled = mode !== "public";
  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (disabled) return;
    send.mutate({ name: form.name, phone: form.phone, message: form.message, website: form.website });
  };
  const input = "w-full rounded-[calc(var(--pf-radius)*0.6)] border border-[var(--pf-border)] bg-[var(--pf-bg)] px-4 py-3 text-[15px] outline-none focus:border-[var(--pf-primary)]";
  return (
    <div className="fixed inset-0 z-[90] flex items-end justify-center bg-black/50 p-0 backdrop-blur-sm sm:items-center sm:p-4" onClick={onClose}>
      <div className="w-full max-w-md rounded-t-[calc(var(--pf-radius)*1.2)] bg-[var(--pf-surface)] p-6 text-[var(--pf-fg)] shadow-2xl sm:rounded-[calc(var(--pf-radius)*1.2)]" onClick={(e) => e.stopPropagation()}>
        <div className="mb-5 flex items-start justify-between gap-4">
          <div>
            <h3 className="pf-display text-xl font-semibold">Laisser un message</h3>
            <p className="mt-1 text-sm pf-muted">{name} vous recontacte rapidement.</p>
          </div>
          <button onClick={onClose} className="rounded-full p-1.5 hover:bg-[var(--pf-surface2)]" aria-label="Fermer">
            <X className="h-5 w-5" />
          </button>
        </div>
        {send.isSuccess ? (
          <div className="py-8 text-center">
            <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-500/15 text-emerald-600">
              <Check className="h-7 w-7" />
            </span>
            <p className="mt-4 font-semibold">Message envoyé !</p>
            <p className="mt-1 text-sm pf-muted">Vous serez recontacté(e) très bientôt.</p>
            <button onClick={onClose} className="pf-btn pf-btn-ghost mt-6">Fermer</button>
          </div>
        ) : (
          <form onSubmit={submit} className="space-y-3">
            <input required minLength={2} placeholder="Votre nom" className={input} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            <input required type="tel" placeholder="Votre numéro (WhatsApp)" className={input} value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
            <textarea required minLength={5} rows={4} placeholder="Votre besoin, vos dates, votre budget..." className={input} value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} />
            {/* Champ piège anti-robot */}
            <input tabIndex={-1} autoComplete="off" className="hidden" value={form.website} onChange={(e) => setForm({ ...form, website: e.target.value })} aria-hidden />
            {error && <p className="text-sm text-red-500">{error}</p>}
            {disabled && <p className="text-sm pf-muted">Aperçu : le formulaire fonctionnera sur votre page publique.</p>}
            <button type="submit" disabled={disabled || send.isPending} className="pf-btn pf-btn-primary w-full justify-center !py-3.5 disabled:opacity-60">
              {send.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <MessageSquareText className="h-4 w-4" />} Envoyer
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

// ============================================================
// Portfolio complet
// ============================================================
export interface PortfolioViewProps {
  data: PortfolioData;
  mode?: PortfolioMode;
  /** Remplace le template du profil (aperçu dans l'éditeur, exemples) */
  templateOverride?: TemplateId;
  onTrack?: (type: string) => void;
}

export function PortfolioView({ data, mode = "public", templateOverride, onTrack }: PortfolioViewProps) {
  const { profile } = data;
  const profession = getProfession(profile.profession);
  const tpl = (templateOverride ?? profile.template ?? profession.template) as TemplateId;
  const meta = getTemplate(tpl);
  const primary = profile.primaryColor && /^#[0-9a-f]{6}$/i.test(profile.primaryColor) ? profile.primaryColor : meta.defaultColor;

  useEffect(() => {
    loadFonts([meta.displayFont, meta.bodyFont, profile.fontFamily]);
  }, [meta.displayFont, meta.bodyFont, profile.fontFamily]);

  const [lightbox, setLightbox] = useState<{ images: { url: string; caption?: string }[]; index: number } | null>(null);
  const [leadOpen, setLeadOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  const publicUrl = typeof window !== "undefined" ? `${window.location.origin}/${data.username}` : `/${data.username}`;
  const signupUrl = `/inscription?metier=${profession.id}`;

  const track = useCallback((type: string) => {
    if (mode === "public") onTrack?.(type);
  }, [mode, onTrack]);

  const ctx: PortfolioCtx = useMemo(
    () => ({
      tpl,
      meta,
      profile,
      profession,
      primary,
      mode,
      username: data.username,
      plan: data.plan,
      whatsapp: (message?: string) => {
        // Sur les exemples, les boutons mènent à l'inscription
        if (mode === "demo") return signupUrl;
        return whatsappLink(profile.whatsapp, message);
      },
      track,
      openLightbox: (images, index) => setLightbox({ images, index }),
      openLeadForm: () => setLeadOpen(true),
    }),
    [tpl, meta, profile, profession, primary, mode, data.username, data.plan, track, signupUrl]
  );

  const allBlocks = visibleBlocks(data.blocks);
  // Les héros Atelier et Studio affichent déjà les chiffres clés
  const blocks = tpl === "atelier" || tpl === "studio" ? allBlocks.filter((b) => b.type !== "stats") : allBlocks;
  const Hero = HEROES[tpl] ?? HEROES.atelier;
  const first = blocks[0];
  const firstAnchor = first ? `#s-${first.type}-0` : undefined;
  const firstLabel = first ? (first.type === "menu" ? "Voir la carte" : first.type === "offers" ? "Voir les offres" : first.type === "projects" ? "Voir les projets" : first.type === "services" ? "Voir les tarifs" : "Voir mon travail") : undefined;

  // Les templates visuels montrent les images avant le texte
  const aboutAfterFirst = tpl === "galerie";
  const wa = ctx.whatsapp(profession.cta.message);
  const tel = mode === "demo" ? null : telLink(profile.whatsapp);

  const onWhatsApp = () => track("whatsapp");
  const share = async () => {
    track("share");
    const payload = { title: profile.fullName ?? "Portfolio", text: profile.tagline ?? profile.title ?? "", url: publicUrl };
    try {
      if (navigator.share) await navigator.share(payload);
      else {
        await navigator.clipboard.writeText(publicUrl);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }
    } catch {
      /* partage annulé */
    }
  };
  const downloadVCard = () => {
    track("vcard");
    const blob = new Blob([buildVCard(profile, publicUrl)], { type: "text/vcard" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `${(profile.fullName ?? "contact").replace(/\s+/g, "-")}.vcf`;
    a.click();
    URL.revokeObjectURL(a.href);
  };

  // Navigation : jusqu'à 4 sections
  const navLinks = [
    ...blocks.slice(0, 4).map((b, i) => ({ href: `#s-${b.type}-${i}`, label: sectionTitle(b, tpl, profession.blockTitles) })),
    { href: "#contact", label: "Contact" },
  ];

  const about = profile.bio ? (
    <Section id="a-propos" alt={tpl !== "galerie"}>
      <div className={`grid items-center gap-10 ${["table", "galerie", "studio", "chantier"].includes(tpl) ? "@3xl:grid-cols-[0.8fr_1.2fr]" : ""}`}>
        {["table", "galerie", "studio", "chantier"].includes(tpl) && (
          <Reveal>
            <Avatar className="mx-auto aspect-[4/5] w-full max-w-xs" rounded="rounded-[var(--pf-radius)]" />
          </Reveal>
        )}
        <Reveal className={["table", "galerie", "studio", "chantier"].includes(tpl) ? "" : "mx-auto max-w-3xl"}>
          <SectionHeading
            title={tpl === "table" ? "Notre histoire" : tpl === "studio" ? "À propos" : tpl === "cabinet" ? "Présentation" : "Qui suis-je ?"}
            eyebrow={tpl === "cabinet" ? undefined : "À propos"}
            center={tpl === "atelier" || tpl === "scene"}
          />
          <div className={`space-y-4 text-lg leading-relaxed ${tpl === "atelier" || tpl === "scene" ? "text-center" : ""}`}>
            {profile.bio.split(/\n\s*\n/).map((p, i) => (
              <p key={i} className={i === 0 ? "" : "pf-muted"}>{p}</p>
            ))}
          </div>
          <div className={`mt-6 flex flex-wrap gap-2 text-sm ${tpl === "atelier" || tpl === "scene" ? "justify-center" : ""}`}>
            {(profile.city || profile.country) && (
              <span className="inline-flex items-center gap-1.5 rounded-full border border-[var(--pf-border)] px-3 py-1.5">
                <MapPin className="h-3.5 w-3.5 text-[var(--pf-primary-strong)]" /> {[profile.city, profile.country].filter(Boolean).join(", ")}
              </span>
            )}
            {profile.yearsExperience ? (
              <span className="inline-flex items-center gap-1.5 rounded-full border border-[var(--pf-border)] px-3 py-1.5">
                <Clock className="h-3.5 w-3.5 text-[var(--pf-primary-strong)]" /> {profile.yearsExperience} an{profile.yearsExperience > 1 ? "s" : ""} d'expérience
              </span>
            ) : null}
          </div>
        </Reveal>
      </div>
    </Section>
  ) : null;

  const socials = [
    profile.linkedin && { href: profile.linkedin, icon: Linkedin, label: "LinkedIn" },
    profile.github && { href: profile.github, icon: Github, label: "GitHub" },
    profile.twitter && { href: profile.twitter, icon: Twitter, label: "X / Twitter" },
    profile.instagram && { href: profile.instagram, icon: Instagram, label: "Instagram" },
    profile.facebook && { href: profile.facebook, icon: Facebook, label: "Facebook" },
    profile.youtube && { href: profile.youtube, icon: Youtube, label: "YouTube" },
    profile.tiktok && { href: profile.tiktok, icon: Music2, label: "TikTok" },
    profile.website && { href: profile.website, icon: Globe, label: "Site web" },
  ].filter(Boolean) as { href: string; icon: typeof Globe; label: string }[];

  const contactTitle: Record<TemplateId, string> = {
    atelier: "Parlons de votre projet",
    chantier: "Besoin d'une intervention ?",
    table: "Réservez ou commandez",
    galerie: "Travaillons ensemble",
    cabinet: "Prendre rendez-vous",
    studio: "Un projet en tête ?",
    scene: "Prêt(e) à commencer ?",
  };

  const navStyle: CSSProperties =
    tpl === "chantier"
      ? { background: "#0F172A", color: "#fff", borderColor: "rgba(255,255,255,0.08)" }
      : { background: `color-mix(in srgb, ${meta.palette.bg} 88%, transparent)` };

  return (
    <PortfolioContext.Provider value={ctx}>
      <div className={`pf-root @container relative min-h-full tpl-${tpl}`} style={themeVars(tpl, primary, profile.fontFamily)}>
        {/* ── Navigation ── */}
        <nav className="sticky top-0 z-40 border-b border-[var(--pf-border)] backdrop-blur-md" style={navStyle}>
          <div className="mx-auto flex h-14 max-w-6xl items-center justify-between gap-4 px-5 @2xl:px-8">
            <a href="#" className="flex min-w-0 items-center gap-2.5 font-semibold" onClick={(e) => { e.preventDefault(); (e.currentTarget.closest(".pf-root")?.parentElement ?? window).scrollTo({ top: 0, behavior: "smooth" }); }}>
              {profile.logoUrl ? (
                <img src={profile.logoUrl} alt="" className="h-7 w-auto" />
              ) : (
                <Avatar className="h-8 w-8 text-sm" />
              )}
              <span className="truncate pf-display">{profile.fullName}</span>
              {data.plan === "premium" && <span title="Profil Pro vérifié" className="text-[var(--pf-primary-strong)]">✓</span>}
            </a>
            <div className="hidden items-center gap-6 text-sm @4xl:flex">
              {navLinks.map((l) => (
                <a key={l.href} href={l.href} className="opacity-70 transition-opacity hover:opacity-100">
                  {l.label}
                </a>
              ))}
            </div>
            {wa && (
              <a href={wa} target={mode === "demo" ? undefined : "_blank"} rel="noreferrer" onClick={onWhatsApp} className="pf-btn pf-btn-primary shrink-0 !px-4 !py-2 text-sm">
                <MessageCircle className="h-4 w-4" /> <span className="hidden @md:inline">{profession.cta.label}</span><span className="@md:hidden">Contact</span>
              </a>
            )}
          </div>
        </nav>

        <div onClickCapture={(e) => {
          // Suivi des clics WhatsApp où qu'ils soient dans la page
          const a = (e.target as HTMLElement).closest("a");
          if (a?.href.includes("wa.me")) onWhatsApp();
        }}>
          <Hero blocks={allBlocks} firstAnchor={firstAnchor} firstLabel={firstLabel} />

          {!aboutAfterFirst && about}
          {blocks.map((b, i) => (
            <div key={`${b.type}-${i}`}>
              <BlockSection block={b} index={i} alt={tpl === "galerie" ? false : (i + (aboutAfterFirst ? 0 : 1)) % 2 === 1} />
              {aboutAfterFirst && i === 0 && about}
            </div>
          ))}
          {aboutAfterFirst && blocks.length === 0 && about}

          {/* ── Contact ── */}
          <section id="contact" className="scroll-mt-16 px-5 py-16 @2xl:px-8 @2xl:py-24">
            <div
              className="mx-auto max-w-5xl overflow-hidden rounded-[calc(var(--pf-radius)*1.5)] p-8 @2xl:p-14"
              style={{ background: tpl === "chantier" ? "#0F172A" : "var(--pf-primary)", color: tpl === "chantier" ? "#fff" : "var(--pf-on-primary)" }}
            >
              <div className="grid gap-10 @3xl:grid-cols-[1.2fr_1fr] @3xl:items-center">
                <div>
                  <h2 className="pf-display text-3xl font-bold leading-tight @2xl:text-5xl">{contactTitle[tpl]}</h2>
                  <p className="mt-4 max-w-md opacity-80">
                    Écrivez-moi sur WhatsApp : je réponds rapidement.
                    {profile.city && ` Basé(e) à ${profile.city}.`}
                  </p>
                  {socials.length > 0 && (
                    <div className="mt-6 flex gap-2">
                      {socials.map((s) => (
                        <a key={s.href} href={s.href} target="_blank" rel="noreferrer" aria-label={s.label} className="flex h-10 w-10 items-center justify-center rounded-full border border-current/20 opacity-80 transition-opacity hover:opacity-100" style={{ borderColor: "currentColor" }}>
                          <s.icon className="h-4 w-4" />
                        </a>
                      ))}
                    </div>
                  )}
                </div>
                <div className="grid gap-3">
                  {wa && (
                    <a href={wa} target={mode === "demo" ? undefined : "_blank"} rel="noreferrer" className="flex items-center justify-center gap-2 rounded-full bg-[#25D366] px-6 py-4 font-semibold text-white shadow-lg transition-transform hover:-translate-y-0.5">
                      <MessageCircle className="h-5 w-5" /> {profession.cta.label}
                    </a>
                  )}
                  <div className="grid grid-cols-2 gap-3">
                    {tel && (
                      <a href={tel} onClick={() => track("call")} className="flex items-center justify-center gap-2 rounded-full bg-black/15 px-4 py-3 text-sm font-semibold backdrop-blur transition-colors hover:bg-black/25">
                        <Phone className="h-4 w-4" /> Appeler
                      </a>
                    )}
                    {profile.emailContact && mode !== "demo" && (
                      <a href={`mailto:${profile.emailContact}`} onClick={() => track("email")} className="flex items-center justify-center gap-2 rounded-full bg-black/15 px-4 py-3 text-sm font-semibold backdrop-blur transition-colors hover:bg-black/25">
                        <Mail className="h-4 w-4" /> Email
                      </a>
                    )}
                    <button onClick={() => setLeadOpen(true)} className="flex items-center justify-center gap-2 rounded-full bg-black/15 px-4 py-3 text-sm font-semibold backdrop-blur transition-colors hover:bg-black/25">
                      <MessageSquareText className="h-4 w-4" /> Message
                    </button>
                    <button onClick={downloadVCard} className="flex items-center justify-center gap-2 rounded-full bg-black/15 px-4 py-3 text-sm font-semibold backdrop-blur transition-colors hover:bg-black/25">
                      <Contact className="h-4 w-4" /> Enregistrer
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* ── Pied de page ── */}
          <footer className="border-t border-[var(--pf-border)] px-5 py-8 pb-28 text-sm @3xl:pb-8 @2xl:px-8">
            <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-3 @2xl:flex-row">
              <p className="pf-muted">© {new Date().getFullYear()} {profile.fullName}</p>
              <button onClick={share} className="inline-flex items-center gap-1.5 pf-muted hover:text-[var(--pf-fg)]">
                <Share2 className="h-4 w-4" /> {copied ? "Lien copié !" : "Partager cette page"}
              </button>
              {data.plan !== "premium" && (
                <a href={`/inscription?src=portfolio&metier=${profession.id}`} className="pf-muted hover:text-[var(--pf-fg)]">
                  Créé avec <strong className="font-semibold text-[var(--pf-fg)]">AfriFolio</strong> · Créez le vôtre
                </a>
              )}
            </div>
          </footer>
        </div>

        {/* ── Barre d'action mobile ── */}
        {wa && (
          <div className="sticky bottom-0 z-40 border-t border-[var(--pf-border)] p-3 @3xl:hidden" style={{ background: `color-mix(in srgb, ${meta.palette.bg} 92%, transparent)`, backdropFilter: "blur(12px)" }}>
            <div className="flex gap-2">
              <a href={wa} target={mode === "demo" ? undefined : "_blank"} rel="noreferrer" onClick={onWhatsApp} className="flex flex-1 items-center justify-center gap-2 rounded-full bg-[#25D366] py-3.5 text-[15px] font-semibold text-white">
                <MessageCircle className="h-5 w-5" /> {profession.cta.label}
              </a>
              {tel && (
                <a href={tel} onClick={() => track("call")} aria-label="Appeler" className="flex w-12 items-center justify-center rounded-full border border-[var(--pf-border)] bg-[var(--pf-surface)]">
                  <Phone className="h-5 w-5" />
                </a>
              )}
              <button onClick={share} aria-label="Partager" className="flex w-12 items-center justify-center rounded-full border border-[var(--pf-border)] bg-[var(--pf-surface)]">
                {copied ? <Check className="h-5 w-5" /> : <Share2 className="h-5 w-5" />}
              </button>
            </div>
          </div>
        )}

        {lightbox && <Lightbox images={lightbox.images} index={lightbox.index} onClose={() => setLightbox(null)} />}
        {leadOpen && <LeadForm username={data.username} mode={mode} name={profile.fullName ?? ""} onClose={() => setLeadOpen(false)} />}
      </div>
    </PortfolioContext.Provider>
  );
}
