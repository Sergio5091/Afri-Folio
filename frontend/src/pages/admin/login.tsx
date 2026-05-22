import { useState } from "react";
import { useLogin } from "@workspace/api-client-react";
import { useAuth } from "@/contexts/auth";
import { useLocation, Link } from "wouter";
import { useToast } from "@/hooks/use-toast";
import { Shield, Eye, EyeOff, Loader2 } from "lucide-react";

export default function AdminLogin() {
  const [, setLocation] = useLocation();
  const { login } = useAuth();
  const { toast } = useToast();
  const loginMutation = useLogin();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email || !password) return;

    loginMutation.mutate({ data: { email, password } }, {
      onSuccess: (response) => {
        if (!response.user.isAdmin) {
          toast({ title: "Accès refusé", description: "Vous n'avez pas les droits administrateur.", variant: "destructive" });
          return;
        }
        login(response.token, response.user);
        toast({ title: "Connexion admin réussie" });
        setLocation("/admin");
      },
      onError: () => {
        toast({ title: "Identifiants incorrects", description: "Vérifiez votre email et mot de passe.", variant: "destructive" });
      },
    });
  }

  return (
    <div className="min-h-screen bg-foreground flex items-center justify-center px-4">
      {/* Fond décoratif */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/3 w-96 h-96 bg-primary/10 rounded-full blur-[100px]" />
        <div className="absolute bottom-1/4 right-1/3 w-64 h-64 bg-destructive/10 rounded-full blur-[80px]" />
      </div>

      <div className="relative w-full max-w-md">
        {/* Card */}
        <div className="bg-card border rounded-2xl shadow-2xl p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Shield className="w-7 h-7 text-primary" />
            </div>
            <h1 className="text-2xl font-display font-black">Espace Administrateur</h1>
            <p className="text-muted-foreground text-sm mt-1">Accès réservé à l'équipe AfriFolio</p>
          </div>

          <form onSubmit={onSubmit} className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Email administrateur</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@afrifolio.com"
                required
                className="w-full px-4 py-3 rounded-xl border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Mot de passe</label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full px-4 py-3 pr-12 rounded-xl border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loginMutation.isPending || !email || !password}
              className="w-full flex items-center justify-center gap-2 bg-primary text-primary-foreground font-bold py-3 rounded-xl hover:bg-primary/90 transition-all disabled:opacity-50 disabled:cursor-not-allowed mt-2"
            >
              {loginMutation.isPending ? (
                <><Loader2 className="w-4 h-4 animate-spin" /> Connexion...</>
              ) : (
                <><Shield className="w-4 h-4" /> Accéder au panel</>
              )}
            </button>
          </form>

          <div className="mt-6 pt-6 border-t text-center">
            <Link href="/connexion" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              ← Retour à la connexion normale
            </Link>
          </div>
        </div>

        <p className="text-center text-xs text-muted-foreground mt-4 opacity-50">
          AfriFolio Admin · Accès sécurisé
        </p>
      </div>
    </div>
  );
}
