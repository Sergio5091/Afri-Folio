// ============================================================
// Données d'un portfolio + utilitaires partagés
// (page publique, aperçu dans l'éditeur, exemples de la landing)
// ============================================================
import type { Block, Profile, Project, PublicPortfolio } from "@workspace/api-client-react";
import { BLOCKS, DEFAULT_HOURS, newBlock, type BlockType, type DayHours, type TypedBlock } from "./blocks";
import { getProfession, PROFESSIONS, buildBio, type Profession } from "./professions";
import { getTemplate, type TemplateId } from "./templates";
import { IMAGE_SETS, PORTRAITS, unsplash, type PortraitId } from "./images";

export interface PortfolioData {
  username: string;
  plan: "free" | "premium";
  profile: Profile;
  blocks: TypedBlock[];
}

// ── Conversion des anciens profils (texte libre, projets) en sections ──
export function parseLegacyServices(text?: string | null) {
  if (!text) return [];
  return text
    .split(/\n\s*\n/)
    .map((chunk) => chunk.split("\n").map((l) => l.trim()).filter(Boolean))
    .filter((lines) => lines.length > 0)
    .map((lines) => ({ name: lines[0], description: lines.slice(1).join(" ") || undefined }));
}

export function legacyBlocks(profile: Profile, projects: Project[] = []): TypedBlock[] {
  const out: TypedBlock[] = [];
  const services = parseLegacyServices(profile.services);
  if (services.length) out.push(newBlock("services", { items: services }));
  if (projects.length) {
    out.push(
      newBlock("projects", {
        items: projects.map((p) => ({
          title: p.title,
          description: p.description ?? undefined,
          image: p.imageUrl ?? undefined,
          url: p.projectUrl ?? undefined,
        })),
      })
    );
  }
  if (profile.skills?.length) out.push(newBlock("skills", { items: profile.skills }));
  const stats = [
    profile.yearsExperience ? { value: `${profile.yearsExperience}+`, label: "Années d'expérience" } : null,
    profile.completedProjects ? { value: String(profile.completedProjects), label: "Réalisations" } : null,
    profile.satisfiedClients ? { value: String(profile.satisfiedClients), label: "Clients satisfaits" } : null,
  ].filter(Boolean) as { value: string; label: string }[];
  if (stats.length) out.push(newBlock("stats", { items: stats }));
  return out;
}

/** Réponse API → données prêtes à afficher (complète avec les anciens champs si besoin) */
export function normalizePortfolio(api: PublicPortfolio): PortfolioData {
  const blocks = (api.blocks ?? []) as TypedBlock[];
  const present = new Set(blocks.map((b) => b.type));
  const legacy = legacyBlocks(api.profile, api.projects).filter((b) => !present.has(b.type));
  return {
    username: api.user.username,
    plan: api.user.plan,
    profile: api.profile,
    blocks: [...blocks, ...legacy],
  };
}

export function visibleBlocks(blocks: TypedBlock[]) {
  return blocks.filter((b) => b.visible && BLOCKS[b.type as BlockType]?.hasContent(b.data));
}

// ── Contact ─────────────────────────────────────────────────
export function phoneDigits(phone?: string | null) {
  return (phone ?? "").replace(/\D/g, "");
}

export function whatsappLink(phone?: string | null, message?: string) {
  const digits = phoneDigits(phone);
  if (!digits) return null;
  return `https://wa.me/${digits}${message ? `?text=${encodeURIComponent(message)}` : ""}`;
}

export function telLink(phone?: string | null) {
  const digits = phoneDigits(phone);
  return digits ? `tel:+${digits}` : null;
}

/** Fiche contact à enregistrer dans le téléphone */
export function buildVCard(p: Profile, url: string) {
  const lines = [
    "BEGIN:VCARD",
    "VERSION:3.0",
    `FN:${p.fullName ?? ""}`,
    p.title ? `TITLE:${p.title}` : "",
    p.whatsapp ? `TEL;TYPE=CELL:${p.whatsapp}` : "",
    p.emailContact ? `EMAIL:${p.emailContact}` : "",
    p.city || p.country ? `ADR;TYPE=WORK:;;;${p.city ?? ""};;;${p.country ?? ""}` : "",
    `URL:${url}`,
    "END:VCARD",
  ];
  return lines.filter(Boolean).join("\r\n");
}

// ── Horaires ────────────────────────────────────────────────
export function openStatus(days?: DayHours[], now = new Date()): { open: boolean; label: string } | null {
  if (!days?.length) return null;
  const today = days.find((d) => d.day === now.getDay());
  const minutes = now.getHours() * 60 + now.getMinutes();
  const toMin = (t: string) => {
    const [h, m] = t.split(":").map(Number);
    return (h || 0) * 60 + (m || 0);
  };
  if (today?.open && minutes >= toMin(today.from) && minutes < toMin(today.to)) {
    return { open: true, label: `Ouvert · ferme à ${today.to.replace(":", "h")}` };
  }
  if (today?.open && minutes < toMin(today.from)) {
    return { open: false, label: `Fermé · ouvre à ${today.from.replace(":", "h")}` };
  }
  return { open: false, label: "Fermé actuellement" };
}

// ── Complétion du profil ────────────────────────────────────
export interface CompletionTip {
  id: string;
  label: string;
  points: number;
  href: string;
}

export function completion(profile: Profile | undefined, blocks: TypedBlock[]) {
  if (!profile) return { score: 0, tips: [] as CompletionTip[] };
  const has = (type: BlockType) => blocks.some((b) => b.type === type && b.visible && BLOCKS[type].hasContent(b.data));
  const profession = getProfession(profile.profession);
  const checks: (CompletionTip & { done: boolean })[] = [
    { id: "name", label: "Indiquez votre nom et votre métier", points: 10, href: "/dashboard/profil", done: !!profile.fullName && !!profile.title },
    { id: "whatsapp", label: "Ajoutez votre numéro WhatsApp", points: 15, href: "/dashboard/profil", done: !!profile.whatsapp },
    { id: "photo", label: "Ajoutez une photo de vous", points: 15, href: "/dashboard/profil", done: !!profile.photoUrl },
    { id: "bio", label: "Présentez-vous en quelques lignes", points: 10, href: "/dashboard/profil", done: (profile.bio?.length ?? 0) > 40 },
    { id: "city", label: "Indiquez votre ville", points: 5, href: "/dashboard/profil", done: !!profile.city },
    {
      id: "services", label: "Listez vos prestations et vos prix", points: 15, href: "/dashboard/ma-page",
      done: has("services") || has("menu") || has("offers"),
    },
    {
      id: "photos", label: "Ajoutez des photos de votre travail", points: 15, href: "/dashboard/ma-page",
      done: has("gallery") || has("projects") || has("beforeAfter") || !profession.blocks.includes("gallery"),
    },
    { id: "testimonials", label: "Ajoutez 2 ou 3 avis de clients", points: 10, href: "/dashboard/ma-page", done: has("testimonials") },
    {
      id: "hours", label: "Vérifiez et affichez vos horaires", points: 5, href: "/dashboard/ma-page",
      done: has("hours") || !profession.blocks.includes("hours"),
    },
  ];
  const score = checks.reduce((s, c) => s + (c.done ? c.points : 0), 0);
  return { score: Math.min(100, score), tips: checks.filter((c) => !c.done) };
}

// ── Portfolios de démonstration ─────────────────────────────
const DEMO_NAMES: Record<PortraitId, string> = {
  womanWax: "Aïcha Koné",
  womanGlasses: "Fatou Ndiaye",
  womanPortrait: "Awa Traoré",
  womanSmile: "Mariam Sow",
  womanProfile: "Nadia Mensah",
  womanOffice: "Grâce Adjovi",
  manBeret: "Koffi Mensah",
  manShirt: "Ibrahim Diallo",
  manGlasses: "Yao Kouassi",
  manSmile: "Moussa Camara",
  manSport: "Samuel Okafor",
  manBeanie: "Kwame Asante",
  manScrubs: "Serge Houngbo",
  manElectrician: "Paul Agbo",
};

const DEMO_PLACES = [
  { city: "Cotonou", country: "Bénin", areas: ["Akpakpa", "Cadjèhoun", "Fidjrossè", "Calavi"], phone: "+229 01 97 00 00 00" },
  { city: "Abidjan", country: "Côte d'Ivoire", areas: ["Cocody", "Marcory", "Yopougon", "Plateau"], phone: "+225 07 00 00 00 00" },
  { city: "Dakar", country: "Sénégal", areas: ["Plateau", "Almadies", "Parcelles", "Mermoz"], phone: "+221 77 000 00 00" },
  { city: "Lomé", country: "Togo", areas: ["Bè", "Tokoin", "Agoè", "Adidogomé"], phone: "+228 90 00 00 00" },
  { city: "Douala", country: "Cameroun", areas: ["Akwa", "Bonapriso", "Bonamoussadi", "Makepe"], phone: "+237 6 90 00 00 00" },
];

const DEMO_TESTIMONIALS = [
  { name: "Christelle A.", text: "Travail impeccable et délais respectés. Je recommande les yeux fermés !", rating: 5 },
  { name: "Arnaud K.", text: "Très professionnel, à l'écoute et de bon conseil. Le résultat a dépassé mes attentes.", rating: 5 },
  { name: "Mme Bello", text: "Rapide, sérieux et prix honnêtes. C'est devenu mon contact de confiance.", rating: 5 },
];

function demoFaq(tpl: TemplateId, city: string) {
  const nb = " ";
  const byTemplate: Record<TemplateId, { q: string; a: string }[]> = {
    atelier: [
      { q: `Comment passer commande${nb}?`, a: "Écrivez-moi sur WhatsApp avec votre modèle ou votre idée, je vous réponds rapidement avec un prix." },
      { q: `Faut-il payer un acompte${nb}?`, a: "Un acompte de 50 % lance le travail, le reste est réglé à la livraison." },
      { q: `Quels sont les délais${nb}?`, a: "Comptez en général 5 à 10 jours selon la pièce. Pour un événement, prévenez-moi le plus tôt possible." },
    ],
    chantier: [
      { q: `Le devis est-il gratuit${nb}?`, a: "Oui, le déplacement pour le devis est gratuit dans ma zone d'intervention." },
      { q: `Intervenez-vous en urgence${nb}?`, a: "Oui, 7j/7 pour les pannes urgentes. Appelez-moi directement." },
      { q: `Le travail est-il garanti${nb}?`, a: "Toutes mes interventions sont garanties. En cas de souci, je reviens sans frais." },
    ],
    table: [
      { q: `Livrez-vous${nb}?`, a: `Oui, dans les quartiers indiqués à ${city}. Les frais dépendent de la distance.` },
      { q: `Peut-on réserver pour un groupe${nb}?`, a: "Bien sûr, prévenez-nous 24 h à l'avance sur WhatsApp." },
      { q: `Quels moyens de paiement acceptez-vous${nb}?`, a: "Espèces et Mobile Money (MTN, Moov, Wave)." },
    ],
    galerie: [
      { q: `Comment réserver une séance${nb}?`, a: "Écrivez-moi sur WhatsApp avec la date et le type de séance souhaités." },
      { q: `Quand vais-je recevoir le résultat${nb}?`, a: "Sous 7 à 14 jours, en haute définition, via un lien de téléchargement." },
      { q: `Vous déplacez-vous${nb}?`, a: `Oui, partout à ${city} et dans toute la région.` },
    ],
    cabinet: [
      { q: `Faut-il prendre rendez-vous${nb}?`, a: "Oui, de préférence. Écrivez-moi sur WhatsApp pour réserver un créneau." },
      { q: `Proposez-vous des consultations en ligne${nb}?`, a: "Oui, par appel vidéo pour les suivis et les premiers échanges." },
      { q: `Quels moyens de paiement acceptez-vous${nb}?`, a: "Espèces, Mobile Money et virement." },
    ],
    studio: [
      { q: `Quels sont vos délais${nb}?`, a: "Un site vitrine prend 2 à 3 semaines. Pour un projet plus complexe, je vous donne un planning détaillé." },
      { q: `Comment se passe le paiement${nb}?`, a: "En plusieurs étapes : un acompte au démarrage, puis à chaque livraison validée." },
      { q: `Assurez-vous la maintenance${nb}?`, a: "Oui, je propose un forfait mensuel de maintenance et d'hébergement." },
    ],
    scene: [
      { q: `Comment se passe le premier échange${nb}?`, a: "Un appel découverte gratuit de 20 minutes pour comprendre vos objectifs." },
      { q: `Proposez-vous des séances en ligne${nb}?`, a: "Oui, toutes les offres sont disponibles en présentiel ou en visio." },
      { q: `Quels moyens de paiement acceptez-vous${nb}?`, a: "Mobile Money, virement ou espèces." },
    ],
  };
  return byTemplate[tpl];
}

const hash = (s: string) => [...s].reduce((h, c) => (h * 31 + c.charCodeAt(0)) >>> 0, 7);

export function buildDemoPortfolio(professionId: string, overrides?: { template?: TemplateId; color?: string }): PortfolioData {
  const p: Profession = getProfession(professionId);
  const place = DEMO_PLACES[hash(p.id) % DEMO_PLACES.length];
  const images = IMAGE_SETS[p.imageSet].map((id) => unsplash(id, 1200));
  const years = 3 + (hash(p.id) % 9);
  const template = overrides?.template ?? p.template;
  const tpl = getTemplate(template);
  const services = p.services.slice(0, 5);

  const blocks: TypedBlock[] = [];
  for (const type of p.blocks) {
    const title = p.blockTitles?.[type];
    const base = { ...(title ? { title } : {}) };
    switch (type) {
      case "gallery":
        blocks.push(newBlock("gallery", { ...base, items: images.map((url) => ({ url })) }));
        break;
      case "beforeAfter":
        blocks.push(newBlock("beforeAfter", { ...base, items: [{ before: images[1] ?? images[0], after: images[0], caption: "Rénovation complète" }] }));
        break;
      case "services":
        blocks.push(newBlock("services", { ...base, items: services.map((s) => ({ name: s.name, price: s.price, unit: s.unit, description: s.description })) }));
        break;
      case "menu":
        blocks.push(
          newBlock("menu", {
            ...base,
            categories: [
              { name: "Plats", items: services.slice(0, 4).map((s, i) => ({ name: s.name, price: s.price, image: images[i] })) },
              { name: "Boissons & desserts", items: services.slice(4).map((s) => ({ name: s.name, price: s.price })) },
            ].filter((c) => c.items.length),
          })
        );
        break;
      case "offers":
        blocks.push(
          newBlock("offers", {
            ...base,
            items: services.slice(0, 3).map((s, i) => ({
              name: s.name,
              price: s.price,
              description: s.unit,
              highlighted: i === 1,
              features: ["Échange préalable offert", "Accompagnement personnalisé", i > 0 ? "Suivi sur WhatsApp" : "Réponse sous 24 h"],
            })),
          })
        );
        break;
      case "hours":
        blocks.push(newBlock("hours", { ...base, days: DEFAULT_HOURS }));
        break;
      case "zone":
        blocks.push(newBlock("zone", { ...base, areas: place.areas, travels: true }));
        break;
      case "credentials":
        blocks.push(
          newBlock("credentials", {
            ...base,
            items: [
              { title: `Diplôme d'État — ${p.title}`, issuer: `Université de ${place.city}`, year: String(2026 - years - 2) },
              { title: "Formation continue certifiante", issuer: "Ordre professionnel", year: String(2026 - 2) },
            ],
          })
        );
        break;
      case "experience":
        blocks.push(
          newBlock("experience", {
            ...base,
            items: [
              { role: p.title, org: "Indépendant", period: `${2026 - Math.min(years, 4)} — aujourd'hui`, description: "Accompagnement de clients particuliers et entreprises." },
              { role: `${p.title} associé`, org: `Cabinet ${place.city}`, period: `${2026 - years} — ${2026 - Math.min(years, 4)}` },
            ],
          })
        );
        break;
      case "testimonials":
        blocks.push(newBlock("testimonials", { ...base, items: DEMO_TESTIMONIALS }));
        break;
      case "projects":
        blocks.push(
          newBlock("projects", {
            ...base,
            items: services.slice(0, 3).map((s, i) => ({
              title: ["Plateforme e-commerce", "Application de gestion", "Refonte de marque"][i] ?? s.name,
              description: `${s.name} pour un client à ${place.city}. Livré en ${3 + i} semaines.`,
              image: images[i],
              tags: [s.name.split(" ")[0], place.city],
            })),
          })
        );
        break;
      case "skills":
        blocks.push(newBlock("skills", { ...base, items: services.map((s) => s.name.split(" ").slice(0, 2).join(" ")) }));
        break;
      case "faq":
        blocks.push(newBlock("faq", { ...base, items: demoFaq(template, place.city) }));
        break;
      case "stats":
        blocks.push(
          newBlock("stats", {
            ...base,
            items: [
              { value: `${years}+`, label: "ans d'expérience" },
              { value: `${120 + (hash(p.id) % 300)}`, label: "clients satisfaits" },
              { value: "4,9/5", label: "note moyenne" },
            ],
          })
        );
        break;
      default:
        break;
    }
  }

  const fullName = DEMO_NAMES[p.portrait];
  const profile: Profile = {
    id: 0,
    userId: 0,
    profileType: p.family,
    profession: p.id,
    professionCustom: null,
    template,
    fullName,
    title: p.title || "Professionnel",
    tagline: p.tagline,
    bio: buildBio(p, { city: place.city, years, services: services.map((s) => s.name) }),
    photoUrl: unsplash(PORTRAITS[p.portrait], 800, 800),
    logoUrl: null,
    skills: [],
    services: null,
    whatsapp: place.phone,
    emailContact: "contact@exemple.com",
    linkedin: null,
    twitter: null,
    github: null,
    website: null,
    country: place.country,
    city: place.city,
    styleTheme: template,
    primaryColor: overrides?.color ?? tpl.defaultColor,
    fontFamily: null,
    yearsExperience: years,
    completedProjects: null,
    satisfiedClients: null,
    availableForWork: true,
  };

  return { username: `exemple-${p.id}`, plan: "premium", profile, blocks };
}

/** Un exemple par template, pour la landing */
export const SHOWCASE_PROFESSIONS = ["couturiere", "electricien", "restaurant", "photographe", "medecin", "developpeur", "coach"];

export function blocksToApi(blocks: TypedBlock[]): Block[] {
  return blocks.map((b) => ({ id: b.id, type: b.type, visible: b.visible, data: b.data }));
}

export { PROFESSIONS };
