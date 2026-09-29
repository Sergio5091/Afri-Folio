import { useRef } from "react";
import { ChevronLeft, ChevronRight, ImagePlus, Loader2, Plus, Trash2 } from "lucide-react";
import { BLOCKS, DAY_NAMES, DEFAULT_HOURS, type BlockDataMap, type BlockType, type DayHours, type MenuCategory } from "@/lib/blocks";
import { fieldCls, FormField, Toggle } from "@/components/dashboard/ui";
import { ItemsEditor, TagsInput, useImageUpload, type FieldDef } from "./fields";

// ============================================================
// Sections "liste d'éléments" décrites par configuration
// ============================================================
interface ItemsConfig {
  itemLabel: string;
  addLabel: string;
  fields: FieldDef[];
  newItem: () => any;
  summary?: (it: any) => string;
  help?: string;
}

const ITEMS: Partial<Record<BlockType, ItemsConfig>> = {
  services: {
    itemLabel: "Prestation",
    addLabel: "Ajouter une prestation",
    newItem: () => ({ name: "" }),
    summary: (it) => [it.name, it.price && `${it.price} F`].filter(Boolean).join(" · "),
    fields: [
      { key: "name", label: "Nom de la prestation", type: "text", placeholder: "Ex. Confection sur mesure" },
      { key: "price", label: "Prix", type: "price", half: true },
      { key: "unit", label: "Précision", type: "text", half: true, placeholder: "à partir de, par m²..." },
      { key: "description", label: "Description (facultatif)", type: "textarea", placeholder: "Ce qui est inclus, les délais..." },
    ],
  },
  offers: {
    itemLabel: "Offre",
    addLabel: "Ajouter une offre",
    newItem: () => ({ name: "", features: [] }),
    summary: (it) => [it.name, it.price && `${it.price} F`].filter(Boolean).join(" · "),
    fields: [
      { key: "name", label: "Nom de l'offre", type: "text", placeholder: "Ex. Programme 3 mois" },
      { key: "price", label: "Prix", type: "price", half: true },
      { key: "duration", label: "Durée / unité", type: "text", half: true, placeholder: "par mois, 4 séances..." },
      { key: "description", label: "Description courte", type: "text" },
      { key: "features", label: "Ce qui est inclus", type: "tags", placeholder: "Tapez puis Entrée" },
      { key: "highlighted", label: "Mise en avant", type: "bool", placeholder: "Mettre cette offre en avant (« le plus demandé »)" },
    ],
  },
  testimonials: {
    itemLabel: "Avis",
    addLabel: "Ajouter un avis",
    newItem: () => ({ name: "", text: "", rating: 5 }),
    help: "Demandez à 2 ou 3 clients satisfaits une phrase sur votre travail : c'est ce qui rassure le plus.",
    fields: [
      { key: "name", label: "Nom du client", type: "text", half: true, placeholder: "Christelle A." },
      { key: "role", label: "Précision (facultatif)", type: "text", half: true, placeholder: "Mariée, juin 2025" },
      { key: "text", label: "Son avis", type: "textarea" },
      { key: "rating", label: "Note", type: "rating" },
    ],
  },
  credentials: {
    itemLabel: "Diplôme",
    addLabel: "Ajouter un diplôme",
    newItem: () => ({ title: "" }),
    fields: [
      { key: "title", label: "Diplôme ou certification", type: "text" },
      { key: "issuer", label: "École / organisme", type: "text", half: true },
      { key: "year", label: "Année", type: "text", half: true, placeholder: "2019" },
    ],
  },
  experience: {
    itemLabel: "Expérience",
    addLabel: "Ajouter une expérience",
    newItem: () => ({ role: "" }),
    fields: [
      { key: "role", label: "Poste / rôle", type: "text" },
      { key: "org", label: "Entreprise / lieu", type: "text", half: true },
      { key: "period", label: "Période", type: "text", half: true, placeholder: "2020 — aujourd'hui" },
      { key: "description", label: "Description", type: "textarea" },
    ],
  },
  projects: {
    itemLabel: "Projet",
    addLabel: "Ajouter un projet",
    newItem: () => ({ title: "", tags: [] }),
    fields: [
      { key: "title", label: "Titre du projet", type: "text" },
      { key: "image", label: "Image", type: "image" },
      { key: "description", label: "Description", type: "textarea", placeholder: "Le besoin du client, ce que vous avez fait, le résultat." },
      { key: "url", label: "Lien (facultatif)", type: "url" },
      { key: "tags", label: "Mots-clés", type: "tags", placeholder: "React, E-commerce..." },
    ],
  },
  faq: {
    itemLabel: "Question",
    addLabel: "Ajouter une question",
    newItem: () => ({ q: "", a: "" }),
    fields: [
      { key: "q", label: "Question", type: "text", placeholder: "Faut-il payer un acompte ?" },
      { key: "a", label: "Réponse", type: "textarea" },
    ],
  },
  stats: {
    itemLabel: "Chiffre",
    addLabel: "Ajouter un chiffre",
    newItem: () => ({ value: "", label: "" }),
    summary: (it) => [it.value, it.label].filter(Boolean).join(" "),
    fields: [
      { key: "value", label: "Valeur", type: "text", half: true, placeholder: "150+" },
      { key: "label", label: "Libellé", type: "text", half: true, placeholder: "clients satisfaits" },
    ],
  },
  video: {
    itemLabel: "Vidéo",
    addLabel: "Ajouter une vidéo",
    newItem: () => ({ url: "" }),
    help: "Collez le lien d'une vidéo YouTube. Elle ne se charge qu'au clic : pas de données gaspillées.",
    fields: [
      { key: "url", label: "Lien YouTube", type: "url", placeholder: "https://youtu.be/..." },
      { key: "title", label: "Titre (facultatif)", type: "text" },
    ],
  },
  beforeAfter: {
    itemLabel: "Comparaison",
    addLabel: "Ajouter une comparaison",
    newItem: () => ({ before: "", after: "" }),
    summary: (it) => it.caption || (it.before && it.after ? "Avant / après" : ""),
    fields: [
      { key: "before", label: "Avant", type: "image", half: true },
      { key: "after", label: "Après", type: "image", half: true },
      { key: "caption", label: "Légende", type: "text", placeholder: "Rénovation d'une salle de bain" },
    ],
  },
};

// ============================================================
// Galerie
// ============================================================
function GalleryEditor({ data, onChange, photoLimit }: { data: BlockDataMap["gallery"]; onChange: (d: BlockDataMap["gallery"]) => void; photoLimit: number | null }) {
  const input = useRef<HTMLInputElement>(null);
  const { upload, busy } = useImageUpload();
  const items = data.items;
  const remaining = photoLimit == null ? Infinity : Math.max(0, photoLimit);

  const addFiles = async (files: FileList | null) => {
    if (!files) return;
    const list = Array.from(files).slice(0, remaining);
    const added: { url: string }[] = [];
    for (const f of list) {
      const url = await upload(f);
      if (url) added.push({ url });
    }
    if (added.length) onChange({ ...data, items: [...items, ...added] });
  };
  const move = (i: number, dir: -1 | 1) => {
    const j = i + dir;
    if (j < 0 || j >= items.length) return;
    const next = [...items];
    [next[i], next[j]] = [next[j], next[i]];
    onChange({ ...data, items: next });
  };

  return (
    <div>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {items.map((it, i) => (
          <div key={`${it.url}-${i}`} className="overflow-hidden rounded-xl border bg-card">
            <div className="relative aspect-square bg-muted">
              <img src={it.url} alt="" className="h-full w-full object-cover" />
              {i === 0 && <span className="absolute left-1.5 top-1.5 rounded-full bg-black/60 px-2 py-0.5 text-[10px] font-bold text-white">Couverture</span>}
              <div className="absolute right-1.5 top-1.5 flex gap-1">
                <button type="button" onClick={() => move(i, -1)} disabled={i === 0} className="rounded-md bg-white/90 p-1 text-black disabled:opacity-40" aria-label="Avant"><ChevronLeft className="h-3.5 w-3.5" /></button>
                <button type="button" onClick={() => move(i, 1)} disabled={i === items.length - 1} className="rounded-md bg-white/90 p-1 text-black disabled:opacity-40" aria-label="Après"><ChevronRight className="h-3.5 w-3.5" /></button>
                <button type="button" onClick={() => onChange({ ...data, items: items.filter((_, j) => j !== i) })} className="rounded-md bg-white/90 p-1 text-black" aria-label="Supprimer"><Trash2 className="h-3.5 w-3.5" /></button>
              </div>
            </div>
            <input
              value={it.caption ?? ""}
              onChange={(e) => onChange({ ...data, items: items.map((x, j) => (j === i ? { ...x, caption: e.target.value } : x)) })}
              placeholder="Légende (facultatif)"
              className="w-full border-t bg-transparent px-2.5 py-2 text-xs outline-none"
            />
          </div>
        ))}
        {remaining > 0 && (
          <button
            type="button"
            onClick={() => input.current?.click()}
            disabled={busy}
            className="flex aspect-square flex-col items-center justify-center gap-1.5 rounded-xl border-2 border-dashed text-muted-foreground hover:border-primary hover:text-primary"
          >
            {busy ? <Loader2 className="h-7 w-7 animate-spin" /> : <ImagePlus className="h-7 w-7" />}
            <span className="text-xs font-semibold">{busy ? "Envoi..." : "Ajouter des photos"}</span>
          </button>
        )}
      </div>
      <input ref={input} type="file" accept="image/*" multiple className="hidden" onChange={(e) => { addFiles(e.target.files); e.target.value = ""; }} />
      {photoLimit != null && (
        <p className="mt-3 text-xs text-muted-foreground">
          {remaining > 0 ? `Vous pouvez encore ajouter ${remaining} photo${remaining > 1 ? "s" : ""} avec le plan gratuit.` : "Limite de photos du plan gratuit atteinte. Passez Pro pour des photos illimitées."}
        </p>
      )}
    </div>
  );
}

// ============================================================
// Menu
// ============================================================
function MenuEditor({ data, onChange }: { data: BlockDataMap["menu"]; onChange: (d: BlockDataMap["menu"]) => void }) {
  const cats = data.categories;
  const setCat = (i: number, cat: MenuCategory) => onChange({ ...data, categories: cats.map((c, j) => (j === i ? cat : c)) });
  return (
    <div className="space-y-5">
      {cats.map((cat, i) => (
        <div key={i} className="rounded-2xl border bg-muted/30 p-3">
          <div className="mb-3 flex items-center gap-2">
            <input value={cat.name} onChange={(e) => setCat(i, { ...cat, name: e.target.value })} placeholder="Nom de la catégorie" className={`${fieldCls} font-semibold`} />
            {cats.length > 1 && (
              <button type="button" onClick={() => onChange({ ...data, categories: cats.filter((_, j) => j !== i) })} className="rounded-lg p-2 text-muted-foreground hover:bg-destructive/10 hover:text-destructive" aria-label="Supprimer la catégorie">
                <Trash2 className="h-4 w-4" />
              </button>
            )}
          </div>
          <ItemsEditor
            items={cat.items}
            onChange={(items) => setCat(i, { ...cat, items })}
            itemLabel="Plat"
            addLabel="Ajouter un plat"
            newItem={() => ({ name: "" })}
            summary={(it: any) => [it.name, it.price && `${it.price} F`].filter(Boolean).join(" · ")}
            fields={[
              { key: "name", label: "Nom", type: "text" },
              { key: "price", label: "Prix", type: "price", half: true },
              { key: "tag", label: "Étiquette", type: "text", half: true, placeholder: "Épicé, Nouveau..." },
              { key: "description", label: "Description", type: "text" },
              { key: "image", label: "Photo", type: "image" },
            ]}
          />
        </div>
      ))}
      <button type="button" onClick={() => onChange({ ...data, categories: [...cats, { name: "", items: [] }] })} className="inline-flex items-center gap-2 text-sm font-semibold text-primary hover:underline">
        <Plus className="h-4 w-4" /> Ajouter une catégorie
      </button>
      <FormField label="Note (facultatif)">
        <input value={data.note ?? ""} onChange={(e) => onChange({ ...data, note: e.target.value })} placeholder="Ex. Livraison gratuite dès 10 000 F" className={fieldCls} />
      </FormField>
    </div>
  );
}

// ============================================================
// Horaires
// ============================================================
function HoursEditor({ data, onChange }: { data: BlockDataMap["hours"]; onChange: (d: BlockDataMap["hours"]) => void }) {
  const order = [1, 2, 3, 4, 5, 6, 0];
  const days: DayHours[] = order.map((d) => data.days.find((x) => x.day === d) ?? DEFAULT_HOURS.find((x) => x.day === d)!);
  const setDay = (day: number, patch: Partial<DayHours>) => onChange({ ...data, days: days.map((d) => (d.day === day ? { ...d, ...patch } : d)) });
  const copyMonday = () => {
    const mon = days[0];
    onChange({ ...data, days: days.map((d) => (d.day >= 1 && d.day <= 5 ? { ...d, open: mon.open, from: mon.from, to: mon.to } : d)) });
  };
  return (
    <div>
      <div className="divide-y rounded-xl border">
        {days.map((d) => (
          <div key={d.day} className="flex items-center gap-3 px-3 py-2.5">
            <label className="flex w-28 shrink-0 cursor-pointer items-center gap-2 text-sm font-medium">
              <input type="checkbox" checked={d.open} onChange={(e) => setDay(d.day, { open: e.target.checked })} className="h-4 w-4 accent-[hsl(var(--primary))]" />
              {DAY_NAMES[d.day]}
            </label>
            {d.open ? (
              <div className="flex flex-1 items-center gap-2">
                <input type="time" value={d.from} onChange={(e) => setDay(d.day, { from: e.target.value })} className="w-full rounded-lg border bg-background px-2 py-1.5 text-sm" />
                <span className="text-muted-foreground">–</span>
                <input type="time" value={d.to} onChange={(e) => setDay(d.day, { to: e.target.value })} className="w-full rounded-lg border bg-background px-2 py-1.5 text-sm" />
              </div>
            ) : (
              <span className="flex-1 text-sm text-muted-foreground">Fermé</span>
            )}
          </div>
        ))}
      </div>
      <button type="button" onClick={copyMonday} className="mt-2 text-sm font-medium text-primary hover:underline">
        Appliquer les horaires du lundi à toute la semaine
      </button>
      <FormField label="Note (facultatif)" className="mt-4">
        <input value={data.note ?? ""} onChange={(e) => onChange({ ...data, note: e.target.value })} placeholder="Ex. Sur rendez-vous le dimanche" className={fieldCls} />
      </FormField>
    </div>
  );
}

// ============================================================
// Zone d'intervention
// ============================================================
function ZoneEditor({ data, onChange }: { data: BlockDataMap["zone"]; onChange: (d: BlockDataMap["zone"]) => void }) {
  return (
    <div className="space-y-5">
      <FormField label="Quartiers, villes ou régions" hint="Tapez un nom puis Entrée.">
        <TagsInput value={data.areas} onChange={(areas) => onChange({ ...data, areas })} placeholder="Ex. Akpakpa, Calavi..." />
      </FormField>
      <Toggle checked={data.travels ?? false} onChange={(travels) => onChange({ ...data, travels })} label="Je me déplace chez le client" />
      <FormField label="Note (facultatif)">
        <input value={data.note ?? ""} onChange={(e) => onChange({ ...data, note: e.target.value })} placeholder="Ex. Frais de déplacement offerts à Cotonou" className={fieldCls} />
      </FormField>
    </div>
  );
}

// ============================================================
// Aiguillage
// ============================================================
export function BlockEditor({ type, data, onChange, defaultTitle, photoLimit }: {
  type: BlockType;
  data: any;
  onChange: (data: any) => void;
  defaultTitle: string;
  /** Photos encore disponibles (plan gratuit) ; null = illimité */
  photoLimit: number | null;
}) {
  const config = ITEMS[type];
  return (
    <div className="space-y-6">
      <FormField label="Titre de la section" hint={`Laissez vide pour « ${defaultTitle} ».`}>
        <input value={data.title ?? ""} onChange={(e) => onChange({ ...data, title: e.target.value })} placeholder={defaultTitle} className={fieldCls} />
      </FormField>

      {config?.help && <p className="rounded-xl bg-primary/5 px-4 py-3 text-sm text-foreground/80">💡 {config.help}</p>}

      {type === "gallery" && <GalleryEditor data={data} onChange={onChange} photoLimit={photoLimit} />}
      {type === "menu" && <MenuEditor data={data} onChange={onChange} />}
      {type === "hours" && <HoursEditor data={data} onChange={onChange} />}
      {type === "zone" && <ZoneEditor data={data} onChange={onChange} />}
      {type === "skills" && (
        <FormField label="Compétences" hint="Tapez puis Entrée. Ex. Couture, Broderie, Wax...">
          <TagsInput value={data.items ?? []} onChange={(items) => onChange({ ...data, items })} />
        </FormField>
      )}
      {config && (
        <ItemsEditor
          items={data.items ?? []}
          onChange={(items) => onChange({ ...data, items })}
          fields={config.fields}
          itemLabel={config.itemLabel}
          addLabel={config.addLabel}
          newItem={config.newItem}
          summary={config.summary}
        />
      )}
      {type === "services" && (
        <FormField label="Note sous les tarifs (facultatif)">
          <input value={data.note ?? ""} onChange={(e) => onChange({ ...data, note: e.target.value })} placeholder="Ex. Tarifs indicatifs, devis gratuit sur WhatsApp" className={fieldCls} />
        </FormField>
      )}
    </div>
  );
}

/** Résumé court d'une section pour la liste de l'éditeur */
export function blockSummary(type: BlockType, data: any): { text: string; empty: boolean } {
  const n = (arr?: any[], pred: (x: any) => boolean = Boolean) => (Array.isArray(arr) ? arr.filter(pred).length : 0);
  const empty = !BLOCKS[type].hasContent(data);
  const plural = (k: number, one: string, many = `${one}s`) => `${k} ${k > 1 ? many : one}`;
  switch (type) {
    case "gallery": return { text: plural(n(data.items, (i) => i.url), "photo"), empty };
    case "beforeAfter": return { text: plural(n(data.items, (i) => i.before && i.after), "comparaison"), empty };
    case "services": return { text: plural(n(data.items, (i) => i.name), "prestation"), empty };
    case "menu": return { text: plural((data.categories ?? []).reduce((s: number, c: any) => s + n(c.items, (i) => i.name), 0), "plat"), empty };
    case "hours": return { text: plural(n(data.days, (d) => d.open), "jour ouvert", "jours ouverts"), empty };
    case "zone": return { text: (data.areas ?? []).slice(0, 3).join(", ") || "Aucune zone", empty };
    case "skills": return { text: plural(n(data.items), "compétence"), empty };
    case "testimonials": return { text: plural(n(data.items, (i) => i.text), "avis", "avis"), empty };
    case "offers": return { text: plural(n(data.items, (i) => i.name), "offre"), empty };
    case "faq": return { text: plural(n(data.items, (i) => i.q && i.a), "question"), empty };
    case "video": return { text: plural(n(data.items, (i) => i.url), "vidéo"), empty };
    default: return { text: plural(n(data.items), "élément"), empty };
  }
}

