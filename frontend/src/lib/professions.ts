// ============================================================
// Catalogue des métiers
// Chaque métier choisit un template, ses sections par défaut, des
// prestations suggérées et des textes prêts à l'emploi : l'utilisateur
// modifie au lieu d'écrire, et publie en moins de 5 minutes.
// ============================================================
import type { BlockType } from "./blocks";
import type { TemplateId } from "./templates";
import type { ImageSetId, PortraitId } from "./images";

export type FamilyId =
  | "artisan" | "beauty" | "building" | "food" | "creative" | "health" | "legal" | "business" | "tech" | "education" | "events" | "agriculture" | "other";

export const FAMILIES: Record<FamilyId, { label: string; emoji: string }> = {
  artisan: { label: "Artisanat & mode", emoji: "🧵" },
  beauty: { label: "Beauté & coiffure", emoji: "💇🏾‍♀️" },
  building: { label: "Bâtiment & dépannage", emoji: "🛠️" },
  food: { label: "Cuisine & restauration", emoji: "🍲" },
  creative: { label: "Image & création", emoji: "📸" },
  health: { label: "Santé & bien-être", emoji: "🩺" },
  legal: { label: "Droit & finance", emoji: "⚖️" },
  business: { label: "Conseil & immobilier", emoji: "💼" },
  tech: { label: "Tech & digital", emoji: "💻" },
  education: { label: "Coaching & formation", emoji: "🎓" },
  events: { label: "Événementiel & musique", emoji: "🎤" },
  agriculture: { label: "Agriculture & élevage", emoji: "🌾" },
  other: { label: "Autre", emoji: "✨" },
};

export interface SuggestedService {
  name: string;
  price?: string;
  unit?: string;
  description?: string;
}

export interface Profession {
  id: string;
  label: string;
  /** Titre par défaut affiché sous le nom */
  title: string;
  emoji: string;
  family: FamilyId;
  template: TemplateId;
  synonyms: string[];
  imageSet: ImageSetId;
  portrait: PortraitId;
  /** Sections créées pour ce métier, dans l'ordre */
  blocks: BlockType[];
  /** Où vont les prestations choisies pendant l'inscription */
  serviceBlock: "services" | "menu" | "offers";
  services: SuggestedService[];
  /** Tokens : {at} = " à Cotonou", {since} = " depuis 5 ans", {services} = "a, b et c" */
  bio: string;
  tagline: string;
  cta: { label: string; message: string };
  /** Titre de l'étape photos pendant l'inscription */
  photosLabel: string;
  blockTitles?: Partial<Record<BlockType, string>>;
}

type Def = Omit<Profession, "serviceBlock" | "blocks" | "cta" | "photosLabel"> &
  Partial<Pick<Profession, "serviceBlock" | "blocks" | "cta" | "photosLabel">>;

const TEMPLATE_BLOCKS: Record<TemplateId, BlockType[]> = {
  atelier: ["gallery", "services", "testimonials", "stats", "hours", "faq"],
  chantier: ["services", "beforeAfter", "zone", "gallery", "testimonials", "hours", "faq"],
  table: ["menu", "gallery", "hours", "zone", "testimonials"],
  galerie: ["gallery", "services", "video", "testimonials", "stats"],
  cabinet: ["services", "credentials", "hours", "experience", "faq", "testimonials"],
  studio: ["projects", "skills", "services", "experience", "stats", "testimonials"],
  scene: ["offers", "testimonials", "stats", "video", "gallery", "faq"],
};

const DEFAULT_CTA: Record<TemplateId, Profession["cta"]> = {
  atelier: { label: "Demander un devis", message: "Bonjour, j'ai vu votre portfolio et je souhaite un devis pour " },
  chantier: { label: "Demander une intervention", message: "Bonjour, j'ai besoin d'une intervention pour " },
  table: { label: "Commander sur WhatsApp", message: "Bonjour, je souhaite commander : " },
  galerie: { label: "Réserver une séance", message: "Bonjour, j'aimerais réserver une séance pour " },
  cabinet: { label: "Prendre rendez-vous", message: "Bonjour, je souhaite prendre rendez-vous pour " },
  studio: { label: "Discuter de mon projet", message: "Bonjour, j'ai un projet à vous présenter : " },
  scene: { label: "Réserver maintenant", message: "Bonjour, je suis intéressé(e) par " },
};

function def(d: Def): Profession {
  return {
    serviceBlock: "services",
    blocks: TEMPLATE_BLOCKS[d.template],
    cta: DEFAULT_CTA[d.template],
    photosLabel: "Vos plus belles réalisations",
    ...d,
  };
}

export const PROFESSIONS: Profession[] = [
  // ── Artisanat & mode ────────────────────────────────────────
  def({
    id: "couturiere", label: "Couturière / Couturier", title: "Couturière", emoji: "🧵", family: "artisan", template: "atelier",
    synonyms: ["couture", "couturier", "tailleur", "confection", "modéliste", "pagne", "wax", "tenue"],
    imageSet: "couture", portrait: "womanWax",
    services: [
      { name: "Confection sur mesure", price: "15 000", unit: "à partir de" },
      { name: "Tenues de cérémonie & mariage", price: "35 000", unit: "à partir de" },
      { name: "Retouches & ajustements", price: "2 000", unit: "à partir de" },
      { name: "Tenues assorties (couple, famille)" },
      { name: "Uniformes scolaires & professionnels" },
      { name: "Cours de couture" },
    ],
    bio: "Couturière{at}{since}, je réalise vos tenues sur mesure : {services}. Du choix du tissu aux finitions, chaque pièce est cousue avec soin pour vous aller parfaitement. Envoyez-moi votre modèle sur WhatsApp, je vous fais un devis rapidement.",
    tagline: "Des tenues sur mesure qui vous ressemblent",
    photosLabel: "Vos plus belles créations",
    blockTitles: { gallery: "Mes créations", services: "Mes tarifs" },
  }),
  def({
    id: "styliste", label: "Styliste / Créateur de mode", title: "Styliste", emoji: "👗", family: "artisan", template: "galerie",
    synonyms: ["mode", "créateur", "créatrice", "fashion", "designer de mode", "marque de vêtements"],
    imageSet: "fashion", portrait: "womanProfile",
    services: [
      { name: "Création de collections" },
      { name: "Pièces sur commande", price: "25 000", unit: "à partir de" },
      { name: "Stylisme pour shooting & clip" },
      { name: "Conseil en image" },
    ],
    bio: "Styliste{at}{since}, je crée des pièces qui mêlent héritage africain et coupes contemporaines. {services} : chaque création raconte une histoire. Contactez-moi pour une commande ou une collaboration.",
    tagline: "La mode africaine, réinventée",
    photosLabel: "Vos collections et créations",
    blockTitles: { gallery: "Collections" },
  }),
  def({
    id: "bijoutier", label: "Bijoutier / Créatrice de bijoux", title: "Créatrice de bijoux", emoji: "💍", family: "artisan", template: "atelier",
    synonyms: ["bijoux", "bijouterie", "perles", "orfèvre", "accessoires"],
    imageSet: "jewelry", portrait: "womanSmile",
    services: [
      { name: "Bijoux faits main", price: "5 000", unit: "à partir de" },
      { name: "Bijoux personnalisés" },
      { name: "Parures de mariage" },
      { name: "Réparation de bijoux" },
    ],
    bio: "Créatrice de bijoux{at}{since}, je fabrique à la main des pièces uniques : {services}. Chaque bijou est pensé pour sublimer votre style. Commandez directement sur WhatsApp.",
    tagline: "Des bijoux uniques, faits main",
    photosLabel: "Vos bijoux",
  }),
  def({
    id: "menuisier", label: "Menuisier / Ébéniste", title: "Menuisier ébéniste", emoji: "🪚", family: "artisan", template: "atelier",
    synonyms: ["menuiserie", "ébéniste", "bois", "meubles", "charpentier", "mobilier"],
    imageSet: "wood", portrait: "manSmile",
    services: [
      { name: "Meubles sur mesure", unit: "sur devis" },
      { name: "Portes & fenêtres" },
      { name: "Cuisines & placards" },
      { name: "Lits, salons & tables" },
      { name: "Réparation & rénovation de meubles" },
    ],
    bio: "Menuisier ébéniste{at}{since}, je fabrique et pose vos {services}. Bois de qualité, finitions soignées et délais respectés. Envoyez-moi une photo ou un croquis de votre projet pour un devis gratuit.",
    tagline: "Le bois travaillé avec passion",
    blockTitles: { gallery: "Mes réalisations" },
  }),
  def({
    id: "cordonnier", label: "Cordonnier / Maroquinier", title: "Maroquinier", emoji: "👞", family: "artisan", template: "atelier",
    synonyms: ["cordonnerie", "maroquinerie", "chaussures", "sacs", "cuir", "sandales"],
    imageSet: "fashion", portrait: "manSmile",
    services: [
      { name: "Chaussures sur mesure", price: "20 000", unit: "à partir de" },
      { name: "Sacs & accessoires en cuir" },
      { name: "Réparation de chaussures", price: "1 500", unit: "à partir de" },
      { name: "Sandales artisanales" },
    ],
    bio: "Artisan du cuir{at}{since}, je réalise {services}. Un travail durable, fait main, avec des matériaux choisis. Passez à l'atelier ou écrivez-moi sur WhatsApp.",
    tagline: "Le cuir, travaillé à la main",
  }),

  // ── Beauté & coiffure ───────────────────────────────────────
  def({
    id: "coiffeuse", label: "Coiffeuse / Tresseuse", title: "Coiffeuse", emoji: "💇🏾‍♀️", family: "beauty", template: "atelier",
    synonyms: ["coiffure", "tresses", "tresseuse", "nattes", "perruque", "salon de coiffure", "locks", "tissage"],
    imageSet: "beauty", portrait: "womanGlasses",
    blocks: ["gallery", "services", "hours", "testimonials", "zone", "faq"],
    services: [
      { name: "Tresses & nattes", price: "5 000", unit: "à partir de" },
      { name: "Tissage & pose de perruque", price: "7 000", unit: "à partir de" },
      { name: "Locks (création & entretien)" },
      { name: "Coiffure de mariage & cérémonie" },
      { name: "Soins & défrisage" },
      { name: "Coiffure à domicile" },
    ],
    bio: "Coiffeuse{at}{since}, je prends soin de vos cheveux : {services}. Travail soigné, respect du cheveu naturel et bonne humeur garantie. Réservez votre créneau sur WhatsApp.",
    tagline: "Sublimer vos cheveux, c'est mon métier",
    cta: { label: "Réserver un créneau", message: "Bonjour, je souhaite réserver un créneau pour " },
    photosLabel: "Vos plus belles coiffures",
    blockTitles: { gallery: "Mes coiffures", services: "Prestations & tarifs" },
  }),
  def({
    id: "barbier", label: "Barbier / Coiffeur homme", title: "Barbier", emoji: "💈", family: "beauty", template: "atelier",
    synonyms: ["barber", "coiffeur", "coupe homme", "barbe", "salon"],
    imageSet: "barber", portrait: "manBeanie",
    blocks: ["gallery", "services", "hours", "testimonials", "faq"],
    services: [
      { name: "Coupe homme", price: "1 500" },
      { name: "Dégradé & contours", price: "2 000" },
      { name: "Taille de barbe", price: "1 000" },
      { name: "Coupe enfant", price: "1 000" },
      { name: "Soin du visage" },
    ],
    bio: "Barbier{at}{since}. Coupes nettes, dégradés précis et barbe taillée au millimètre : {services}. Passez au salon ou réservez sur WhatsApp pour éviter l'attente.",
    tagline: "Une coupe nette, à chaque fois",
    cta: { label: "Réserver ma coupe", message: "Bonjour, je souhaite réserver pour " },
    photosLabel: "Vos plus belles coupes",
  }),
  def({
    id: "maquilleuse", label: "Maquilleuse professionnelle", title: "Maquilleuse professionnelle", emoji: "💄", family: "beauty", template: "galerie",
    synonyms: ["maquillage", "makeup", "make-up", "mua", "beauté", "mariée"],
    imageSet: "beauty", portrait: "womanPortrait",
    blocks: ["gallery", "services", "testimonials", "zone", "faq"],
    services: [
      { name: "Maquillage de mariée", price: "25 000", unit: "à partir de" },
      { name: "Maquillage de soirée", price: "10 000" },
      { name: "Maquillage shooting & clip" },
      { name: "Cours d'auto-maquillage" },
      { name: "Déplacement à domicile" },
    ],
    bio: "Maquilleuse professionnelle{at}{since}, je révèle votre beauté pour vos grands jours : {services}. Produits de qualité adaptés aux peaux noires et métissées. Réservez tôt pour les mariages !",
    tagline: "Votre beauté, révélée",
    cta: { label: "Réserver une date", message: "Bonjour, je souhaite réserver un maquillage pour le " },
    photosLabel: "Vos plus beaux maquillages",
  }),
  def({
    id: "estheticienne", label: "Esthéticienne / Onglerie", title: "Esthéticienne", emoji: "💅🏾", family: "beauty", template: "atelier",
    synonyms: ["esthétique", "ongles", "manucure", "pédicure", "onglerie", "soins", "institut", "spa"],
    imageSet: "beauty", portrait: "womanSmile",
    blocks: ["services", "gallery", "hours", "testimonials", "faq"],
    services: [
      { name: "Pose d'ongles (gel, capsules)", price: "8 000" },
      { name: "Manucure & pédicure", price: "5 000" },
      { name: "Soin du visage", price: "10 000" },
      { name: "Épilation" },
      { name: "Massage relaxant" },
    ],
    bio: "Esthéticienne{at}{since}, je vous accueille pour un moment de soin : {services}. Hygiène irréprochable et produits de qualité. Réservez votre rendez-vous sur WhatsApp.",
    tagline: "Prenez soin de vous",
    cta: { label: "Prendre rendez-vous", message: "Bonjour, je souhaite un rendez-vous pour " },
  }),

  // ── Bâtiment & dépannage ────────────────────────────────────
  def({
    id: "electricien", label: "Électricien", title: "Électricien", emoji: "⚡", family: "building", template: "chantier",
    synonyms: ["électricité", "installation électrique", "câblage", "dépannage électrique", "solaire", "panneaux solaires"],
    imageSet: "electric", portrait: "manElectrician",
    services: [
      { name: "Installation électrique complète", unit: "sur devis" },
      { name: "Dépannage & recherche de panne", price: "5 000", unit: "à partir de" },
      { name: "Pose de panneaux solaires" },
      { name: "Mise aux normes" },
      { name: "Installation de climatiseurs & ventilateurs" },
      { name: "Éclairage & prises" },
    ],
    bio: "Électricien{at}{since}, j'interviens chez les particuliers et les entreprises : {services}. Travail propre, sécurisé et garanti. Appelez-moi ou écrivez sur WhatsApp, je me déplace rapidement.",
    tagline: "Installation & dépannage électrique, rapide et sûr",
    photosLabel: "Photos de vos chantiers",
  }),
  def({
    id: "plombier", label: "Plombier", title: "Plombier", emoji: "🔧", family: "building", template: "chantier",
    synonyms: ["plomberie", "fuite", "sanitaire", "tuyauterie", "chauffe-eau", "fosse septique"],
    imageSet: "plumbing", portrait: "manSmile",
    services: [
      { name: "Réparation de fuites", price: "5 000", unit: "à partir de" },
      { name: "Installation sanitaire complète", unit: "sur devis" },
      { name: "Débouchage", price: "7 000" },
      { name: "Pose de chauffe-eau" },
      { name: "Installation de surpresseur & forage" },
    ],
    bio: "Plombier{at}{since}, je règle vos problèmes d'eau : {services}. Intervention rapide, prix annoncés à l'avance. Un souci ? Appelez-moi.",
    tagline: "Une fuite ? J'arrive.",
    photosLabel: "Photos de vos interventions",
  }),
  def({
    id: "macon", label: "Maçon / Entreprise BTP", title: "Maçon", emoji: "🧱", family: "building", template: "chantier",
    synonyms: ["maçonnerie", "btp", "construction", "bâtiment", "carrelage", "carreleur", "entrepreneur", "chantier"],
    imageSet: "building", portrait: "manShirt",
    services: [
      { name: "Construction de maisons", unit: "sur devis" },
      { name: "Rénovation & agrandissement" },
      { name: "Carrelage & dallage" },
      { name: "Clôtures & murs" },
      { name: "Crépissage & finitions" },
    ],
    bio: "Maçon{at}{since}, je construis et rénove : {services}. Suivi de chantier sérieux, respect des plans et du budget. Contactez-moi pour une visite et un devis.",
    tagline: "Construire solide, livrer à temps",
    cta: { label: "Demander un devis", message: "Bonjour, j'ai un projet de construction : " },
    photosLabel: "Photos de vos chantiers",
  }),
  def({
    id: "peintre", label: "Peintre en bâtiment", title: "Peintre en bâtiment", emoji: "🎨", family: "building", template: "chantier",
    synonyms: ["peinture", "décoration murale", "enduit", "staff", "plafond"],
    imageSet: "building", portrait: "manSmile",
    services: [
      { name: "Peinture intérieure", price: "1 500", unit: "par m²" },
      { name: "Peinture extérieure & façades" },
      { name: "Enduit & préparation des murs" },
      { name: "Décoration murale" },
      { name: "Faux plafonds (staff)" },
    ],
    bio: "Peintre en bâtiment{at}{since}, je donne un coup de neuf à vos murs : {services}. Travail propre, protection des meubles et finitions nettes.",
    tagline: "Des murs impeccables, sans stress",
  }),
  def({
    id: "mecanicien", label: "Mécanicien auto / moto", title: "Mécanicien", emoji: "🚗", family: "building", template: "chantier",
    synonyms: ["mécanique", "garage", "garagiste", "voiture", "moto", "réparation auto", "vidange", "diagnostic"],
    imageSet: "mechanic", portrait: "manSmile",
    blocks: ["services", "gallery", "hours", "zone", "testimonials", "faq"],
    services: [
      { name: "Diagnostic électronique", price: "10 000" },
      { name: "Vidange & entretien", price: "15 000", unit: "à partir de" },
      { name: "Réparation moteur", unit: "sur devis" },
      { name: "Freins & embrayage" },
      { name: "Dépannage sur place" },
    ],
    bio: "Mécanicien{at}{since}, je répare et entretiens votre véhicule : {services}. Diagnostic honnête, pièces de qualité et prix clairs. Passez au garage ou appelez-moi.",
    tagline: "Votre véhicule entre de bonnes mains",
    cta: { label: "Prendre rendez-vous", message: "Bonjour, mon véhicule a besoin de : " },
    photosLabel: "Photos de votre garage et réparations",
  }),
  def({
    id: "frigoriste", label: "Frigoriste / Climatisation", title: "Frigoriste", emoji: "❄️", family: "building", template: "chantier",
    synonyms: ["climatisation", "clim", "froid", "réfrigérateur", "congélateur", "frigo"],
    imageSet: "electric", portrait: "manElectrician",
    services: [
      { name: "Installation de climatiseur", price: "25 000", unit: "à partir de" },
      { name: "Entretien & recharge de gaz", price: "10 000" },
      { name: "Réparation de réfrigérateurs & congélateurs" },
      { name: "Chambres froides" },
    ],
    bio: "Frigoriste{at}{since}, j'installe et répare vos équipements de froid : {services}. Intervention rapide, même en urgence.",
    tagline: "Au frais, toute l'année",
  }),
  def({
    id: "nettoyage", label: "Entreprise de nettoyage", title: "Services de nettoyage", emoji: "🧽", family: "building", template: "chantier",
    synonyms: ["ménage", "nettoyage", "entretien", "propreté", "femme de ménage", "désinsectisation"],
    imageSet: "cleaning", portrait: "womanSmile",
    services: [
      { name: "Nettoyage de bureaux", unit: "sur devis" },
      { name: "Ménage à domicile", price: "5 000", unit: "la séance" },
      { name: "Nettoyage après chantier" },
      { name: "Nettoyage de canapés & tapis" },
      { name: "Désinsectisation" },
    ],
    bio: "Nous assurons la propreté de vos espaces{at}{since} : {services}. Équipe sérieuse, matériel professionnel et produits efficaces.",
    tagline: "Des espaces impeccables, sans effort",
  }),
  def({
    id: "reparateur-telephone", label: "Réparateur téléphone & informatique", title: "Réparateur téléphone & PC", emoji: "📱", family: "building", template: "chantier",
    synonyms: ["réparation téléphone", "smartphone", "écran", "informatique", "ordinateur", "technicien", "maintenance"],
    imageSet: "tech", portrait: "manGlasses",
    blocks: ["services", "hours", "zone", "testimonials", "faq"],
    services: [
      { name: "Changement d'écran", price: "10 000", unit: "à partir de" },
      { name: "Remplacement de batterie", price: "5 000" },
      { name: "Déblocage & logiciel" },
      { name: "Réparation d'ordinateurs" },
      { name: "Récupération de données" },
    ],
    bio: "Technicien{at}{since}, je répare vos téléphones et ordinateurs : {services}. Diagnostic gratuit et réparation rapide, souvent le jour même.",
    tagline: "Réparé vite, réparé bien",
    cta: { label: "Demander un prix", message: "Bonjour, mon appareil a un problème : " },
  }),

  // ── Cuisine & restauration ──────────────────────────────────
  def({
    id: "restaurant", label: "Restaurant / Maquis", title: "Restaurant", emoji: "🍽️", family: "food", template: "table",
    synonyms: ["maquis", "resto", "cantine", "cuisine", "plats", "livraison de repas", "fast-food"],
    imageSet: "food", portrait: "womanSmile",
    serviceBlock: "menu",
    services: [
      { name: "Riz au gras / Jollof", price: "2 500" },
      { name: "Poulet braisé & alloco", price: "3 500" },
      { name: "Poisson braisé", price: "4 000" },
      { name: "Sauce arachide & foufou", price: "2 500" },
      { name: "Brochettes (5 pièces)", price: "1 500" },
      { name: "Jus de bissap / gingembre", price: "500" },
    ],
    bio: "Bienvenue{at} ! Nous préparons chaque jour une cuisine généreuse et faite maison : {services}. Sur place, à emporter ou en livraison, commandez directement sur WhatsApp.",
    tagline: "La cuisine de chez nous, faite avec amour",
    photosLabel: "Photos de vos plats et du lieu",
    blockTitles: { menu: "Notre carte", zone: "Zones de livraison" },
  }),
  def({
    id: "traiteur", label: "Traiteur événementiel", title: "Traiteur", emoji: "🥘", family: "food", template: "table",
    synonyms: ["traiteur", "buffet", "mariage", "réception", "cocktail", "catering"],
    imageSet: "food", portrait: "womanGlasses",
    blocks: ["offers", "gallery", "menu", "testimonials", "zone", "faq"],
    serviceBlock: "offers",
    services: [
      { name: "Buffet mariage & baptême", price: "5 000", unit: "par personne" },
      { name: "Cocktail d'entreprise", price: "3 500", unit: "par personne" },
      { name: "Plateaux repas" },
      { name: "Pâtisseries & desserts" },
      { name: "Service & décoration de table" },
    ],
    bio: "Traiteur{at}{since}, je régale vos invités : {services}. Menus sur mesure selon votre budget, de 20 à 500 personnes. Parlons de votre événement sur WhatsApp.",
    tagline: "Vos événements, un vrai festin",
    cta: { label: "Demander un devis", message: "Bonjour, j'organise un événement pour ... personnes le " },
    photosLabel: "Photos de vos buffets et événements",
    blockTitles: { offers: "Nos formules" },
  }),
  def({
    id: "patissier", label: "Pâtissier(ère) / Cake designer", title: "Pâtissière", emoji: "🎂", family: "food", template: "atelier",
    synonyms: ["pâtisserie", "gâteaux", "cake design", "cupcakes", "anniversaire", "boulangerie", "viennoiseries"],
    imageSet: "pastry", portrait: "womanSmile",
    blocks: ["gallery", "services", "testimonials", "zone", "faq"],
    services: [
      { name: "Gâteau d'anniversaire", price: "10 000", unit: "à partir de" },
      { name: "Pièce montée de mariage", unit: "sur devis" },
      { name: "Cupcakes (12 pièces)", price: "6 000" },
      { name: "Box de douceurs", price: "5 000" },
      { name: "Cours de pâtisserie" },
    ],
    bio: "Pâtissière{at}{since}, je crée des gâteaux aussi beaux que bons : {services}. Commandez au moins 48 h à l'avance, livraison possible.",
    tagline: "Des gâteaux qui font briller vos fêtes",
    cta: { label: "Commander un gâteau", message: "Bonjour, je souhaite commander un gâteau pour le " },
    photosLabel: "Photos de vos gâteaux",
    blockTitles: { gallery: "Mes créations", services: "Tarifs indicatifs" },
  }),
  def({
    id: "chef-domicile", label: "Chef à domicile", title: "Chef à domicile", emoji: "👨🏾‍🍳", family: "food", template: "table",
    synonyms: ["chef", "cuisinier", "cuisinière", "chef privé", "cours de cuisine"],
    imageSet: "food", portrait: "manSmile",
    blocks: ["offers", "gallery", "menu", "testimonials", "zone"],
    serviceBlock: "offers",
    services: [
      { name: "Dîner privé", price: "15 000", unit: "par personne" },
      { name: "Repas de famille" },
      { name: "Cours de cuisine à domicile" },
      { name: "Préparation de repas de la semaine" },
    ],
    bio: "Chef{at}{since}, je cuisine chez vous pour des moments inoubliables : {services}. Produits frais du marché, cuisine africaine et internationale.",
    tagline: "Le restaurant s'invite chez vous",
    cta: { label: "Réserver le chef", message: "Bonjour, je souhaite réserver un repas pour ... personnes le " },
  }),

  // ── Image & création ────────────────────────────────────────
  def({
    id: "photographe", label: "Photographe", title: "Photographe", emoji: "📸", family: "creative", template: "galerie",
    synonyms: ["photo", "photographie", "shooting", "mariage", "portrait", "studio photo"],
    imageSet: "photo", portrait: "manBeret",
    services: [
      { name: "Shooting portrait", price: "25 000", unit: "à partir de" },
      { name: "Reportage mariage", price: "150 000", unit: "à partir de" },
      { name: "Photos d'événements" },
      { name: "Photos produits pour marques" },
      { name: "Photos de famille & grossesse" },
    ],
    bio: "Photographe{at}{since}, je capture vos moments avec authenticité : {services}. Retouches soignées et photos livrées en haute définition. Réservez votre séance.",
    tagline: "Des images qui racontent votre histoire",
    photosLabel: "Vos meilleures photos",
    blockTitles: { gallery: "Portfolio", services: "Séances & tarifs" },
  }),
  def({
    id: "videaste", label: "Vidéaste / Monteur", title: "Vidéaste", emoji: "🎬", family: "creative", template: "galerie",
    synonyms: ["vidéo", "cameraman", "montage", "clip", "réalisateur", "drone", "film"],
    imageSet: "photo", portrait: "manBeret",
    blocks: ["video", "gallery", "services", "testimonials", "stats"],
    services: [
      { name: "Clip musical", unit: "sur devis" },
      { name: "Film de mariage", price: "200 000", unit: "à partir de" },
      { name: "Vidéo d'entreprise & publicité" },
      { name: "Montage vidéo" },
      { name: "Prises de vue par drone" },
    ],
    bio: "Vidéaste{at}{since}, je réalise des vidéos qui marquent : {services}. De l'écriture au montage final, je m'occupe de tout.",
    tagline: "Vos histoires, en mouvement",
    cta: { label: "Parler de mon projet", message: "Bonjour, j'ai un projet vidéo : " },
    photosLabel: "Images de vos tournages",
  }),
  def({
    id: "graphiste", label: "Graphiste", title: "Graphiste", emoji: "🖌️", family: "creative", template: "galerie",
    synonyms: ["graphisme", "logo", "infographiste", "identité visuelle", "flyer", "affiche", "design graphique"],
    imageSet: "design", portrait: "manGlasses",
    blocks: ["gallery", "services", "testimonials", "skills", "stats"],
    services: [
      { name: "Création de logo", price: "25 000", unit: "à partir de" },
      { name: "Identité visuelle complète" },
      { name: "Flyers & affiches", price: "10 000" },
      { name: "Visuels réseaux sociaux" },
      { name: "Cartes de visite" },
    ],
    bio: "Graphiste{at}{since}, je donne une image forte aux marques : {services}. Des visuels modernes qui attirent l'œil et font vendre.",
    tagline: "Des visuels qui font parler de vous",
    cta: { label: "Demander un devis", message: "Bonjour, j'ai besoin d'un graphiste pour " },
    photosLabel: "Vos créations graphiques",
  }),
  def({
    id: "artiste", label: "Artiste peintre / Plasticien", title: "Artiste peintre", emoji: "🖼️", family: "creative", template: "galerie",
    synonyms: ["peintre", "art", "tableaux", "sculpteur", "plasticien", "artiste"],
    imageSet: "art", portrait: "womanProfile",
    blocks: ["gallery", "services", "experience", "video"],
    services: [
      { name: "Œuvres originales" },
      { name: "Commandes sur mesure" },
      { name: "Fresques murales" },
      { name: "Ateliers d'art" },
    ],
    bio: "Artiste{at}{since}, mon travail explore les couleurs et les récits de l'Afrique d'aujourd'hui. {services} : contactez-moi pour une acquisition ou une commande.",
    tagline: "L'art comme langage",
    cta: { label: "Acquérir une œuvre", message: "Bonjour, je suis intéressé(e) par votre œuvre " },
    photosLabel: "Vos œuvres",
    blockTitles: { gallery: "Œuvres", experience: "Expositions" },
  }),
  def({
    id: "decorateur", label: "Décorateur(trice) d'intérieur / d'événements", title: "Décoratrice", emoji: "🪴", family: "creative", template: "galerie",
    synonyms: ["décoration", "déco", "design d'intérieur", "aménagement", "décoration mariage"],
    imageSet: "realestate", portrait: "womanGlasses",
    blocks: ["gallery", "services", "beforeAfter", "testimonials"],
    services: [
      { name: "Décoration d'intérieur", unit: "sur devis" },
      { name: "Décoration de mariage & événements" },
      { name: "Conseil & plans d'aménagement" },
      { name: "Home staging" },
    ],
    bio: "Décoratrice{at}{since}, je transforme vos espaces : {services}. Des lieux beaux, pratiques et à votre image.",
    tagline: "Des espaces qui vous ressemblent",
  }),

  // ── Santé & bien-être ───────────────────────────────────────
  def({
    id: "medecin", label: "Médecin", title: "Médecin généraliste", emoji: "🩺", family: "health", template: "cabinet",
    synonyms: ["docteur", "clinique", "cabinet médical", "généraliste", "consultation", "pédiatre", "gynécologue"],
    imageSet: "health", portrait: "manScrubs",
    services: [
      { name: "Consultation générale", price: "10 000" },
      { name: "Suivi des maladies chroniques" },
      { name: "Certificats médicaux" },
      { name: "Visites à domicile" },
      { name: "Téléconsultation" },
    ],
    bio: "Médecin{at}{since}, je vous accompagne pour votre santé et celle de votre famille : {services}. Écoute, prévention et suivi personnalisé.",
    tagline: "Votre santé, avec attention",
    photosLabel: "Photos de votre cabinet",
    blockTitles: { services: "Consultations", hours: "Horaires de consultation" },
  }),
  def({
    id: "infirmier", label: "Infirmier(ère) / Soins à domicile", title: "Infirmier", emoji: "💉", family: "health", template: "cabinet",
    synonyms: ["infirmière", "soins", "aide-soignant", "domicile", "pansement", "injection"],
    imageSet: "health", portrait: "manScrubs",
    blocks: ["services", "zone", "hours", "credentials", "faq"],
    services: [
      { name: "Soins à domicile", price: "5 000", unit: "à partir de" },
      { name: "Injections & perfusions" },
      { name: "Pansements" },
      { name: "Prise de tension & glycémie" },
      { name: "Accompagnement des personnes âgées" },
    ],
    bio: "Infirmier diplômé{at}{since}, je me déplace chez vous : {services}. Soins de qualité, dans le respect et la discrétion.",
    tagline: "Des soins de qualité, chez vous",
  }),
  def({
    id: "kine", label: "Kinésithérapeute", title: "Kinésithérapeute", emoji: "🦴", family: "health", template: "cabinet",
    synonyms: ["kiné", "rééducation", "masseur", "physiothérapeute", "ostéopathe"],
    imageSet: "fitness", portrait: "manSport",
    services: [
      { name: "Rééducation", price: "10 000", unit: "la séance" },
      { name: "Kiné du sport" },
      { name: "Massages thérapeutiques" },
      { name: "Séances à domicile" },
    ],
    bio: "Kinésithérapeute{at}{since}, je vous aide à retrouver mobilité et confort : {services}.",
    tagline: "Retrouvez votre mobilité",
  }),
  def({
    id: "psychologue", label: "Psychologue", title: "Psychologue", emoji: "🧠", family: "health", template: "cabinet",
    synonyms: ["psy", "thérapeute", "psychothérapie", "conseil conjugal", "santé mentale"],
    imageSet: "coaching", portrait: "womanGlasses",
    services: [
      { name: "Consultation individuelle", price: "15 000" },
      { name: "Thérapie de couple" },
      { name: "Accompagnement des adolescents" },
      { name: "Consultation en ligne" },
    ],
    bio: "Psychologue{at}{since}, je vous offre un espace d'écoute bienveillant et confidentiel : {services}.",
    tagline: "Un espace pour vous, en toute confiance",
  }),
  def({
    id: "nutritionniste", label: "Nutritionniste / Diététicien(ne)", title: "Nutritionniste", emoji: "🥗", family: "health", template: "cabinet",
    synonyms: ["nutrition", "diététique", "perte de poids", "régime", "alimentation"],
    imageSet: "health", portrait: "womanSmile",
    blocks: ["offers", "testimonials", "credentials", "faq", "hours"],
    serviceBlock: "offers",
    services: [
      { name: "Bilan nutritionnel", price: "15 000" },
      { name: "Programme perte de poids (3 mois)", price: "60 000" },
      { name: "Suivi diabète & hypertension" },
      { name: "Nutrition sportive" },
    ],
    bio: "Nutritionniste{at}{since}, je vous aide à mieux manger sans vous priver : {services}. Des conseils adaptés à nos plats et à votre quotidien.",
    tagline: "Mieux manger, mieux vivre",
  }),
  def({
    id: "coach-sportif", label: "Coach sportif", title: "Coach sportif", emoji: "🏋🏾", family: "health", template: "scene",
    synonyms: ["sport", "fitness", "musculation", "personal trainer", "salle de sport", "remise en forme"],
    imageSet: "fitness", portrait: "manSport",
    serviceBlock: "offers",
    services: [
      { name: "Séance individuelle", price: "10 000" },
      { name: "Programme 1 mois", price: "60 000" },
      { name: "Cours collectifs", price: "3 000", unit: "la séance" },
      { name: "Coaching en ligne" },
    ],
    bio: "Coach sportif{at}{since}, je vous aide à atteindre vos objectifs : perte de poids, prise de muscle ou remise en forme. {services}. Motivation garantie !",
    tagline: "Votre meilleure forme commence ici",
    photosLabel: "Photos de vos séances",
  }),

  // ── Droit & finance ─────────────────────────────────────────
  def({
    id: "avocat", label: "Avocat(e)", title: "Avocat au Barreau", emoji: "⚖️", family: "legal", template: "cabinet",
    synonyms: ["avocat", "juriste", "cabinet d'avocats", "droit", "défense", "conseil juridique"],
    imageSet: "legal", portrait: "manShirt",
    blocks: ["services", "experience", "credentials", "faq", "hours"],
    services: [
      { name: "Droit des affaires" },
      { name: "Droit de la famille" },
      { name: "Droit du travail" },
      { name: "Droit foncier & immobilier" },
      { name: "Contentieux & défense pénale" },
    ],
    bio: "Avocat{at}{since}, je conseille et défends particuliers et entreprises en {services}. Rigueur, disponibilité et confidentialité.",
    tagline: "Défendre vos droits, sécuriser vos projets",
    blockTitles: { services: "Domaines d'intervention" },
  }),
  def({
    id: "notaire", label: "Notaire / Conseiller juridique", title: "Conseiller juridique", emoji: "📜", family: "legal", template: "cabinet",
    synonyms: ["notaire", "juriste", "actes", "succession", "conseil juridique"],
    imageSet: "legal", portrait: "manShirt",
    blocks: ["services", "credentials", "faq", "hours"],
    services: [
      { name: "Création d'entreprise" },
      { name: "Actes de vente & titres fonciers" },
      { name: "Successions & donations" },
      { name: "Rédaction de contrats" },
    ],
    bio: "Juriste{at}{since}, je sécurise vos démarches : {services}.",
    tagline: "Vos actes en toute sécurité",
  }),
  def({
    id: "comptable", label: "Expert-comptable / Comptable", title: "Expert-comptable", emoji: "📊", family: "legal", template: "cabinet",
    synonyms: ["comptabilité", "fiscalité", "impôts", "audit", "gestion", "déclarations", "ohada"],
    imageSet: "business", portrait: "womanOffice",
    blocks: ["services", "credentials", "experience", "faq", "testimonials"],
    services: [
      { name: "Tenue de comptabilité", price: "50 000", unit: "par mois" },
      { name: "Déclarations fiscales & sociales" },
      { name: "États financiers (SYSCOHADA)" },
      { name: "Création d'entreprise" },
      { name: "Audit & conseil de gestion" },
    ],
    bio: "Expert-comptable{at}{since}, j'accompagne PME et entrepreneurs : {services}. Des comptes clairs pour décider sereinement.",
    tagline: "Des comptes clairs, une entreprise sereine",
  }),
  def({
    id: "assureur", label: "Agent d'assurance", title: "Agent d'assurance", emoji: "🛡️", family: "legal", template: "cabinet",
    synonyms: ["assurance", "courtier", "auto", "santé", "vie"],
    imageSet: "business", portrait: "manShirt",
    blocks: ["services", "faq", "testimonials", "hours"],
    services: [
      { name: "Assurance automobile" },
      { name: "Assurance santé" },
      { name: "Assurance habitation" },
      { name: "Épargne & retraite" },
    ],
    bio: "Agent d'assurance{at}{since}, je vous aide à choisir la bonne couverture : {services}. Devis gratuit et accompagnement en cas de sinistre.",
    tagline: "Protégez ce qui compte",
  }),

  // ── Conseil & immobilier ────────────────────────────────────
  def({
    id: "consultant", label: "Consultant(e)", title: "Consultant en stratégie", emoji: "💼", family: "business", template: "studio",
    synonyms: ["consulting", "conseil", "stratégie", "business", "management", "entrepreneur"],
    imageSet: "business", portrait: "manShirt",
    blocks: ["services", "projects", "experience", "stats", "testimonials"],
    services: [
      { name: "Stratégie & business plan" },
      { name: "Accompagnement de PME" },
      { name: "Recherche de financement" },
      { name: "Formation des équipes" },
    ],
    bio: "Consultant{at}{since}, j'aide les entreprises à structurer leur croissance : {services}. Des recommandations concrètes, adaptées au marché africain.",
    tagline: "Votre croissance, structurée",
    blockTitles: { projects: "Missions réalisées" },
  }),
  def({
    id: "agent-immobilier", label: "Agent immobilier", title: "Agent immobilier", emoji: "🏠", family: "business", template: "galerie",
    synonyms: ["immobilier", "location", "vente", "maison", "terrain", "démarcheur", "gestion locative"],
    imageSet: "realestate", portrait: "manShirt",
    blocks: ["gallery", "services", "zone", "testimonials", "faq"],
    services: [
      { name: "Location de maisons & appartements" },
      { name: "Vente de terrains & maisons" },
      { name: "Gestion locative" },
      { name: "Accompagnement des acheteurs de la diaspora" },
    ],
    bio: "Agent immobilier{at}{since}, je vous aide à trouver le bien idéal : {services}. Biens vérifiés, visites organisées et documents en règle.",
    tagline: "Trouvez le bien qui vous correspond",
    cta: { label: "Voir les biens disponibles", message: "Bonjour, je recherche un bien : " },
    photosLabel: "Photos de vos biens",
    blockTitles: { gallery: "Biens disponibles" },
  }),
  def({
    id: "architecte", label: "Architecte", title: "Architecte", emoji: "📐", family: "business", template: "studio",
    synonyms: ["architecture", "plans", "dessinateur", "bureau d'études", "permis de construire"],
    imageSet: "building", portrait: "manGlasses",
    blocks: ["projects", "services", "experience", "credentials", "testimonials"],
    services: [
      { name: "Plans de maison", unit: "sur devis" },
      { name: "Permis de construire" },
      { name: "Suivi de chantier" },
      { name: "Rendu 3D" },
    ],
    bio: "Architecte{at}{since}, je conçois des bâtiments beaux, durables et adaptés au climat : {services}.",
    tagline: "Concevoir les lieux de demain",
  }),

  // ── Tech & digital ──────────────────────────────────────────
  def({
    id: "developpeur", label: "Développeur(se) web & mobile", title: "Développeur web & mobile", emoji: "💻", family: "tech", template: "studio",
    synonyms: ["développeur", "programmeur", "dev", "site web", "application", "fullstack", "informaticien", "codeur"],
    imageSet: "tech", portrait: "manGlasses",
    services: [
      { name: "Sites vitrines", price: "150 000", unit: "à partir de" },
      { name: "Applications web sur mesure" },
      { name: "Applications mobiles" },
      { name: "Intégration Mobile Money" },
      { name: "Maintenance & hébergement" },
    ],
    bio: "Développeur{at}{since}, je crée des produits web et mobiles performants : {services}. Code propre, délais tenus et accompagnement après la mise en ligne.",
    tagline: "Je transforme vos idées en produits digitaux",
    photosLabel: "Captures de vos projets",
  }),
  def({
    id: "designer-ux", label: "Designer UI/UX", title: "Designer UI/UX", emoji: "🎯", family: "tech", template: "studio",
    synonyms: ["ux", "ui", "product designer", "figma", "webdesign", "interface"],
    imageSet: "design", portrait: "womanOffice",
    services: [
      { name: "Maquettes d'applications" },
      { name: "Refonte de site web" },
      { name: "Design system" },
      { name: "Tests utilisateurs" },
    ],
    bio: "Designer UI/UX{at}{since}, je conçois des interfaces simples et belles : {services}.",
    tagline: "Des produits simples à utiliser",
    photosLabel: "Captures de vos maquettes",
  }),
  def({
    id: "community-manager", label: "Community manager / Marketing digital", title: "Community manager", emoji: "📣", family: "tech", template: "studio",
    synonyms: ["réseaux sociaux", "marketing", "social media", "facebook", "instagram", "tiktok", "publicité"],
    imageSet: "tech", portrait: "womanOffice",
    blocks: ["services", "projects", "stats", "testimonials", "skills"],
    services: [
      { name: "Gestion de pages", price: "50 000", unit: "par mois" },
      { name: "Création de contenus" },
      { name: "Publicités Facebook & Instagram" },
      { name: "Stratégie digitale" },
    ],
    bio: "Community manager{at}{since}, je fais grandir votre marque en ligne : {services}. Des résultats mesurables, chaque mois.",
    tagline: "Votre marque, visible et aimée",
  }),

  // ── Coaching & formation ────────────────────────────────────
  def({
    id: "coach", label: "Coach de vie / Business", title: "Coach", emoji: "🌱", family: "education", template: "scene",
    synonyms: ["coaching", "développement personnel", "mentor", "leadership", "coach business"],
    imageSet: "coaching", portrait: "womanGlasses",
    serviceBlock: "offers",
    services: [
      { name: "Séance découverte", price: "Gratuit" },
      { name: "Coaching individuel (4 séances)", price: "80 000" },
      { name: "Programme de groupe" },
      { name: "Conférences & ateliers" },
    ],
    bio: "Coach{at}{since}, j'accompagne celles et ceux qui veulent passer un cap : {services}. Clarté, confiance et plan d'action concret.",
    tagline: "Révélez votre potentiel",
    cta: { label: "Réserver un appel découverte", message: "Bonjour, je souhaite réserver un appel découverte." },
    photosLabel: "Photos de vos ateliers",
  }),
  def({
    id: "formateur", label: "Formateur(trice)", title: "Formateur", emoji: "🎓", family: "education", template: "scene",
    synonyms: ["formation", "enseignant", "cours", "atelier", "e-learning"],
    imageSet: "coaching", portrait: "manShirt",
    serviceBlock: "offers",
    services: [
      { name: "Formation en entreprise", unit: "sur devis" },
      { name: "Formation en ligne" },
      { name: "Ateliers pratiques" },
      { name: "Certification" },
    ],
    bio: "Formateur{at}{since}, je transmets des compétences concrètes et utiles : {services}. Pédagogie active et supports fournis.",
    tagline: "Apprendre, pour avancer",
  }),
  def({
    id: "professeur", label: "Professeur particulier / Répétiteur", title: "Professeur particulier", emoji: "📚", family: "education", template: "scene",
    synonyms: ["cours à domicile", "répétiteur", "soutien scolaire", "maths", "anglais", "enseignant"],
    imageSet: "coaching", portrait: "womanSmile",
    serviceBlock: "offers",
    blocks: ["offers", "testimonials", "credentials", "zone", "faq"],
    services: [
      { name: "Cours de mathématiques", price: "20 000", unit: "par mois" },
      { name: "Cours d'anglais", price: "20 000", unit: "par mois" },
      { name: "Préparation aux examens (BEPC, BAC)" },
      { name: "Cours en ligne" },
    ],
    bio: "Professeur{at}{since}, j'aide les élèves à reprendre confiance et à progresser : {services}. Suivi régulier avec les parents.",
    tagline: "La réussite, pas à pas",
  }),

  // ── Événementiel & musique ──────────────────────────────────
  def({
    id: "dj", label: "DJ", title: "DJ", emoji: "🎧", family: "events", template: "scene",
    synonyms: ["dj", "disc jockey", "animation", "sono", "sonorisation", "soirée"],
    imageSet: "music", portrait: "manBeanie",
    blocks: ["video", "offers", "gallery", "testimonials", "stats"],
    serviceBlock: "offers",
    services: [
      { name: "Animation de mariage", price: "100 000", unit: "à partir de" },
      { name: "Soirée privée & anniversaire" },
      { name: "Événement d'entreprise" },
      { name: "Location de sonorisation" },
    ],
    bio: "DJ{at}{since}, je fais danser vos invités jusqu'au bout de la nuit : {services}. Afrobeat, coupé-décalé, zouk et plus encore.",
    tagline: "L'ambiance, c'est moi",
    cta: { label: "Réserver le DJ", message: "Bonjour, je souhaite réserver pour un événement le " },
    photosLabel: "Photos de vos soirées",
  }),
  def({
    id: "musicien", label: "Musicien / Chanteur", title: "Artiste musicien", emoji: "🎤", family: "events", template: "scene",
    synonyms: ["chanteur", "chanteuse", "artiste", "groupe", "orchestre", "rappeur", "chorale"],
    imageSet: "music", portrait: "manBeanie",
    blocks: ["video", "gallery", "offers", "stats", "testimonials"],
    serviceBlock: "offers",
    services: [
      { name: "Concerts & showcases" },
      { name: "Animation de mariage" },
      { name: "Featuring & studio" },
    ],
    bio: "Artiste{at}{since}, je partage ma musique sur scène et en studio. {services} : contactez-moi pour vos événements.",
    tagline: "La musique qui rassemble",
    cta: { label: "Booker l'artiste", message: "Bonjour, je souhaite vous booker pour " },
  }),
  def({
    id: "evenementiel", label: "Organisateur(trice) d'événements", title: "Wedding & event planner", emoji: "🎉", family: "events", template: "galerie",
    synonyms: ["wedding planner", "organisation", "événementiel", "mariage", "location de chaises", "animation"],
    imageSet: "event", portrait: "womanGlasses",
    blocks: ["gallery", "offers", "testimonials", "faq"],
    serviceBlock: "offers",
    services: [
      { name: "Organisation complète de mariage", unit: "sur devis" },
      { name: "Anniversaires & baptêmes" },
      { name: "Événements d'entreprise" },
      { name: "Location de matériel" },
    ],
    bio: "Organisatrice d'événements{at}{since}, je m'occupe de tout pour que vous profitiez : {services}.",
    tagline: "Vos plus beaux jours, sans stress",
    cta: { label: "Parler de mon événement", message: "Bonjour, j'organise un événement le " },
    photosLabel: "Photos de vos événements",
  }),

  // ── Agriculture ─────────────────────────────────────────────
  def({
    id: "agriculteur", label: "Agriculteur / Producteur", title: "Producteur agricole", emoji: "🌾", family: "agriculture", template: "atelier",
    synonyms: ["agriculture", "ferme", "maraîcher", "producteur", "légumes", "fruits", "bio"],
    imageSet: "agri", portrait: "manSmile",
    blocks: ["gallery", "services", "zone", "testimonials", "faq"],
    services: [
      { name: "Légumes frais de saison" },
      { name: "Fruits" },
      { name: "Paniers hebdomadaires", price: "5 000" },
      { name: "Vente en gros aux restaurants" },
      { name: "Livraison" },
    ],
    bio: "Producteur{at}{since}, je cultive des produits frais et de qualité : {services}. Du champ à votre table, sans intermédiaire.",
    tagline: "Du champ à votre table",
    cta: { label: "Commander", message: "Bonjour, je souhaite commander : " },
    photosLabel: "Photos de vos produits et champs",
    blockTitles: { services: "Nos produits", zone: "Zones de livraison" },
  }),
  def({
    id: "eleveur", label: "Éleveur", title: "Éleveur", emoji: "🐓", family: "agriculture", template: "atelier",
    synonyms: ["élevage", "poulets", "volaille", "porcs", "bétail", "pisciculture", "poissons", "œufs"],
    imageSet: "agri", portrait: "manSmile",
    blocks: ["gallery", "services", "zone", "testimonials"],
    services: [
      { name: "Poulets de chair", price: "3 500", unit: "pièce" },
      { name: "Œufs (plateau de 30)", price: "2 500" },
      { name: "Poissons (tilapia, silure)" },
      { name: "Conseil en élevage" },
    ],
    bio: "Éleveur{at}{since}, je propose des produits frais et bien élevés : {services}. Commandes pour particuliers, restaurants et fêtes.",
    tagline: "Frais, local et bien élevé",
    cta: { label: "Commander", message: "Bonjour, je souhaite commander : " },
    blockTitles: { services: "Nos produits" },
  }),
];

/** Métier générique quand rien ne correspond */
export const OTHER_PROFESSION: Profession = def({
  id: "autre", label: "Autre métier", title: "", emoji: "✨", family: "other", template: "atelier",
  synonyms: [], imageSet: "business", portrait: "womanSmile",
  blocks: ["services", "gallery", "testimonials", "faq"],
  services: [],
  bio: "Professionnel{at}{since}, je propose {services}. Contactez-moi sur WhatsApp pour en discuter.",
  tagline: "",
});

export function getProfession(id?: string | null): Profession {
  return PROFESSIONS.find((p) => p.id === id) ?? OTHER_PROFESSION;
}

const normalize = (s: string) =>
  s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().replace(/[^a-z0-9 ]/g, " ").trim();

/** Recherche tolérante : "coutu", "tailleur", "electricite" trouvent le bon métier */
export function searchProfessions(query: string, limit = 8): Profession[] {
  const q = normalize(query);
  if (!q) return [];
  const scored = PROFESSIONS.map((p) => {
    const label = normalize(p.label);
    const title = normalize(p.title);
    const syn = p.synonyms.map(normalize);
    let score = 0;
    if (label.startsWith(q) || title.startsWith(q)) score = 100;
    else if (label.split(/[ /]+/).some((w) => w.startsWith(q))) score = 80;
    else if (syn.some((s) => s.startsWith(q))) score = 70;
    else if (label.includes(q)) score = 60;
    else if (syn.some((s) => s.includes(q) || q.includes(s))) score = 50;
    return { p, score };
  }).filter((x) => x.score > 0);
  return scored.sort((a, b) => b.score - a.score).slice(0, limit).map((x) => x.p);
}

/** Métiers mis en avant sur l'écran de choix */
export const POPULAR_PROFESSIONS = [
  "couturiere", "coiffeuse", "electricien", "restaurant", "photographe", "patissier", "developpeur", "mecanicien", "coach", "avocat",
];

export function formatServicesList(names: string[]): string {
  const n = names.filter(Boolean).map((s) => s.charAt(0).toLowerCase() + s.slice(1)).slice(0, 3);
  if (n.length === 0) return "des prestations de qualité";
  if (n.length === 1) return n[0];
  return `${n.slice(0, -1).join(", ")} et ${n[n.length - 1]}`;
}

/** Rédige la bio à partir des réponses de l'inscription */
export function buildBio(p: Profession, ctx: { city?: string; years?: number | null; services: string[] }) {
  const at = ctx.city ? ` à ${ctx.city}` : "";
  const since = ctx.years ? ` depuis ${ctx.years} an${ctx.years > 1 ? "s" : ""}` : "";
  return p.bio
    .replace("{at}", at)
    .replace("{since}", since)
    .replace("{services}", formatServicesList(ctx.services))
    .replace(/\s+([,.])/g, "$1");
}

/** Libellé lisible d'un métier ("famille:tech" = profils créés avant le catalogue) */
export function professionLabel(profession?: string | null, custom?: string | null) {
  if (profession?.startsWith("famille:")) {
    const f = profession.slice(8) as FamilyId;
    return FAMILIES[f]?.label ?? "Non renseigné";
  }
  if (!profession || profession === "autre") return custom || "Non renseigné";
  return getProfession(profession).label;
}
