import { lazy, Suspense, type ComponentType } from "react";
import { Switch, Route, Router as WouterRouter, Redirect } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider, useAuth } from "@/contexts/auth";

// Pages publiques légères : chargées tout de suite
import Home from "@/pages/home";
import PublicPortfolio from "@/pages/portfolio/public";
import NotFound from "@/pages/not-found";

// Le reste est chargé à la demande : un visiteur de portfolio ne télécharge
// ni l'espace client, ni l'administration, ni les graphiques.
const Onboarding = lazy(() => import("@/pages/onboarding"));
const Login = lazy(() => import("@/pages/login"));
const AdminLogin = lazy(() => import("@/pages/login").then((m) => ({ default: m.AdminLogin })));
const Exemples = lazy(() => import("@/pages/exemples"));
const ExampleDetail = lazy(() => import("@/pages/exemples").then((m) => ({ default: m.ExampleDetail })));
const Annuaire = lazy(() => import("@/pages/annuaire"));

const Dashboard = lazy(() => import("@/pages/dashboard/index"));
const PageEditor = lazy(() => import("@/pages/dashboard/page-editor"));
const ProfileEdit = lazy(() => import("@/pages/dashboard/profile"));
const Appearance = lazy(() => import("@/pages/dashboard/appearance"));
const Messages = lazy(() => import("@/pages/dashboard/messages"));
const Analytics = lazy(() => import("@/pages/dashboard/analytics"));
const Subscription = lazy(() => import("@/pages/dashboard/subscription"));
const Referral = lazy(() => import("@/pages/dashboard/referral"));
const Account = lazy(() => import("@/pages/dashboard/account"));

const AdminOverview = lazy(() => import("@/pages/admin/index"));
const AdminUsers = lazy(() => import("@/pages/admin/users"));
const AdminPayments = lazy(() => import("@/pages/admin/payments"));
const AdminWithdrawals = lazy(() => import("@/pages/admin/withdrawals"));
const AdminProfessions = lazy(() => import("@/pages/admin/professions"));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: (failureCount, error: any) => {
        const status = error?.status ?? error?.response?.status;
        if (status && status >= 400 && status < 500) return false;
        return failureCount < 1;
      },
      staleTime: 30_000,
      refetchOnWindowFocus: false,
    },
  },
});

function PageLoader() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
    </div>
  );
}

function Protected({ component: Component, admin = false }: { component: ComponentType; admin?: boolean }) {
  const { isAuthenticated, isLoading, user } = useAuth();
  if (isLoading) return <PageLoader />;
  if (!isAuthenticated) return <Redirect to={admin ? "/admin/connexion" : "/connexion"} />;
  if (admin && !user?.isAdmin) return <Redirect to="/dashboard" />;
  return <Component />;
}

const dash = (c: ComponentType) => () => <Protected component={c} />;
const adm = (c: ComponentType) => () => <Protected component={c} admin />;

function Router() {
  return (
    <Suspense fallback={<PageLoader />}>
      <Switch>
        <Route path="/" component={Home} />
        <Route path="/inscription" component={Onboarding} />
        <Route path="/connexion">{() => <Login />}</Route>
        <Route path="/exemples" component={Exemples} />
        <Route path="/exemples/:profession" component={ExampleDetail} />
        <Route path="/annuaire" component={Annuaire} />

        <Route path="/dashboard">{dash(Dashboard)}</Route>
        <Route path="/dashboard/ma-page">{dash(PageEditor)}</Route>
        <Route path="/dashboard/profil">{dash(ProfileEdit)}</Route>
        <Route path="/dashboard/apparence">{dash(Appearance)}</Route>
        <Route path="/dashboard/messages">{dash(Messages)}</Route>
        <Route path="/dashboard/statistiques">{dash(Analytics)}</Route>
        <Route path="/dashboard/abonnement">{dash(Subscription)}</Route>
        <Route path="/dashboard/parrainage">{dash(Referral)}</Route>
        <Route path="/dashboard/compte">{dash(Account)}</Route>
        {/* Anciennes adresses */}
        <Route path="/dashboard/projets"><Redirect to="/dashboard/ma-page" /></Route>
        <Route path="/dashboard/analytiques"><Redirect to="/dashboard/statistiques" /></Route>

        <Route path="/admin/connexion" component={AdminLogin} />
        <Route path="/admin">{adm(AdminOverview)}</Route>
        <Route path="/admin/utilisateurs">{adm(AdminUsers)}</Route>
        <Route path="/admin/paiements">{adm(AdminPayments)}</Route>
        <Route path="/admin/retraits">{adm(AdminWithdrawals)}</Route>
        <Route path="/admin/metiers">{adm(AdminProfessions)}</Route>
        <Route path="/admin/stats"><Redirect to="/admin" /></Route>

        {/* Portfolios : afrifolio.com/identifiant (et l'ancienne forme /portfolio/identifiant) */}
        <Route path="/portfolio/:username" component={PublicPortfolio} />
        <Route path="/:username" component={PublicPortfolio} />

        <Route component={NotFound} />
      </Switch>
    </Suspense>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <AuthProvider>
          <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
            <Router />
          </WouterRouter>
          <Toaster />
        </AuthProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
