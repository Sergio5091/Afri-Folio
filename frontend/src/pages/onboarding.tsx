import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useLocation, useSearch } from "wouter";
import {
  ArrowLeft, ArrowRight, Camera, Check, CheckCircle2, Copy, ExternalLink, ImagePlus, Loader2, Lock, Mail, MessageCircle,
  Plus, RefreshCw, Search, Sparkles, X, Eye,
} from "lucide-react";
import { apiClient, checkUsername, useRegister, type Block } from "@workspace/api-client-react";
import { useAuth } from "@/contexts/auth";
import { PortfolioView } from "@/components/portfolio/PortfolioView";
import { PhoneMockup, PreviewFrame } from "@/components/portfolio/PreviewFrame";
import { PortfolioQrCode } from "@/components/qr-code";
import { LogoMark } from "@/components/brand";
import {
  FAMILIES, OTHER_PROFESSION, POPULAR_PROFESSIONS, getProfession, searchProfessions, type Profession,
} from "@/lib/professions";
import { COUNTRIES, getCountry } from "@/lib/countries";
import { IMAGE_SETS, unsplash } from "@/lib/images";
import {
  EMPTY_ANSWERS, buildBlocks, generatedBio, previewData, professionOf, suggestedServices, titleOf, whatsappOf,
  type OnboardingAnswers,
} from "@/lib/onboarding";
import { uploadPhoto } from "@/lib/image";
import { blocksToApi } from "@/lib/portfolio";
import { copyText, portfolioDisplayUrl, portfolioUrl, shareMessage, whatsappShare } from "@/lib/share";
import { slugify } from "@/lib/utils";

const DRAFT_KEY = "afrifolio_onboarding_v1";
const MAX_PHOTOS = 12;

type StepId = "metier" | "vous" | "photo" | "realisations" | "prestations" | "presentation" | "compte";
const STEPS: { id: StepId; label: string; seconds: number }[] = [
  { id: "metier", label: "Votre métier", seconds: 15 },
  { id: "vous", label: "Vous", seconds: 35 },
  { id: "photo", label: "Votre photo", seconds: 20 },
  { id: "realisations", label: "Vos réalisations", seconds: 45 },
  { id: "prestations", label: "Vos prestations", seconds: 40 },
  { id: "presentation", label: "Présentation", seconds: 20 },
  { id: "compte", label: "Votre accès", seconds: 25 },
];

interface LocalPhoto {
  file: File;
  url: string;
}

// ── Petits composants de formulaire ────────────────────────
function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-semibold">{label}</span>
      {children}
      {hint && <span className="mt-1.5 block text-xs text-muted-foreground">{hint}</span>}
    </label>
  );
}

const inputCls =
  "w-full rounded-xl border bg-card px-4 py-3.5 text-[16px] outline-none transition-shadow placeholder:text-muted-foreground/70 focus:border-primary focus:ring-4 focus:ring-primary/10";

function StepTitle({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <div className="mb-7">
      <h1 className="text-[1.75rem] font-bold leading-tight tracking-tight sm:text-3xl">{title}</h1>
      {subtitle && <p className="mt-2 text-muted-foreground">{subtitle}</p>}
    </div>
  );
}

// ============================================================
// Étape 1 — métier
// ============================================================
function StepMetier({ answers, onPick }: { answers: OnboardingAnswers; onPick: (p: Profession, custom?: string) => void }) {
  const [query, setQuery] = useState("");
  const [custom, setCustom] = useState(answers.professionCustom);
  const [showCustom, setShowCustom] = useState(answers.professionId === "autre");
  const results = useMemo(() => searchProfessions(query), [query]);
  const popular = POPULAR_PROFESSIONS.map((id) => getProfession(id));

  return (
    <div>
      <StepTitle title="Quel est votre métier ?" subtitle="Votre portfolio s'adapte : galerie, tarifs, menu, horaires..." />
      <div className="relative">
        <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
        <input
          autoFocus
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Ex. couturière, électricien, photographe..."
          className={`${inputCls} pl-12`}
        />
      </div>

      {query.trim() ? (
        <div className="mt-3 overflow-hidden rounded-xl border bg-card">
          {results.map((p) => (
            <button key={p.id} onClick={() => onPick(p)} className="flex w-full items-center gap-3 border-b px-4 py-3.5 text-left last:border-0 hover:bg-muted">
              <span className="text-xl">{p.emoji}</span>
              <span className="flex-1">
                <span className="block font-medium">{p.label}</span>
                <span className="block text-xs text-muted-foreground">{FAMILIES[p.family].label}</span>
              </span>
              <ArrowRight className="h-4 w-4 text-muted-foreground" />
            </button>
          ))}
          <button
            onClick={() => {
              setCustom(query.trim());
              setShowCustom(true);
              setQuery("");
            }}
            className="flex w-full items-center gap-3 px-4 py-3.5 text-left text-primary hover:bg-muted"
          >
            <Plus className="h-5 w-5" /> <span className="font-medium">Mon métier n'est pas dans la liste : « {query.trim()} »</span>
          </button>
        </div>
      ) : (
        <>
          <p className="mb-3 mt-7 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Les plus choisis</p>
          <div className="grid grid-cols-2 gap-2.5">
            {popular.map((p) => (
              <button
                key={p.id}
                onClick={() => onPick(p)}
                className={`flex items-center gap-2.5 rounded-xl border bg-card px-3.5 py-3 text-left text-sm font-medium transition-all hover:border-primary hover:shadow-sm active:scale-[0.98] ${answers.professionId === p.id ? "border-primary ring-2 ring-primary/20" : ""}`}
              >
                <span className="text-lg">{p.emoji}</span> <span className="leading-tight">{p.title}</span>
              </button>
            ))}
          </div>
          {!showCustom && (
            <button onClick={() => setShowCustom(true)} className="mt-4 text-sm font-medium text-primary hover:underline">
              Mon métier n'est pas dans la liste
            </button>
          )}
        </>
      )}

      {showCustom && !query.trim() && (
        <div className="mt-6 rounded-2xl border bg-card p-4">
          <Field label="Votre métier" hint="On choisit pour vous une mise en page adaptée, modifiable ensuite.">
            <input value={custom} onChange={(e) => setCustom(e.target.value)} placeholder="Ex. Tapissier, Traducteur, Chauffeur VTC..." className={inputCls} />
          </Field>
          <button
            disabled={custom.trim().length < 2}
            onClick={() => onPick(OTHER_PROFESSION, custom.trim())}
            className="mt-3 w-full rounded-xl bg-primary py-3 font-semibold text-primary-foreground disabled:opacity-40"
          >
            Continuer
          </button>
        </div>
      )}
    </div>
  );
}

// ============================================================
// Étape 2 — vous
// ============================================================
function StepVous({ a, set }: { a: OnboardingAnswers; set: (p: Partial<OnboardingAnswers>) => void }) {
  const country = getCountry(a.countryCode);
  const yearsOptions: { v: number | null; l: string }[] = [
    { v: 0, l: "Je débute" }, { v: 2, l: "1-2 ans" }, { v: 4, l: "3-5 ans" }, { v: 8, l: "5-10 ans" }, { v: 10, l: "10 ans +" },
  ];
  return (
    <div>
      <StepTitle title="Faisons connaissance" subtitle="Ces informations apparaissent en haut de votre page." />
      <div className="space-y-5">
        <Field label="Votre nom (ou celui de votre activité)">
          <input autoFocus value={a.fullName} onChange={(e) => set({ fullName: e.target.value })} placeholder="Ex. Aminata Diallo" className={inputCls} autoComplete="name" />
        </Field>
        <div className="grid grid-cols-[1fr_1.2fr] gap-3">
          <Field label="Pays">
            <select value={a.countryCode} onChange={(e) => set({ countryCode: e.target.value })} className={inputCls}>
              {COUNTRIES.map((c) => (
                <option key={c.code} value={c.code}>{c.flag} {c.name}</option>
              ))}
            </select>
          </Field>
          <Field label="Ville">
            <input value={a.city} onChange={(e) => set({ city: e.target.value })} placeholder={country.cities[0]} list="cities" className={inputCls} autoComplete="address-level2" />
            <datalist id="cities">
              {country.cities.map((c) => <option key={c} value={c} />)}
            </datalist>
          </Field>
        </div>
        <Field label="Votre numéro WhatsApp" hint="Vos clients vous contactent en un clic. Il n'est jamais revendu.">
          <div className="flex">
            <span className="flex items-center gap-1.5 rounded-l-xl border border-r-0 bg-muted px-3 text-[15px] font-medium">
              {country.flag} +{country.dial}
            </span>
            <input value={a.phone} onChange={(e) => set({ phone: e.target.value })} type="tel" inputMode="tel" placeholder="97 00 00 00" className={`${inputCls} rounded-l-none`} autoComplete="tel-national" />
          </div>
        </Field>
        <div>
          <span className="mb-2 block text-sm font-semibold">Depuis combien de temps exercez-vous ?</span>
          <div className="flex flex-wrap gap-2">
            {yearsOptions.map((o) => (
              <button
                key={o.l}
                type="button"
                onClick={() => set({ years: o.v })}
                className={`rounded-full border px-4 py-2 text-sm font-medium transition-colors ${a.years === o.v ? "border-primary bg-primary text-primary-foreground" : "bg-card hover:border-primary"}`}
              >
                {o.l}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ============================================================
// Étape 3 — photo de profil
// ============================================================
function StepPhoto({ avatar, setAvatar, professionTitle }: { avatar: LocalPhoto | null; setAvatar: (p: LocalPhoto | null) => void; professionTitle: string }) {
  const input = useRef<HTMLInputElement>(null);
  return (
    <div>
      <StepTitle title="Une photo de vous" subtitle="Les clients font plus confiance à un visage. Souriez !" />
      <div className="flex flex-col items-center py-4">
        <button
          onClick={() => input.current?.click()}
          className="group relative flex h-44 w-44 items-center justify-center overflow-hidden rounded-full border-2 border-dashed border-primary/40 bg-primary/5 transition-colors hover:bg-primary/10"
        >
          {avatar ? (
            <img src={avatar.url} alt="" className="h-full w-full object-cover" />
          ) : (
            <span className="flex flex-col items-center gap-2 text-primary">
              <Camera className="h-10 w-10" />
              <span className="text-sm font-semibold">Ajouter une photo</span>
            </span>
          )}
          {avatar && (
            <span className="absolute inset-0 flex items-center justify-center bg-black/40 text-sm font-semibold text-white opacity-0 transition-opacity group-hover:opacity-100">
              Changer
            </span>
          )}
        </button>
        <input
          ref={input}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) setAvatar({ file: f, url: URL.createObjectURL(f) });
            e.target.value = "";
          }}
        />
        {avatar && (
          <button onClick={() => setAvatar(null)} className="mt-4 text-sm text-muted-foreground hover:text-destructive">
            Retirer la photo
          </button>
        )}
        <ul className="mt-8 w-full space-y-2 rounded-2xl bg-muted/60 p-4 text-sm text-muted-foreground">
          <li className="flex gap-2"><Check className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" /> Photo nette, visage bien visible</li>
          <li className="flex gap-2"><Check className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" /> Idéalement en tenue de travail de {professionTitle.toLowerCase() || "votre métier"}</li>
          <li className="flex gap-2"><Check className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" /> Vous pourrez la changer à tout moment</li>
        </ul>
      </div>
    </div>
  );
}

// ============================================================
// Étape 4 — réalisations
// ============================================================
function StepRealisations({ photos, setPhotos, label }: { photos: LocalPhoto[]; setPhotos: (p: LocalPhoto[]) => void; label: string }) {
  const input = useRef<HTMLInputElement>(null);
  const add = (files: FileList | null) => {
    if (!files) return;
    const next = [...photos];
    for (const f of Array.from(files)) {
      if (next.length >= MAX_PHOTOS) break;
      if (f.type.startsWith("image/")) next.push({ file: f, url: URL.createObjectURL(f) });
    }
    setPhotos(next);
  };
  return (
    <div>
      <StepTitle title={label} subtitle={`Choisissez jusqu'à ${MAX_PHOTOS} photos d'un coup dans votre galerie. Les photos sont allégées automatiquement.`} />
      <div className="grid grid-cols-3 gap-2.5">
        {photos.map((p, i) => (
          <div key={p.url} className="group relative aspect-square overflow-hidden rounded-xl bg-muted">
            <img src={p.url} alt="" className="h-full w-full object-cover" />
            {i === 0 && <span className="absolute left-1.5 top-1.5 rounded-full bg-black/60 px-2 py-0.5 text-[10px] font-bold text-white">Couverture</span>}
            <button
              onClick={() => setPhotos(photos.filter((x) => x !== p))}
              className="absolute right-1.5 top-1.5 flex h-7 w-7 items-center justify-center rounded-full bg-black/60 text-white"
              aria-label="Retirer"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        ))}
        {photos.length < MAX_PHOTOS && (
          <button
            onClick={() => input.current?.click()}
            className="flex aspect-square flex-col items-center justify-center gap-1.5 rounded-xl border-2 border-dashed border-primary/40 bg-primary/5 text-primary transition-colors hover:bg-primary/10"
          >
            <ImagePlus className="h-7 w-7" />
            <span className="text-xs font-semibold">{photos.length ? "Ajouter" : "Choisir des photos"}</span>
          </button>
        )}
      </div>
      <input ref={input} type="file" accept="image/*" multiple className="hidden" onChange={(e) => { add(e.target.files); e.target.value = ""; }} />
      <p className="mt-4 text-sm text-muted-foreground">
        {photos.length ? `${photos.length} photo${photos.length > 1 ? "s" : ""} sélectionnée${photos.length > 1 ? "s" : ""}.` : "Pas de photo sous la main ? Passez cette étape, vous pourrez en ajouter plus tard."}
      </p>
    </div>
  );
}

// ============================================================
// Étape 5 — prestations
// ============================================================
function StepPrestations({ a, set, profession }: { a: OnboardingAnswers; set: (p: Partial<OnboardingAnswers>) => void; profession: Profession }) {
  const [newName, setNewName] = useState("");
  const update = (i: number, patch: Partial<OnboardingAnswers["services"][number]>) =>
    set({ services: a.services.map((s, j) => (j === i ? { ...s, ...patch } : s)) });
  const addCustom = () => {
    if (!newName.trim()) return;
    set({ services: [...a.services, { name: newName.trim(), price: "", selected: true }] });
    setNewName("");
  };
  const noun = profession.serviceBlock === "menu" ? "plats" : profession.serviceBlock === "offers" ? "offres" : "prestations";
  return (
    <div>
      <StepTitle title={`Vos ${noun}`} subtitle="Cochez ce que vous proposez. Le prix est facultatif, mais les clients adorent savoir." />
      <div className="space-y-2.5">
        {a.services.map((s, i) => (
          <div key={i} className={`rounded-xl border bg-card p-3.5 transition-colors ${s.selected ? "border-primary/60 bg-primary/[0.03]" : ""}`}>
            <label className="flex cursor-pointer items-center gap-3">
              <span className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-md border-2 transition-colors ${s.selected ? "border-primary bg-primary text-primary-foreground" : "border-muted-foreground/30"}`}>
                {s.selected && <Check className="h-4 w-4" />}
              </span>
              <input type="checkbox" className="sr-only" checked={s.selected} onChange={(e) => update(i, { selected: e.target.checked })} />
              <span className="flex-1 font-medium">{s.name}</span>
            </label>
            {s.selected && (
              <div className="ml-9 mt-2.5 flex items-center gap-2">
                <div className="relative flex-1">
                  <input
                    value={s.price}
                    onChange={(e) => update(i, { price: e.target.value })}
                    inputMode="numeric"
                    placeholder="Prix (facultatif)"
                    className="w-full rounded-lg border bg-background px-3 py-2 pr-14 text-[15px] outline-none focus:border-primary"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">FCFA</span>
                </div>
                {s.unit && <span className="shrink-0 text-xs text-muted-foreground">{s.unit}</span>}
              </div>
            )}
          </div>
        ))}
      </div>
      <div className="mt-3 flex gap-2">
        <input
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addCustom())}
          placeholder={`Ajouter ${profession.serviceBlock === "menu" ? "un plat" : "une prestation"}...`}
          className="flex-1 rounded-xl border bg-card px-4 py-3 text-[15px] outline-none focus:border-primary"
        />
        <button onClick={addCustom} disabled={!newName.trim()} className="rounded-xl border bg-card px-4 font-semibold disabled:opacity-40" aria-label="Ajouter">
          <Plus className="h-5 w-5" />
        </button>
      </div>
    </div>
  );
}

// ============================================================
// Étape 6 — présentation
// ============================================================
function StepPresentation({ a, set, profession }: { a: OnboardingAnswers; set: (p: Partial<OnboardingAnswers>) => void; profession: Profession }) {
  return (
    <div>
      <StepTitle title="Votre présentation" subtitle="On l'a rédigée pour vous à partir de vos réponses. Modifiez-la si vous voulez." />
      <div className="space-y-5">
        <Field label="Votre phrase d'accroche" hint="Une promesse courte, affichée en grand.">
          <input value={a.tagline} onChange={(e) => set({ tagline: e.target.value })} placeholder={profession.tagline || "Ex. Des tenues sur mesure qui vous ressemblent"} className={inputCls} maxLength={120} />
        </Field>
        <Field label="Qui êtes-vous ?">
          <textarea value={a.bio} onChange={(e) => set({ bio: e.target.value, bioEdited: true })} rows={7} className={`${inputCls} resize-none leading-relaxed`} />
        </Field>
        <button
          type="button"
          onClick={() => set({ bio: generatedBio(a), bioEdited: false })}
          className="inline-flex items-center gap-2 text-sm font-medium text-primary hover:underline"
        >
          <RefreshCw className="h-4 w-4" /> Proposer un autre texte à partir de mes réponses
        </button>
      </div>
    </div>
  );
}

// ============================================================
// Étape 7 — compte
// ============================================================
function StepCompte({
  a, set, password, setPassword, usernameState, error,
}: {
  a: OnboardingAnswers;
  set: (p: Partial<OnboardingAnswers>) => void;
  password: string;
  setPassword: (v: string) => void;
  usernameState: { checking: boolean; available: boolean | null; reason: string | null };
  error: string | null;
}) {
  const [show, setShow] = useState(false);
  return (
    <div>
      <StepTitle title="Dernière étape !" subtitle="Créez votre accès pour modifier votre page quand vous voulez." />
      <div className="space-y-5">
        <Field label="Adresse de votre page">
          <div className={`flex items-center overflow-hidden rounded-xl border bg-card focus-within:border-primary focus-within:ring-4 focus-within:ring-primary/10 ${usernameState.available === false ? "border-destructive" : ""}`}>
            <span className="shrink-0 pl-4 text-[15px] text-muted-foreground">{window.location.host}/</span>
            <input
              value={a.username}
              onChange={(e) => set({ username: slugify(e.target.value), usernameEdited: true })}
              className="min-w-0 flex-1 bg-transparent py-3.5 pr-3 text-[16px] font-semibold outline-none"
              autoCapitalize="off"
              autoCorrect="off"
            />
            <span className="pr-4">
              {usernameState.checking ? (
                <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
              ) : usernameState.available ? (
                <CheckCircle2 className="h-5 w-5 text-emerald-600" />
              ) : usernameState.available === false ? (
                <X className="h-5 w-5 text-destructive" />
              ) : null}
            </span>
          </div>
          {usernameState.available === false && <span className="mt-1.5 block text-xs text-destructive">{usernameState.reason}</span>}
        </Field>
        <Field label="Email">
          <div className="relative">
            <Mail className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
            <input type="email" value={a.email} onChange={(e) => set({ email: e.target.value.trim() })} placeholder="vous@exemple.com" className={`${inputCls} pl-12`} autoComplete="email" />
          </div>
        </Field>
        <Field label="Mot de passe" hint="6 caractères minimum.">
          <div className="relative">
            <Lock className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
            <input type={show ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)} className={`${inputCls} pl-12 pr-12`} autoComplete="new-password" />
            <button type="button" onClick={() => setShow(!show)} className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg p-1.5 text-muted-foreground hover:bg-muted" aria-label="Afficher le mot de passe">
              <Eye className="h-5 w-5" />
            </button>
          </div>
        </Field>
        {a.referralCode && (
          <p className="rounded-xl bg-emerald-500/10 px-4 py-3 text-sm text-emerald-700">
            🎁 Invité(e) avec le code <strong>{a.referralCode}</strong>
          </p>
        )}
        {error && <p className="rounded-xl bg-destructive/10 px-4 py-3 text-sm text-destructive">{error}</p>}
        <p className="text-xs text-muted-foreground">
          Déjà un compte ? <Link href="/connexion" className="font-semibold text-primary">Connectez-vous</Link>
        </p>
      </div>
    </div>
  );
}

// ============================================================
// Écran final
// ============================================================
function Success({ username, name, title }: { username: string; name: string; title: string }) {
  const [copied, setCopied] = useState(false);
  const url = portfolioUrl(username);
  return (
    <div className="min-h-screen bg-gradient-to-b from-primary/10 via-background to-background px-5 py-12">
      <div className="mx-auto max-w-md text-center">
        <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-emerald-500 text-white shadow-xl shadow-emerald-500/30">
          <Check className="h-10 w-10" strokeWidth={3} />
        </div>
        <h1 className="mt-6 text-3xl font-bold tracking-tight">Votre portfolio est en ligne !</h1>
        <p className="mt-3 text-muted-foreground">Partagez-le dès maintenant avec vos clients.</p>

        <div className="mt-8 rounded-2xl border bg-card p-4 text-left shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Votre adresse</p>
          <div className="mt-2 flex items-center gap-2">
            <p className="min-w-0 flex-1 truncate text-lg font-bold text-primary">{portfolioDisplayUrl(username)}</p>
            <button
              onClick={async () => {
                if (await copyText(url)) {
                  setCopied(true);
                  setTimeout(() => setCopied(false), 2000);
                }
              }}
              className="inline-flex items-center gap-1.5 rounded-lg border px-3 py-2 text-sm font-medium hover:bg-muted"
            >
              {copied ? <Check className="h-4 w-4 text-emerald-600" /> : <Copy className="h-4 w-4" />} {copied ? "Copié" : "Copier"}
            </button>
          </div>
        </div>

        <div className="mt-4 grid gap-3">
          <a href={whatsappShare(shareMessage(username, name, title))} target="_blank" rel="noreferrer" className="flex items-center justify-center gap-2 rounded-xl bg-[#25D366] py-4 font-semibold text-white shadow-lg shadow-[#25D366]/25">
            <MessageCircle className="h-5 w-5" /> Partager sur WhatsApp
          </a>
          <div className="grid grid-cols-2 gap-3">
            <a href={`/${username}`} target="_blank" rel="noreferrer" className="flex items-center justify-center gap-2 rounded-xl border bg-card py-3.5 font-semibold hover:bg-muted">
              <ExternalLink className="h-4 w-4" /> Voir ma page
            </a>
            <Link href="/dashboard" className="flex items-center justify-center gap-2 rounded-xl bg-foreground py-3.5 font-semibold text-background">
              Mon espace <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>

        <div className="mt-10 rounded-2xl border bg-card p-6">
          <p className="font-semibold">Votre QR code</p>
          <p className="mb-4 mt-1 text-sm text-muted-foreground">À imprimer sur vos cartes, flyers ou dans votre boutique.</p>
          <PortfolioQrCode url={`${url}?src=qr`} filename={`qr-${username}`} size={160} />
        </div>
      </div>
    </div>
  );
}

// ============================================================
// Page
// ============================================================
export default function Onboarding() {
  const search = useSearch();
  const [, navigate] = useLocation();
  const { isAuthenticated, isLoading: authLoading, login } = useAuth();
  // Pendant la publication, la connexion automatique ne doit pas rediriger
  const submitting = useRef(false);
  const params = new URLSearchParams(search);

  const [answers, setAnswers] = useState<OnboardingAnswers>(() => {
    let draft: OnboardingAnswers = EMPTY_ANSWERS;
    try {
      const saved = localStorage.getItem(DRAFT_KEY);
      if (saved) draft = { ...EMPTY_ANSWERS, ...JSON.parse(saved) };
    } catch {
      /* brouillon illisible */
    }
    const metier = params.get("metier");
    if (metier && getProfession(metier).id === metier && draft.professionId !== metier) {
      const p = getProfession(metier);
      draft = { ...draft, professionId: p.id, services: suggestedServices(p), tagline: p.tagline, bioEdited: false };
    }
    const ref = params.get("ref");
    if (ref) draft = { ...draft, referralCode: ref.toUpperCase() };
    return draft;
  });
  const [step, setStep] = useState<number>(() => (answers.professionId ? 1 : 0));
  const [avatar, setAvatar] = useState<LocalPhoto | null>(null);
  const [photos, setPhotos] = useState<LocalPhoto[]>([]);
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState<string | null>(null);
  const [done, setDone] = useState<{ username: string } | null>(null);
  const [usernameState, setUsernameState] = useState<{ checking: boolean; available: boolean | null; reason: string | null }>({ checking: false, available: null, reason: null });
  const [showPreview, setShowPreview] = useState(false);

  const register = useRegister();
  const profession = professionOf(answers);
  const current = STEPS[step];

  const set = (patch: Partial<OnboardingAnswers>) => setAnswers((a) => ({ ...a, ...patch }));

  // Déjà connecté en arrivant : direction le tableau de bord
  useEffect(() => {
    if (!authLoading && isAuthenticated && !submitting.current) navigate("/dashboard");
  }, [authLoading, isAuthenticated, navigate]);

  // Brouillon (sans mot de passe ni photos)
  useEffect(() => {
    try {
      localStorage.setItem(DRAFT_KEY, JSON.stringify(answers));
    } catch {
      /* stockage plein ou désactivé */
    }
  }, [answers]);

  // Bio rédigée automatiquement tant que la personne ne l'a pas modifiée
  useEffect(() => {
    if (!answers.bioEdited) {
      const bio = generatedBio(answers);
      if (bio !== answers.bio) set({ bio });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [answers.professionId, answers.professionCustom, answers.city, answers.years, answers.services, answers.bioEdited]);

  // Identifiant proposé à partir du nom
  useEffect(() => {
    if (current.id !== "compte") return;
    const wanted = answers.usernameEdited ? answers.username : "";
    if (answers.usernameEdited && wanted.length < 3) {
      setUsernameState({ checking: false, available: false, reason: "3 caractères minimum" });
      return;
    }
    setUsernameState((s) => ({ ...s, checking: true }));
    const t = setTimeout(async () => {
      try {
        const res = answers.usernameEdited ? await checkUsername({ u: wanted }) : await checkUsername({ name: answers.fullName });
        if (!answers.usernameEdited) set({ username: res.suggestion });
        setUsernameState({ checking: false, available: answers.usernameEdited ? res.available : true, reason: res.reason });
      } catch {
        setUsernameState({ checking: false, available: null, reason: null });
      }
    }, 350);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [current.id, answers.username, answers.usernameEdited, answers.fullName]);

  // Libérer les URLs locales des photos
  useEffect(() => () => {
    photos.forEach((p) => URL.revokeObjectURL(p.url));
    if (avatar) URL.revokeObjectURL(avatar.url);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const pickProfession = (p: Profession, custom?: string) => {
    const changed = p.id !== answers.professionId || (custom ?? "") !== answers.professionCustom;
    set({
      professionId: p.id,
      professionCustom: custom ?? "",
      ...(changed ? { services: suggestedServices(p), tagline: p.tagline, bioEdited: false } : {}),
    });
    setStep(1);
  };

  const canContinue = (() => {
    switch (current.id) {
      case "metier": return !!answers.professionId;
      case "vous": return answers.fullName.trim().length >= 2 && answers.phone.replace(/\D/g, "").length >= 8;
      case "prestations": return true;
      case "compte":
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(answers.email) && password.length >= 6 && answers.username.length >= 3 && usernameState.available !== false && !usernameState.checking;
      default: return true;
    }
  })();

  const remaining = STEPS.slice(step).reduce((s, x) => s + x.seconds, 0);
  const demoImages = useMemo(() => IMAGE_SETS[profession.imageSet].slice(0, 6).map((id) => unsplash(id, 600)), [profession.imageSet]);
  const preview = useMemo(
    () => previewData(answers, photos.map((p) => p.url), avatar?.url ?? null, demoImages),
    [answers, photos, avatar, demoImages]
  );

  async function finish() {
    submitting.current = true;
    setError(null);
    setProgress("Création de votre page...");
    const country = getCountry(answers.countryCode);
    try {
      const res = await register.mutateAsync({
        data: {
          email: answers.email,
          password,
          username: answers.username,
          referralCode: answers.referralCode || undefined,
          fullName: answers.fullName.trim(),
          profession: profession.id,
          professionCustom: answers.professionCustom || undefined,
          profileType: profession.family,
          template: profession.template,
          title: titleOf(answers) || undefined,
          tagline: answers.tagline.trim() || undefined,
          bio: answers.bio.trim() || undefined,
          city: answers.city.trim() || undefined,
          country: country.name,
          whatsapp: whatsappOf(answers),
          yearsExperience: answers.years ?? undefined,
          blocks: blocksToApi(buildBlocks(answers, [])) as Block[],
        },
      });
      login(res.token, res.user);

      // Photos : envoyées après la création du compte (il faut être connecté)
      if (avatar) {
        setProgress("Envoi de votre photo...");
        await uploadPhoto(avatar.file, "avatar").catch(() => null);
      }
      if (photos.length) {
        const urls: string[] = [];
        for (let i = 0; i < photos.length; i++) {
          setProgress(`Envoi des photos (${i + 1}/${photos.length})...`);
          const url = await uploadPhoto(photos[i].file).catch(() => null);
          if (url) urls.push(url);
        }
        if (urls.length) {
          setProgress("Mise en page...");
          await apiClient.put("/api/blocks", { blocks: blocksToApi(buildBlocks(answers, urls)) });
        }
      }
      localStorage.removeItem(DRAFT_KEY);
      setDone({ username: res.user.username });
    } catch (err: any) {
      submitting.current = false;
      setProgress(null);
      if (err?.data?.field === "username") setUsernameState({ checking: false, available: false, reason: err.message });
      setError(err?.message || "Une erreur est survenue. Réessayez.");
    }
  }

  const next = () => {
    if (!canContinue) return;
    if (current.id === "compte") return finish();
    setStep((s) => Math.min(STEPS.length - 1, s + 1));
    window.scrollTo({ top: 0 });
  };
  const back = () => (step === 0 ? navigate("/") : setStep((s) => s - 1));
  const skippable = current.id === "photo" || current.id === "realisations";
  const hasContentForStep = current.id === "photo" ? !!avatar : current.id === "realisations" ? photos.length > 0 : true;

  if (done) return <Success username={done.username} name={answers.fullName} title={titleOf(answers)} />;

  return (
    <div className="min-h-screen bg-background lg:grid lg:grid-cols-[minmax(0,1fr)_minmax(420px,0.9fr)]">
      {/* ── Formulaire ── */}
      <div className="flex min-h-screen flex-col">
        <header className="sticky top-0 z-20 border-b bg-background/95 backdrop-blur">
          <div className="mx-auto flex h-14 max-w-xl items-center gap-3 px-5">
            <button onClick={back} className="-ml-2 rounded-lg p-2 hover:bg-muted" aria-label="Retour">
              <ArrowLeft className="h-5 w-5" />
            </button>
            <div className="flex-1">
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span className="font-medium text-foreground">{current.label}</span>
                <span>{step + 1}/{STEPS.length} · ~{Math.max(1, Math.round(remaining / 60))} min</span>
              </div>
              <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-muted">
                <div className="h-full rounded-full bg-primary transition-all duration-500" style={{ width: `${((step + 1) / STEPS.length) * 100}%` }} />
              </div>
            </div>
            <Link href="/" aria-label="Accueil" className="hidden sm:block"><LogoMark className="h-7 w-7" /></Link>
          </div>
        </header>

        <main className="mx-auto w-full max-w-xl flex-1 px-5 pb-40 pt-8">
          {current.id === "metier" && <StepMetier answers={answers} onPick={pickProfession} />}
          {current.id === "vous" && <StepVous a={answers} set={set} />}
          {current.id === "photo" && <StepPhoto avatar={avatar} setAvatar={setAvatar} professionTitle={titleOf(answers)} />}
          {current.id === "realisations" && <StepRealisations photos={photos} setPhotos={setPhotos} label={profession.photosLabel} />}
          {current.id === "prestations" && <StepPrestations a={answers} set={set} profession={profession} />}
          {current.id === "presentation" && <StepPresentation a={answers} set={set} profession={profession} />}
          {current.id === "compte" && (
            <StepCompte a={answers} set={set} password={password} setPassword={setPassword} usernameState={usernameState} error={error} />
          )}
        </main>

        {/* ── Barre d'action ── */}
        {current.id !== "metier" && (
          <div className="fixed inset-x-0 bottom-0 z-30 border-t bg-background/95 backdrop-blur lg:right-auto lg:w-[calc(100%-max(420px,47.37%))]">
            <div className="mx-auto flex max-w-xl items-center gap-3 px-5 py-3.5">
              <button onClick={() => setShowPreview(true)} className="flex items-center gap-1.5 rounded-xl border px-4 py-3.5 text-sm font-semibold lg:hidden">
                <Eye className="h-4 w-4" /> Aperçu
              </button>
              {skippable && !hasContentForStep ? (
                <button onClick={next} className="flex-1 rounded-xl border py-3.5 font-semibold hover:bg-muted">
                  Passer cette étape
                </button>
              ) : (
                <button
                  onClick={next}
                  disabled={!canContinue || !!progress}
                  className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-primary py-3.5 font-semibold text-primary-foreground shadow-lg shadow-primary/25 transition-opacity disabled:opacity-40"
                >
                  {progress ? (
                    <><Loader2 className="h-5 w-5 animate-spin" /> {progress}</>
                  ) : current.id === "compte" ? (
                    <><Sparkles className="h-5 w-5" /> Publier mon portfolio</>
                  ) : (
                    <>Continuer <ArrowRight className="h-5 w-5" /></>
                  )}
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      {/* ── Aperçu en direct (ordinateur) ── */}
      <aside className="sticky top-0 hidden h-screen flex-col items-center justify-center overflow-hidden bg-[#1a1410] px-10 lg:flex">
        <div className="pointer-events-none absolute -top-32 right-0 h-96 w-96 rounded-full bg-primary/30 blur-[120px]" />
        <p className="relative mb-5 inline-flex items-center gap-2 text-sm font-medium text-white/70">
          <span className="h-2 w-2 animate-pulse rounded-full bg-emerald-400" /> Aperçu en direct de votre page
        </p>
        <PhoneMockup className="relative w-[330px]">
          <PreviewFrame virtualWidth={390} aspect={1.95} interactive>
            <PortfolioView data={preview} mode="preview" />
          </PreviewFrame>
        </PhoneMockup>
        {!photos.length && answers.professionId && (
          <p className="relative mt-4 text-xs text-white/50">Photos d'exemple : ajoutez les vôtres à l'étape « Vos réalisations ».</p>
        )}
      </aside>

      {/* ── Aperçu (mobile) ── */}
      {showPreview && (
        <div className="fixed inset-0 z-50 flex flex-col bg-[#1a1410] lg:hidden">
          <div className="flex items-center justify-between px-4 py-3 text-white">
            <span className="text-sm font-semibold">Aperçu de votre page</span>
            <button onClick={() => setShowPreview(false)} className="rounded-lg p-2 hover:bg-white/10" aria-label="Fermer l'aperçu">
              <X className="h-5 w-5" />
            </button>
          </div>
          <div className="flex-1 overflow-y-auto bg-white">
            <PortfolioView data={preview} mode="preview" />
          </div>
        </div>
      )}
    </div>
  );
}

