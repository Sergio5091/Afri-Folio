import { useEffect, useState } from "react";
import { Link } from "wouter";
import { BadgeCheck, MapPin, Search, Users } from "lucide-react";
import { useGetDirectory, type PortfolioCard } from "@workspace/api-client-react";
import { SiteFooter, SiteHeader } from "@/components/site-layout";
import { usePageMeta } from "@/hooks/use-page-meta";
import { FAMILIES, getProfession, PROFESSIONS, searchProfessions, type FamilyId } from "@/lib/professions";
import { getTemplate } from "@/lib/templates";

function Card({ p }: { p: PortfolioCard }) {
  const profession = getProfession(p.profession);
  const color = p.primaryColor || getTemplate(p.template ?? profession.template).defaultColor;
  return (
    <Link href={`/${p.username}?src=annuaire`} className="group overflow-hidden rounded-2xl border bg-card transition-shadow hover:shadow-lg">
      <div className="relative aspect-[4/3] overflow-hidden" style={{ background: color }}>
        {p.coverUrl ? (
          <img src={p.coverUrl} alt="" loading="lazy" className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />
        ) : p.photoUrl ? (
          <img src={p.photoUrl} alt="" loading="lazy" className="h-full w-full object-cover" />
        ) : (
          <span className="flex h-full items-center justify-center text-5xl">{profession.emoji}</span>
        )}
      </div>
      <div className="relative px-4 pb-4 pt-8">
        <span className="absolute -top-7 left-4 h-14 w-14 overflow-hidden rounded-full border-4 border-card bg-muted">
          {p.photoUrl ? <img src={p.photoUrl} alt="" className="h-full w-full object-cover" /> : <span className="flex h-full items-center justify-center font-bold" style={{ background: color, color: "#fff" }}>{(p.fullName ?? "?").charAt(0)}</span>}
        </span>
        <p className="flex items-center gap-1.5 font-semibold">
          <span className="truncate">{p.fullName}</span>
          {p.plan === "premium" && <BadgeCheck className="h-4 w-4 shrink-0 text-sky-500" aria-label="Pro vérifié" />}
        </p>
        <p className="truncate text-sm text-muted-foreground">{p.title || p.professionCustom || profession.title}</p>
        {p.city && <p className="mt-2 flex items-center gap-1 text-xs text-muted-foreground"><MapPin className="h-3.5 w-3.5" /> {p.city}</p>}
      </div>
    </Link>
  );
}

export default function Annuaire() {
  const [q, setQ] = useState("");
  const [debounced, setDebounced] = useState("");
  const [profession, setProfession] = useState("");
  const [family, setFamily] = useState<FamilyId | "">("");
  const [city, setCity] = useState("");
  const [page, setPage] = useState(1);

  usePageMeta({ title: "Trouver un professionnel près de chez vous — AfriFolio", description: "Couturières, électriciens, photographes, traiteurs... Contactez-les directement sur WhatsApp." });

  useEffect(() => {
    const t = setTimeout(() => {
      // Si la recherche correspond à un métier du catalogue, on filtre par métier
      const match = searchProfessions(q, 1)[0];
      if (match && q.trim().length >= 3 && !profession) {
        setProfession(match.id);
        setDebounced("");
      } else setDebounced(q);
      setPage(1);
    }, 350);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q]);

  const { data, isLoading } = useGetDirectory({ q: debounced || undefined, profession: profession || undefined, family: family || undefined, city: city || undefined, page });

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <main className="mx-auto max-w-7xl px-4 pb-24 pt-28 sm:px-6">
        <div className="mx-auto max-w-2xl text-center">
          <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl">Trouvez le bon professionnel</h1>
          <p className="mt-3 text-lg text-muted-foreground">Voyez leur travail, leurs prix, et contactez-les directement sur WhatsApp.</p>
        </div>

        <div className="mx-auto mt-8 flex max-w-3xl flex-col gap-2 rounded-2xl border bg-card p-2 shadow-sm sm:flex-row">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
            <input value={q} onChange={(e) => { setQ(e.target.value); if (!e.target.value) setProfession(""); }} placeholder="Métier ou nom : couturière, plombier..." className="w-full rounded-xl bg-transparent py-3 pl-11 pr-3 text-[15px] outline-none" />
          </div>
          <div className="relative sm:w-56">
            <MapPin className="absolute left-3.5 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
            <input value={city} onChange={(e) => { setCity(e.target.value); setPage(1); }} list="dir-cities" placeholder="Ville" className="w-full rounded-xl bg-muted/60 py-3 pl-11 pr-3 text-[15px] outline-none" />
            <datalist id="dir-cities">{data?.cities.map((c) => <option key={c} value={c} />)}</datalist>
          </div>
        </div>

        <div className="mt-6 flex gap-2 overflow-x-auto pb-2 [scrollbar-width:none] sm:flex-wrap sm:justify-center">
          {profession ? (
            <button onClick={() => { setProfession(""); setQ(""); }} className="shrink-0 rounded-full bg-foreground px-4 py-2 text-sm font-medium text-background">
              {getProfession(profession).emoji} {getProfession(profession).label} ✕
            </button>
          ) : (
            <>
              <button onClick={() => setFamily("")} className={`shrink-0 rounded-full border px-4 py-2 text-sm font-medium ${!family ? "border-foreground bg-foreground text-background" : "hover:bg-muted"}`}>Tous</button>
              {(Object.keys(FAMILIES) as FamilyId[]).filter((f) => PROFESSIONS.some((p) => p.family === f)).map((f) => (
                <button key={f} onClick={() => { setFamily(f); setPage(1); }} className={`shrink-0 rounded-full border px-4 py-2 text-sm font-medium ${family === f ? "border-foreground bg-foreground text-background" : "hover:bg-muted"}`}>
                  {FAMILIES[f].emoji} {FAMILIES[f].label}
                </button>
              ))}
            </>
          )}
        </div>

        {isLoading ? (
          <div className="mt-10 grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
            {Array.from({ length: 8 }).map((_, i) => <div key={i} className="aspect-[4/5] animate-pulse rounded-2xl bg-muted" />)}
          </div>
        ) : !data || data.items.length === 0 ? (
          <div className="mt-16 flex flex-col items-center text-center">
            <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-muted"><Users className="h-7 w-7 text-muted-foreground" /></span>
            <p className="mt-4 font-semibold">Aucun professionnel trouvé</p>
            <p className="mt-1 text-sm text-muted-foreground">Vous exercez ce métier ? Soyez le premier à apparaître ici.</p>
            <Link href="/inscription" className="mt-5 rounded-full bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground">Créer mon portfolio gratuit</Link>
          </div>
        ) : (
          <>
            <p className="mt-8 text-sm text-muted-foreground">{data.total} professionnel{data.total > 1 ? "s" : ""}</p>
            <div className="mt-4 grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
              {data.items.map((p) => <Card key={p.username} p={p} />)}
            </div>
            {data.total > data.limit && (
              <div className="mt-10 flex justify-center gap-2">
                <button disabled={page <= 1} onClick={() => setPage(page - 1)} className="rounded-xl border px-4 py-2 text-sm font-medium disabled:opacity-40">Précédent</button>
                <button disabled={page * data.limit >= data.total} onClick={() => setPage(page + 1)} className="rounded-xl border px-4 py-2 text-sm font-medium disabled:opacity-40">Suivant</button>
              </div>
            )}
          </>
        )}
      </main>
      <SiteFooter />
    </div>
  );
}
