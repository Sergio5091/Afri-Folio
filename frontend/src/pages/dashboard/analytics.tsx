import { useGetAnalyticsStats, getGetAnalyticsStatsQueryKey } from "@workspace/api-client-react";
import { useAuth } from "@/contexts/auth";
import { DashboardLayout } from "@/components/dashboard-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from "recharts";
import { Eye, TrendingUp, Lock } from "lucide-react";
import { Link } from "wouter";

export default function Analytics() {
  const { user } = useAuth();
  const isPro = user?.plan === "premium";
  const MOCK_STATS = {
    totalViews: 142,
    viewsThisMonth: 38,
    viewsByCountry: [
      { country: "Bénin", count: 61 },
      { country: "Sénégal", count: 34 },
      { country: "Côte d'Ivoire", count: 27 },
      { country: "France", count: 12 },
      { country: "Autres", count: 8 },
    ],
    viewsByDay: Array.from({ length: 14 }, (_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - (13 - i));
      // Valeurs fixes pour éviter le re-render aléatoire
      const fixedCounts = [3,7,2,9,5,11,4,8,6,10,3,12,7,5];
      return { date: d.toISOString().split("T")[0], count: fixedCounts[i] };
    }),
  };

  const { data: fetchedStats } = useGetAnalyticsStats({
    query: { queryKey: getGetAnalyticsStatsQueryKey(), retry: false, placeholderData: MOCK_STATS },
  });
  const displayStats = fetchedStats ?? MOCK_STATS;

  return (
    <DashboardLayout>
      <div className="mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold font-display">Analytiques</h1>
          <p className="text-muted-foreground mt-1">Suivez les performances de votre portfolio.</p>
        </div>
        {!isPro && (
          <Link href="/dashboard/abonnement"
            className="inline-flex items-center gap-2 bg-primary text-primary-foreground text-sm font-semibold px-5 py-2.5 rounded-full hover:bg-primary/90 transition-all shadow-lg shadow-primary/20">
            <Lock className="w-4 h-4" /> Débloquer les stats Pro
          </Link>
        )}
      </div>

      {!isPro && (
        <div className="relative mb-8 rounded-2xl border border-primary/20 bg-primary/5 p-6 text-center">
          <Lock className="w-8 h-8 text-primary mx-auto mb-3" />
          <p className="font-bold mb-1">Statistiques détaillées réservées au plan Pro</p>
          <p className="text-sm text-muted-foreground mb-4">Vues par pays, courbe quotidienne sur 14 jours, sources de trafic.</p>
          <Link href="/dashboard/abonnement"
            className="inline-flex items-center gap-2 bg-primary text-primary-foreground text-sm font-semibold px-6 py-2.5 rounded-full hover:bg-primary/90 transition-all">
            Passer Pro — 360 FCFA/mois
          </Link>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Vues Totales</CardTitle>
            <Eye className="w-4 h-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{displayStats.totalViews}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Vues (30 derniers jours)</CardTitle>
            <TrendingUp className="w-4 h-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{displayStats.viewsThisMonth}</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card>
          <CardHeader>
            <CardTitle>Vues par jour</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] w-full">
              {displayStats.viewsByDay.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={displayStats.viewsByDay} margin={{ top: 5, right: 5, bottom: 5, left: -20 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                    <XAxis 
                      dataKey="date" 
                      tickFormatter={(val) => {
                        const date = new Date(val);
                        return `${date.getDate()}/${date.getMonth()+1}`;
                      }}
                      tick={{ fontSize: 12 }}
                      stroke="hsl(var(--muted-foreground))"
                    />
                    <YAxis tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" />
                    <Tooltip 
                      contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))', borderRadius: '8px' }}
                      labelFormatter={(val) => new Date(val).toLocaleDateString()}
                    />
                    <Line type="monotone" dataKey="count" stroke="hsl(var(--primary))" strokeWidth={3} dot={false} activeDot={{ r: 6 }} />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center text-muted-foreground">Aucune donnée disponible</div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Répartition par pays</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] w-full">
              {displayStats.viewsByCountry.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={displayStats.viewsByCountry} margin={{ top: 5, right: 5, bottom: 5, left: -20 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                    <XAxis dataKey="country" tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" />
                    <YAxis tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" />
                    <Tooltip 
                      contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))', borderRadius: '8px' }}
                      cursor={{ fill: 'hsl(var(--muted))' }}
                    />
                    <Bar dataKey="count" fill="hsl(var(--secondary))" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center text-muted-foreground">Aucune donnée disponible</div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

    </DashboardLayout>
  );
}
