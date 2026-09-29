// ============================================================
// Types de profils et configuration des champs par catégorie
// ============================================================

export interface ProfileCategory {
  id: string;
  label: string;
  emoji: string;
  description: string;
  // Labels personnalisés
  projectsSectionLabel: string;
  skillsSectionLabel: string;
  servicesLabel: string;
  // Placeholders
  titlePlaceholder: string;
  skillsPlaceholder: string;
  bioPlaceholder: string;
  servicesPlaceholder: string;
  taglinePlaceholder: string;
  // Labels des stats
  statExperienceLabel: string;
  statProjectsLabel: string;
  statClientsLabel: string;
  // Champs visibles
  showGithub: boolean;
  showLinkedin: boolean;
  showTwitter: boolean;
  showYearsExperience: boolean;
  showCompletedProjects: boolean;
  showSatisfiedClients: boolean;
  // Champs spécifiques au domaine
  showAvailableForWork: boolean;   // "Disponible pour missions"
  showLogo: boolean;               // logo entreprise / marque
  showWebsite: boolean;            // site web personnel
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
    titlePlaceholder: "Développeur Web Fullstack",
    skillsPlaceholder: "React, Node.js, TypeScript, Figma...",
    bioPlaceholder: "Passionné par le développement web, je crée des applications performantes pour des clients en Afrique et partout dans le monde. X ans d'expérience en...",
    servicesPlaceholder: "Développement Web\nCréation de sites vitrines, applications web et APIs modernes.\n\nDesign UI/UX\nMaquettes, prototypes et interfaces utilisateur.\n\nConseil Technique\nAudit, choix de stack, accompagnement d'équipe.",
    taglinePlaceholder: "Je transforme vos idées en produits digitaux",
    statExperienceLabel: "Années d'expérience",
    statProjectsLabel: "Projets livrés",
    statClientsLabel: "Clients satisfaits",
    showGithub: true,
    showLinkedin: true,
    showTwitter: true,
    showYearsExperience: true,
    showCompletedProjects: true,
    showSatisfiedClients: true,
    showAvailableForWork: true,
    showLogo: false,
    showWebsite: true,
  },
  {
    id: "creative",
    label: "Créatif & Arts",
    emoji: "🎨",
    description: "Graphiste, Photographe, Musicien, Illustrateur, Styliste...",
    projectsSectionLabel: "Portfolio & Créations",
    skillsSectionLabel: "Outils & Styles",
    servicesLabel: "Prestations artistiques",
    titlePlaceholder: "Photographe & Vidéaste",
    skillsPlaceholder: "Photographie, Retouche, Lightroom, Premiere Pro...",
    bioPlaceholder: "Artiste visuel basé à [ville], je capture des moments authentiques et crée des visuels percutants pour les marques, événements et particuliers.",
    servicesPlaceholder: "Séances Photo\nPortraits, mariages, événements d'entreprise.\n\nPostproduction\nRetouche photo, montage vidéo, color grading.\n\nDirection Artistique\nIdentité visuelle, shooting de marque.",
    taglinePlaceholder: "L'art de sublimer chaque instant",
    statExperienceLabel: "Années de pratique",
    statProjectsLabel: "Créations réalisées",
    statClientsLabel: "Clients satisfaits",
    showGithub: false,
    showLinkedin: true,
    showTwitter: true,
    showYearsExperience: true,
    showCompletedProjects: true,
    showSatisfiedClients: true,
    showAvailableForWork: true,
    showLogo: false,
    showWebsite: true,
  },
  {
    id: "education",
    label: "Éducation & Coaching",
    emoji: "🎓",
    description: "Coach, Formateur, Enseignant, Tuteur, Conférencier...",
    projectsSectionLabel: "Programmes & Formations",
    skillsSectionLabel: "Domaines d'expertise",
    servicesLabel: "Offres de formation",
    titlePlaceholder: "Coach de vie & Formateur",
    skillsPlaceholder: "Leadership, Développement personnel, Prise de parole...",
    bioPlaceholder: "Formateur certifié avec X années d'expérience, j'accompagne des individus et organisations à atteindre leurs objectifs. Mes formations combinent théorie et pratique.",
    servicesPlaceholder: "Coaching Individuel\nSéances personnalisées pour atteindre vos objectifs professionnels et personnels.\n\nFormation en groupe\nAteliers et sessions de groupe (présentiel ou en ligne).\n\nConférences\nInterventions sur mesure pour vos événements.",
    taglinePlaceholder: "Révélez votre potentiel, atteignez vos objectifs",
    statExperienceLabel: "Années d'expérience",
    statProjectsLabel: "Formations dispensées",
    statClientsLabel: "Personnes formées",
    showGithub: false,
    showLinkedin: true,
    showTwitter: true,
    showYearsExperience: true,
    showCompletedProjects: true,
    showSatisfiedClients: true,
    showAvailableForWork: true,
    showLogo: false,
    showWebsite: true,
  },
  {
    id: "business",
    label: "Business & Conseil",
    emoji: "💼",
    description: "Entrepreneur, Consultant, Comptable, Agent immobilier...",
    projectsSectionLabel: "Projets & Références",
    skillsSectionLabel: "Expertises",
    servicesLabel: "Services & Conseil",
    titlePlaceholder: "Consultant en stratégie d'entreprise",
    skillsPlaceholder: "Stratégie, Finance, Marketing, Gestion de projet...",
    bioPlaceholder: "Consultant avec X années d'expérience, j'aide les entreprises africaines à structurer leur croissance, optimiser leurs finances et développer leur marché.",
    servicesPlaceholder: "Conseil Stratégique\nAnalyse de marché, business plan, stratégie de croissance.\n\nAccompagnement Financier\nOptimisation des coûts, levée de fonds, trésorerie.\n\nMarketing & Communication\nStratégie digitale, branding, acquisition clients.",
    taglinePlaceholder: "Votre croissance, notre mission",
    statExperienceLabel: "Années d'expérience",
    statProjectsLabel: "Missions réalisées",
    statClientsLabel: "Entreprises accompagnées",
    showGithub: false,
    showLinkedin: true,
    showTwitter: true,
    showYearsExperience: true,
    showCompletedProjects: true,
    showSatisfiedClients: true,
    showAvailableForWork: true,
    showLogo: true,
    showWebsite: true,
  },
  {
    id: "health",
    label: "Santé & Bien-être",
    emoji: "🏥",
    description: "Médecin, Nutritionniste, Coach sportif, Psychologue...",
    projectsSectionLabel: "Programmes & Suivis",
    skillsSectionLabel: "Spécialités",
    servicesLabel: "Consultations & Soins",
    titlePlaceholder: "Nutritionniste & Coach bien-être",
    skillsPlaceholder: "Nutrition, Diététique, Sport, Méditation...",
    bioPlaceholder: "Professionnel de santé diplômé, j'accompagne mes patients vers un mieux-être durable grâce à une approche globale et personnalisée.",
    servicesPlaceholder: "Consultation Individuelle\nBilan de santé, suivi nutritionnel ou médical personnalisé.\n\nCoaching Bien-être\nProgrammes de remise en forme, gestion du stress, sommeil.\n\nAteliers Collectifs\nSéances de groupe sur la nutrition, la santé mentale.",
    taglinePlaceholder: "Votre santé, ma priorité",
    statExperienceLabel: "Années de pratique",
    statProjectsLabel: "Programmes créés",
    statClientsLabel: "Patients suivis",
    showGithub: false,
    showLinkedin: true,
    showTwitter: false,
    showYearsExperience: true,
    showCompletedProjects: false,
    showSatisfiedClients: true,
    showAvailableForWork: true,
    showLogo: false,
    showWebsite: true,
  },
  {
    id: "artisan",
    label: "Artisanat & Métiers",
    emoji: "🔨",
    description: "Couturier, Menuisier, Électricien, Mécanicien, Bijoutier...",
    projectsSectionLabel: "Mes Réalisations",
    skillsSectionLabel: "Savoir-faire",
    servicesLabel: "Prestations & Devis",
    titlePlaceholder: "Couturier & Styliste",
    skillsPlaceholder: "Couture, Broderie, Stylisme, Tissu wax...",
    bioPlaceholder: "Artisan passionné avec X années d'expérience, je réalise des pièces uniques sur mesure avec soin et précision. Chaque commande est traitée avec rigueur.",
    servicesPlaceholder: "Confection sur mesure\nVêtements, tenues de cérémonie, uniformes.\n\nRetouches & Réparations\nAjustements, transformations, remises en état.\n\nFormation\nInitiation à la couture et aux techniques artisanales.",
    taglinePlaceholder: "L'excellence artisanale à votre service",
    statExperienceLabel: "Années de métier",
    statProjectsLabel: "Pièces réalisées",
    statClientsLabel: "Clients fidèles",
    showGithub: false,
    showLinkedin: false,
    showTwitter: false,
    showYearsExperience: true,
    showCompletedProjects: true,
    showSatisfiedClients: true,
    showAvailableForWork: true,
    showLogo: false,
    showWebsite: false,
  },
  {
    id: "legal",
    label: "Juridique & Finance",
    emoji: "⚖️",
    description: "Avocat, Notaire, Conseiller juridique, Expert-comptable...",
    projectsSectionLabel: "Domaines d'intervention",
    skillsSectionLabel: "Domaines juridiques",
    servicesLabel: "Services juridiques",
    titlePlaceholder: "Avocat d'affaires",
    skillsPlaceholder: "Droit des affaires, Droit civil, Fiscalité...",
    bioPlaceholder: "Juriste expérimenté, j'interviens auprès de particuliers et d'entreprises pour sécuriser leurs opérations juridiques et défendre leurs intérêts.",
    servicesPlaceholder: "Conseil Juridique\nRédaction de contrats, due diligence, audit juridique.\n\nDéfense & Représentation\nAssistance devant les tribunaux et instances arbitrales.\n\nFormation Juridique\nSéminaires sur la conformité et le droit des affaires.",
    taglinePlaceholder: "Votre sécurité juridique, mon engagement",
    statExperienceLabel: "Années de barreau",
    statProjectsLabel: "Dossiers traités",
    statClientsLabel: "Clients accompagnés",
    showGithub: false,
    showLinkedin: true,
    showTwitter: false,
    showYearsExperience: true,
    showCompletedProjects: true,
    showSatisfiedClients: true,
    showAvailableForWork: false,
    showLogo: true,
    showWebsite: true,
  },
  {
    id: "agriculture",
    label: "Agriculture & Environnement",
    emoji: "🌾",
    description: "Agriculteur, Éleveur, Agronome, Pêcheur...",
    projectsSectionLabel: "Productions & Projets",
    skillsSectionLabel: "Spécialités agricoles",
    servicesLabel: "Produits & Services",
    titlePlaceholder: "Agronome & Consultant agricole",
    skillsPlaceholder: "Maraîchage, Élevage, Agroforesterie, Irrigation...",
    bioPlaceholder: "Agronome passionné, j'accompagne agriculteurs et entreprises agricoles dans l'optimisation de leurs productions et l'adoption de pratiques durables.",
    servicesPlaceholder: "Conseil Agricole\nDiagnostic de sol, plan cultural, choix variétal.\n\nFormation Agricole\nTechniques modernes, agriculture biologique, irrigation.\n\nVente de Produits\nProduits frais, transformés, livraison possible.",
    taglinePlaceholder: "Une agriculture durable pour une Afrique prospère",
    statExperienceLabel: "Années d'expérience",
    statProjectsLabel: "Hectares gérés",
    statClientsLabel: "Exploitations accompagnées",
    showGithub: false,
    showLinkedin: false,
    showTwitter: false,
    showYearsExperience: true,
    showCompletedProjects: true,
    showSatisfiedClients: true,
    showAvailableForWork: false,
    showLogo: false,
    showWebsite: false,
  },
  {
    id: "food",
    label: "Restauration & Hôtellerie",
    emoji: "🍽️",
    description: "Chef cuisinier, Traiteur, Pâtissier, Barman...",
    projectsSectionLabel: "Créations & Menus",
    skillsSectionLabel: "Spécialités culinaires",
    servicesLabel: "Prestations traiteur",
    titlePlaceholder: "Chef cuisinier & Traiteur",
    skillsPlaceholder: "Cuisine africaine, Pâtisserie, Traiteur, Bar...",
    bioPlaceholder: "Chef passionné avec X années en cuisine, je propose des expériences culinaires authentiques et créatives. Disponible pour événements, traiteur et cours de cuisine.",
    servicesPlaceholder: "Traiteur Événementiel\nMariages, baptêmes, réceptions d'entreprise, tous budgets.\n\nCours de Cuisine\nInitiation et perfectionnement pour particuliers et groupes.\n\nMenu sur mesure\nCarte personnalisée pour restaurants et hôtels.",
    taglinePlaceholder: "La gastronomie africaine dans toute sa splendeur",
    statExperienceLabel: "Années en cuisine",
    statProjectsLabel: "Événements réalisés",
    statClientsLabel: "Convives servis",
    showGithub: false,
    showLinkedin: false,
    showTwitter: true,
    showYearsExperience: true,
    showCompletedProjects: true,
    showSatisfiedClients: true,
    showAvailableForWork: true,
    showLogo: false,
    showWebsite: false,
  },
  {
    id: "other",
    label: "Autre",
    emoji: "✨",
    description: "Tout autre métier ou activité professionnelle",
    projectsSectionLabel: "Réalisations",
    skillsSectionLabel: "Compétences",
    servicesLabel: "Services proposés",
    titlePlaceholder: "Votre titre professionnel",
    skillsPlaceholder: "Vos compétences...",
    bioPlaceholder: "Présentez-vous en quelques lignes. Parlez de votre parcours, vos valeurs et ce qui vous rend unique dans votre domaine.",
    servicesPlaceholder: "Service 1\nDescription de votre premier service.\n\nService 2\nDescription de votre deuxième service.",
    taglinePlaceholder: "Votre slogan professionnel",
    statExperienceLabel: "Années d'expérience",
    statProjectsLabel: "Projets réalisés",
    statClientsLabel: "Clients satisfaits",
    showGithub: true,
    showLinkedin: true,
    showTwitter: true,
    showYearsExperience: true,
    showCompletedProjects: true,
    showSatisfiedClients: true,
    showAvailableForWork: true,
    showLogo: true,
    showWebsite: true,
  },
];

export function getCategoryById(id: string | null | undefined): ProfileCategory {
  if (!id) return PROFILE_CATEGORIES[PROFILE_CATEGORIES.length - 1];
  return PROFILE_CATEGORIES.find((c) => c.id === id) ?? PROFILE_CATEGORIES[PROFILE_CATEGORIES.length - 1];
}

export function shouldShowField(
  profileType: string | null | undefined,
  field: keyof Pick<ProfileCategory,
    | "showGithub" | "showLinkedin" | "showTwitter"
    | "showYearsExperience" | "showCompletedProjects" | "showSatisfiedClients"
    | "showAvailableForWork" | "showLogo" | "showWebsite"
  >
): boolean {
  if (!profileType) return true;
  const cat = PROFILE_CATEGORIES.find((c) => c.id === profileType);
  if (!cat) return true;
  return cat[field];
}
