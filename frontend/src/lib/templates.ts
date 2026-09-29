// ============================================================
// Templates de portfolio : une mise en page + une ambiance.
// Les blocs sont communs ; le template décide COMMENT ils s'affichent.
// Doit rester aligné avec backend/src/config/constants.js (TEMPLATES).
// ============================================================

export type TemplateId = "atelier" | "chantier" | "table" | "galerie" | "cabinet" | "studio" | "scene";

export interface TemplatePalette {
  bg: string;
  fg: string;
  muted: string;
  surface: string;
  surface2: string;
  border: string;
}

export interface TemplateMeta {
  id: TemplateId;
  name: string;
  tagline: string;
  description: string;
  /** Métiers pour lesquels ce template est pensé (texte d'aide) */
  bestFor: string;
  dark: boolean;
  palette: TemplatePalette;
  displayFont: string;
  bodyFont: string;
  radius: number;
  defaultColor: string;
  colors: string[];
}

export const TEMPLATES: Record<TemplateId, TemplateMeta> = {
  atelier: {
    id: "atelier",
    name: "Atelier",
    tagline: "Chaleureux et artisanal",
    description: "Vos créations en grand, une ambiance papier et terre cuite, un bouton devis toujours visible.",
    bestFor: "Couture, bijoux, menuiserie, coiffure, beauté, agriculture",
    dark: false,
    palette: { bg: "#F7F1E8", fg: "#2B2118", muted: "#7A6A5A", surface: "#FFFDF9", surface2: "#EFE6D8", border: "#E4D7C4" },
    displayFont: "Fraunces",
    bodyFont: "DM Sans",
    radius: 18,
    defaultColor: "#B4532A",
    colors: ["#B4532A", "#1F6F5C", "#8A5A2B", "#9F1239", "#1E3A8A", "#6D28D9"],
  },
  chantier: {
    id: "chantier",
    name: "Chantier",
    tagline: "Direct et efficace",
    description: "Appel et WhatsApp en un geste, zone d'intervention, tarifs clairs et avant/après.",
    bestFor: "Électricien, plombier, maçon, mécanicien, climatisation, nettoyage",
    dark: false,
    palette: { bg: "#F3F4F6", fg: "#0F172A", muted: "#556070", surface: "#FFFFFF", surface2: "#E5E7EB", border: "#D9DDE3" },
    displayFont: "Archivo",
    bodyFont: "Inter",
    radius: 10,
    defaultColor: "#F5B400",
    colors: ["#F5B400", "#F97316", "#16A34A", "#2563EB", "#DC2626", "#0EA5E9"],
  },
  table: {
    id: "table",
    name: "Table",
    tagline: "Gourmand et raffiné",
    description: "Grande photo d'ambiance, carte avec les prix, horaires et commande sur WhatsApp.",
    bestFor: "Restaurant, traiteur, pâtisserie, chef à domicile",
    dark: true,
    palette: { bg: "#14100D", fg: "#F5EDE3", muted: "#BCAC98", surface: "#1D1713", surface2: "#271F19", border: "#3A2E25" },
    displayFont: "Playfair Display",
    bodyFont: "DM Sans",
    radius: 14,
    defaultColor: "#D9A441",
    colors: ["#D9A441", "#E26D3D", "#7FB069", "#E11D48", "#F4F1EA", "#38BDF8"],
  },
  galerie: {
    id: "galerie",
    name: "Galerie",
    tagline: "Vos images d'abord",
    description: "Mosaïque plein écran, visionneuse, typographie éditoriale. Le texte s'efface devant l'œuvre.",
    bestFor: "Photographe, vidéaste, artiste, graphiste, mannequin, décoration",
    dark: false,
    palette: { bg: "#FFFFFF", fg: "#0A0A0A", muted: "#6B6B6B", surface: "#F6F6F6", surface2: "#EDEDED", border: "#E6E6E6" },
    displayFont: "Syne",
    bodyFont: "Inter",
    radius: 0,
    defaultColor: "#FF4D2E",
    colors: ["#FF4D2E", "#0A0A0A", "#2F54EB", "#00A676", "#C026D3", "#EAB308"],
  },
  cabinet: {
    id: "cabinet",
    name: "Cabinet",
    tagline: "Sobre et rassurant",
    description: "Diplômes, spécialités, horaires de consultation et prise de rendez-vous. Inspire confiance.",
    bestFor: "Santé, avocat, notaire, comptable, assurance, immobilier",
    dark: false,
    palette: { bg: "#F7F9FB", fg: "#0B1B2B", muted: "#566677", surface: "#FFFFFF", surface2: "#EEF2F6", border: "#DFE6EE" },
    displayFont: "Source Serif 4",
    bodyFont: "Inter",
    radius: 14,
    defaultColor: "#0F766E",
    colors: ["#0F766E", "#1D4ED8", "#0B3B5C", "#7C2D12", "#6D28D9", "#BE123C"],
  },
  studio: {
    id: "studio",
    name: "Studio",
    tagline: "Moderne et technique",
    description: "Études de cas, compétences, parcours et chiffres clés, sur un fond sombre élégant.",
    bestFor: "Développeur, designer, marketing, consultant, architecte",
    dark: true,
    palette: { bg: "#0B0D12", fg: "#E9EBF1", muted: "#8C94A8", surface: "#12151D", surface2: "#191D27", border: "#252A37" },
    displayFont: "Space Grotesk",
    bodyFont: "Inter",
    radius: 16,
    defaultColor: "#7C5CFF",
    colors: ["#7C5CFF", "#22D3EE", "#34D399", "#F472B6", "#F59E0B", "#F8FAFC"],
  },
  scene: {
    id: "scene",
    name: "Scène",
    tagline: "Énergique et inspirant",
    description: "Grande accroche, offres avec prix, avis clients et vidéos. Fait pour convaincre et réserver.",
    bestFor: "Coach, formateur, professeur, DJ, musicien, animateur, événementiel",
    dark: false,
    palette: { bg: "#FFFAF3", fg: "#1B1712", muted: "#6D6358", surface: "#FFFFFF", surface2: "#F6EBDD", border: "#EEDFCB" },
    displayFont: "Bricolage Grotesque",
    bodyFont: "DM Sans",
    radius: 24,
    defaultColor: "#E8590C",
    colors: ["#E8590C", "#D6336C", "#0CA678", "#4263EB", "#7048E8", "#1B1712"],
  },
};

export const TEMPLATE_IDS = Object.keys(TEMPLATES) as TemplateId[];

export function getTemplate(id?: string | null): TemplateMeta {
  return TEMPLATES[(id as TemplateId) ?? "atelier"] ?? TEMPLATES.atelier;
}

// ── Polices ─────────────────────────────────────────────────
const GOOGLE_FONTS: Record<string, string> = {
  Fraunces: "Fraunces:opsz,wght@9..144,400;9..144,600;9..144,700",
  "DM Sans": "DM+Sans:opsz,wght@9..40,400;9..40,500;9..40,600;9..40,700",
  Archivo: "Archivo:wght@500;600;700;800;900",
  Inter: "Inter:wght@400;500;600;700",
  "Playfair Display": "Playfair+Display:ital,wght@0,500;0,600;0,700;1,500",
  Syne: "Syne:wght@500;600;700;800",
  "Source Serif 4": "Source+Serif+4:opsz,wght@8..60,500;8..60,600;8..60,700",
  "Space Grotesk": "Space+Grotesk:wght@400;500;600;700",
  "Bricolage Grotesque": "Bricolage+Grotesque:opsz,wght@12..96,500;12..96,700;12..96,800",
  Poppins: "Poppins:wght@400;500;600;700;800",
  Montserrat: "Montserrat:wght@500;600;700;800",
  Lora: "Lora:ital,wght@0,500;0,600;0,700;1,500",
  "Cormorant Garamond": "Cormorant+Garamond:ital,wght@0,500;0,600;0,700;1,500",
};

/** Polices proposées pour les titres (en plus de celle du template) */
export const FONT_OPTIONS = [
  "Fraunces", "Playfair Display", "Cormorant Garamond", "Lora", "Source Serif 4",
  "Syne", "Space Grotesk", "Bricolage Grotesque", "Archivo", "Montserrat", "Poppins", "Inter",
];

const loaded = new Set<string>();

/** Charge à la demande les polices d'un portfolio (économise les données mobiles). */
export function loadFonts(families: (string | null | undefined)[]) {
  if (typeof document === "undefined") return;
  const wanted = [...new Set(families.filter((f): f is string => !!f && !!GOOGLE_FONTS[f]))].filter(
    (f) => !loaded.has(f)
  );
  if (wanted.length === 0) return;
  wanted.forEach((f) => loaded.add(f));
  const link = document.createElement("link");
  link.rel = "stylesheet";
  link.href = `https://fonts.googleapis.com/css2?${wanted.map((f) => `family=${GOOGLE_FONTS[f]}`).join("&")}&display=swap`;
  document.head.appendChild(link);
}

// ── Couleurs ────────────────────────────────────────────────
function hexToRgb(hex: string): [number, number, number] | null {
  const m = /^#?([0-9a-f]{6})$/i.exec(hex.trim());
  if (!m) return null;
  const n = parseInt(m[1], 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

/** Luminance relative (WCAG) */
export function luminance(hex: string): number {
  const rgb = hexToRgb(hex);
  if (!rgb) return 0;
  const [r, g, b] = rgb.map((v) => {
    const c = v / 255;
    return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

/** Couleur de texte lisible sur un fond donné */
export function readableOn(hex: string): string {
  return luminance(hex) > 0.45 ? "#111111" : "#FFFFFF";
}

export function withAlpha(hex: string, alpha: number): string {
  const rgb = hexToRgb(hex);
  if (!rgb) return hex;
  return `rgba(${rgb[0]}, ${rgb[1]}, ${rgb[2]}, ${alpha})`;
}
