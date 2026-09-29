import { useGetAdminWithdrawals, useUpdateWithdrawal, getGetAdminWithdrawalsQueryKey } from "@workspace/api-client-react";
import { AdminLayout } from "@/components/admin-layout";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";
import { Check, X, Wallet, Loader2 } from "lucide-react";
import { useState } from "react";

const STATUS_LABELS: Record<string, { label: string; class: string }> = {
  pending:  { label: "En attente", class: "bg-amber-500/10 text-amber-600" },
  approved: { label: "Approuvé",   class: "bg-emerald-500/10 text-emerald-600" },
  rejected: { label: "Rejeté",     class: "bg-destructive/10 text-destructive" },
};

export default function AdminWithdrawals() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [filter, setFilter] = useState<"all" | "pending" | "approved" | "rejected">("pending");

  const { data: withdrawals = [], isLoading } = useGetAdminWithdrawals({
    query: { queryKey: getGetAdminWithdrawalsQueryKey(), retry: false },
  });
  const updateMutation = useUpdateWithdrawal();

  const filtered = filter === "all" ? withdrawals : withdrawals.filter(w => w.status === filter);
  const pendingCount = withdrawals.filter(w => w.status === "pending").length;

  const handle = (id: number, status: "approved" | "rejected") => {
    updateMutation.mutate({ id, data: { status } }, {
      onSuccess: () => {
        toast({ title: status === "approved" ? "✅ Retrait approuvé" : "❌ Retrait rejeté" });
        queryClient.invalidateQueries({ queryKey: getGetAdminWithdrawalsQueryKey() });
      },
      onError: () => toast({ title: "Erreur", variant: "destructive" }),
    });
  };

  return (
    <AdminLayout>
      <div className="mb-8">
        <h1 className="text-3xl font-display font-black">Retraits</h1>
        <p className="text-muted-foreground mt-1">Gérez les demandes de retrait des utilisateurs</p>
      </div>

      {/* Filtres */}
      <div className="flex gap-2 mb-6 flex-wrap">
        {(["pending", "all", "approved", "rejected"] as const).map((f) => (
          <button key={f} onClick={() => setFilter(f)}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
              filter === f ? "bg-primary text-primary-foreground" : "bg-card border hover:bg-muted"
            }`}>
            {f === "pending" ? `En attente${pendingCount > 0 ? ` (${pendingCount})` : ""}` :
             f === "all" ? "Tous" :
             f === "approved" ? "Approuvés" : "Rejetés"}
          </button>
        ))}
      </div>

      <div className="bg-card border rounded-2xl overflow-hidden">
        {isLoading ? (
          <div className="py-16 flex justify-center">
            <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="py-16 text-center">
            <Wallet className="w-8 h-8 mx-auto mb-2 text-muted-foreground opacity-30" />
            <p className="text-sm text-muted-foreground">Aucun retrait dans cette catégorie</p>
          </div>
        ) : (
          <div className="divide-y">
            {filtered.map((w) => (
              <div key={w.id} className="px-6 py-4 flex items-center gap-4">
                {/* Icône méthode */}
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                  {w.method === "mobile_money" ? "📱" : "💳"}
                </div>

                {/* Infos */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="font-semibold text-sm">@{w.username}</p>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${STATUS_LABELS[w.status].class}`}>
                      {STATUS_LABELS[w.status].label}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {w.method === "mobile_money" ? `Mobile Money · ${w.phoneNumber || "—"}` : "Crédit abonnement"}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Demandé le {new Date(w.requestedAt).toLocaleDateString("fr-FR")}
                    {w.processedAt && ` · Traité le ${new Date(w.processedAt).toLocaleDateString("fr-FR")}`}
                  </p>
                </div>

                {/* Montant */}
                <p className="font-display font-black text-lg shrink-0">
                  {w.amount.toLocaleString()} <span className="text-xs font-normal text-muted-foreground">FCFA</span>
                </p>

                {/* Actions (seulement si pending) */}
                {w.status === "pending" && (
                  <div className="flex gap-2 shrink-0">
                    <button onClick={() => handle(w.id, "approved")} disabled={updateMutation.isPending}
                      className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/20 text-xs font-semibold transition-colors disabled:opacity-50">
                      <Check className="w-3.5 h-3.5" /> Approuver
                    </button>
                    <button onClick={() => handle(w.id, "rejected")} disabled={updateMutation.isPending}
                      className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-destructive/10 text-destructive hover:bg-destructive/20 text-xs font-semibold transition-colors disabled:opacity-50">
                      <X className="w-3.5 h-3.5" /> Rejeter
                    </button>
                  </div>
                )}
                {w.status !== "pending" && (
                  <div className="shrink-0 w-8 h-8 rounded-full flex items-center justify-center">
                    {w.status === "approved"
                      ? <Check className="w-4 h-4 text-emerald-500" />
                      : <X className="w-4 h-4 text-destructive" />}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
