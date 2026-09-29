// ============================================================
// Parcours d'inscription : réponses → profil + sections du portfolio
// ============================================================
import type { Profile } from "@workspace/api-client-react";
import { DEFAULT_HOURS, newBlock, type TypedBlock } from "./blocks";
import { getProfession, buildBio, type Profession } from "./professions";
import { getTemplate } from "./templates";
import { formatWhatsapp, getCountry } from "./countries";
import type { PortfolioData } from "./portfolio";

export interface ServiceChoice {
  name: string;
  price: string;
  unit?: string;
  selected: boolean;
}

export interface OnboardingAnswers {
  professionId: string | null;
  professionCustom: string;
  fullName: string;
  countryCode: string;
  city: string;
  phone: string;
  years: number | null;
  services: ServiceChoice[];
  bio: string;
  bioEdited: boolean;
  tagline: string;
  email: string;
  username: string;
  usernameEdited: boolean;
  referralCode: string;
}

export const EMPTY_ANSWERS: OnboardingAnswers = {
  professionId: null,
  professionCustom: "",
  fullName: "",
  countryCode: "BJ",
  city: "",
  phone: "",
  years: null,
  services: [],
  bio: "",
  bioEdited: false,
  tagline: "",
  email: "",
  username: "",
  usernameEdited: false,
  referralCode: "",
};

export function professionOf(a: OnboardingAnswers): Profession {
  return getProfession(a.professionId);
}

/** Prestations suggérées pour un métier : les 3 premières cochées */
export function suggestedServices(p: Profession): ServiceChoice[] {
  return p.services.map((s, i) => ({ name: s.name, price: s.price ?? "", unit: s.unit, selected: i < 3 }));
}

export function titleOf(a: OnboardingAnswers) {
  const p = professionOf(a);
  return p.id === "autre" ? a.professionCustom.trim() : p.title;
}

export function generatedBio(a: OnboardingAnswers) {
  const p = professionOf(a);
  const chosen = a.services.filter((s) => s.selected).map((s) => s.name);
  if (p.id === "autre") {
    const title = a.professionCustom.trim() || "Professionnel";
    const at = a.city ? ` à ${a.city}` : "";
    const since = a.years ? ` depuis ${a.years} an${a.years > 1 ? "s" : ""}` : "";
    return `${title}${at}${since}, je mets mon savoir-faire à votre service${chosen.length ? ` : ${chosen.slice(0, 3).join(", ").toLowerCase()}` : ""}. Contactez-moi sur WhatsApp pour en discuter.`;
  }
  return buildBio(p, { city: a.city, years: a.years, services: chosen });
}

/**
 * Sections créées à l'inscription. Les sections vides sont conservées :
 * elles n'apparaissent pas sur le portfolio mais le tableau de bord
 * propose de les compléter.
 */
export function buildBlocks(a: OnboardingAnswers, photoUrls: string[]): TypedBlock[] {
  const p = professionOf(a);
  const chosen = a.services.filter((s) => s.selected && s.name.trim());
  const types = [...p.blocks];
  if (!types.includes(p.serviceBlock)) types.unshift(p.serviceBlock);
  if (photoUrls.length && !types.includes("gallery")) types.splice(1, 0, "gallery");

  return types.map((type): TypedBlock => {
    const title = p.blockTitles?.[type];
    const base = title ? { title } : {};
    switch (type) {
      case "services":
        return newBlock("services", { ...base, items: chosen.map((s) => ({ name: s.name.trim(), price: s.price.trim() || undefined, unit: s.unit })) });
      case "menu":
        return newBlock("menu", { ...base, categories: [{ name: "Nos plats", items: chosen.map((s) => ({ name: s.name.trim(), price: s.price.trim() || undefined })) }] });
      case "offers":
        return newBlock("offers", {
          ...base,
          items: chosen.map((s, i) => ({ name: s.name.trim(), price: s.price.trim() || undefined, description: s.unit, highlighted: chosen.length > 2 && i === 1, features: [] })),
        });
      case "gallery":
        return newBlock("gallery", { ...base, items: photoUrls.map((url) => ({ url })) });
      case "zone":
        return newBlock("zone", { ...base, areas: a.city ? [a.city] : [], travels: true });
      case "stats":
        return newBlock("stats", { ...base, items: a.years ? [{ value: `${a.years}${a.years >= 10 ? "+" : ""}`, label: a.years > 1 ? "ans d'expérience" : "an d'expérience" }] : [] });
      case "hours":
        // Horaires par défaut, masqués tant que la personne ne les a pas vérifiés
        return { ...newBlock("hours", { ...base, days: DEFAULT_HOURS }), visible: false };
      default:
        return newBlock(type, base as any);
    }
  });
}

export function whatsappOf(a: OnboardingAnswers) {
  return formatWhatsapp(a.phone, getCountry(a.countryCode));
}

/** Données d'aperçu en direct pendant le parcours */
export function previewData(a: OnboardingAnswers, photoUrls: string[], avatarUrl: string | null, demoImages: string[]): PortfolioData {
  const p = professionOf(a);
  const tpl = getTemplate(p.template);
  const photos = photoUrls.length ? photoUrls : demoImages;
  const profile: Profile = {
    id: 0,
    userId: 0,
    profileType: p.family,
    profession: p.id,
    professionCustom: a.professionCustom || null,
    template: p.template,
    fullName: a.fullName.trim() || "Votre nom",
    title: titleOf(a) || "Votre métier",
    tagline: a.tagline || p.tagline || null,
    bio: a.bio || generatedBio(a),
    photoUrl: avatarUrl,
    logoUrl: null,
    skills: [],
    services: null,
    whatsapp: whatsappOf(a) || "+229 00 00 00 00",
    emailContact: null,
    linkedin: null,
    twitter: null,
    github: null,
    website: null,
    country: getCountry(a.countryCode).name,
    city: a.city || null,
    styleTheme: p.template,
    primaryColor: tpl.defaultColor,
    fontFamily: null,
    yearsExperience: a.years,
    completedProjects: null,
    satisfiedClients: null,
    availableForWork: true,
  };
  return { username: "apercu", plan: "free", profile, blocks: buildBlocks(a, photos) };
}
