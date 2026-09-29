import { useRef, useState, type ReactNode } from "react";
import { ChevronDown, ChevronUp, ImagePlus, Loader2, Plus, Star, Trash2, X } from "lucide-react";
import { uploadPhoto } from "@/lib/image";
import { fieldCls } from "@/components/dashboard/ui";
import { useToast } from "@/hooks/use-toast";

// ── Envoi d'image ───────────────────────────────────────────
export function useImageUpload() {
  const { toast } = useToast();
  const [busy, setBusy] = useState(0);
  const upload = async (file: File): Promise<string | null> => {
    setBusy((n) => n + 1);
    try {
      return await uploadPhoto(file);
    } catch (e: any) {
      toast({ title: "Envoi impossible", description: e?.message ?? "Réessayez avec une autre image.", variant: "destructive" });
      return null;
    } finally {
      setBusy((n) => n - 1);
    }
  };
  return { upload, busy: busy > 0 };
}

export function ImageField({ value, onChange, label = "Photo", aspect = "aspect-[4/3]" }: { value?: string; onChange: (url: string | undefined) => void; label?: string; aspect?: string }) {
  const input = useRef<HTMLInputElement>(null);
  const { upload, busy } = useImageUpload();
  return (
    <div>
      <span className="mb-1.5 block text-sm font-medium">{label}</span>
      <div className={`group relative ${aspect} w-full overflow-hidden rounded-xl border-2 border-dashed bg-muted/40`}>
        {value ? (
          <>
            <img src={value} alt="" className="h-full w-full object-cover" />
            <div className="absolute inset-x-0 bottom-0 flex justify-end gap-1.5 bg-gradient-to-t from-black/60 to-transparent p-2">
              <button type="button" onClick={() => input.current?.click()} className="rounded-lg bg-white/90 px-2.5 py-1 text-xs font-semibold text-black">Changer</button>
              <button type="button" onClick={() => onChange(undefined)} className="rounded-lg bg-white/90 p-1 text-black" aria-label="Retirer"><X className="h-4 w-4" /></button>
            </div>
          </>
        ) : (
          <button type="button" onClick={() => input.current?.click()} className="flex h-full w-full flex-col items-center justify-center gap-1.5 text-muted-foreground hover:text-primary">
            {busy ? <Loader2 className="h-6 w-6 animate-spin" /> : <ImagePlus className="h-6 w-6" />}
            <span className="text-xs font-medium">{busy ? "Envoi..." : "Ajouter"}</span>
          </button>
        )}
        {busy && value && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/40"><Loader2 className="h-6 w-6 animate-spin text-white" /></div>
        )}
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
          const url = await upload(f);
          if (url) onChange(url);
        }}
      />
    </div>
  );
}

// ── Liste d'étiquettes ──────────────────────────────────────
export function TagsInput({ value, onChange, placeholder }: { value: string[]; onChange: (v: string[]) => void; placeholder?: string }) {
  const [text, setText] = useState("");
  const add = () => {
    const parts = text.split(",").map((s) => s.trim()).filter(Boolean);
    if (!parts.length) return;
    onChange([...value, ...parts.filter((p) => !value.includes(p))]);
    setText("");
  };
  return (
    <div className="rounded-xl border bg-background p-2 focus-within:border-primary focus-within:ring-4 focus-within:ring-primary/10">
      <div className="flex flex-wrap gap-1.5">
        {value.map((t, i) => (
          <span key={`${t}-${i}`} className="inline-flex items-center gap-1 rounded-full bg-primary/10 py-1 pl-3 pr-1.5 text-sm font-medium text-primary">
            {t}
            <button type="button" onClick={() => onChange(value.filter((_, j) => j !== i))} className="rounded-full p-0.5 hover:bg-primary/20" aria-label={`Retirer ${t}`}>
              <X className="h-3.5 w-3.5" />
            </button>
          </span>
        ))}
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === ",") {
              e.preventDefault();
              add();
            }
            if (e.key === "Backspace" && !text && value.length) onChange(value.slice(0, -1));
          }}
          onBlur={add}
          placeholder={value.length ? "Ajouter..." : placeholder}
          className="min-w-[8rem] flex-1 bg-transparent px-2 py-1 text-[15px] outline-none"
        />
      </div>
    </div>
  );
}

export function RatingInput({ value = 5, onChange }: { value?: number; onChange: (v: number) => void }) {
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((n) => (
        <button key={n} type="button" onClick={() => onChange(n)} aria-label={`${n} étoile${n > 1 ? "s" : ""}`}>
          <Star className={`h-6 w-6 ${n <= value ? "fill-[#F5B400] text-[#F5B400]" : "text-muted-foreground/30"}`} />
        </button>
      ))}
    </div>
  );
}

// ── Champs décrits par configuration ────────────────────────
export type FieldType = "text" | "textarea" | "price" | "image" | "rating" | "tags" | "url" | "bool";

export interface FieldDef {
  key: string;
  label: string;
  type: FieldType;
  placeholder?: string;
  half?: boolean;
  hint?: string;
}

export function FieldInput({ def, value, onChange }: { def: FieldDef; value: any; onChange: (v: any) => void }) {
  switch (def.type) {
    case "textarea":
      return <textarea value={value ?? ""} onChange={(e) => onChange(e.target.value)} rows={3} placeholder={def.placeholder} className={`${fieldCls} resize-y`} />;
    case "price":
      return (
        <div className="relative">
          <input value={value ?? ""} onChange={(e) => onChange(e.target.value)} placeholder={def.placeholder ?? "15 000"} inputMode="numeric" className={`${fieldCls} pr-16`} />
          <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">FCFA</span>
        </div>
      );
    case "image":
      return <ImageField value={value} onChange={onChange} label={def.label} />;
    case "rating":
      return <RatingInput value={value ?? 5} onChange={onChange} />;
    case "tags":
      return <TagsInput value={Array.isArray(value) ? value : []} onChange={onChange} placeholder={def.placeholder} />;
    case "bool":
      return (
        <label className="flex cursor-pointer items-center gap-2.5 text-sm">
          <input type="checkbox" checked={!!value} onChange={(e) => onChange(e.target.checked)} className="h-4 w-4 accent-[hsl(var(--primary))]" />
          {def.placeholder}
        </label>
      );
    case "url":
      return <input type="url" value={value ?? ""} onChange={(e) => onChange(e.target.value)} placeholder={def.placeholder ?? "https://"} className={fieldCls} />;
    default:
      return <input value={value ?? ""} onChange={(e) => onChange(e.target.value)} placeholder={def.placeholder} className={fieldCls} />;
  }
}

/** Liste d'éléments éditables (prestations, avis, diplômes...) */
export function ItemsEditor<T extends Record<string, any>>({
  items, onChange, fields, itemLabel, addLabel, newItem, summary,
}: {
  items: T[];
  onChange: (items: T[]) => void;
  fields: FieldDef[];
  itemLabel: string;
  /** Ex. "Ajouter une prestation" */
  addLabel: string;
  newItem: () => T;
  summary?: (item: T) => ReactNode;
}) {
  const [open, setOpen] = useState<number | null>(null);
  const update = (i: number, patch: Partial<T>) => onChange(items.map((it, j) => (j === i ? { ...it, ...patch } : it)));
  const move = (i: number, dir: -1 | 1) => {
    const j = i + dir;
    if (j < 0 || j >= items.length) return;
    const next = [...items];
    [next[i], next[j]] = [next[j], next[i]];
    onChange(next);
    setOpen(j);
  };
  const add = () => {
    onChange([...items, newItem()]);
    setOpen(items.length);
  };
  const first = fields[0].key;

  return (
    <div className="space-y-2.5">
      {items.map((it, i) => {
        const isOpen = open === i;
        return (
          <div key={i} className={`rounded-xl border bg-card transition-shadow ${isOpen ? "shadow-sm ring-1 ring-primary/20" : ""}`}>
            <div className="flex items-center gap-2 px-3 py-2.5">
              <button type="button" onClick={() => setOpen(isOpen ? null : i)} className="min-w-0 flex-1 text-left">
                <span className="block truncate text-sm font-medium">{(summary?.(it) ?? it[first]) || <span className="text-muted-foreground">{itemLabel} sans titre</span>}</span>
              </button>
              <button type="button" onClick={() => move(i, -1)} disabled={i === 0} className="rounded-md p-1 text-muted-foreground hover:bg-muted disabled:opacity-30" aria-label="Monter"><ChevronUp className="h-4 w-4" /></button>
              <button type="button" onClick={() => move(i, 1)} disabled={i === items.length - 1} className="rounded-md p-1 text-muted-foreground hover:bg-muted disabled:opacity-30" aria-label="Descendre"><ChevronDown className="h-4 w-4" /></button>
              <button type="button" onClick={() => onChange(items.filter((_, j) => j !== i))} className="rounded-md p-1 text-muted-foreground hover:bg-destructive/10 hover:text-destructive" aria-label="Supprimer"><Trash2 className="h-4 w-4" /></button>
            </div>
            {isOpen && (
              <div className="grid grid-cols-2 gap-3 border-t px-3 pb-4 pt-3">
                {fields.map((f) => (
                  <div key={f.key} className={f.half ? "col-span-1" : "col-span-2"}>
                    {f.type !== "image" && <span className="mb-1.5 block text-sm font-medium">{f.label}</span>}
                    <FieldInput def={f} value={it[f.key]} onChange={(v) => update(i, { [f.key]: v } as Partial<T>)} />
                    {f.hint && <span className="mt-1 block text-xs text-muted-foreground">{f.hint}</span>}
                  </div>
                ))}
              </div>
            )}
          </div>
        );
      })}
      <button type="button" onClick={add} className="flex w-full items-center justify-center gap-2 rounded-xl border-2 border-dashed py-3 text-sm font-semibold text-muted-foreground hover:border-primary hover:text-primary">
        <Plus className="h-4 w-4" /> {addLabel}
      </button>
    </div>
  );
}
