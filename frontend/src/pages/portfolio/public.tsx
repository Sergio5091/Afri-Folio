import { useGetPublicPortfolio, useRecordView, getGetPublicPortfolioQueryKey } from "@workspace/api-client-react";
import { useParams } from "wouter";
import { useEffect, useRef, useState } from "react";
import {
  Mail, MapPin, Github, Linkedin, Twitter, Globe, ExternalLink,
  MessageCircle, ChevronDown, Star, Zap, Menu, X, Sun, Moon,
  Code2, Palette, Briefcase, Layers, ArrowRight,
} from "lucide-react";
import { getCategoryById } from "@/lib/profile-types";

/* ─── Mock data ─────────────────────────────────────────────── */
const MOCK_PORTFOLIO = {
  user: { id: 1, email: "jean@exemple.com", username: "jean-dupont", plan: "premium" as const, referralCode: "REF-JEAN42", createdAt: "2025-01-01" },
  profile: {
    id: 1, userId: 1, profileType: "tech",
    fullName: "Jean Dupont", photoUrl: null, logoUrl: null,
    title: "Développeur Web Fullstack", tagline: "Je transforme vos idées en produits digitaux",
    bio: "Passionné par le développement web et les solutions innovantes. Je crée des applications performantes et accessibles pour des clients en Afrique de l'Ouest et partout dans le monde.\n\nAvec 5 ans d'expérience, j'accompagne startups et PME dans leur transformation digitale.",
    skills: ["React", "Node.js", "TypeScript", "PostgreSQL", "Tailwind CSS", "Figma", "Next.js", "GraphQL", "Docker"],
    services: "Développement Web\nCréation de sites vitrines, applications web et APIs RESTful modernes.\n\nConseil & Architecture\nAudit technique, choix de stack, accompagnement de vos équipes.\n\nIntégration Mobile Money\nIntégration de paiements MTN, Moov, Wave dans vos applications.",
    whatsapp: "+229 97 00 00 00", emailContact: "jean@exemple.com",
    linkedin: "https://linkedin.com", twitter: null, github: "https://github.com", website: "https://jeandupont.dev",
    country: "Bénin", city: "Cotonou",
    styleTheme: "modern" as const, primaryColor: "#4f46e5", fontFamily: "Space Grotesk",
    yearsExperience: 5, completedProjects: 24, satisfiedClients: 18, availableForWork: true,
  },
  projects: [
    { id: 1, userId: 1, title: "Plateforme e-commerce locale", description: "Boutique en ligne pour une PME béninoise avec paiement Mobile Money intégré.", imageUrl: "https://images.unsplash.com/photo-1557821552-17105176677c?w=800&q=80", projectUrl: "https://exemple.com", createdAt: "2025-03-01" },
    { id: 2, userId: 1, title: "Application de gestion RH", description: "Système RH pour 50 employés : congés, paie, évaluations.", imageUrl: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&q=80", projectUrl: null, createdAt: "2025-01-15" },
    { id: 3, userId: 1, title: "Dashboard Analytics", description: "Interface de visualisation de données pour une fintech.", imageUrl: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&q=80", projectUrl: "https://exemple.com", createdAt: "2024-11-10" },
  ],
};

const getInitials = (name: string) => name.split(" ").map((n) => n[0]).join("").toUpperCase().substring(0, 2);

/* ─── Scroll reveal ─────────────────────────────────────────── */
function useScrollReveal() {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current; if (!el) return;
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setVisible(true); obs.disconnect(); } }, { threshold: 0.1 });
    obs.observe(el); return () => obs.disconnect();
  }, []);
  return { ref, visible };
}
function Reveal({ children, delay = 0, className = "" }: { children: React.ReactNode; delay?: number; className?: string }) {
  const { ref, visible } = useScrollReveal();
  return (
    <div ref={ref} className={`transition-all duration-700 ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"} ${className}`} style={{ transitionDelay: `${delay}ms` }}>
      {children}
    </div>
  );
}

/* ─── Theme configs ──────────────────────────────────────────── */
type ThemeKey = "minimalist" | "modern" | "classic" | "bold" | "elegant";
interface TC {
  bg: string; bgD: string; text: string; textD: string; muted: string; mutedD: string;
  surface: string; surfaceD: string; border: string; borderD: string;
  navBg: string; navBgD: string; heroBg: string; heroBgD: string;
  sectionAlt: string; sectionAltD: string; titleClass: string;
  btnPrimary: string; btnGhost: string; btnGhostD: string;
  skillBadge: string; skillBadgeD: string; statCard: string; statCardD: string;
  projectCard: string; projectCardD: string; serviceCard: string; serviceCardD: string;
  nativeDark: boolean;
}
const THEMES: Record<ThemeKey, TC> = {
  minimalist: {
    bg:"bg-white", bgD:"bg-gray-950", text:"text-gray-900", textD:"text-gray-50",
    muted:"text-gray-500", mutedD:"text-gray-400", surface:"bg-gray-50", surfaceD:"bg-gray-900",
    border:"border-gray-100", borderD:"border-gray-800",
    navBg:"bg-white/90 backdrop-blur border-b border-gray-100", navBgD:"bg-gray-950/90 backdrop-blur border-b border-gray-800",
    heroBg:"bg-white", heroBgD:"bg-gray-950", sectionAlt:"bg-gray-50", sectionAltD:"bg-gray-900",
    titleClass:"font-light tracking-tight",
    btnPrimary:"bg-gray-900 text-white hover:bg-gray-700 rounded-full px-7 py-3 text-sm font-medium transition-all",
    btnGhost:"border border-gray-200 text-gray-700 hover:bg-gray-50 rounded-full px-7 py-3 text-sm font-medium transition-all",
    btnGhostD:"border border-gray-700 text-gray-200 hover:bg-gray-800 rounded-full px-7 py-3 text-sm font-medium transition-all",
    skillBadge:"border border-gray-200 text-gray-600 px-4 py-1.5 rounded-full text-sm",
    skillBadgeD:"border border-gray-700 text-gray-300 px-4 py-1.5 rounded-full text-sm",
    statCard:"bg-white border border-gray-100 rounded-2xl p-6 shadow-sm",
    statCardD:"bg-gray-900 border border-gray-800 rounded-2xl p-6",
    projectCard:"bg-white border border-gray-100 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow",
    projectCardD:"bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden hover:border-gray-600 transition-all",
    serviceCard:"bg-white border border-gray-100 rounded-2xl p-6 shadow-sm hover:shadow-md transition-all hover:-translate-y-1",
    serviceCardD:"bg-gray-900 border border-gray-800 rounded-2xl p-6 hover:border-gray-600 transition-all hover:-translate-y-1",
    nativeDark:false,
  },
  modern: {
    bg:"bg-[#080B14]", bgD:"bg-[#080B14]", text:"text-white", textD:"text-white",
    muted:"text-white/50", mutedD:"text-white/50", surface:"bg-white/5", surfaceD:"bg-white/5",
    border:"border-white/10", borderD:"border-white/10",
    navBg:"bg-[#080B14]/80 backdrop-blur-xl border-b border-white/10", navBgD:"bg-[#080B14]/80 backdrop-blur-xl border-b border-white/10",
    heroBg:"bg-[#080B14]", heroBgD:"bg-[#080B14]", sectionAlt:"bg-white/[0.03]", sectionAltD:"bg-white/[0.03]",
    titleClass:"font-bold",
    btnPrimary:"bg-[var(--p)] text-white hover:opacity-90 rounded-full px-7 py-3 text-sm font-semibold transition-all shadow-[0_0_20px_var(--p-20)]",
    btnGhost:"border border-white/20 text-white hover:bg-white/10 rounded-full px-7 py-3 text-sm font-medium transition-all",
    btnGhostD:"border border-white/20 text-white hover:bg-white/10 rounded-full px-7 py-3 text-sm font-medium transition-all",
    skillBadge:"bg-[var(--p-10)] text-[var(--p)] border border-[var(--p-20)] px-4 py-1.5 rounded-full text-sm font-medium",
    skillBadgeD:"bg-[var(--p-10)] text-[var(--p)] border border-[var(--p-20)] px-4 py-1.5 rounded-full text-sm font-medium",
    statCard:"bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur",
    statCardD:"bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur",
    projectCard:"bg-white/5 border border-white/10 rounded-2xl overflow-hidden hover:bg-white/10 transition-all",
    projectCardD:"bg-white/5 border border-white/10 rounded-2xl overflow-hidden hover:bg-white/10 transition-all",
    serviceCard:"bg-white/5 border border-white/10 rounded-2xl p-6 hover:bg-white/10 transition-all hover:-translate-y-1",
    serviceCardD:"bg-white/5 border border-white/10 rounded-2xl p-6 hover:bg-white/10 transition-all hover:-translate-y-1",
    nativeDark:true,
  },
  classic: {
    bg:"bg-[#F9F8F5]", bgD:"bg-[#1A1A18]", text:"text-[#1A2229]", textD:"text-[#F0EDE8]",
    muted:"text-[#6B7280]", mutedD:"text-[#9CA3AF]", surface:"bg-white", surfaceD:"bg-[#252520]",
    border:"border-[#E5E2DC]", borderD:"border-[#3A3A35]",
    navBg:"bg-white/95 backdrop-blur border-b border-[#E5E2DC]", navBgD:"bg-[#1A1A18]/95 backdrop-blur border-b border-[#3A3A35]",
    heroBg:"bg-[#F9F8F5]", heroBgD:"bg-[#1A1A18]", sectionAlt:"bg-white", sectionAltD:"bg-[#252520]",
    titleClass:"font-serif",
    btnPrimary:"bg-[#1A2229] text-white hover:bg-[#2C363F] px-7 py-3 text-sm font-medium tracking-wide transition-all",
    btnGhost:"border border-[#1A2229]/20 text-[#1A2229] hover:bg-[#1A2229]/5 px-7 py-3 text-sm font-medium tracking-wide transition-all",
    btnGhostD:"border border-[#F0EDE8]/20 text-[#F0EDE8] hover:bg-[#F0EDE8]/5 px-7 py-3 text-sm font-medium tracking-wide transition-all",
    skillBadge:"bg-[#F0EEEA] text-[#4A5568] px-4 py-1.5 text-xs font-semibold uppercase tracking-wider",
    skillBadgeD:"bg-[#3A3A35] text-[#D1C9BE] px-4 py-1.5 text-xs font-semibold uppercase tracking-wider",
    statCard:"bg-white border border-[#E5E2DC] p-6 shadow-sm",
    statCardD:"bg-[#252520] border border-[#3A3A35] p-6",
    projectCard:"bg-white border border-[#E5E2DC] overflow-hidden hover:shadow-md transition-shadow",
    projectCardD:"bg-[#252520] border border-[#3A3A35] overflow-hidden hover:border-[#5A5A55] transition-all",
    serviceCard:"bg-white border border-[#E5E2DC] p-6 hover:shadow-md transition-all hover:-translate-y-1",
    serviceCardD:"bg-[#252520] border border-[#3A3A35] p-6 hover:border-[#5A5A55] transition-all hover:-translate-y-1",
    nativeDark:false,
  },
  bold: {
    bg:"bg-black", bgD:"bg-black", text:"text-white", textD:"text-white",
    muted:"text-white/50", mutedD:"text-white/50", surface:"bg-zinc-900", surfaceD:"bg-zinc-900",
    border:"border-zinc-800", borderD:"border-zinc-800",
    navBg:"bg-black/90 backdrop-blur border-b border-zinc-800", navBgD:"bg-black/90 backdrop-blur border-b border-zinc-800",
    heroBg:"bg-black", heroBgD:"bg-black", sectionAlt:"bg-zinc-950", sectionAltD:"bg-zinc-950",
    titleClass:"font-black uppercase tracking-tighter",
    btnPrimary:"bg-[var(--p)] text-black hover:bg-white font-black uppercase tracking-wide px-7 py-3 text-sm transition-all",
    btnGhost:"border-2 border-white text-white hover:bg-white hover:text-black font-black uppercase tracking-wide px-7 py-3 text-sm transition-all",
    btnGhostD:"border-2 border-white text-white hover:bg-white hover:text-black font-black uppercase tracking-wide px-7 py-3 text-sm transition-all",
    skillBadge:"bg-white text-black px-4 py-1.5 font-bold uppercase text-xs tracking-wider",
    skillBadgeD:"bg-white text-black px-4 py-1.5 font-bold uppercase text-xs tracking-wider",
    statCard:"bg-zinc-900 border-l-4 border-[var(--p)] p-6",
    statCardD:"bg-zinc-900 border-l-4 border-[var(--p)] p-6",
    projectCard:"bg-zinc-900 border border-zinc-800 overflow-hidden hover:border-[var(--p)] transition-colors",
    projectCardD:"bg-zinc-900 border border-zinc-800 overflow-hidden hover:border-[var(--p)] transition-colors",
    serviceCard:"bg-zinc-900 border border-zinc-800 p-6 hover:border-[var(--p)] transition-all hover:-translate-y-1",
    serviceCardD:"bg-zinc-900 border border-zinc-800 p-6 hover:border-[var(--p)] transition-all hover:-translate-y-1",
    nativeDark:true,
  },
  elegant: {
    bg:"bg-[#FDFBF7]", bgD:"bg-[#1C1814]", text:"text-[#2D241E]", textD:"text-[#F5EDE3]",
    muted:"text-[#8B7355]", mutedD:"text-[#A89070]", surface:"bg-white", surfaceD:"bg-[#261F19]",
    border:"border-[#EBE1D5]", borderD:"border-[#3D3028]",
    navBg:"bg-[#FDFBF7]/95 backdrop-blur shadow-sm", navBgD:"bg-[#1C1814]/95 backdrop-blur shadow-sm border-b border-[#3D3028]",
    heroBg:"bg-gradient-to-br from-[#FDFBF7] via-[#F8F0E8] to-[#F3EBE1]", heroBgD:"bg-gradient-to-br from-[#1C1814] via-[#221A14] to-[#261F19]",
    sectionAlt:"bg-[#F8F4EF]", sectionAltD:"bg-[#221A14]",
    titleClass:"font-medium tracking-tight",
    btnPrimary:"bg-[var(--p)] text-white hover:opacity-90 rounded-2xl px-7 py-3 text-sm font-medium transition-all shadow-lg shadow-[var(--p-20)]",
    btnGhost:"border border-[#EBE1D5] text-[#2D241E] hover:bg-[#F3EBE1] rounded-2xl px-7 py-3 text-sm font-medium transition-all",
    btnGhostD:"border border-[#3D3028] text-[#F5EDE3] hover:bg-[#3D3028] rounded-2xl px-7 py-3 text-sm font-medium transition-all",
    skillBadge:"bg-[#F5EDE3] text-[#6B5A4E] px-4 py-1.5 rounded-xl text-sm font-medium",
    skillBadgeD:"bg-[#3D3028] text-[#C4A882] px-4 py-1.5 rounded-xl text-sm font-medium",
    statCard:"bg-white rounded-2xl p-6 shadow-[0_4px_24px_-8px_rgba(0,0,0,0.08)] border border-[#EBE1D5]",
    statCardD:"bg-[#261F19] rounded-2xl p-6 border border-[#3D3028]",
    projectCard:"bg-white rounded-2xl overflow-hidden shadow-[0_4px_24px_-8px_rgba(0,0,0,0.08)] border border-[#EBE1D5] hover:shadow-[0_8px_32px_-8px_rgba(0,0,0,0.12)] transition-shadow",
    projectCardD:"bg-[#261F19] rounded-2xl overflow-hidden border border-[#3D3028] hover:border-[#5A4535] transition-all",
    serviceCard:"bg-white rounded-2xl p-6 shadow-[0_4px_24px_-8px_rgba(0,0,0,0.08)] border border-[#EBE1D5] hover:shadow-[0_8px_32px_-8px_rgba(0,0,0,0.12)] transition-all hover:-translate-y-1",
    serviceCardD:"bg-[#261F19] rounded-2xl p-6 border border-[#3D3028] hover:border-[#5A4535] transition-all hover:-translate-y-1",
    nativeDark:false,
  },
};

const SERVICE_ICONS = [
  <Code2 className="w-6 h-6" />, <Layers className="w-6 h-6" />, <Palette className="w-6 h-6" />,
  <Briefcase className="w-6 h-6" />, <Zap className="w-6 h-6" />, <Star className="w-6 h-6" />,
];

function SocialBtn({ href, icon, border, muted }: { href: string; icon: React.ReactNode; border: string; muted: string }) {
  return (
    <a href={href} target="_blank" rel="noreferrer"
      className={`w-9 h-9 rounded-full border flex items-center justify-center transition-all hover:text-[var(--p)] hover:border-[var(--p)] ${border} ${muted}`}>
      {icon}
    </a>
  );
}
function SectionLabel({ label, muted }: { label: string; muted: string }) {
  return (
    <div className="flex items-center gap-3 mb-4">
      <div className="w-8 h-0.5 rounded-full" style={{ background: "var(--p)" }} />
      <span className={`text-xs font-bold uppercase tracking-widest ${muted}`}>{label}</span>
    </div>
  );
}

export default function PublicPortfolio() {
  const { username } = useParams<{ username: string }>();
  const { data: fetchedPortfolio, isLoading } = useGetPublicPortfolio(username, {
    query: { queryKey: getGetPublicPortfolioQueryKey(username), retry: false, placeholderData: MOCK_PORTFOLIO },
  });
  const recordViewMutation = useRecordView();
  const [viewRecorded, setViewRecorded] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    if (username && !viewRecorded) { recordViewMutation.mutate({ data: { portfolioUsername: username } }); setViewRecorded(true); }
  }, [username, viewRecorded]);
  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", fn); return () => window.removeEventListener("scroll", fn);
  }, []);

  const portfolio = fetchedPortfolio ?? MOCK_PORTFOLIO;
  if (isLoading) return (
    <div className="min-h-screen flex items-center justify-center bg-[#080B14]">
      <div className="flex flex-col items-center gap-4">
        <div className="w-10 h-10 rounded-full border-2 border-indigo-500 border-t-transparent animate-spin" />
        <p className="text-white/50 text-sm">Chargement...</p>
      </div>
    </div>
  );

  const { profile, projects } = portfolio;
  const themeKey = (profile.styleTheme || "modern") as ThemeKey;
  const t = THEMES[themeKey];
  const primary = profile.primaryColor || "#4f46e5";
  const category = getCategoryById(profile.profileType);
  const dark = t.nativeDark ? true : isDark;

  const bg = dark ? t.bgD : t.bg;
  const text = dark ? t.textD : t.text;
  const muted = dark ? t.mutedD : t.muted;
  const surface = dark ? t.surfaceD : t.surface;
  const border = dark ? t.borderD : t.border;
  const navBg = dark ? t.navBgD : t.navBg;
  const heroBg = dark ? t.heroBgD : t.heroBg;
  const sectionAlt = dark ? t.sectionAltD : t.sectionAlt;
  const btnGhost = dark ? t.btnGhostD : t.btnGhost;
  const skillBadge = dark ? t.skillBadgeD : t.skillBadge;
  const statCard = dark ? t.statCardD : t.statCard;
  const projectCard = dark ? t.projectCardD : t.projectCard;
  const serviceCard = dark ? t.serviceCardD : t.serviceCard;

  const cssVars = { "--p": primary, "--p-10": primary + "1a", "--p-20": primary + "33", fontFamily: profile.fontFamily ? `"${profile.fontFamily}", sans-serif` : undefined } as React.CSSProperties;

  // Parse services into cards
  const serviceBlocks = profile.services
    ? profile.services.split("\n\n").map(s => s.trim()).filter(Boolean)
    : [];

  return (
    <div className={`${bg} ${text} min-h-screen`} style={cssVars}>

      {/* ── NAVBAR ── */}
      <nav className={`fixed top-0 w-full z-50 transition-all duration-300 ${navBg} ${scrolled ? "shadow-lg" : ""}`}>
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="font-bold text-lg tracking-tight">
            {profile.logoUrl ? <img src={profile.logoUrl} alt={profile.fullName ?? ""} className="h-7 w-auto object-contain" /> : <span>{profile.fullName?.split(" ")[0]}</span>}
          </div>
          <div className="hidden md:flex items-center gap-6 text-sm font-medium">
            {profile.bio && <a href="#about" className={`${muted} hover:opacity-100 transition-opacity`}>À propos</a>}
            {profile.skills?.length > 0 && <a href="#skills" className={`${muted} hover:opacity-100 transition-opacity`}>Compétences</a>}
            {serviceBlocks.length > 0 && <a href="#services" className={`${muted} hover:opacity-100 transition-opacity`}>Services</a>}
            {projects.length > 0 && <a href="#projects" className={`${muted} hover:opacity-100 transition-opacity`}>Projets</a>}
            {(profile.whatsapp || profile.emailContact) && <a href="#contact" className={`${muted} hover:opacity-100 transition-opacity`}>Contact</a>}
          </div>
          <div className="flex items-center gap-2">
            {!t.nativeDark && (
              <button onClick={() => setIsDark(!isDark)} aria-label="Toggle dark mode"
                className={`w-9 h-9 rounded-full border flex items-center justify-center transition-all ${border} ${muted} hover:text-[var(--p)] hover:border-[var(--p)]`}>
                {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
              </button>
            )}
            {(profile.whatsapp || profile.emailContact) && (
              <a href="#contact" className={`hidden md:inline-flex items-center gap-2 ${t.btnPrimary}`}>Contact</a>
            )}
            <button className={`md:hidden flex items-center justify-center w-9 h-9 rounded-lg ${muted}`} onClick={() => setMenuOpen(!menuOpen)}>
              {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
        {/* Mobile menu */}
        <div className={`md:hidden overflow-hidden transition-all duration-300 ${menuOpen ? "max-h-96 opacity-100" : "max-h-0 opacity-0"}`}>
          <div className={`px-5 pb-5 pt-3 flex flex-col gap-2 border-t ${border}`}>
            {[
              profile.bio && { href: "#about", label: "À propos" },
              profile.skills?.length > 0 && { href: "#skills", label: "Compétences" },
              serviceBlocks.length > 0 && { href: "#services", label: "Services" },
              projects.length > 0 && { href: "#projects", label: "Projets" },
              (profile.whatsapp || profile.emailContact) && { href: "#contact", label: "Contact" },
            ].filter(Boolean).map((item: any) => (
              <a key={item.href} href={item.href} onClick={() => setMenuOpen(false)}
                className={`flex items-center gap-3 py-3 text-sm font-medium ${muted} border-b ${border}`}>
                <span className="w-1.5 h-1.5 rounded-full" style={{ background: primary }} />{item.label}
              </a>
            ))}
            <div className="flex gap-3 pt-3">
              {profile.whatsapp && (
                <a href={`https://wa.me/${profile.whatsapp.replace(/\D/g, "")}`} target="_blank" rel="noreferrer" onClick={() => setMenuOpen(false)}
                  className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl border border-[#25D366]/40 text-[#25D366] text-sm font-medium">
                  <MessageCircle className="w-4 h-4" /> WhatsApp
                </a>
              )}
              {profile.emailContact && (
                <a href={`mailto:${profile.emailContact}`} onClick={() => setMenuOpen(false)}
                  className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl border text-sm font-medium"
                  style={{ borderColor: primary + "40", color: primary }}>
                  <Mail className="w-4 h-4" /> Email
                </a>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* ── HERO — Split layout ── */}
      <section className={`${heroBg} relative min-h-screen flex items-center pt-16 overflow-hidden`}>
        {themeKey === "modern" && (
          <>
            <div className="absolute top-1/3 left-1/4 w-[600px] h-[600px] rounded-full blur-[140px] pointer-events-none" style={{ background: primary + "22" }} />
            <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] rounded-full blur-[100px] pointer-events-none" style={{ background: primary + "11" }} />
          </>
        )}
        {themeKey === "bold" && <div className="absolute top-0 left-0 w-full h-2" style={{ background: primary }} />}

        <div className="max-w-6xl mx-auto px-6 py-24 w-full">
          <div className="flex flex-col-reverse md:flex-row items-center gap-12 md:gap-16">

            {/* Left: text */}
            <div className="flex-1 flex flex-col gap-5 text-center md:text-left items-center md:items-start">
              <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
                <span className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest px-4 py-2 rounded-full"
                  style={{ background: primary + "1a", color: primary }}>
                  {category.emoji} {category.label}
                </span>
              </div>
              <div className="animate-in fade-in slide-in-from-bottom-6 duration-700 delay-100">
                <p className={`text-sm font-medium mb-2 ${muted}`}>Bonjour, je suis</p>
                <h1 className={`text-[clamp(2.5rem,6vw,4.5rem)] leading-tight ${t.titleClass}`}>
                  {profile.fullName?.split(" ")[0]}{" "}
                  <span style={{ color: primary }}>{profile.fullName?.split(" ").slice(1).join(" ")}</span>
                </h1>
              </div>
              <p className="text-lg md:text-xl font-semibold animate-in fade-in duration-700 delay-150" style={{ color: primary }}>
                {profile.title}
              </p>
              {profile.tagline && (
                <p className={`text-base md:text-lg max-w-lg leading-relaxed ${muted} animate-in fade-in duration-700 delay-200`}>{profile.tagline}</p>
              )}
              {(profile.city || profile.country) && (
                <div className={`flex items-center gap-2 text-sm ${muted} animate-in fade-in duration-700 delay-250`}>
                  <MapPin className="w-4 h-4" style={{ color: primary }} />
                  <span>{[profile.city, profile.country].filter(Boolean).join(", ")}</span>
                </div>
              )}
              <div className="flex flex-wrap gap-3 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-300">
                {profile.whatsapp && (
                  <a href={`https://wa.me/${profile.whatsapp.replace(/\D/g, "")}`} target="_blank" rel="noreferrer"
                    className="flex items-center gap-2 bg-[#25D366] text-white hover:bg-[#20b858] px-7 py-3 rounded-full text-sm font-semibold transition-all shadow-lg shadow-[#25D366]/30">
                    <MessageCircle className="w-4 h-4" /> Contact
                  </a>
                )}
                {projects.length > 0 && (
                  <a href="#projects" className={`${btnGhost} flex items-center gap-2`}>
                    Voir projets <ArrowRight className="w-4 h-4" />
                  </a>
                )}
              </div>
              <div className="flex gap-3 animate-in fade-in duration-700 delay-500">
                {profile.linkedin && <SocialBtn href={profile.linkedin} icon={<Linkedin className="w-4 h-4" />} border={border} muted={muted} />}
                {profile.github && <SocialBtn href={profile.github} icon={<Github className="w-4 h-4" />} border={border} muted={muted} />}
                {profile.twitter && <SocialBtn href={profile.twitter} icon={<Twitter className="w-4 h-4" />} border={border} muted={muted} />}
                {profile.website && <SocialBtn href={profile.website} icon={<Globe className="w-4 h-4" />} border={border} muted={muted} />}
              </div>
            </div>

            {/* Right: photo */}
            <div className="flex-shrink-0 flex items-center justify-center animate-in fade-in zoom-in duration-700">
              <div className="relative">
                <div className="absolute -inset-4 rounded-full opacity-15 blur-xl" style={{ background: primary }} />
                <div className="absolute -inset-1 rounded-full opacity-20" style={{ background: `conic-gradient(from 0deg, ${primary}, transparent 60%, ${primary})` }} />
                {profile.photoUrl ? (
                  <img src={profile.photoUrl} alt={profile.fullName ?? ""} className={`relative z-10 object-cover shadow-2xl ${
                    themeKey === "minimalist" ? "w-56 h-56 md:w-72 md:h-72 rounded-full" :
                    themeKey === "modern" ? "w-56 h-56 md:w-72 md:h-72 rounded-3xl" :
                    themeKey === "classic" ? "w-56 h-56 md:w-72 md:h-72 rounded-full border-4 border-white shadow-xl" :
                    themeKey === "bold" ? "w-56 h-56 md:w-72 md:h-72 rounded-none" :
                    "w-56 h-56 md:w-72 md:h-72 rounded-[2.5rem]"
                  }`} />
                ) : (
                  <div className={`relative z-10 flex items-center justify-center text-white text-5xl font-bold shadow-2xl ${
                    themeKey === "minimalist" ? "w-56 h-56 md:w-72 md:h-72 rounded-full" :
                    themeKey === "modern" ? "w-56 h-56 md:w-72 md:h-72 rounded-3xl" :
                    themeKey === "classic" ? "w-56 h-56 md:w-72 md:h-72 rounded-full border-4 border-white shadow-xl" :
                    themeKey === "bold" ? "w-56 h-56 md:w-72 md:h-72 rounded-none" :
                    "w-56 h-56 md:w-72 md:h-72 rounded-[2.5rem]"
                  }`} style={{ background: `linear-gradient(135deg, ${primary}, ${primary}99)` }}>
                    {getInitials(profile.fullName || "?")}
                  </div>
                )}
                {profile.availableForWork && (
                  <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 z-20 bg-emerald-500 text-white text-xs font-bold px-4 py-1.5 rounded-full flex items-center gap-1.5 shadow-lg whitespace-nowrap">
                    <span className="w-2 h-2 bg-white rounded-full animate-pulse" /> Disponible
                  </div>
                )}
              </div>
            </div>
          </div>
          <div className={`absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1 ${muted} animate-bounce`}>
            <ChevronDown className="w-5 h-5" />
          </div>
        </div>
      </section>

      {/* ── STATS ── */}
      {(profile.yearsExperience != null || profile.completedProjects != null || profile.satisfiedClients != null) && (
        <section className={`py-12 px-6 ${sectionAlt} border-y ${border}`}>
          <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-center justify-center gap-8 sm:gap-0 divide-y sm:divide-y-0 sm:divide-x divide-current opacity-100">
            {profile.yearsExperience != null && (
              <Reveal delay={0} className="flex-1 flex flex-col items-center text-center px-8">
                <span className="text-4xl md:text-5xl font-bold" style={{ color: primary }}>{profile.yearsExperience}<span className="text-2xl">+</span></span>
                <span className={`text-xs uppercase tracking-widest font-semibold mt-1 ${muted}`}>Années d'expérience</span>
              </Reveal>
            )}
            {profile.completedProjects != null && (
              <Reveal delay={100} className="flex-1 flex flex-col items-center text-center px-8">
                <span className="text-4xl md:text-5xl font-bold" style={{ color: primary }}>{profile.completedProjects}</span>
                <span className={`text-xs uppercase tracking-widest font-semibold mt-1 ${muted}`}>Projets réalisés</span>
              </Reveal>
            )}
            {profile.satisfiedClients != null && (
              <Reveal delay={200} className="flex-1 flex flex-col items-center text-center px-8">
                <span className="text-4xl md:text-5xl font-bold" style={{ color: primary }}>{profile.satisfiedClients}</span>
                <span className={`text-xs uppercase tracking-widest font-semibold mt-1 ${muted}`}>Clients satisfaits</span>
              </Reveal>
            )}
          </div>
        </section>
      )}

      {/* ── SERVICES — cards grid ── */}
      {serviceBlocks.length > 0 && (
        <section id="services" className={`py-20 px-6 ${sectionAlt}`}>
          <div className="max-w-6xl mx-auto">
            <Reveal>
              <SectionLabel label={category.servicesLabel} muted={muted} />
              <h2 className={`text-3xl md:text-4xl font-bold mb-12 ${t.titleClass}`}>Ce que je fais</h2>
            </Reveal>
            <div className={`grid gap-6 ${serviceBlocks.length === 1 ? "md:grid-cols-1 max-w-2xl" : serviceBlocks.length === 2 ? "md:grid-cols-2" : "sm:grid-cols-2 lg:grid-cols-3"}`}>
              {serviceBlocks.map((block, i) => {
                const lines = block.split("\n").map(l => l.trim()).filter(Boolean);
                const title = lines.length > 1 ? lines[0] : `Service ${i + 1}`;
                const desc = lines.length > 1 ? lines.slice(1).join(" ") : block;
                return (
                  <Reveal key={i} delay={i * 80}>
                    <div className={`${serviceCard} group h-full`}>
                      <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-5 transition-all group-hover:scale-110" style={{ background: primary + "1a", color: primary }}>
                        {SERVICE_ICONS[i % SERVICE_ICONS.length]}
                      </div>
                      <h3 className={`font-bold text-base mb-3 ${t.titleClass}`}>{title}</h3>
                      <p className={`text-sm leading-relaxed ${muted}`}>{desc}</p>
                    </div>
                  </Reveal>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* ── ABOUT + SKILLS — 2 columns ── */}
      {(profile.bio || (profile.skills && profile.skills.length > 0)) && (
        <section id="about" className="py-20 px-6">
          <div className="max-w-6xl mx-auto">
            <Reveal>
              <SectionLabel label="À propos" muted={muted} />
              <h2 className={`text-3xl md:text-4xl font-bold mb-12 ${t.titleClass}`}>Qui suis-je ?</h2>
            </Reveal>
            <div className="grid md:grid-cols-2 gap-12 md:gap-16 items-start">
              {profile.bio && (
                <Reveal delay={100}>
                  <div className="space-y-4">
                    {profile.bio.split("\n\n").map((para, i) => (
                      <p key={i} className={`text-base md:text-lg leading-relaxed ${muted}`}>{para}</p>
                    ))}
                  </div>
                </Reveal>
              )}
              {profile.skills && profile.skills.length > 0 && (
                <div id="skills">
                  <Reveal delay={150}>
                    <p className={`text-xs font-bold uppercase tracking-widest mb-6 ${muted}`}>{category.skillsSectionLabel}</p>
                    <div className="flex flex-wrap gap-3">
                      {profile.skills.map((skill, i) => (
                        <Reveal key={i} delay={i * 40}>
                          <span className={`${skillBadge} cursor-default hover:scale-105 transition-transform inline-block`}>{skill}</span>
                        </Reveal>
                      ))}
                    </div>
                  </Reveal>
                </div>
              )}
            </div>
          </div>
        </section>
      )}

      {/* ── PROJECTS ── */}
      {projects.length > 0 && (
        <section id="projects" className={`py-20 px-6 ${sectionAlt}`}>
          <div className="max-w-6xl mx-auto">
            <Reveal>
              <SectionLabel label={category.projectsSectionLabel} muted={muted} />
              <h2 className={`text-3xl md:text-4xl font-bold mb-12 ${t.titleClass}`}>Mes Projets</h2>
            </Reveal>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {projects.map((project, i) => (
                <Reveal key={project.id} delay={i * 80}>
                  <div className={`${projectCard} group h-full flex flex-col`}>
                    <div className="aspect-video overflow-hidden relative">
                      {project.imageUrl ? (
                        <img src={project.imageUrl} alt={project.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                      ) : (
                        <div className={`w-full h-full flex items-center justify-center ${surface}`}>
                          <Star className={`w-10 h-10 ${muted} opacity-30`} />
                        </div>
                      )}
                      {project.projectUrl && (
                        <a href={project.projectUrl} target="_blank" rel="noreferrer"
                          className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                          <span className="flex items-center gap-2 text-white font-semibold text-sm bg-white/20 backdrop-blur px-4 py-2 rounded-full border border-white/30">
                            <ExternalLink className="w-4 h-4" /> Voir le projet
                          </span>
                        </a>
                      )}
                    </div>
                    <div className="p-5 flex flex-col flex-1">
                      <h3 className="font-bold text-base mb-2 line-clamp-1">{project.title}</h3>
                      {project.description && <p className={`text-sm leading-relaxed line-clamp-3 flex-1 ${muted}`}>{project.description}</p>}
                      {project.projectUrl && (
                        <a href={project.projectUrl} target="_blank" rel="noreferrer"
                          className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold hover:opacity-70 transition-opacity" style={{ color: primary }}>
                          Voir le projet <ExternalLink className="w-3.5 h-3.5" />
                        </a>
                      )}
                    </div>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── CONTACT ── */}
      <section id="contact" className="py-28 px-6">
        <div className="max-w-4xl mx-auto">
          <Reveal>
            <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest mb-6 px-4 py-2 rounded-full" style={{ background: primary + "1a", color: primary }}>
              <Star className="w-3.5 h-3.5" /> Travaillons ensemble
            </div>
            <h2 className={`text-4xl md:text-5xl font-bold mb-4 ${t.titleClass}`}>Discutons de<br />votre projet</h2>
            <p className={`text-lg mb-12 max-w-xl ${muted}`}>Parlez-moi de votre idée. Je suis disponible pour de nouvelles collaborations.</p>
          </Reveal>
          <div className="grid sm:grid-cols-2 gap-4 max-w-xl">
            {profile.whatsapp && (
              <Reveal delay={100}>
                <a href={`https://wa.me/${profile.whatsapp.replace(/\D/g, "")}`} target="_blank" rel="noreferrer"
                  className={`group flex items-center gap-4 p-5 rounded-2xl border transition-all duration-300 hover:-translate-y-1 hover:shadow-xl ${statCard}`}>
                  <div className="w-12 h-12 rounded-xl bg-[#25D366]/15 flex items-center justify-center shrink-0 group-hover:bg-[#25D366]/25 transition-colors">
                    <MessageCircle className="w-6 h-6 text-[#25D366]" />
                  </div>
                  <div className="min-w-0">
                    <p className="font-semibold text-sm">WhatsApp</p>
                    <p className={`text-xs mt-0.5 truncate ${muted}`}>{profile.whatsapp}</p>
                  </div>
                  <ExternalLink className={`w-4 h-4 ml-auto shrink-0 ${muted} group-hover:opacity-100 opacity-0 transition-opacity`} />
                </a>
              </Reveal>
            )}
            {profile.emailContact && (
              <Reveal delay={200}>
                <a href={`mailto:${profile.emailContact}`}
                  className={`group flex items-center gap-4 p-5 rounded-2xl border transition-all duration-300 hover:-translate-y-1 hover:shadow-xl ${statCard}`}>
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0" style={{ background: primary + "20" }}>
                    <Mail className="w-6 h-6" style={{ color: primary }} />
                  </div>
                  <div className="min-w-0">
                    <p className="font-semibold text-sm">Email</p>
                    <p className={`text-xs mt-0.5 truncate max-w-[140px] ${muted}`}>{profile.emailContact}</p>
                  </div>
                  <ExternalLink className={`w-4 h-4 ml-auto shrink-0 ${muted} group-hover:opacity-100 opacity-0 transition-opacity`} />
                </a>
              </Reveal>
            )}
          </div>
          <Reveal delay={300}>
            <div className="flex gap-3 mt-10">
              {profile.linkedin && <SocialBtn href={profile.linkedin} icon={<Linkedin className="w-4 h-4" />} border={border} muted={muted} />}
              {profile.github && <SocialBtn href={profile.github} icon={<Github className="w-4 h-4" />} border={border} muted={muted} />}
              {profile.twitter && <SocialBtn href={profile.twitter} icon={<Twitter className="w-4 h-4" />} border={border} muted={muted} />}
              {profile.website && <SocialBtn href={profile.website} icon={<Globe className="w-4 h-4" />} border={border} muted={muted} />}
            </div>
          </Reveal>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className={`py-8 px-6 border-t ${border}`}>
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <p className={`text-sm ${muted}`}>© {new Date().getFullYear()} {profile.fullName}</p>
          <div className="flex gap-3">
            {profile.linkedin && <SocialBtn href={profile.linkedin} icon={<Linkedin className="w-4 h-4" />} border={border} muted={muted} />}
            {profile.github && <SocialBtn href={profile.github} icon={<Github className="w-4 h-4" />} border={border} muted={muted} />}
            {profile.twitter && <SocialBtn href={profile.twitter} icon={<Twitter className="w-4 h-4" />} border={border} muted={muted} />}
            {profile.website && <SocialBtn href={profile.website} icon={<Globe className="w-4 h-4" />} border={border} muted={muted} />}
          </div>
          <a href="/inscription" className={`text-xs font-medium hover:opacity-100 transition-opacity`} style={{ color: primary }}>
            Créer mon portfolio gratuit avec AfriFolio →
          </a>
        </div>
      </footer>

    </div>
  );
}
