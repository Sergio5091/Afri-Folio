import { useEffect, useMemo, useRef, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { Camera, Check, Loader2, RefreshCw, Search, Sparkles, X } from "lucide-react";
import {
  getGetProfileQueryKey, getGetDashboardSummaryQueryKey, useGetProfile, useUpdateProfile, type Profile,
} from "@workspace/api-client-react";
import { DashboardLayout } from "@/components/dashboard-layout";
import { FormField, PageHeader, Panel, Toggle, fieldCls } from "@/components/dashboard/ui";
import { useToast } from "@/hooks/use-toast";
import { uploadPhoto } from "@/lib/image";
import { FAMILIES, buildBio, getProfession, searchProfessions, type Profession } from "@/lib/professions";
import { TEMPLATES } from "@/lib/templates";
import { COUNTRIES } from "@/lib/countries";

type Form = Partial<Profile>;

const SOCIALS: { key: keyof Profile; label: string; placeholder: string }[] = [
  { key: "instagram", label: "Instagram", placeholder: "https://instagram.com/votre-compte" },
  { key: "facebook", label: "Facebook", placeholder: "https://facebook.com/votre-page" },
  { key: "tiktok", label: "TikTok", placeholder: "https://tiktok.com/@votre-compte" },
  { key: "youtube", label: "YouTube", placeholder: "https://youtube.com/@votre-chaine" },
  { key: "linkedin", label: "LinkedIn", placeholder: "https://linkedin.com/in/..." },
  { key: "website", label: "Site web", placeholder: "https://..." },
  { key: "github", label: "GitHub", placeholder: "https://github.com/..." },
  { key: "twitter", label: "X / Twitter", placeholder: "https://x.com/..." },
];

function PhotoUpload({ value, onUploaded, kind, label }: { value?: string | null; onUploaded: (url: string | null) => void; kind: "avatar" | "logo"; label: string }) {
  const input = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const { toast } = useToast();
  return (
    <div className="flex items-center gap-4">
      <button
        type="button"
        onClick={() => input.current?.click()}
        className={`group relative flex shrink-0 items-center justify-center overflow-hidden border-2 border-dashed bg-muted/40 ${kind === "avatar" ? "h-20 w-20 rounded-full" : "h-16 w-28 rounded-xl"}`}
      >
        {value ? <img src={value} alt="" className={`h-full w-full ${kind === "avatar" ? "object-cover" : "object-contain p-2"}`} /> : <Camera className="h-6 w-6 text-muted-foreground" />}
        <span className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 transition-opacity group-hover:opacity-100">
          {busy ? <Loader2 className="h-5 w-5 animate-spin text-white" /> : <Camera className="h-5 w-5 text-white" />}
        </span>
        {busy && <span className="absolute inset-0 flex items-center justify-center bg-black/40"><Loader2 className="h-5 w-5 animate-spin text-white" /></span>}
      </button>
      <div>
        <p className="text-sm font-medium">{label}</p>
        <div className="mt-1 flex gap-3 text-sm">
          <button type="button" onClick={() => input.current?.click()} className="font-semibold text-primary hover:underline">{value ? "Changer" : "Ajouter"}</button>
          {value && <button type="button" onClick={() => onUploaded(null)} className="text-muted-foreground hover:text-destructive">Retirer</button>}
        </div>
      </div>
      <input
        ref={input}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={async (e) => {
          const f = e.target.files?.[0];
          e.target.value = "";
          if (!f) return;
          setBusy(true);
          try {
            onUploaded(await uploadPhoto(f, kind));
          } catch (err: any) {
            toast({ title: "Envoi impossible", description: err?.message, variant: "destructive" });
          } finally {
            setBusy(false);
          }
        }}
      />
    </div>
  );
}

function ProfessionPicker({ value, custom, onPick }: { value?: string | null; custom?: string | null; onPick: (p: Profession, custom?: string) => void }) {
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");
  const results = useMemo(() => searchProfessions(q, 8), [q]);
  const current = getProfession(value);
  return (
    <div className="relative">
      <button type="button" onClick={() => setOpen(!open)} className={`${fieldCls} flex items-center gap-2 text-left`}>
        <span>{current.emoji}</span>
        <span className="flex-1 truncate">{current.id === "autre" ? custom || "Autre métier" : current.label}</span>
        <span className="text-xs text-muted-foreground">Changer</span>
      </button>
      {open && (
        <div className="absolute z-20 mt-2 w-full rounded-xl border bg-card p-2 shadow-xl">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input autoFocus value={q} onChange={(e) => setQ(e.target.value)} placeholder="Rechercher un métier..." className={`${fieldCls} pl-9`} />
          </div>
          <div className="mt-1 max-h-64 overflow-y-auto">
            {results.map((p) => (
              <button key={p.id} type="button" onClick={() => { onPick(p); setOpen(false); setQ(""); }} className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2.5 text-left text-sm hover:bg-muted">
                <span>{p.emoji}</span>
                <span className="flex-1">{p.label}</span>
                <span className="text-xs text-muted-foreground">{FAMILIES[p.family].label}</span>
              </button>
            ))}
            {q.trim().length >= 2 && (
              <button type="button" onClick={() => { onPick(getProfession("autre"), q.trim()); setOpen(false); setQ(""); }} className="flex w-full items-center gap-2 rounded-lg px-3 py-2.5 text-left text-sm font-medium text-primary hover:bg-muted">
                Utiliser « {q.trim()} »
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default function ProfileEdit() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { data: profile, isLoading } = useGetProfile();
  const update = useUpdateProfile();
  const [form, setForm] = useState<Form>({});
  const [dirty, setDirty] = useState(false);
  const [suggestTemplate, setSuggestTemplate] = useState<string | null>(null);

  useEffect(() => {
    if (profile && !dirty) setForm(profile);
  }, [profile, dirty]);

  const set = (patch: Form) => {
    setForm((f) => ({ ...f, ...patch }));
    setDirty(true);
  };

  const persist = (patch: Form, message = "Modifications enregistrées") =>
    update.mutate(
      { data: patch },
      {
        onSuccess: (data) => {
          queryClient.setQueryData(getGetProfileQueryKey(), data);
          queryClient.invalidateQueries({ queryKey: getGetDashboardSummaryQueryKey() });
          setForm(data);
          setDirty(false);
          toast({ title: message });
        },
        onError: (err: any) => toast({ title: "Erreur", description: err?.message, variant: "destructive" }),
      }
    );

  const pickProfession = (p: Profession, custom?: string) => {
    const previous = getProfession(form.profession);
    const titleWasDefault = !form.title || form.title === previous.title || form.title === form.professionCustom;
    set({
      profession: p.id,
      professionCustom: custom ?? null,
      profileType: p.family,
      ...(titleWasDefault ? { title: custom ?? p.title } : {}),
    });
    const currentTpl = form.template ?? previous.template;
    setSuggestTemplate(p.template !== currentTpl ? p.template : null);
  };

  const profession = getProfession(form.profession);

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="space-y-4">{[0, 1, 2].map((i) => <div key={i} className="h-40 animate-pulse rounded-2xl bg-muted" />)}</div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <PageHeader title="Infos & contact" description="Ce que vos clients voient en premier : qui vous êtes et comment vous joindre." />

      <form
        onSubmit={(e) => {
          e.preventDefault();
          persist(form);
        }}
        className="space-y-6 pb-24"
      >
        <Panel title="Photos">
          <div className="grid gap-6 sm:grid-cols-2">
            <PhotoUpload
              kind="avatar"
              label="Votre photo de profil"
              value={form.photoUrl}
              onUploaded={(url) => {
                setForm((f) => ({ ...f, photoUrl: url }));
                if (url === null) persist({ photoUrl: null }, "Photo retirée");
                else queryClient.invalidateQueries({ queryKey: getGetProfileQueryKey() });
              }}
            />
            <PhotoUpload
              kind="logo"
              label="Logo (facultatif)"
              value={form.logoUrl}
              onUploaded={(url) => {
                setForm((f) => ({ ...f, logoUrl: url }));
                if (url === null) persist({ logoUrl: null }, "Logo retiré");
                else queryClient.invalidateQueries({ queryKey: getGetProfileQueryKey() });
              }}
            />
          </div>
        </Panel>

        <Panel title="Identité">
          <div className="grid gap-5 sm:grid-cols-2">
            <FormField label="Nom affiché">
              <input value={form.fullName ?? ""} onChange={(e) => set({ fullName: e.target.value })} className={fieldCls} required minLength={2} />
            </FormField>
            <FormField label="Métier">
              <ProfessionPicker value={form.profession} custom={form.professionCustom} onPick={pickProfession} />
            </FormField>
            {suggestTemplate && (
              <div className="flex flex-col gap-3 rounded-xl border border-primary/30 bg-primary/5 p-4 sm:col-span-2 sm:flex-row sm:items-center">
                <Sparkles className="h-5 w-5 shrink-0 text-primary" />
                <p className="flex-1 text-sm">
                  Le style <strong>{TEMPLATES[suggestTemplate as keyof typeof TEMPLATES].name}</strong> est pensé pour ce métier. Voulez-vous l'appliquer ?
                </p>
                <div className="flex gap-2">
                  <button type="button" onClick={() => { set({ template: suggestTemplate, primaryColor: null }); setSuggestTemplate(null); }} className="rounded-lg bg-primary px-3 py-1.5 text-sm font-semibold text-primary-foreground">Appliquer</button>
                  <button type="button" onClick={() => setSuggestTemplate(null)} className="rounded-lg px-3 py-1.5 text-sm hover:bg-muted"><X className="h-4 w-4" /></button>
                </div>
              </div>
            )}
            <FormField label="Titre affiché" hint="Ex. Couturière, Électricien agréé, Chef traiteur...">
              <input value={form.title ?? ""} onChange={(e) => set({ title: e.target.value })} className={fieldCls} />
            </FormField>
            <FormField label="Années d'expérience">
              <input type="number" min={0} max={70} value={form.yearsExperience ?? ""} onChange={(e) => set({ yearsExperience: e.target.value === "" ? null : Number(e.target.value) })} className={fieldCls} />
            </FormField>
            <FormField label="Phrase d'accroche" className="sm:col-span-2" hint="Une promesse courte, affichée en grand en haut de votre page.">
              <input value={form.tagline ?? ""} onChange={(e) => set({ tagline: e.target.value })} placeholder={profession.tagline} maxLength={120} className={fieldCls} />
            </FormField>
            <div className="sm:col-span-2">
              <FormField label="Présentation">
                <textarea value={form.bio ?? ""} onChange={(e) => set({ bio: e.target.value })} rows={6} className={`${fieldCls} resize-y leading-relaxed`} />
              </FormField>
              {profession.id !== "autre" && (
                <button
                  type="button"
                  onClick={() => set({ bio: buildBio(profession, { city: form.city ?? undefined, years: form.yearsExperience, services: profession.services.slice(0, 3).map((s) => s.name) }) })}
                  className="mt-2 inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:underline"
                >
                  <RefreshCw className="h-3.5 w-3.5" /> Proposer un texte type pour mon métier
                </button>
              )}
            </div>
          </div>
        </Panel>

        <Panel title="Contact & localisation" description="Le bouton WhatsApp est le moyen de contact le plus utilisé par vos clients.">
          <div className="grid gap-5 sm:grid-cols-2">
            <FormField label="Numéro WhatsApp" hint="Avec l'indicatif du pays, ex. +229 97 00 00 00">
              <input type="tel" value={form.whatsapp ?? ""} onChange={(e) => set({ whatsapp: e.target.value })} placeholder="+229 97 00 00 00" className={fieldCls} />
            </FormField>
            <FormField label="Email de contact">
              <input type="email" value={form.emailContact ?? ""} onChange={(e) => set({ emailContact: e.target.value })} className={fieldCls} />
            </FormField>
            <FormField label="Ville">
              <input value={form.city ?? ""} onChange={(e) => set({ city: e.target.value })} className={fieldCls} />
            </FormField>
            <FormField label="Pays">
              <select value={form.country ?? ""} onChange={(e) => set({ country: e.target.value })} className={fieldCls}>
                <option value="">—</option>
                {COUNTRIES.map((c) => <option key={c.code} value={c.name}>{c.name}</option>)}
              </select>
            </FormField>
          </div>
        </Panel>

        <Panel title="Réseaux sociaux" description="Facultatif : ils apparaissent dans la section contact.">
          <div className="grid gap-4 sm:grid-cols-2">
            {SOCIALS.map((s) => (
              <FormField key={s.key} label={s.label}>
                <input type="url" value={(form[s.key] as string) ?? ""} onChange={(e) => set({ [s.key]: e.target.value } as Form)} placeholder={s.placeholder} className={fieldCls} />
              </FormField>
            ))}
          </div>
        </Panel>

        <Panel title="Visibilité">
          <div className="space-y-5">
            <Toggle checked={form.availableForWork ?? true} onChange={(v) => set({ availableForWork: v })} label="Disponible pour de nouveaux clients" description="Affiche un badge « Disponible » sur votre page." />
            <Toggle checked={form.listedInDirectory ?? true} onChange={(v) => set({ listedInDirectory: v })} label="Apparaître dans l'annuaire AfriFolio" description="Les clients qui cherchent votre métier dans votre ville peuvent vous trouver." />
          </div>
        </Panel>

        {/* ── Barre d'enregistrement ── */}
        <div className={`fixed inset-x-0 bottom-16 z-30 border-t bg-card/95 backdrop-blur transition-transform md:bottom-0 md:left-64 ${dirty ? "translate-y-0" : "translate-y-[200%]"}`}>
          <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-3 sm:px-6 lg:px-10">
            <p className="text-sm text-muted-foreground">Modifications non enregistrées</p>
            <div className="flex gap-2">
              <button type="button" onClick={() => { setDirty(false); if (profile) setForm(profile); setSuggestTemplate(null); }} className="rounded-xl px-4 py-2.5 text-sm font-medium hover:bg-muted">
                Annuler
              </button>
              <button type="submit" disabled={update.isPending} className="inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground disabled:opacity-60">
                {update.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />} Enregistrer
              </button>
            </div>
          </div>
        </div>
      </form>
    </DashboardLayout>
  );
}
