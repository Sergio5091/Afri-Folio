import { useState } from "react";
import { Link } from "wouter";
import { CreditCard } from "lucide-react";
import { useGetAdminSubscriptions } from "@workspace/api-client-react";
import { AdminLayout } from "@/components/admin-layout";
import { EmptyState, PageHeader, Panel } from "@/components/dashboard/ui";
import { formatNumber } from "@/lib/utils";

const STATUS = {
  success: { label: "Payé", cls: "bg-emerald-500/10 text-emerald-700" },
  pending: { label: "En attente", cls: "bg-amber-500/10 text-amber-700" },
  failed: { label: "Échoué", cls: "bg-red-500/10 text-red-600" },
} as const;

export default function AdminPayments() {
  const [status, setStatus] = useState<"" | "success" | "pending" | "failed">("");
  const { data, isLoading } = useGetAdminSubscriptions(status || undefined);
  const paid = (data ?? []).filter((s) => s.status === "success" && !s.grantedByAdmin);
  const total = paid.reduce((sum, s) => sum + s.amount, 0);

  return (
    <AdminLayout>
      <PageHeader title="Paiements" description="Abonnements Pro payés, en attente ou offerts (200 derniers)." />
      <div className="mb-4 flex flex-wrap items-center gap-2">
        {([["", "Tous"], ["success", "Payés"], ["pending", "En attente"], ["failed", "Échoués"]] as const).map(([v, l]) => (
          <button key={v} onClick={() => setStatus(v)} className={`rounded-full px-4 py-2 text-sm font-medium ${status === v ? "bg-foreground text-background" : "border bg-card hover:bg-muted"}`}>{l}</button>
        ))}
        {paid.length > 0 && <span className="ml-auto text-sm text-muted-foreground">Total affiché : <strong className="text-foreground">{formatNumber(total)} FCFA</strong></span>}
      </div>
      <Panel padded={false}>
        {!isLoading && (data ?? []).length === 0 ? (
          <EmptyState icon={CreditCard} title="Aucun paiement" />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b bg-muted/40 text-left text-xs uppercase tracking-wider text-muted-foreground">
                <tr>
                  <th className="px-4 py-3 font-semibold">Date</th>
                  <th className="px-4 py-3 font-semibold">Utilisateur</th>
                  <th className="px-4 py-3 font-semibold">Formule</th>
                  <th className="px-4 py-3 text-right font-semibold">Montant</th>
                  <th className="hidden px-4 py-3 font-semibold md:table-cell">Opérateur</th>
                  <th className="px-4 py-3 font-semibold">Statut</th>
                  <th className="hidden px-4 py-3 font-semibold lg:table-cell">Expire le</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {(data ?? []).map((s) => (
                  <tr key={s.id} className="hover:bg-muted/30">
                    <td className="whitespace-nowrap px-4 py-3">{new Date(s.createdAt).toLocaleDateString("fr-FR")}</td>
                    <td className="px-4 py-3">
                      <Link href={`/admin/utilisateurs?id=${s.userId}`} className="font-medium hover:text-primary">{s.username}</Link>
                      <p className="text-xs text-muted-foreground">{s.email}</p>
                    </td>
                    <td className="px-4 py-3">{s.grantedByAdmin ? "Offert" : s.period === "yearly" ? "Annuel" : "Mensuel"}</td>
                    <td className="whitespace-nowrap px-4 py-3 text-right font-medium">{formatNumber(s.amount)} F</td>
                    <td className="hidden px-4 py-3 uppercase text-muted-foreground md:table-cell">{s.grantedByAdmin ? "—" : `${s.operator} · ${s.phoneNumber}`}</td>
                    <td className="px-4 py-3"><span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${STATUS[s.status].cls}`}>{STATUS[s.status].label}</span></td>
                    <td className="hidden whitespace-nowrap px-4 py-3 text-muted-foreground lg:table-cell">{s.expiresAt ? new Date(s.expiresAt).toLocaleDateString("fr-FR") : "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Panel>
    </AdminLayout>
  );
}
