import { useGetAdminUsers, useGetAdminStats, useGetAdminWithdrawals, useUpdateWithdrawal, getGetAdminUsersQueryKey, getGetAdminStatsQueryKey, getGetAdminWithdrawalsQueryKey } from "@workspace/api-client-react";
import { AdminLayout } from "@/components/admin-layout";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";
import { Users, Wallet, TrendingUp, Clock, Check, X, ExternalLink, Loader2, Crown } from "lucide-react";

export default function AdminPanel() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { data: stats, isLoading: statsLoading } = useGetAdminStats(30, { query: { queryKey: getGetAdminStatsQueryKey(30), retry: false } });
  const { data: usersData, isLoading: usersLoading } = useGetAdminUsers(undefined, { query: { queryKey: getGetAdminUsersQueryKey(), retry: false } });
  const { data: withdrawals, isLoading: wLoading } = useGetAdminWithdrawals({ query: { queryKey: getGetAdminWithdrawalsQueryKey(), retry: false } });
  const updateMutation = useUpdateWithdrawal();

  const handleWithdrawal = (id: number, status: "approved" | "rejected") => {
    updateMutation.mutate({ id, data: { status } }, {
      onSuccess: () => {
        toast({ title: status === "approved" ? "✅ Retrait approuvé" : "❌ Retrait rejeté" });
        queryClient.invalidateQueries({ queryKey: getGetAdminWithdrawalsQueryKey() });
        queryClient.invalidateQueries({ queryKey: getGetAdminStatsQueryKey() });
      },
      onError: () => toast({ title: "Erreur", variant: "destructive" }),
    });
  };

  const pendingWithdrawals = withdrawals?.filter(w => w.status === "pending") ?? [];

  return (
    <AdminLayout>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-display font-black">Vue d'ensemble</h1>
        <p className="text-muted-foreground mt-1">Tableau de bord administrateur AfriFolio</p>
      </div>

      {/* Stats cards */}
      {statsLoading ? (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {[1,2,3,4].map(i => <div key={i} className="h-28 bg-muted animate-pulse rounded-2xl" />)}
        </div>
      ) : stats && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {[
            { label: "Utilisateurs", value: stats.totalUsers, sub: `${stats.premiumUsers} Premium`, icon: Users, color: "text-blue-500", bg: "bg-blue-500/10" },
            { label: "Revenus totaux", value: `${stats.totalRevenue.toLocaleString()} FCFA`, sub: "Abonnements payés", icon: TrendingUp, color: "text-emerald-500", bg: "bg-emerald-500/10" },
            { label: "Commissions", value: `${stats.totalCommissionsPaid.toLocaleString()} FCFA`, sub: "Parrainage payé", icon: Crown, color: "text-amber-500", bg: "bg-amber-500/10" },
            { label: "Retraits en attente", value: stats.pendingWithdrawals, sub: "À traiter", icon: Clock, color: "text-destructive", bg: "bg-destructive/10" },
          ].map((s, i) => (
            <div key={i} className="bg-card border rounded-2xl p-5">
              <div className="flex items-center justify-between mb-3">
                <p className="text-sm font-medium text-muted-foreground">{s.label}</p>
                <div className={`w-8 h-8 ${s.bg} rounded-lg flex items-center justify-center`}>
                  <s.icon className={`w-4 h-4 ${s.color}`} />
                </div>
              </div>
              <p className="text-2xl font-display font-black">{s.value}</p>
              <p className="text-xs text-muted-foreground mt-1">{s.sub}</p>
            </div>
          ))}
        </div>
      )}

      <div className="grid lg:grid-cols-2 gap-6">

        {/* Retraits en attente */}
        <div className="bg-card border rounded-2xl overflow-hidden">
          <div className="px-6 py-4 border-b flex items-center justify-between">
            <h2 className="font-display font-bold">Retraits en attente</h2>
            {pendingWithdrawals.length > 0 && (
              <span className="bg-destructive/10 text-destructive text-xs font-bold px-2.5 py-1 rounded-full">
                {pendingWithdrawals.length} à traiter
              </span>
            )}
          </div>
          <div className="divide-y">
            {wLoading ? (
              <div className="p-6 flex justify-center"><Loader2 className="w-5 h-5 animate-spin text-muted-foreground" /></div>
            ) : pendingWithdrawals.length === 0 ? (
              <div className="p-8 text-center">
                <Check className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">Aucun retrait en attente</p>
              </div>
            ) : pendingWithdrawals.map((w) => (
              <div key={w.id} className="px-6 py-4 flex items-center gap-4">
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm">@{w.username}</p>
                  <p className="text-xs text-muted-foreground">{w.method === "mobile_money" ? "📱 Mobile Money" : "💳 Crédit abonnement"} · {w.phoneNumber || "—"}</p>
                  <p className="text-xs text-muted-foreground">{new Date(w.requestedAt).toLocaleDateString("fr-FR")}</p>
                </div>
                <p className="font-display font-black text-base shrink-0">{w.amount.toLocaleString()} <span className="text-xs font-normal text-muted-foreground">FCFA</span></p>
                <div className="flex gap-2 shrink-0">
                  <button
                    onClick={() => handleWithdrawal(w.id, "approved")}
                    disabled={updateMutation.isPending}
                    className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/20 flex items-center justify-center transition-colors"
                  >
                    <Check className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleWithdrawal(w.id, "rejected")}
                    disabled={updateMutation.isPending}
                    className="w-8 h-8 rounded-lg bg-destructive/10 text-destructive hover:bg-destructive/20 flex items-center justify-center transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Derniers utilisateurs */}
        <div className="bg-card border rounded-2xl overflow-hidden">
          <div className="px-6 py-4 border-b flex items-center justify-between">
            <h2 className="font-display font-bold">Derniers inscrits</h2>
            <span className="text-xs text-muted-foreground">{usersData?.total ?? 0} total</span>
          </div>
          <div className="divide-y">
            {usersLoading ? (
              <div className="p-6 flex justify-center"><Loader2 className="w-5 h-5 animate-spin text-muted-foreground" /></div>
            ) : usersData?.users.slice(0, 8).map((user) => (
              <div key={user.id} className="px-6 py-3.5 flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold text-primary shrink-0">
                  {user.username.substring(0, 2).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold truncate">@{user.username}</p>
                  <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    user.plan === "premium" ? "bg-amber-500/10 text-amber-600" : "bg-muted text-muted-foreground"
                  }`}>
                    {user.plan === "premium" ? "⭐ Pro" : "Free"}
                  </span>
                  <a href={`/portfolio/${user.username}`} target="_blank" rel="noreferrer"
                    className="text-muted-foreground hover:text-primary transition-colors">
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>
            ))}
          </div>
          {usersData && usersData.total > 8 && (
            <div className="px-6 py-3 border-t">
              <a href="/admin/utilisateurs" className="text-xs text-primary hover:underline font-medium">
                Voir tous les {usersData.total} utilisateurs →
              </a>
            </div>
          )}
        </div>
      </div>

    </AdminLayout>
  );
}
