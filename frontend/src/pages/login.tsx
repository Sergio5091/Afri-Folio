import { useState } from "react";
import { Link, useLocation } from "wouter";
import { Eye, Loader2, Lock, Mail } from "lucide-react";
import { useLogin } from "@workspace/api-client-react";
import { useAuth } from "@/contexts/auth";
import { Logo } from "@/components/brand";
import { PortfolioView } from "@/components/portfolio/PortfolioView";
import { PhoneMockup, PreviewFrame } from "@/components/portfolio/PreviewFrame";
import { buildDemoPortfolio } from "@/lib/portfolio";

const inputCls = "w-full rounded-xl border bg-card py-3.5 pl-12 pr-4 text-[16px] outline-none focus:border-primary focus:ring-4 focus:ring-primary/10";

export default function Login({ admin = false }: { admin?: boolean }) {
  const [, navigate] = useLocation();
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [show, setShow] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const mutation = useLogin({
    onSuccess: (res) => {
      if (admin && !res.user.isAdmin) {
        setError("Ce compte n'a pas les droits administrateur.");
        return;
      }
      login(res.token, res.user);
      navigate(admin ? "/admin" : "/dashboard");
    },
    onError: (e: any) => setError(e?.message ?? "Connexion impossible"),
  });

  return (
    <div className="grid min-h-screen bg-background lg:grid-cols-2">
      <div className="flex flex-col px-6 py-8 sm:px-10">
        <Logo />
        <div className="mx-auto flex w-full max-w-sm flex-1 flex-col justify-center py-12">
          <h1 className="text-3xl font-bold tracking-tight">{admin ? "Administration" : "Bon retour !"}</h1>
          <p className="mt-2 text-muted-foreground">{admin ? "Accès réservé à l'équipe AfriFolio." : "Connectez-vous pour gérer votre page."}</p>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              setError(null);
              mutation.mutate({ data: { email, password } });
            }}
            className="mt-8 space-y-4"
          >
            <label className="block">
              <span className="mb-1.5 block text-sm font-semibold">Email ou identifiant</span>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
                <input value={email} onChange={(e) => setEmail(e.target.value)} required autoComplete="username" placeholder="vous@exemple.com" className={inputCls} />
              </div>
            </label>
            <label className="block">
              <span className="mb-1.5 block text-sm font-semibold">Mot de passe</span>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
                <input type={show ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)} required autoComplete="current-password" className={`${inputCls} pr-12`} />
                <button type="button" onClick={() => setShow(!show)} className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg p-1.5 text-muted-foreground hover:bg-muted" aria-label="Afficher le mot de passe">
                  <Eye className="h-5 w-5" />
                </button>
              </div>
            </label>
            {error && <p className="rounded-xl bg-destructive/10 px-4 py-3 text-sm text-destructive">{error}</p>}
            <button type="submit" disabled={mutation.isPending} className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary py-3.5 font-semibold text-primary-foreground shadow-lg shadow-primary/20 disabled:opacity-60">
              {mutation.isPending && <Loader2 className="h-5 w-5 animate-spin" />} Se connecter
            </button>
          </form>

          {!admin && (
            <p className="mt-6 text-center text-sm text-muted-foreground">
              Pas encore de page ? <Link href="/inscription" className="font-semibold text-primary">Créez-la gratuitement</Link>
            </p>
          )}
          <p className="mt-3 text-center text-xs text-muted-foreground">Mot de passe oublié ? Écrivez au support sur WhatsApp.</p>
        </div>
      </div>

      <div className="relative hidden items-center justify-center overflow-hidden bg-[#1a1410] lg:flex">
        <div className="pointer-events-none absolute -left-20 top-10 h-80 w-80 rounded-full bg-primary/30 blur-[110px]" />
        <div className="relative w-[300px] rotate-[-4deg]">
          <PhoneMockup>
            <PreviewFrame virtualWidth={390} aspect={1.95}>
              <PortfolioView data={buildDemoPortfolio("patissier")} mode="demo" />
            </PreviewFrame>
          </PhoneMockup>
        </div>
      </div>
    </div>
  );
}

export function AdminLogin() {
  return <Login admin />;
}
