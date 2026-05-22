import { Switch, Route, Router as WouterRouter, Redirect, useLocation } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider, useAuth } from "@/contexts/auth";

import NotFound from "@/pages/not-found";
import Home from "@/pages/home";
import Register from "@/pages/register";
import Login from "@/pages/login";
import Dashboard from "@/pages/dashboard/index";
import ProfileEdit from "@/pages/dashboard/profile";
import ProjectsDashboard from "@/pages/dashboard/projects";
import Referral from "@/pages/dashboard/referral";
import Analytics from "@/pages/dashboard/analytics";
import Subscription from "@/pages/dashboard/subscription";
import PublicPortfolio from "@/pages/portfolio/public";
import AdminPanel from "@/pages/admin/index";
import AdminLogin from "@/pages/admin/login";
import AdminUsers from "@/pages/admin/users";
import AdminWithdrawals from "@/pages/admin/withdrawals";
import AdminStats from "@/pages/admin/stats";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: (failureCount, error: any) => {
        const status = error?.status ?? error?.response?.status;
        if (status && status >= 400 && status < 500) return false;
        return failureCount < 1;
      },
      staleTime: 30_000,
    },
  },
});

function ProtectedRoute({ component: Component, adminOnly = false }: { component: any, adminOnly?: boolean }) {
  const { isAuthenticated, isLoading, user } = useAuth();

  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center">Chargement...</div>;
  }

  if (!isAuthenticated) {
    return <Redirect to="/connexion" />;
  }

  if (adminOnly && !user?.isAdmin) {
    return <Redirect to="/admin/connexion" />;
  }

  return <Component />;
}

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/inscription" component={Register} />
      <Route path="/connexion" component={Login} />
      
      <Route path="/dashboard">
        {() => <ProtectedRoute component={Dashboard} />}
      </Route>
      <Route path="/dashboard/profil">
        {() => <ProtectedRoute component={ProfileEdit} />}
      </Route>
      <Route path="/dashboard/projets">
        {() => <ProtectedRoute component={ProjectsDashboard} />}
      </Route>
      <Route path="/dashboard/parrainage">
        {() => <ProtectedRoute component={Referral} />}
      </Route>
      <Route path="/dashboard/analytiques">
        {() => <ProtectedRoute component={Analytics} />}
      </Route>
      <Route path="/dashboard/abonnement">
        {() => <ProtectedRoute component={Subscription} />}
      </Route>
      
      <Route path="/portfolio/:username" component={PublicPortfolio} />
      
      <Route path="/admin">
        {() => <ProtectedRoute component={AdminPanel} adminOnly />}
      </Route>
      <Route path="/admin/utilisateurs">
        {() => <ProtectedRoute component={AdminUsers} adminOnly />}
      </Route>
      <Route path="/admin/retraits">
        {() => <ProtectedRoute component={AdminWithdrawals} adminOnly />}
      </Route>
      <Route path="/admin/stats">
        {() => <ProtectedRoute component={AdminStats} adminOnly />}
      </Route>
      <Route path="/admin/connexion" component={AdminLogin} />
      
      <Route component={NotFound} />
    </Switch>
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
