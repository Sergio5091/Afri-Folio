import { useEffect, useRef, useState, type ReactNode } from "react";
import { Star } from "lucide-react";
import { usePortfolio } from "./context";

// Éléments en attente d'apparition. En plus de l'IntersectionObserver, un
// contrôle au défilement révèle ceux qu'on a dépassés d'un coup (défilement
// rapide) : aucun contenu ne doit rester invisible.
const pendingReveals = new Set<() => void>();
let revealListener = false;
function watchScroll() {
  if (revealListener || typeof window === "undefined") return;
  revealListener = true;
  let ticking = false;
  const check = () => {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(() => {
      pendingReveals.forEach((fn) => fn());
      ticking = false;
    });
  };
  window.addEventListener("scroll", check, { passive: true, capture: true });
  window.addEventListener("resize", check, { passive: true });
}

/** Apparition douce au défilement */
export function Reveal({ children, delay = 0, className = "" }: { children: ReactNode; delay?: number; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (!("IntersectionObserver" in window)) {
      setVisible(true);
      return;
    }
    const show = () => {
      setVisible(true);
      obs.disconnect();
      pendingReveals.delete(check);
    };
    const check = () => {
      if (el.getBoundingClientRect().top < window.innerHeight * 0.95) show();
    };
    const obs = new IntersectionObserver(([e]) => e.isIntersecting && show(), { threshold: 0.08 });
    obs.observe(el);
    pendingReveals.add(check);
    watchScroll();
    check();
    return () => {
      obs.disconnect();
      pendingReveals.delete(check);
    };
  }, []);
  return (
    <div
      ref={ref}
      className={`transition-all duration-700 ease-out motion-reduce:transition-none ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"} ${className}`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {children}
    </div>
  );
}

export function Stars({ value = 5, size = 14 }: { value?: number; size?: number }) {
  return (
    <div className="flex gap-0.5" aria-label={`${value} sur 5`}>
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          style={{ width: size, height: size }}
          className={i < value ? "fill-[#F5B400] text-[#F5B400]" : "text-[var(--pf-border)]"}
        />
      ))}
    </div>
  );
}

export function initials(name?: string | null) {
  return (name ?? "?")
    .split(/\s+/)
    .filter(Boolean)
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

/** Photo de profil ou initiales */
export function Avatar({ className = "", rounded = "rounded-full" }: { className?: string; rounded?: string }) {
  const { profile } = usePortfolio();
  if (profile.photoUrl) {
    return <img src={profile.photoUrl} alt={profile.fullName ?? ""} className={`object-cover ${rounded} ${className}`} />;
  }
  return (
    <div
      className={`flex items-center justify-center font-bold pf-display ${rounded} ${className}`}
      style={{ background: "var(--pf-primary)", color: "var(--pf-on-primary)" }}
    >
      <span className="text-[40%]">{initials(profile.fullName)}</span>
    </div>
  );
}

/** Titre de section, stylé selon le template */
export function SectionHeading({ title, eyebrow, index, center }: { title: string; eyebrow?: string; index?: number; center?: boolean }) {
  const { tpl } = usePortfolio();

  switch (tpl) {
    case "chantier":
      return (
        <div className="mb-8 flex items-center gap-3">
          <span className="h-8 w-1.5 rounded-sm" style={{ background: "var(--pf-primary)" }} />
          <h2 className="pf-display text-2xl @2xl:text-3xl font-extrabold uppercase tracking-tight">{title}</h2>
        </div>
      );
    case "table":
      return (
        <div className="mb-10 text-center">
          <div className="mb-3 flex items-center justify-center gap-3 text-[var(--pf-primary-strong)]">
            <span className="h-px w-10 bg-current opacity-60" />
            <span className="text-xs">✦</span>
            <span className="h-px w-10 bg-current opacity-60" />
          </div>
          <h2 className="pf-display text-3xl @2xl:text-5xl italic">{title}</h2>
        </div>
      );
    case "galerie":
      return (
        <div className="mb-8 flex items-baseline justify-between gap-4 border-t border-[var(--pf-fg)] pt-4">
          <h2 className="pf-display text-3xl @2xl:text-5xl font-bold tracking-tight">{title}</h2>
          {index != null && <span className="font-mono text-sm pf-muted">{String(index).padStart(2, "0")}</span>}
        </div>
      );
    case "cabinet":
      return (
        <div className={`mb-8 ${center ? "text-center" : ""}`}>
          <span className="mb-3 block h-0.5 w-10 rounded-full" style={{ background: "var(--pf-primary)", marginInline: center ? "auto" : undefined }} />
          <h2 className="pf-display text-2xl @2xl:text-4xl font-semibold">{title}</h2>
          {eyebrow && <p className="mt-2 pf-muted">{eyebrow}</p>}
        </div>
      );
    case "studio":
      return (
        <div className="mb-10">
          <p className="mb-2 font-mono text-xs uppercase tracking-[0.2em] text-[var(--pf-primary-strong)]">
            // {eyebrow ?? title}
          </p>
          <h2 className="pf-display text-3xl @2xl:text-4xl font-semibold tracking-tight">{title}</h2>
        </div>
      );
    case "scene":
      return (
        <div className={`mb-10 ${center ? "text-center" : ""}`}>
          {eyebrow && (
            <span className="mb-4 inline-block rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wider" style={{ background: "var(--pf-primary-soft)", color: "var(--pf-primary-strong)" }}>
              {eyebrow}
            </span>
          )}
          <h2 className="pf-display text-3xl @2xl:text-5xl font-extrabold tracking-tight">{title}</h2>
        </div>
      );
    default: // atelier
      return (
        <div className={`mb-10 ${center ? "text-center" : ""}`}>
          {eyebrow && <p className="mb-2 text-xs font-semibold uppercase tracking-[0.25em] text-[var(--pf-primary-strong)]">{eyebrow}</p>}
          <h2 className="pf-display text-3xl @2xl:text-5xl font-semibold tracking-tight">{title}</h2>
        </div>
      );
  }
}

/** Conteneur de section avec les marges du template */
export function Section({ id, children, alt = false, className = "" }: { id?: string; children: ReactNode; alt?: boolean; className?: string }) {
  const { tpl } = usePortfolio();
  const pad = tpl === "galerie" ? "py-14 @2xl:py-20" : tpl === "chantier" ? "py-12 @2xl:py-16" : "py-16 @2xl:py-24";
  return (
    <section id={id} className={`${pad} scroll-mt-16 ${alt ? "bg-[var(--pf-surface2)]" : ""} ${className}`}>
      <div className="mx-auto w-full max-w-6xl px-5 @2xl:px-8">{children}</div>
    </section>
  );
}

/** Image chargée paresseusement avec fond pendant le chargement */
export function Img({ src, alt = "", className = "", onClick }: { src: string; alt?: string; className?: string; onClick?: () => void }) {
  const [loaded, setLoaded] = useState(false);
  const ref = useRef<HTMLImageElement>(null);
  // Image déjà en cache : l'événement load a pu partir avant le montage
  useEffect(() => {
    if (ref.current?.complete && ref.current.naturalWidth > 0) setLoaded(true);
  }, [src]);
  return (
    <img
      ref={ref}
      src={src}
      alt={alt}
      loading="lazy"
      decoding="async"
      onLoad={() => setLoaded(true)}
      onClick={onClick}
      className={`bg-[var(--pf-surface2)] transition-opacity duration-500 ${loaded ? "opacity-100" : "opacity-0"} ${onClick ? "cursor-zoom-in" : ""} ${className}`}
    />
  );
}
