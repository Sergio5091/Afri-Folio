// Pays proposés à l'inscription : indicatif WhatsApp + grandes villes
export interface Country {
  code: string;
  name: string;
  dial: string;
  flag: string;
  cities: string[];
}

export const COUNTRIES: Country[] = [
  { code: "BJ", name: "Bénin", dial: "229", flag: "🇧🇯", cities: ["Cotonou", "Abomey-Calavi", "Porto-Novo", "Parakou", "Bohicon", "Ouidah", "Natitingou"] },
  { code: "CI", name: "Côte d'Ivoire", dial: "225", flag: "🇨🇮", cities: ["Abidjan", "Bouaké", "Yamoussoukro", "San-Pédro", "Daloa", "Korhogo"] },
  { code: "SN", name: "Sénégal", dial: "221", flag: "🇸🇳", cities: ["Dakar", "Thiès", "Saint-Louis", "Touba", "Mbour", "Ziguinchor"] },
  { code: "TG", name: "Togo", dial: "228", flag: "🇹🇬", cities: ["Lomé", "Kara", "Sokodé", "Kpalimé", "Atakpamé"] },
  { code: "CM", name: "Cameroun", dial: "237", flag: "🇨🇲", cities: ["Douala", "Yaoundé", "Bafoussam", "Garoua", "Bamenda", "Kribi"] },
  { code: "BF", name: "Burkina Faso", dial: "226", flag: "🇧🇫", cities: ["Ouagadougou", "Bobo-Dioulasso", "Koudougou"] },
  { code: "ML", name: "Mali", dial: "223", flag: "🇲🇱", cities: ["Bamako", "Sikasso", "Ségou", "Kayes"] },
  { code: "NE", name: "Niger", dial: "227", flag: "🇳🇪", cities: ["Niamey", "Zinder", "Maradi"] },
  { code: "GN", name: "Guinée", dial: "224", flag: "🇬🇳", cities: ["Conakry", "Kankan", "Labé"] },
  { code: "GA", name: "Gabon", dial: "241", flag: "🇬🇦", cities: ["Libreville", "Port-Gentil", "Franceville"] },
  { code: "CG", name: "Congo", dial: "242", flag: "🇨🇬", cities: ["Brazzaville", "Pointe-Noire"] },
  { code: "CD", name: "RD Congo", dial: "243", flag: "🇨🇩", cities: ["Kinshasa", "Lubumbashi", "Goma"] },
  { code: "MA", name: "Maroc", dial: "212", flag: "🇲🇦", cities: ["Casablanca", "Rabat", "Marrakech", "Tanger"] },
  { code: "TN", name: "Tunisie", dial: "216", flag: "🇹🇳", cities: ["Tunis", "Sfax", "Sousse"] },
  { code: "RW", name: "Rwanda", dial: "250", flag: "🇷🇼", cities: ["Kigali"] },
  { code: "MG", name: "Madagascar", dial: "261", flag: "🇲🇬", cities: ["Antananarivo", "Toamasina"] },
  { code: "FR", name: "France", dial: "33", flag: "🇫🇷", cities: ["Paris", "Lyon", "Marseille"] },
  { code: "BE", name: "Belgique", dial: "32", flag: "🇧🇪", cities: ["Bruxelles", "Liège"] },
  { code: "CA", name: "Canada", dial: "1", flag: "🇨🇦", cities: ["Montréal", "Québec", "Ottawa"] },
];

export function getCountry(code?: string | null) {
  return COUNTRIES.find((c) => c.code === code) ?? COUNTRIES[0];
}

export function findCountryByName(name?: string | null) {
  return COUNTRIES.find((c) => c.name === name);
}

/** "97 00 00 00" + Bénin → "+229 97 00 00 00" (sauf si l'indicatif est déjà saisi) */
export function formatWhatsapp(local: string, country: Country) {
  const trimmed = local.trim();
  if (!trimmed) return "";
  if (trimmed.startsWith("+")) return trimmed;
  if (trimmed.startsWith("00")) return `+${trimmed.slice(2)}`;
  return `+${country.dial} ${trimmed}`;
}
