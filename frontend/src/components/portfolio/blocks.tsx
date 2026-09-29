import { useMemo, useState, type ReactNode } from "react";
import {
  ArrowUpRight, Award, Check, ExternalLink, MapPin, MessageCircle, Play, Plus, Quote, Car,
} from "lucide-react";
import {
  blockTitle, DAY_NAMES, youtubeId, type BlockType, type TypedBlock, type BlockDataMap,
} from "@/lib/blocks";
import { openStatus } from "@/lib/portfolio";
import { usePortfolio } from "./context";
import { Img, Reveal, Section, SectionHeading, Stars } from "./ui";

// ============================================================
// Bouton "Demander" sur une prestation / un plat / une offre
// ============================================================
function AskButton({ label, message, variant = "link" }: { label: string; message: string; variant?: "link" | "button" | "solid" }) {
  const { whatsapp } = usePortfolio();
  const href = whatsapp(message);
  if (!href) return null;
  if (variant === "solid") {
    return (
      <a href={href} target="_blank" rel="noreferrer" className="pf-btn pf-btn-primary w-full justify-center">
        <MessageCircle className="h-4 w-4" /> {label}
      </a>
    );
  }
  if (variant === "button") {
    return (
      <a href={href} target="_blank" rel="noreferrer" className="pf-btn pf-btn-ghost !px-4 !py-2 text-sm">
        {label} <ArrowUpRight className="h-3.5 w-3.5" />
      </a>
    );
  }
  return (
    <a href={href} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-sm font-semibold text-[var(--pf-primary-strong)] hover:underline">
      {label} <ArrowUpRight className="h-3.5 w-3.5" />
    </a>
  );
}

function Price({ price, unit }: { price?: string; unit?: string }) {
  if (!price && !unit) return null;
  const isNumber = price && /\d/.test(price);
  return (
    <span className="whitespace-nowrap text-right">
      {unit && isNumber && unit !== "sur devis" && unit.startsWith("à partir") && (
        <span className="mr-1 text-xs font-normal pf-muted">dès</span>
      )}
      {price && <span className="font-semibold">{price}{isNumber ? " F" : ""}</span>}
      {unit && !(unit.startsWith("à partir") && isNumber) && (
        <span className={`${price ? "ml-1 text-xs" : "text-sm"} font-normal pf-muted`}>{price ? `/ ${unit.replace(/^par /, "")}` : unit}</span>
      )}
    </span>
  );
}

// ============================================================
// Galerie
// ============================================================
function GalleryBlock({ data }: { data: BlockDataMap["gallery"] }) {
  const { tpl, openLightbox } = usePortfolio();
  const items = data.items.filter((i) => i.url);

  if (tpl === "table") {
    return (
      <div className="-mx-5 flex snap-x snap-mandatory gap-4 overflow-x-auto px-5 pb-4 @2xl:-mx-8 @2xl:px-8 [scrollbar-width:none]">
        {items.map((it, i) => (
          <figure key={i} className="w-[78%] shrink-0 snap-start @2xl:w-[38%]">
            <Img src={it.url} alt={it.caption} onClick={() => openLightbox(items, i)} className="aspect-[4/5] w-full rounded-[var(--pf-radius)] object-cover" />
            {it.caption && <figcaption className="mt-2 text-sm pf-muted">{it.caption}</figcaption>}
          </figure>
        ))}
      </div>
    );
  }

  if (tpl === "chantier" || tpl === "cabinet" || tpl === "studio") {
    return (
      <div className="grid grid-cols-2 gap-3 @2xl:grid-cols-3">
        {items.map((it, i) => (
          <Reveal key={i} delay={(i % 6) * 60}>
            <figure className="group relative overflow-hidden rounded-[var(--pf-radius)]">
              <Img src={it.url} alt={it.caption} onClick={() => openLightbox(items, i)} className="aspect-square w-full object-cover transition-transform duration-500 group-hover:scale-105" />
              {it.caption && (
                <figcaption className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent p-3 text-xs font-medium text-white">
                  {it.caption}
                </figcaption>
              )}
            </figure>
          </Reveal>
        ))}
      </div>
    );
  }

  // Mosaïque (atelier, galerie, scène)
  const cols = tpl === "galerie" ? "columns-2 @3xl:columns-3 gap-2 [&>*]:mb-2" : "columns-2 @3xl:columns-3 gap-4 [&>*]:mb-4";
  return (
    <div className={cols}>
      {items.map((it, i) => (
        <figure key={i} className="group relative break-inside-avoid overflow-hidden rounded-[var(--pf-radius)]">
          <Img src={it.url} alt={it.caption} onClick={() => openLightbox(items, i)} className="w-full transition-transform duration-700 group-hover:scale-[1.03]" />
          {it.caption && (
            <figcaption className={tpl === "galerie" ? "mt-1.5 text-xs pf-muted" : "pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/60 to-transparent p-3 text-sm text-white opacity-0 transition-opacity group-hover:opacity-100"}>
              {it.caption}
            </figcaption>
          )}
        </figure>
      ))}
    </div>
  );
}

// ============================================================
// Avant / Après : curseur de comparaison
// ============================================================
function Compare({ before, after, caption }: { before: string; after: string; caption?: string }) {
  const [pos, setPos] = useState(50);
  return (
    <figure>
      <div className="relative aspect-[4/3] select-none overflow-hidden rounded-[var(--pf-radius)] bg-[var(--pf-surface2)]">
        <img src={after} alt="Après" className="absolute inset-0 h-full w-full object-cover" loading="lazy" />
        <img
          src={before}
          alt="Avant"
          className="absolute inset-0 h-full w-full object-cover"
          style={{ clipPath: `inset(0 ${100 - pos}% 0 0)` }}
          loading="lazy"
        />
        <span className="absolute left-3 top-3 rounded-full bg-black/60 px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider text-white">Avant</span>
        <span className="absolute right-3 top-3 rounded-full px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider" style={{ background: "var(--pf-primary)", color: "var(--pf-on-primary)" }}>
          Après
        </span>
        <div className="pointer-events-none absolute inset-y-0 w-0.5 bg-white shadow" style={{ left: `${pos}%` }}>
          <span className="absolute left-1/2 top-1/2 flex h-9 w-9 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-white text-xs font-bold text-black shadow-lg">
            ⇆
          </span>
        </div>
        <input
          type="range"
          min={0}
          max={100}
          value={pos}
          onChange={(e) => setPos(Number(e.target.value))}
          aria-label="Comparer avant et après"
          className="absolute inset-0 h-full w-full cursor-ew-resize opacity-0"
        />
      </div>
      {caption && <figcaption className="mt-2 text-sm pf-muted">{caption}</figcaption>}
    </figure>
  );
}

function BeforeAfterBlock({ data }: { data: BlockDataMap["beforeAfter"] }) {
  const items = data.items.filter((i) => i.before && i.after);
  return (
    <div className={`grid gap-6 ${items.length > 1 ? "@3xl:grid-cols-2" : "max-w-3xl"}`}>
      {items.map((it, i) => (
        <Compare key={i} {...it} />
      ))}
    </div>
  );
}

// ============================================================
// Prestations & tarifs
// ============================================================
function ServicesBlock({ data }: { data: BlockDataMap["services"] }) {
  const { tpl } = usePortfolio();
  const items = data.items.filter((i) => i.name);
  const ask = (name: string) => `Bonjour, je suis intéressé(e) par : ${name}. `;

  if (tpl === "atelier" || tpl === "galerie" || tpl === "table") {
    return (
      <div className="mx-auto max-w-3xl">
        <ul className="divide-y divide-[var(--pf-border)]">
          {items.map((s, i) => (
            <li key={i} className="group py-5">
              <div className="flex items-baseline gap-3">
                <h3 className="pf-display text-lg @2xl:text-xl font-medium">{s.name}</h3>
                <span className="mb-1 flex-1 border-b border-dotted border-[var(--pf-muted)] opacity-50" />
                <Price price={s.price} unit={s.unit} />
              </div>
              {s.description && <p className="mt-1.5 max-w-xl text-sm pf-muted">{s.description}</p>}
              <div className="mt-2 opacity-100 transition-opacity @3xl:opacity-0 @3xl:group-hover:opacity-100">
                <AskButton label="Demander" message={ask(s.name)} />
              </div>
            </li>
          ))}
        </ul>
        {data.note && <p className="mt-6 text-sm pf-muted">{data.note}</p>}
      </div>
    );
  }

  return (
    <>
      <div className="grid gap-4 @2xl:grid-cols-2 @4xl:grid-cols-3">
        {items.map((s, i) => (
          <Reveal key={i} delay={(i % 6) * 50}>
            <article className="pf-card flex h-full flex-col p-6">
              <div className="flex items-start justify-between gap-4">
                <span
                  className={`flex h-10 w-10 shrink-0 items-center justify-center text-sm font-bold ${tpl === "chantier" ? "rounded-md" : "rounded-full"}`}
                  style={{ background: "var(--pf-primary-soft)", color: "var(--pf-primary-strong)" }}
                >
                  {tpl === "studio" ? String(i + 1).padStart(2, "0") : <Check className="h-5 w-5" />}
                </span>
                {(s.price || s.unit) && (
                  <span className="rounded-full bg-[var(--pf-surface2)] px-3 py-1 text-sm">
                    <Price price={s.price} unit={s.unit} />
                  </span>
                )}
              </div>
              <h3 className={`mt-4 text-lg font-semibold ${tpl === "chantier" ? "pf-display" : ""}`}>{s.name}</h3>
              {s.description && <p className="mt-1.5 text-sm pf-muted">{s.description}</p>}
              <div className="mt-auto pt-4">
                <AskButton label={tpl === "chantier" ? "Demander un devis" : "Demander"} message={ask(s.name)} />
              </div>
            </article>
          </Reveal>
        ))}
      </div>
      {data.note && <p className="mt-6 text-sm pf-muted">{data.note}</p>}
    </>
  );
}

// ============================================================
// Menu
// ============================================================
function MenuBlock({ data }: { data: BlockDataMap["menu"] }) {
  const cats = data.categories.filter((c) => c.items.some((i) => i.name));
  const [active, setActive] = useState(0);
  const cat = cats[Math.min(active, cats.length - 1)];
  if (!cat) return null;
  return (
    <div className="mx-auto max-w-4xl">
      {cats.length > 1 && (
        <div className="mb-8 flex flex-wrap justify-center gap-2">
          {cats.map((c, i) => (
            <button
              key={i}
              onClick={() => setActive(i)}
              className={`rounded-full border px-4 py-2 text-sm font-medium transition-colors ${
                i === active ? "border-transparent" : "border-[var(--pf-border)] pf-muted hover:text-[var(--pf-fg)]"
              }`}
              style={i === active ? { background: "var(--pf-primary)", color: "var(--pf-on-primary)" } : undefined}
            >
              {c.name}
            </button>
          ))}
        </div>
      )}
      <ul className="grid gap-x-12 gap-y-2 @3xl:grid-cols-2">
        {cat.items.filter((i) => i.name).map((it, i) => (
          <li key={i} className="flex gap-4 py-4">
            {it.image && <img src={it.image} alt="" loading="lazy" className="h-16 w-16 shrink-0 rounded-[calc(var(--pf-radius)*0.6)] object-cover" />}
            <div className="min-w-0 flex-1">
              <div className="flex items-baseline gap-3">
                <h3 className="pf-display text-lg">{it.name}</h3>
                {it.tag && (
                  <span className="rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider" style={{ background: "var(--pf-primary-soft)", color: "var(--pf-primary-strong)" }}>
                    {it.tag}
                  </span>
                )}
                <span className="mb-1 flex-1 border-b border-dotted border-[var(--pf-muted)] opacity-40" />
                {it.price && <span className="whitespace-nowrap font-semibold text-[var(--pf-primary-strong)]">{it.price}{/\d/.test(it.price) ? " F" : ""}</span>}
              </div>
              {it.description && <p className="mt-1 text-sm pf-muted">{it.description}</p>}
              <div className="mt-1">
                <AskButton label="Commander" message={`Bonjour, je souhaite commander : ${it.name}. `} />
              </div>
            </div>
          </li>
        ))}
      </ul>
      {data.note && <p className="mt-6 text-center text-sm pf-muted">{data.note}</p>}
    </div>
  );
}

// ============================================================
// Horaires
// ============================================================
function HoursBlock({ data }: { data: BlockDataMap["hours"] }) {
  const status = openStatus(data.days);
  const today = new Date().getDay();
  const order = [1, 2, 3, 4, 5, 6, 0];
  const days = order.map((d) => data.days.find((x) => x.day === d)).filter(Boolean) as typeof data.days;
  return (
    <div className="pf-card mx-auto max-w-xl p-6 @2xl:p-8">
      {status && (
        <div className="mb-5 flex items-center gap-2 text-sm font-semibold">
          <span className={`h-2.5 w-2.5 rounded-full ${status.open ? "bg-emerald-500 animate-pulse" : "bg-red-400"}`} />
          <span className={status.open ? "text-emerald-600" : "pf-muted"}>{status.label}</span>
        </div>
      )}
      <ul className="divide-y divide-[var(--pf-border)]">
        {days.map((d) => (
          <li key={d.day} className={`flex items-center justify-between py-3 text-sm ${d.day === today ? "font-semibold" : ""}`}>
            <span className="flex items-center gap-2">
              {d.day === today && <span className="h-1.5 w-1.5 rounded-full" style={{ background: "var(--pf-primary)" }} />}
              {DAY_NAMES[d.day]}
            </span>
            <span className={d.open ? "" : "pf-muted"}>{d.open ? `${d.from.replace(":", "h")} – ${d.to.replace(":", "h")}` : "Fermé"}</span>
          </li>
        ))}
      </ul>
      {data.note && <p className="mt-4 text-sm pf-muted">{data.note}</p>}
    </div>
  );
}

// ============================================================
// Zone d'intervention
// ============================================================
function ZoneBlock({ data }: { data: BlockDataMap["zone"] }) {
  const { profile } = usePortfolio();
  const mapsQuery = encodeURIComponent([data.areas[0], profile.city, profile.country].filter(Boolean).join(", "));
  return (
    <div className="pf-card flex flex-col gap-6 p-6 @3xl:flex-row @3xl:items-center @3xl:p-8">
      <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full" style={{ background: "var(--pf-primary-soft)", color: "var(--pf-primary-strong)" }}>
        <MapPin className="h-7 w-7" />
      </div>
      <div className="flex-1">
        <div className="flex flex-wrap gap-2">
          {data.areas.map((a, i) => (
            <span key={i} className="rounded-full border border-[var(--pf-border)] bg-[var(--pf-bg)] px-3.5 py-1.5 text-sm font-medium">
              {a}
            </span>
          ))}
        </div>
        {data.travels && (
          <p className="mt-3 flex items-center gap-2 text-sm pf-muted">
            <Car className="h-4 w-4" /> Je me déplace chez vous
          </p>
        )}
        {data.note && <p className="mt-2 text-sm pf-muted">{data.note}</p>}
      </div>
      <a href={`https://www.google.com/maps/search/?api=1&query=${mapsQuery}`} target="_blank" rel="noreferrer" className="pf-btn pf-btn-ghost self-start text-sm">
        Voir sur la carte <ExternalLink className="h-3.5 w-3.5" />
      </a>
    </div>
  );
}

// ============================================================
// Diplômes
// ============================================================
function CredentialsBlock({ data }: { data: BlockDataMap["credentials"] }) {
  return (
    <div className="grid gap-4 @2xl:grid-cols-2">
      {data.items.filter((i) => i.title).map((c, i) => (
        <div key={i} className="pf-card flex items-start gap-4 p-5">
          <Award className="mt-0.5 h-6 w-6 shrink-0 text-[var(--pf-primary-strong)]" />
          <div>
            <p className="font-semibold">{c.title}</p>
            {(c.issuer || c.year) && <p className="mt-0.5 text-sm pf-muted">{[c.issuer, c.year].filter(Boolean).join(" · ")}</p>}
          </div>
        </div>
      ))}
    </div>
  );
}

// ============================================================
// Parcours
// ============================================================
function ExperienceBlock({ data }: { data: BlockDataMap["experience"] }) {
  return (
    <ol className="relative ml-2 max-w-3xl border-l border-[var(--pf-border)]">
      {data.items.filter((i) => i.role).map((e, i) => (
        <li key={i} className="relative pb-8 pl-8 last:pb-0">
          <span className="absolute -left-[7px] top-1.5 h-3.5 w-3.5 rounded-full border-2 border-[var(--pf-bg)]" style={{ background: "var(--pf-primary)" }} />
          {e.period && <p className="text-xs font-semibold uppercase tracking-wider text-[var(--pf-primary-strong)]">{e.period}</p>}
          <h3 className="mt-1 text-lg font-semibold">{e.role}</h3>
          {e.org && <p className="pf-muted">{e.org}</p>}
          {e.description && <p className="mt-2 text-sm pf-muted">{e.description}</p>}
        </li>
      ))}
    </ol>
  );
}

// ============================================================
// Avis clients
// ============================================================
function TestimonialsBlock({ data }: { data: BlockDataMap["testimonials"] }) {
  const { tpl } = usePortfolio();
  const items = data.items.filter((i) => i.text);
  return (
    <div className="-mx-5 flex snap-x snap-mandatory gap-4 overflow-x-auto px-5 pb-4 @3xl:mx-0 @3xl:grid @3xl:grid-cols-3 @3xl:overflow-visible @3xl:px-0 [scrollbar-width:none]">
      {items.map((t, i) => (
        <figure key={i} className="pf-card flex w-[85%] shrink-0 snap-start flex-col p-6 @3xl:w-auto">
          {tpl === "scene" || tpl === "atelier" ? (
            <Quote className="h-7 w-7 text-[var(--pf-primary-strong)] opacity-70" />
          ) : (
            <Stars value={t.rating ?? 5} />
          )}
          <blockquote className={`mt-4 flex-1 leading-relaxed ${tpl === "atelier" || tpl === "table" ? "pf-display text-lg italic" : ""}`}>
            « {t.text} »
          </blockquote>
          <figcaption className="mt-5 flex items-center gap-3">
            <span className="flex h-9 w-9 items-center justify-center rounded-full text-sm font-bold" style={{ background: "var(--pf-primary-soft)", color: "var(--pf-primary-strong)" }}>
              {t.name.charAt(0)}
            </span>
            <span>
              <span className="block text-sm font-semibold">{t.name}</span>
              {t.role && <span className="block text-xs pf-muted">{t.role}</span>}
            </span>
            {(tpl === "scene" || tpl === "atelier") && <span className="ml-auto"><Stars value={t.rating ?? 5} size={12} /></span>}
          </figcaption>
        </figure>
      ))}
    </div>
  );
}

// ============================================================
// Projets
// ============================================================
function ProjectsBlock({ data }: { data: BlockDataMap["projects"] }) {
  const { openLightbox } = usePortfolio();
  const items = data.items.filter((i) => i.title);
  return (
    <div className="grid gap-6 @3xl:grid-cols-2">
      {items.map((p, i) => (
        <Reveal key={i} delay={(i % 4) * 70}>
          <article className="pf-card group h-full overflow-hidden">
            {p.image && (
              <div className="overflow-hidden">
                <Img
                  src={p.image}
                  alt={p.title}
                  onClick={() => openLightbox([{ url: p.image!, caption: p.title }], 0)}
                  className="aspect-[16/10] w-full object-cover transition-transform duration-700 group-hover:scale-[1.03]"
                />
              </div>
            )}
            <div className="p-6">
              {p.tags && p.tags.length > 0 && (
                <div className="mb-3 flex flex-wrap gap-1.5">
                  {p.tags.map((t, j) => (
                    <span key={j} className="rounded-full bg-[var(--pf-surface2)] px-2.5 py-0.5 text-xs pf-muted">
                      {t}
                    </span>
                  ))}
                </div>
              )}
              <h3 className="pf-display text-xl font-semibold">{p.title}</h3>
              {p.description && <p className="mt-2 text-sm leading-relaxed pf-muted">{p.description}</p>}
              {p.url && (
                <a href={p.url} target="_blank" rel="noreferrer" className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-[var(--pf-primary-strong)] hover:underline">
                  Voir le projet <ArrowUpRight className="h-4 w-4" />
                </a>
              )}
            </div>
          </article>
        </Reveal>
      ))}
    </div>
  );
}

// ============================================================
// Offres & formules
// ============================================================
function OffersBlock({ data }: { data: BlockDataMap["offers"] }) {
  const items = data.items.filter((i) => i.name);
  return (
    <div className={`grid items-stretch gap-5 ${items.length === 2 ? "@3xl:grid-cols-2 max-w-4xl mx-auto" : "@3xl:grid-cols-3"}`}>
      {items.map((o, i) => (
        <Reveal key={i} delay={i * 80}>
          <article
            className={`pf-card relative flex h-full flex-col p-7 ${o.highlighted ? "shadow-xl @3xl:-translate-y-2" : ""}`}
            style={o.highlighted ? { borderColor: "var(--pf-primary)", borderWidth: 2 } : undefined}
          >
            {o.highlighted && (
              <span className="absolute -top-3 left-6 rounded-full px-3 py-1 text-xs font-bold" style={{ background: "var(--pf-primary)", color: "var(--pf-on-primary)" }}>
                Le plus demandé
              </span>
            )}
            <h3 className="pf-display text-xl font-bold">{o.name}</h3>
            {o.description && <p className="mt-1 text-sm pf-muted">{o.description}</p>}
            {(o.price || o.duration) && (
              <p className="mt-5">
                {o.price && <span className="pf-display text-3xl font-extrabold">{o.price}{/\d/.test(o.price) ? " F" : ""}</span>}
                {o.duration && <span className="ml-1 text-sm pf-muted">/ {o.duration}</span>}
              </p>
            )}
            {o.features && o.features.length > 0 && (
              <ul className="mt-5 space-y-2.5">
                {o.features.filter(Boolean).map((f, j) => (
                  <li key={j} className="flex gap-2.5 text-sm">
                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-[var(--pf-primary-strong)]" /> {f}
                  </li>
                ))}
              </ul>
            )}
            <div className="mt-auto pt-6">
              <AskButton label="Je suis intéressé(e)" message={`Bonjour, je suis intéressé(e) par l'offre « ${o.name} ». `} variant={o.highlighted ? "solid" : "button"} />
            </div>
          </article>
        </Reveal>
      ))}
    </div>
  );
}

// ============================================================
// Compétences, FAQ, chiffres, vidéos
// ============================================================
function SkillsBlock({ data }: { data: BlockDataMap["skills"] }) {
  const { tpl } = usePortfolio();
  return (
    <div className="flex flex-wrap gap-2.5">
      {data.items.map((s, i) => (
        <span
          key={i}
          className={`px-4 py-2 text-sm font-medium ${tpl === "studio" ? "rounded-md border border-[var(--pf-border)] bg-[var(--pf-surface)] font-mono" : "rounded-full"}`}
          style={tpl === "studio" ? undefined : { background: "var(--pf-primary-soft)", color: "var(--pf-primary-strong)" }}
        >
          {s}
        </span>
      ))}
    </div>
  );
}

function FaqBlock({ data }: { data: BlockDataMap["faq"] }) {
  return (
    <div className="mx-auto max-w-3xl divide-y divide-[var(--pf-border)] border-y border-[var(--pf-border)]">
      {data.items.filter((i) => i.q && i.a).map((f, i) => (
        <details key={i} className="group py-5">
          <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-semibold [&::-webkit-details-marker]:hidden">
            {f.q}
            <Plus className="h-5 w-5 shrink-0 text-[var(--pf-primary-strong)] transition-transform group-open:rotate-45" />
          </summary>
          <p className="mt-3 leading-relaxed pf-muted">{f.a}</p>
        </details>
      ))}
    </div>
  );
}

function StatsBlock({ data }: { data: BlockDataMap["stats"] }) {
  const { tpl } = usePortfolio();
  const items = data.items.filter((i) => i.value && i.label);
  return (
    <div className={`grid grid-cols-2 gap-6 ${items.length >= 4 ? "@3xl:grid-cols-4" : "@3xl:grid-cols-3"}`}>
      {items.map((s, i) => (
        <Reveal key={i} delay={i * 80} className={tpl === "chantier" ? "border-l-4 pl-4" : "text-center"}>
          <div style={tpl === "chantier" ? { borderColor: "var(--pf-primary)" } : undefined}>
            <p className="pf-display text-4xl @2xl:text-5xl font-bold" style={{ color: tpl === "chantier" ? undefined : "var(--pf-primary-strong)" }}>
              {s.value}
            </p>
            <p className="mt-1 text-sm pf-muted">{s.label}</p>
          </div>
        </Reveal>
      ))}
    </div>
  );
}

function LiteYoutube({ url, title }: { url: string; title?: string }) {
  const id = youtubeId(url);
  const [play, setPlay] = useState(false);
  if (!id) return null;
  return (
    <figure>
      <div className="relative aspect-video overflow-hidden rounded-[var(--pf-radius)] bg-black">
        {play ? (
          <iframe
            src={`https://www.youtube-nocookie.com/embed/${id}?autoplay=1&rel=0`}
            title={title ?? "Vidéo"}
            allow="autoplay; encrypted-media; picture-in-picture"
            allowFullScreen
            className="absolute inset-0 h-full w-full"
          />
        ) : (
          // Chargement au clic : économise les données mobiles
          <button onClick={() => setPlay(true)} className="group absolute inset-0 h-full w-full" aria-label={`Lire ${title ?? "la vidéo"}`}>
            <img src={`https://i.ytimg.com/vi/${id}/hqdefault.jpg`} alt="" loading="lazy" className="h-full w-full object-cover opacity-90 transition-opacity group-hover:opacity-100" />
            <span className="absolute left-1/2 top-1/2 flex h-16 w-16 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full shadow-xl transition-transform group-hover:scale-110" style={{ background: "var(--pf-primary)", color: "var(--pf-on-primary)" }}>
              <Play className="ml-1 h-7 w-7 fill-current" />
            </span>
          </button>
        )}
      </div>
      {title && <figcaption className="mt-2 text-sm font-medium">{title}</figcaption>}
    </figure>
  );
}

function VideoBlock({ data }: { data: BlockDataMap["video"] }) {
  const items = data.items.filter((i) => youtubeId(i.url));
  return (
    <div className={`grid gap-6 ${items.length > 1 ? "@3xl:grid-cols-2" : "max-w-4xl"}`}>
      {items.map((v, i) => (
        <LiteYoutube key={i} {...v} />
      ))}
    </div>
  );
}

// ============================================================
// Aiguillage
// ============================================================
const RENDERERS: { [K in BlockType]: (props: { data: BlockDataMap[K] }) => ReactNode } = {
  gallery: GalleryBlock,
  beforeAfter: BeforeAfterBlock,
  services: ServicesBlock,
  menu: MenuBlock,
  hours: HoursBlock,
  zone: ZoneBlock,
  credentials: CredentialsBlock,
  experience: ExperienceBlock,
  testimonials: TestimonialsBlock,
  projects: ProjectsBlock,
  offers: OffersBlock,
  skills: SkillsBlock,
  faq: FaqBlock,
  stats: StatsBlock,
  video: VideoBlock,
};

const CENTERED: BlockType[] = ["menu", "offers", "faq", "hours"];

/** Titres par défaut propres à l'ambiance de chaque template */
const TEMPLATE_TITLES: Partial<Record<string, Partial<Record<BlockType, string>>>> = {
  table: { gallery: "En images", testimonials: "Ce qu'en disent nos clients" },
  galerie: { gallery: "Portfolio", services: "Prestations" },
  studio: { gallery: "Aperçus", services: "Services", testimonials: "Recommandations" },
  cabinet: { services: "Consultations & services", testimonials: "Avis de patients et clients" },
  scene: { testimonials: "Ils ont franchi le cap", gallery: "En images" },
  chantier: { gallery: "Chantiers réalisés" },
};

export function sectionTitle(block: { type: string; data: any }, tpl: string, overrides?: Partial<Record<BlockType, string>>) {
  return blockTitle(block, { ...TEMPLATE_TITLES[tpl], ...overrides });
}

export function BlockSection({ block, index, alt }: { block: TypedBlock; index: number; alt: boolean }) {
  const { profession, tpl } = usePortfolio();
  const Renderer = RENDERERS[block.type] as (p: { data: any }) => ReactNode;
  const title = sectionTitle(block, tpl, profession.blockTitles);
  const eyebrow = useMemo(() => {
    if (block.type === "services") return tpl === "cabinet" ? "Ce que je propose" : "Tarifs";
    if (block.type === "testimonials") return "Avis";
    if (block.type === "offers") return "Formules";
    if (block.type === "gallery") return "Portfolio";
    return undefined;
  }, [block.type, tpl]);
  if (!Renderer) return null;
  // Les chiffres clés n'ont pas besoin de titre : ils parlent d'eux-mêmes
  const showTitle = block.type !== "stats" || !!block.data.title;
  return (
    <Section id={`s-${block.type}-${index}`} alt={alt}>
      {showTitle && <SectionHeading title={title} eyebrow={eyebrow} index={index + 1} center={CENTERED.includes(block.type) && tpl !== "galerie" && tpl !== "chantier"} />}
      <Renderer data={block.data} />
    </Section>
  );
}

