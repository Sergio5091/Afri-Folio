import { useGetAnalyticsStats, getGetAnalyticsStatsQueryKey } from "@workspace/api-client-react";
import { DashboardLayout } from "@/components/dashboard-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from "recharts";
import { Eye, TrendingUp } from "lucide-react";

export default function Analytics() {
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
      return { date: d.toISOString().split("T")[0], count: Math.floor(Math.random() * 12) + 1 };
    }),
  };

  const { data: fetchedStats } = useGetAnalyticsStats({
    query: { queryKey: getGetAnalyticsStatsQueryKey(), retry: false, placeholderData: MOCK_STATS },
  });
  const displayStats = fetchedStats ?? MOCK_STATS;

  return (
    <DashboardLayout>
      <div className="mb-8">
        <h1 className="text-3xl font-bold font-display">Analytiques</h1>
        <p className="text-muted-foreground mt-1">Suivez les performances de votre portfolio.</p>
      </div>

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
