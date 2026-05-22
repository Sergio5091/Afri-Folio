import { Link } from "wouter";
import { useEffect, useRef, useState } from "react";
import {
  ArrowRight, Check, Star, Zap, Globe, BarChart3, Users,
  Palette, Shield, Smartphone, ChevronDown, Sparkles, Play,
} from "lucide-react";

/* ── Scroll reveal ── */
function useReveal() {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current; if (!el) return;
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setVisible(true); obs.disconnect(); } }, { threshold: 0.12 });
    obs.observe(el); return () => obs.disconnect();
  }, []);
  return { ref, visible };
}
function Reveal({ children, delay = 0, className = "" }: { children: React.ReactNode; delay?: number; className?: string }) {
  const { ref, visible } = useReveal();
  return (
    <div ref={ref} className={`transition-all duration-700 ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"} ${className}`} style={{ transitionDelay: `${delay}ms` }}>
      {children}
    </div>
  );
}

/* ── Counter animation ── */
function Counter({ target, suffix = "" }: { target: number; suffix?: string }) {
  const [count, setCount] = useState(0);
  const { ref, visible } = useReveal();
  useEffect(() => {
    if (!visible) return;
    let start = 0; const step = target / (1500 / 16);
    const timer = setInterval(() => { start += step; if (start >= target) { setCount(target); clearInterval(timer); } else setCount(Math.floor(start)); }, 16);
    return () => clearInterval(timer);
  }, [visible, target]);
  return <span ref={ref}>{count.toLocaleString("fr-FR")}{suffix}</span>;
}

const FEATURES = [
  { icon: Zap,        title: "Créé en 5 minutes",        desc: "Remplissez votre profil, choisissez un thème et votre portfolio est en ligne. Aucune compétence technique requise." },
  { icon: Palette,    title: "5 thèmes premium",          desc: "Minimaliste, Moderne, Classique, Audacieux ou Élégant. Chaque thème est personnalisable avec votre couleur." },
  { icon: Globe,      title: "Lien personnalisé",         desc: "Votre portfolio sur afrifolio.com/votre-nom. Partagez-le sur WhatsApp, Instagram ou LinkedIn en un clic." },
  { icon: Smartphone, title: "100% mobile",               desc: "Vos clients vous trouvent depuis leur téléphone. Votre portfolio est optimisé pour tous les écrans." },
  { icon: BarChart3,  title: "Statistiques de visites",   desc: "Suivez combien de personnes visitent votre portfolio, depuis quel pays et à quelle heure." },
  { icon: Users,      title: "Programme de parrainage",   desc: "Invitez d'autres freelances et gagnez des commissions sur chaque abonnement." },
  { icon: Shield,     title: "Sécurisé & fiable",         desc: "Vos données sont protégées. Votre portfolio reste en ligne 24h/24, 7j/7." },
  { icon: Sparkles,   title: "Pour tous les métiers",     desc: "Dev, designer, coach, artisan, avocat, chef... Le formulaire s'adapte à votre domaine." },
];

const STEPS = [
  { num: "01", title: "Créez votre compte",       desc: "Inscription gratuite en 30 secondes. Aucune carte bancaire requise." },
  { num: "02", title: "Remplissez votre profil",  desc: "Ajoutez votre photo, bio, compétences et projets. Le formulaire guide chaque étape." },
  { num: "03", title: "Choisissez votre thème",   desc: "Sélectionnez le design qui correspond à votre personnalité et votre secteur." },
  { num: "04", title: "Partagez votre lien",       desc: "Votre portfolio est en ligne. Envoyez le lien à vos clients et sur vos réseaux." },
];

const TESTIMONIALS = [
  { name: "Kofi Mensah",    role: "Développeur Web · Ghana",             avatar: "KM", text: "En 10 minutes j'avais un portfolio professionnel. J'ai décroché 3 nouveaux clients en une semaine grâce à mon lien AfriFolio." },
  { name: "Aminata Diallo", role: "Graphiste & Illustratrice · Sénégal", avatar: "AD", text: "Enfin un outil fait pour nous ! Le thème Élégant correspond parfaitement à mon univers créatif. Mes clients sont impressionnés." },
  { name: "Chidi Okafor",   role: "Coach Business · Nigeria",            avatar: "CO", text: "Le programme de parrainage est incroyable. J'ai invité 8 collègues et je gagne maintenant des commissions chaque mois." },
  { name: "Fatou Ndiaye",   role: "Couturière & Styliste · Bénin",       avatar: "FN", text: "Je ne savais pas coder mais mon portfolio est magnifique. Mes créations sont enfin visibles sur internet !" },
];

const FAQS = [
  { q: "Est-ce vraiment gratuit ?",                    a: "Oui, le plan Découverte est 100% gratuit et sans limite de durée. Vous pouvez créer votre portfolio et le partager sans payer." },
  { q: "Comment fonctionne le paiement Pro ?",         a: "Le plan Pro coûte 360 FCFA/mois, payable via Mobile Money (MTN, Moov, Wave). Aucune carte bancaire internationale requise." },
  { q: "Puis-je changer de thème après la création ?", a: "Oui, vous pouvez changer de thème et de couleur à tout moment depuis votre tableau de bord, sans perdre vos données." },
  { q: "Mon portfolio sera-t-il visible sur Google ?", a: "Oui, chaque portfolio est optimisé pour le référencement (SEO) avec les bonnes métadonnées pour être indexé par Google." },
  { q: "Comment fonctionne le parrainage ?",           a: "Partagez votre code de parrainage. Pour chaque ami qui s'abonne au plan Pro, vous recevez une commission sur votre portefeuille AfriFolio." },
];

export default function Home() {
  const [faqOpen, setFaqOpen] = useState<number | null>(null);
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", fn); return () => window.removeEventListener("scroll", fn);
  }, []);

  return (
    <div className="min-h-screen bg-background text-foreground font-sans overflow-x-hidden">

      {/* ── Navbar ── */}
      <header className={`fixed top-0 w-full z-50 transition-all duration-300 ${scrolled ? "bg-background/95 backdrop-blur-xl border-b shadow-sm" : "bg-transparent"}`}>
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="font-display font-bold text-2xl text-primary tracking-tight">AfriFolio</div>
          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-muted-foreground">
            <a href="#features" className="hover:text-foreground transition-colors">Fonctionnalités</a>
            <a href="#how" className="hover:text-foreground transition-colors">Comment ça marche</a>
            <a href="#pricing" className="hover:text-foreground transition-colors">Tarifs</a>
          </nav>
          <div className="flex items-center gap-3">
            <Link href="/connexion" className="hidden md:block text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">Connexion</Link>
            <Link href="/inscription" className="text-sm font-semibold bg-primary text-primary-foreground px-5 py-2.5 rounded-full hover:bg-primary/90 transition-all shadow-lg shadow-primary/20">
              Commencer gratuitement
            </Link>
          </div>
        </div>
      </header>

      {/* ── Hero ── */}
      <section className="relative min-h-screen flex items-center justify-center pt-16 overflow-hidden">
        {/* Décorations de fond */}
        <div className="absolute top-1/4 right-1/4 w-[500px] h-[500px] bg-primary/8 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute bottom-1/3 left-1/4 w-[350px] h-[350px] bg-accent/10 rounded-full blur-[100px] pointer-events-none" />

        <div className="relative max-w-5xl mx-auto px-6 text-center">
          {/* Badge */}
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-700 inline-flex items-center gap-2 bg-primary/10 border border-primary/20 text-primary text-xs font-semibold px-4 py-2 rounded-full mb-8">
            <Sparkles className="w-3.5 h-3.5" /> Pour tous les professionnels d'Afrique
          </div>

          {/* Titre */}
          <h1 className="animate-in fade-in slide-in-from-bottom-6 duration-700 delay-100 text-5xl md:text-7xl font-display font-black leading-[1.05] tracking-tight mb-6">
            Votre portfolio<br />
            <span className="text-primary">professionnel en ligne</span>
          </h1>

          {/* Sous-titre */}
          <p className="animate-in fade-in slide-in-from-bottom-6 duration-700 delay-200 text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-10 leading-relaxed">
            Créez votre vitrine digitale en 5 minutes. Sans coder. Partagez votre lien, attirez des clients et développez votre activité — que vous soyez développeur, artisan, coach ou designer.
          </p>

          {/* CTAs */}
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-700 delay-300 flex flex-col sm:flex-row gap-4 justify-center mb-16">
            <Link href="/inscription" className="flex items-center justify-center gap-2 bg-primary text-primary-foreground font-bold px-8 py-4 rounded-full text-base hover:bg-primary/90 transition-all shadow-xl shadow-primary/25 hover:-translate-y-0.5">
              Créer mon portfolio gratuit <ArrowRight className="w-5 h-5" />
            </Link>
            <a href="#how" className="flex items-center justify-center gap-2 border border-border text-foreground/70 hover:bg-muted font-medium px-8 py-4 rounded-full text-base transition-all">
              <Play className="w-4 h-4 text-primary" /> Voir comment ça marche
            </a>
          </div>

          {/* Réassurance */}
          <div className="animate-in fade-in duration-700 delay-500 flex flex-wrap items-center justify-center gap-6 text-sm text-muted-foreground mb-16">
            <span className="flex items-center gap-1.5"><Check className="w-4 h-4 text-primary" /> Gratuit pour toujours</span>
            <span className="flex items-center gap-1.5"><Check className="w-4 h-4 text-primary" /> Aucune carte bancaire</span>
            <span className="flex items-center gap-1.5"><Check className="w-4 h-4 text-primary" /> En ligne en 5 minutes</span>
          </div>

          {/* Image hero — aperçu du portfolio */}
          <div className="animate-in fade-in zoom-in-95 duration-1000 delay-700 relative max-w-4xl mx-auto">
            {/* Cadre navigateur */}
            <div className="bg-card border rounded-2xl shadow-2xl shadow-primary/10 overflow-hidden">
              {/* Barre navigateur */}
              <div className="flex items-center gap-2 px-4 py-3 border-b bg-muted/50">
                <div className="flex gap-1.5">
                  <span className="w-3 h-3 rounded-full bg-red-400" />
                  <span className="w-3 h-3 rounded-full bg-yellow-400" />
                  <span className="w-3 h-3 rounded-full bg-green-400" />
                </div>
                <div className="flex-1 mx-4 bg-background border rounded-md px-3 py-1 text-xs text-muted-foreground text-center">
                  afrifolio.com/votre-nom
                </div>
              </div>
              {/* Screenshot du portfolio */}
              <div className="relative aspect-[16/9] overflow-hidden">
                <img
                  src="https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=1200&q=85"
                  alt="Aperçu d'un portfolio professionnel"
                  className="w-full h-full object-cover object-top"
                />
                {/* Overlay léger avec gradient */}
                <div className="absolute inset-0 bg-gradient-to-t from-background/30 via-transparent to-transparent" />
              </div>
            </div>
            {/* Badge flottant gauche */}
            <div className="absolute -left-4 top-1/3 bg-card border rounded-xl px-4 py-3 shadow-lg hidden md:flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-emerald-500/20 flex items-center justify-center">
                <span className="w-2.5 h-2.5 bg-emerald-500 rounded-full animate-pulse" />
              </div>
              <div>
                <p className="text-xs font-bold">Disponible pour missions</p>
                <p className="text-[10px] text-muted-foreground">Badge visible sur votre profil</p>
              </div>
            </div>
            {/* Badge flottant droite */}
            <div className="absolute -right-4 bottom-1/4 bg-card border rounded-xl px-4 py-3 shadow-lg hidden md:flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-primary/15 flex items-center justify-center">
                <BarChart3 className="w-4 h-4 text-primary" />
              </div>
              <div>
                <p className="text-xs font-bold">+142 vues ce mois</p>
                <p className="text-[10px] text-muted-foreground">Statistiques en temps réel</p>
              </div>
            </div>
          </div>
        </div>

        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center text-muted-foreground/40 animate-bounce">
          <ChevronDown className="w-5 h-5" />
        </div>
      </section>

      {/* ── Stats ── */}
      <section className="py-16 border-y bg-muted/30">
        <div className="max-w-5xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          {[
            { value: 2000, suffix: "+",    label: "Freelances inscrits" },
            { value: 15,   suffix: " pays", label: "Pays représentés" },
            { value: 98,   suffix: "%",    label: "Clients satisfaits" },
            { value: 5,    suffix: " min", label: "Pour créer son portfolio" },
          ].map((s, i) => (
            <Reveal key={i} delay={i * 100}>
              <div className="text-3xl md:text-4xl font-display font-black text-primary mb-1">
                <Counter target={s.value} suffix={s.suffix} />
              </div>
              <div className="text-sm text-muted-foreground font-medium">{s.label}</div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ── Features ── */}
      <section id="features" className="py-28 px-6">
        <div className="max-w-7xl mx-auto">
          <Reveal className="text-center mb-16">
            <p className="text-primary text-sm font-bold uppercase tracking-widest mb-3">Fonctionnalités</p>
            <h2 className="text-4xl md:text-5xl font-display font-black mb-4">Tout ce dont vous avez besoin</h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">Un outil complet pensé pour les professionnels africains, quel que soit votre métier.</p>
          </Reveal>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {FEATURES.map((f, i) => (
              <Reveal key={i} delay={i * 60}>
                <div className="group bg-card border rounded-2xl p-6 hover:border-primary/30 hover:shadow-lg transition-all duration-300 hover:-translate-y-1 h-full">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                    <f.icon className="w-5 h-5 text-primary" />
                  </div>
                  <h3 className="font-display font-bold text-base mb-2">{f.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{f.desc}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── How it works ── */}
      <section id="how" className="py-28 px-6 bg-muted/30 border-y">
        <div className="max-w-5xl mx-auto">
          <Reveal className="text-center mb-16">
            <p className="text-primary text-sm font-bold uppercase tracking-widest mb-3">Comment ça marche</p>
            <h2 className="text-4xl md:text-5xl font-display font-black mb-4">Prêt en 4 étapes</h2>
            <p className="text-muted-foreground text-lg max-w-xl mx-auto">De l'inscription à la mise en ligne, tout est guidé pas à pas.</p>
          </Reveal>
          <div className="grid md:grid-cols-2 gap-6">
            {STEPS.map((step, i) => (
              <Reveal key={i} delay={i * 100}>
                <div className="flex gap-5 p-6 bg-card border rounded-2xl hover:border-primary/30 hover:shadow-md transition-all">
                  <div className="w-12 h-12 bg-primary text-primary-foreground rounded-2xl flex items-center justify-center font-display font-black text-lg shrink-0">
                    {step.num}
                  </div>
                  <div>
                    <h3 className="font-display font-bold text-base mb-1.5">{step.title}</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">{step.desc}</p>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
          <Reveal delay={400} className="text-center mt-10">
            <Link href="/inscription" className="inline-flex items-center gap-2 bg-primary text-primary-foreground font-bold px-8 py-4 rounded-full hover:bg-primary/90 transition-all shadow-xl shadow-primary/20">
              Je me lance maintenant <ArrowRight className="w-5 h-5" />
            </Link>
          </Reveal>

          {/* Image illustrative */}
          <Reveal delay={200} className="mt-16">
            <div className="relative rounded-2xl overflow-hidden aspect-[21/9] shadow-xl border">
              <img
                src="https://images.unsplash.com/photo-1531482615713-2afd69097998?w=1400&q=85"
                alt="Freelances africains travaillant ensemble"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-background/70 via-transparent to-transparent flex items-center">
                <div className="px-10 max-w-sm">
                  <p className="text-2xl font-display font-black mb-2">Des milliers de talents<br />déjà en ligne</p>
                  <p className="text-sm text-muted-foreground">Rejoignez la communauté AfriFolio et faites briller votre expertise.</p>
                </div>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ── Testimonials ── */}
      <section className="py-28 px-6">
        <div className="max-w-7xl mx-auto">
          <Reveal className="text-center mb-16">
            <p className="text-primary text-sm font-bold uppercase tracking-widest mb-3">Témoignages</p>
            <h2 className="text-4xl md:text-5xl font-display font-black mb-4">Ils nous font confiance</h2>
            <p className="text-muted-foreground text-lg">Des freelances de toute l'Afrique utilisent AfriFolio chaque jour.</p>
          </Reveal>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {TESTIMONIALS.map((t, i) => (
              <Reveal key={i} delay={i * 80}>
                <div className="bg-card border rounded-2xl p-6 flex flex-col gap-4 h-full hover:border-primary/30 hover:shadow-md transition-all">
                  <div className="flex gap-0.5">
                    {Array.from({ length: 5 }).map((_, j) => (
                      <Star key={j} className="w-4 h-4 fill-accent text-accent" />
                    ))}
                  </div>
                  <p className="text-sm text-muted-foreground leading-relaxed flex-1">"{t.text}"</p>
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-primary/15 flex items-center justify-center text-xs font-bold text-primary">
                      {t.avatar}
                    </div>
                    <div>
                      <p className="text-sm font-semibold">{t.name}</p>
                      <p className="text-xs text-muted-foreground">{t.role}</p>
                    </div>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── Pricing ── */}
      <section id="pricing" className="py-28 px-6 bg-muted/30 border-y">
        <div className="max-w-4xl mx-auto">
          <Reveal className="text-center mb-16">
            <p className="text-primary text-sm font-bold uppercase tracking-widest mb-3">Tarifs</p>
            <h2 className="text-4xl md:text-5xl font-display font-black mb-4">Simple et transparent</h2>
            <p className="text-muted-foreground text-lg">Pensé pour la réalité des freelances africains.</p>
          </Reveal>
          <div className="grid md:grid-cols-2 gap-6">
            <Reveal delay={0}>
              <div className="bg-card border rounded-2xl p-8 flex flex-col h-full">
                <p className="text-sm font-bold text-muted-foreground uppercase tracking-wider mb-2">Découverte</p>
                <div className="flex items-end gap-2 mb-6">
                  <span className="text-5xl font-display font-black">0</span>
                  <span className="text-muted-foreground mb-2">FCFA / mois</span>
                </div>
                <ul className="space-y-3 mb-8 flex-1">
                  {["Portfolio public en ligne", "Jusqu'à 3 projets", "Lien personnalisé", "5 thèmes disponibles", "Contact WhatsApp & Email"].map((item, i) => (
                    <li key={i} className="flex items-center gap-3 text-sm text-muted-foreground">
                      <Check className="w-4 h-4 text-primary shrink-0" /> {item}
                    </li>
                  ))}
                </ul>
                <Link href="/inscription" className="flex items-center justify-center gap-2 border border-input bg-background hover:bg-muted font-semibold py-3 rounded-xl transition-all">
                  Commencer gratuitement
                </Link>
              </div>
            </Reveal>
            <Reveal delay={150}>
              <div className="relative bg-card border-2 border-primary rounded-2xl p-8 flex flex-col h-full shadow-xl shadow-primary/10">
                <div className="absolute top-4 right-4 bg-primary text-primary-foreground text-xs font-bold px-3 py-1 rounded-full">⭐ Populaire</div>
                <p className="text-sm font-bold text-primary uppercase tracking-wider mb-2">Pro</p>
                <div className="flex items-end gap-2 mb-6">
                  <span className="text-5xl font-display font-black">360</span>
                  <span className="text-muted-foreground mb-2">FCFA / mois</span>
                </div>
                <ul className="space-y-3 mb-8 flex-1">
                  {["Tout du plan Découverte", "Projets illimités", "Statistiques de visites détaillées", "Programme de parrainage & commissions", "Badge Pro sur votre portfolio", "Support prioritaire", "Paiement Mobile Money (MTN, Moov, Wave)"].map((item, i) => (
                    <li key={i} className="flex items-center gap-3 text-sm">
                      <Check className="w-4 h-4 text-primary shrink-0" /> {item}
                    </li>
                  ))}
                </ul>
                <Link href="/inscription" className="flex items-center justify-center gap-2 bg-primary text-primary-foreground font-bold py-3 rounded-xl hover:bg-primary/90 transition-all shadow-lg shadow-primary/20">
                  Passer Pro <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ── FAQ ── */}
      <section className="py-28 px-6">
        <div className="max-w-3xl mx-auto">
          <Reveal className="text-center mb-16">
            <p className="text-primary text-sm font-bold uppercase tracking-widest mb-3">FAQ</p>
            <h2 className="text-4xl md:text-5xl font-display font-black mb-4">Questions fréquentes</h2>
          </Reveal>
          <div className="space-y-3">
            {FAQS.map((faq, i) => (
              <Reveal key={i} delay={i * 60}>
                <div className="bg-card border rounded-2xl overflow-hidden">
                  <button onClick={() => setFaqOpen(faqOpen === i ? null : i)}
                    className="w-full flex items-center justify-between gap-4 p-5 text-left hover:bg-muted/30 transition-colors">
                    <span className="font-semibold text-sm md:text-base">{faq.q}</span>
                    <ChevronDown className={`w-5 h-5 text-muted-foreground shrink-0 transition-transform duration-300 ${faqOpen === i ? "rotate-180" : ""}`} />
                  </button>
                  <div className={`overflow-hidden transition-all duration-300 ${faqOpen === i ? "max-h-40 opacity-100" : "max-h-0 opacity-0"}`}>
                    <p className="px-5 pb-5 text-sm text-muted-foreground leading-relaxed">{faq.a}</p>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA Final ── */}
      <section className="py-28 px-6 bg-primary/5 border-t">
        <div className="max-w-3xl mx-auto text-center">
          <Reveal>
            <h2 className="text-4xl md:text-6xl font-display font-black mb-6 leading-tight">
              Votre talent mérite<br />
              <span className="text-primary">d'être vu.</span>
            </h2>
            <p className="text-lg text-muted-foreground mb-10 max-w-xl mx-auto">
              Rejoignez des milliers de professionnels africains qui ont déjà créé leur portfolio avec AfriFolio.
            </p>
            <Link href="/inscription" className="inline-flex items-center gap-2 bg-primary text-primary-foreground font-bold px-10 py-5 rounded-full text-lg hover:bg-primary/90 transition-all shadow-2xl shadow-primary/25 hover:-translate-y-1">
              Créer mon portfolio — c'est gratuit <ArrowRight className="w-5 h-5" />
            </Link>
            <p className="mt-4 text-sm text-muted-foreground">Aucune carte bancaire · Prêt en 5 minutes</p>
          </Reveal>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="border-t py-10 px-6 bg-background">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="font-display font-bold text-xl text-primary">AfriFolio</div>
          <div className="flex gap-6 text-sm text-muted-foreground">
            <a href="#features" className="hover:text-foreground transition-colors">Fonctionnalités</a>
            <a href="#pricing" className="hover:text-foreground transition-colors">Tarifs</a>
            <Link href="/connexion" className="hover:text-foreground transition-colors">Connexion</Link>
            <Link href="/inscription" className="hover:text-foreground transition-colors">S'inscrire</Link>
          </div>
          <p className="text-sm text-muted-foreground">© {new Date().getFullYear()} AfriFolio · Conçu pour les talents d'Afrique</p>
        </div>
      </footer>

    </div>
  );
}
