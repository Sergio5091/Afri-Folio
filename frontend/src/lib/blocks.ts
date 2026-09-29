// ============================================================
// Sections (blocs) d'un portfolio
// Chaque bloc = un type de contenu avec son formulaire et son rendu.
// Doit rester aligné avec backend/src/config/constants.js (BLOCK_TYPES).
// ============================================================
import type { LucideIcon } from "lucide-react";
import {
  Images, SplitSquareHorizontal, Tags, UtensilsCrossed, Clock, MapPin, Award, Route,
  MessageSquareQuote, FolderKanban, Package, Sparkles, HelpCircle, BarChart3, PlayCircle,
} from "lucide-react";

export type BlockType =
  | "gallery" | "beforeAfter" | "services" | "menu" | "hours" | "zone" | "credentials"
  | "experience" | "testimonials" | "projects" | "offers" | "skills" | "faq" | "stats" | "video";

// ── Données de chaque type ──────────────────────────────────
export interface GalleryItem { url: string; caption?: string }
export interface BeforeAfterItem { before: string; after: string; caption?: string }
export interface ServiceItem { name: string; description?: string; price?: string; unit?: string }
export interface MenuItem { name: string; description?: string; price?: string; image?: string; tag?: string }
export interface MenuCategory { name: string; items: MenuItem[] }
export interface DayHours { day: number; open: boolean; from: string; to: string }
export interface Credential { title: string; issuer?: string; year?: string }
export interface ExperienceItem { role: string; org?: string; period?: string; description?: string }
export interface Testimonial { name: string; role?: string; text: string; rating?: number }
export interface ProjectItem { title: string; description?: string; image?: string; url?: string; tags?: string[] }
export interface OfferItem { name: string; description?: string; price?: string; duration?: string; features?: string[]; highlighted?: boolean }
export interface FaqItem { q: string; a: string }
export interface StatItem { value: string; label: string }
export interface VideoItem { url: string; title?: string }

export interface BlockDataMap {
  gallery: { title?: string; items: GalleryItem[] };
  beforeAfter: { title?: string; items: BeforeAfterItem[] };
  services: { title?: string; items: ServiceItem[]; note?: string };
  menu: { title?: string; categories: MenuCategory[]; note?: string };
  hours: { title?: string; days: DayHours[]; note?: string };
  zone: { title?: string; areas: string[]; travels?: boolean; note?: string };
  credentials: { title?: string; items: Credential[] };
  experience: { title?: string; items: ExperienceItem[] };
  testimonials: { title?: string; items: Testimonial[] };
  projects: { title?: string; items: ProjectItem[] };
  offers: { title?: string; items: OfferItem[] };
  skills: { title?: string; items: string[] };
  faq: { title?: string; items: FaqItem[] };
  stats: { title?: string; items: StatItem[] };
  video: { title?: string; items: VideoItem[] };
}

export interface TypedBlock<T extends BlockType = BlockType> {
  id?: number;
  type: T;
  visible: boolean;
  data: BlockDataMap[T];
}

export interface BlockMeta {
  type: BlockType;
  label: string;
  description: string;
  icon: LucideIcon;
  /** Titre affiché sur le portfolio si aucun titre personnalisé */
  defaultTitle: string;
  empty: () => any;
  /** La section a-t-elle du contenu à afficher ? */
  hasContent: (data: any) => boolean;
}

const items = (d: any) => (Array.isArray(d?.items) ? d.items : []);

export const DEFAULT_HOURS: DayHours[] = [1, 2, 3, 4, 5, 6, 0].map((day) => ({
  day,
  open: day !== 0,
  from: "08:00",
  to: day === 6 ? "14:00" : "18:00",
}));

export const BLOCKS: Record<BlockType, BlockMeta> = {
  gallery: {
    type: "gallery", label: "Galerie photos", icon: Images, defaultTitle: "Mes réalisations",
    description: "Montrez votre travail en photos",
    empty: () => ({ items: [] }),
    hasContent: (d) => items(d).some((i: GalleryItem) => i.url),
  },
  beforeAfter: {
    type: "beforeAfter", label: "Avant / Après", icon: SplitSquareHorizontal, defaultTitle: "Avant / Après",
    description: "Comparez le résultat de vos interventions",
    empty: () => ({ items: [] }),
    hasContent: (d) => items(d).some((i: BeforeAfterItem) => i.before && i.after),
  },
  services: {
    type: "services", label: "Prestations & tarifs", icon: Tags, defaultTitle: "Mes prestations",
    description: "Ce que vous proposez, avec vos prix",
    empty: () => ({ items: [] }),
    hasContent: (d) => items(d).some((i: ServiceItem) => i.name),
  },
  menu: {
    type: "menu", label: "Menu / Carte", icon: UtensilsCrossed, defaultTitle: "La carte",
    description: "Vos plats par catégorie avec les prix",
    empty: () => ({ categories: [{ name: "Plats", items: [] }] }),
    hasContent: (d) => (d?.categories ?? []).some((c: MenuCategory) => (c.items ?? []).some((i) => i.name)),
  },
  hours: {
    type: "hours", label: "Horaires", icon: Clock, defaultTitle: "Horaires d'ouverture",
    description: "Vos jours et heures de disponibilité",
    empty: () => ({ days: DEFAULT_HOURS }),
    hasContent: (d) => (d?.days ?? []).some((x: DayHours) => x.open),
  },
  zone: {
    type: "zone", label: "Zone d'intervention", icon: MapPin, defaultTitle: "Zone d'intervention",
    description: "Les quartiers ou villes où vous travaillez",
    empty: () => ({ areas: [], travels: true }),
    hasContent: (d) => (d?.areas ?? []).length > 0,
  },
  credentials: {
    type: "credentials", label: "Diplômes & certifications", icon: Award, defaultTitle: "Diplômes & certifications",
    description: "Vos qualifications qui rassurent vos clients",
    empty: () => ({ items: [] }),
    hasContent: (d) => items(d).some((i: Credential) => i.title),
  },
  experience: {
    type: "experience", label: "Parcours", icon: Route, defaultTitle: "Mon parcours",
    description: "Vos expériences professionnelles",
    empty: () => ({ items: [] }),
    hasContent: (d) => items(d).some((i: ExperienceItem) => i.role),
  },
  testimonials: {
    type: "testimonials", label: "Avis clients", icon: MessageSquareQuote, defaultTitle: "Ils me font confiance",
    description: "Ce que vos clients disent de vous",
    empty: () => ({ items: [] }),
    hasContent: (d) => items(d).some((i: Testimonial) => i.text),
  },
  projects: {
    type: "projects", label: "Projets / Études de cas", icon: FolderKanban, defaultTitle: "Projets",
    description: "Vos projets avec description et lien",
    empty: () => ({ items: [] }),
    hasContent: (d) => items(d).some((i: ProjectItem) => i.title),
  },
  offers: {
    type: "offers", label: "Offres & formules", icon: Package, defaultTitle: "Mes offres",
    description: "Programmes, forfaits ou packs avec leur contenu",
    empty: () => ({ items: [] }),
    hasContent: (d) => items(d).some((i: OfferItem) => i.name),
  },
  skills: {
    type: "skills", label: "Compétences", icon: Sparkles, defaultTitle: "Compétences",
    description: "Vos savoir-faire, outils ou spécialités",
    empty: () => ({ items: [] }),
    hasContent: (d) => items(d).length > 0,
  },
  faq: {
    type: "faq", label: "Questions fréquentes", icon: HelpCircle, defaultTitle: "Questions fréquentes",
    description: "Répondez d'avance aux questions de vos clients",
    empty: () => ({ items: [] }),
    hasContent: (d) => items(d).some((i: FaqItem) => i.q && i.a),
  },
  stats: {
    type: "stats", label: "Chiffres clés", icon: BarChart3, defaultTitle: "En chiffres",
    description: "Années d'expérience, clients, réalisations...",
    empty: () => ({ items: [] }),
    hasContent: (d) => items(d).some((i: StatItem) => i.value && i.label),
  },
  video: {
    type: "video", label: "Vidéos", icon: PlayCircle, defaultTitle: "En vidéo",
    description: "Vidéos YouTube de votre travail",
    empty: () => ({ items: [] }),
    hasContent: (d) => items(d).some((i: VideoItem) => youtubeId(i.url)),
  },
};

export const BLOCK_TYPES = Object.keys(BLOCKS) as BlockType[];

export function blockTitle(block: { type: string; data: any }, overrides?: Partial<Record<BlockType, string>>) {
  const meta = BLOCKS[block.type as BlockType];
  return block.data?.title?.trim() || overrides?.[block.type as BlockType] || meta?.defaultTitle || "";
}

export function newBlock<T extends BlockType>(type: T, data?: Partial<BlockDataMap[T]>): TypedBlock<T> {
  return { type, visible: true, data: { ...BLOCKS[type].empty(), ...(data ?? {}) } };
}

/** Nombre de photos hébergées (même règle que le backend) */
export function countPhotos(blocks: { type: string; data: any }[]) {
  let n = 0;
  for (const b of blocks) {
    if (b.type === "gallery") n += items(b.data).filter((i: GalleryItem) => i.url).length;
    if (b.type === "beforeAfter") n += items(b.data).reduce((s: number, i: BeforeAfterItem) => s + (i.before ? 1 : 0) + (i.after ? 1 : 0), 0);
    if (b.type === "projects") n += items(b.data).filter((i: ProjectItem) => i.image).length;
    if (b.type === "menu") for (const c of b.data?.categories ?? []) n += (c.items ?? []).filter((i: MenuItem) => i.image).length;
  }
  return n;
}

export function youtubeId(url?: string): string | null {
  if (!url) return null;
  const m = url.match(/(?:youtube\.com\/(?:watch\?v=|shorts\/|embed\/)|youtu\.be\/)([\w-]{11})/);
  return m ? m[1] : null;
}

export const DAY_NAMES = ["Dimanche", "Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi"];
