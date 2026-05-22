// ============================================================
// Types de profils et configuration des champs par catégorie
// ============================================================

export interface ProfileCategory {
  id: string;
  label: string;
  emoji: string;
  description: string;
  // Labels personnalisés
  projectsSectionLabel: string;   // "Travaux récents" / "Mes créations" / etc.
  skillsSectionLabel: string;     // "Compétences" / "Savoir-faire" / etc.
  servicesLabel: string;          // "Services" / "Prestations" / etc.
  // Champs visibles
  showGithub: boolean;
  showLinkedin: boolean;
  showTwitter: boolean;
  showYearsExperience: boolean;
  showCompletedProjects: boolean;
  showSatisfiedClients: boolean;
  // Placeholder du titre professionnel
  titlePlaceholder: string;
  // Exemples de compétences
  skillsPlaceholder: string;
}

export const PROFILE_CATEGORIES: ProfileCategory[] = [
  {
    id: "tech",
    label: "Tech & Digital",
    emoji: "💻",
    description: "Développeur, Designer UI/UX, Community Manager, Vidéaste...",
    projectsSectionLabel: "Projets & Réalisations",
    skillsSectionLabel: "Stack technique",
    servicesLabel: "Services proposés",
    showGithub: true,
    showLinkedin: true,
    showTwitter: true,
    showYearsExperience: true,
    showCompletedProjects: true,
    showSatisfiedClients: true,
    titlePlaceholder: "Développeur Web Fullstack",
    skillsPlaceholder: "React, Node.js, TypeScript...",
  },
  {
    id: "creative",
    label: "Créatif & Arts",
    emoji: "🎨",
    description: "Graphiste, Photographe, Musicien, Illustrateur, Styliste...",
    projectsSectionLabel: "Portfolio & Créations",
    skillsSectionLabel: "Outils & Styles",
    servicesLabel: "Prestations artistiques",
    showGithub: false,
    showLinkedin: true,
    showTwitter: true,
    showYearsExperience: true,
    showCompletedProjects: true,
    showSatisfiedClients: true,
    titlePlaceholder: "Photographe & Vidéaste",
    skillsPlaceholder: "Photographie, Retouche, Lightroom...",
  },
  {
    id: "education",
    label: "Éducation & Coaching",
    emoji: "🎓",
    description: "Coach, Formateur, Enseignant, Tuteur, Conférencier...",
    projectsSectionLabel: "Programmes & Formations",
    skillsSectionLabel: "Domaines d'expertise",
    servicesLabel: "Offres de formation",
    showGithub: false,
    showLinkedin: true,
    showTwitter: true,
    showYearsExperience: true,
    showCompletedProjects: false,
    showSatisfiedClients: true,
    titlePlaceholder: "Coach de vie & Formateur",
    skillsPlaceholder: "Leadership, Développement personnel...",
  },
  {
    id: "business",
    label: "Business & Conseil",
    emoji: "💼",
    description: "Entrepreneur, Consultant, Comptable, Agent immobilier...",
    projectsSectionLabel: "Projets & Références",
    skillsSectionLabel: "Expertises",
    servicesLabel: "Services & Conseil",
    showGithub: false,
    showLinkedin: true,
    showTwitter: true,
    showYearsExperience: true,
    showCompletedProjects: true,
    showSatisfiedClients: true,
    titlePlaceholder: "Consultant en stratégie d'entreprise",
    skillsPlaceholder: "Stratégie, Finance, Marketing...",
  },
  {
    id: "health",
    label: "Santé & Bien-être",
    emoji: "🏥",
    description: "Médecin, Nutritionniste, Coach sportif, Psychologue...",
    projectsSectionLabel: "Programmes & Suivis",
    skillsSectionLabel: "Spécialités",
    servicesLabel: "Consultations & Soins",
    showGithub: false,
    showLinkedin: true,
    showTwitter: false,
    showYearsExperience: true,
    showCompletedProjects: false,
    showSatisfiedClients: true,
    titlePlaceholder: "Nutritionniste & Coach bien-être",
    skillsPlaceholder: "Nutrition, Diététique, Sport...",
  },
  {
    id: "artisan",
    label: "Artisanat & Métiers",
    emoji: "🔨",
    description: "Couturier, Menuisier, Électricien, Mécanicien, Bijoutier...",
    projectsSectionLabel: "Mes Réalisations",
    skillsSectionLabel: "Savoir-faire",
    servicesLabel: "Prestations & Devis",
    showGithub: false,
    showLinkedin: false,
    showTwitter: false,
    showYearsExperience: true,
    showCompletedProjects: true,
    showSatisfiedClients: true,
    titlePlaceholder: "Couturier & Styliste",
    skillsPlaceholder: "Couture, Broderie, Stylisme...",
  },
  {
    id: "legal",
    label: "Juridique & Finance",
    emoji: "⚖️",
    description: "Avocat, Notaire, Conseiller juridique, Expert-comptable...",
    projectsSectionLabel: "Domaines d'intervention",
    skillsSectionLabel: "Domaines juridiques",
    servicesLabel: "Services juridiques",
    showGithub: false,
    showLinkedin: true,
    showTwitter: false,
    showYearsExperience: true,
    showCompletedProjects: false,
    showSatisfiedClients: true,
    titlePlaceholder: "Avocat d'affaires",
    skillsPlaceholder: "Droit des affaires, Droit civil...",
  },
  {
    id: "agriculture",
    label: "Agriculture & Environnement",
    emoji: "🌾",
    description: "Agriculteur, Éleveur, Agronome, Pêcheur...",
    projectsSectionLabel: "Productions & Projets",
    skillsSectionLabel: "Spécialités agricoles",
    servicesLabel: "Produits & Services",
    showGithub: false,
    showLinkedin: false,
    showTwitter: false,
    showYearsExperience: true,
    showCompletedProjects: true,
    showSatisfiedClients: true,
    titlePlaceholder: "Agronome & Consultant agricole",
    skillsPlaceholder: "Maraîchage, Élevage, Agroforesterie...",
  },
  {
    id: "food",
    label: "Restauration & Hôtellerie",
    emoji: "🍽️",
    description: "Chef cuisinier, Traiteur, Pâtissier, Barman...",
    projectsSectionLabel: "Créations & Menus",
    skillsSectionLabel: "Spécialités culinaires",
    servicesLabel: "Prestations traiteur",
    showGithub: false,
    showLinkedin: false,
    showTwitter: true,
    showYearsExperience: true,
    showCompletedProjects: true,
    showSatisfiedClients: true,
    titlePlaceholder: "Chef cuisinier & Traiteur",
    skillsPlaceholder: "Cuisine africaine, Pâtisserie, Traiteur...",
  },
  {
    id: "other",
    label: "Autre",
    emoji: "✨",
    description: "Tout autre métier ou activité professionnelle",
    projectsSectionLabel: "Réalisations",
    skillsSectionLabel: "Compétences",
    servicesLabel: "Services proposés",
    showGithub: true,  // Autre = tout visible
    showLinkedin: true,
    showTwitter: true,
    showYearsExperience: true,
    showCompletedProjects: true,
    showSatisfiedClients: true,
    titlePlaceholder: "Votre titre professionnel",
    skillsPlaceholder: "Vos compétences...",
  },
];

export function getCategoryById(id: string | null | undefined): ProfileCategory {
  if (!id) return PROFILE_CATEGORIES[PROFILE_CATEGORIES.length - 1]; // "Autre" = tout visible
  return PROFILE_CATEGORIES.find((c) => c.id === id) ?? PROFILE_CATEGORIES[PROFILE_CATEGORIES.length - 1];
}

/**
 * Retourne true si un champ doit être affiché.
 * Quand aucun type n'est sélectionné, tout est visible.
 */
export function shouldShowField(profileType: string | null | undefined, field: keyof Pick<ProfileCategory, "showGithub" | "showLinkedin" | "showTwitter" | "showYearsExperience" | "showCompletedProjects" | "showSatisfiedClients">): boolean {
  if (!profileType) return true; // pas de type = tout visible
  const cat = PROFILE_CATEGORIES.find((c) => c.id === profileType);
  if (!cat) return true;
  return cat[field];
}
