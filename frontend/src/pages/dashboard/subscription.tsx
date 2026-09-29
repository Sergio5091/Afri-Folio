import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { BadgeCheck, BarChart3, Check, Images, Loader2, Palette, Smartphone, Sparkles, Zap } from "lucide-react";
import {
  getGetDashboardSummaryQueryKey, getGetSubscriptionHistoryQueryKey, useGetDashboardSummary, useGetPlans, useGetSubscriptionHistory,
  useInitiatePayment, useSimulatePayment,
} from "@workspace/api-client-react";
import { DashboardLayout } from "@/components/dashboard-layout";
import { FormField, PageHeader, Panel, fieldCls } from "@/components/dashboard/ui";
import { useAuth } from "@/contexts/auth";
import { useToast } from "@/hooks/use-toast";
import { formatNumber } from "@/lib/utils";

const OPERATORS = [
  { id: "mtn", name: "MTN MoMo", color: "#FFCC00", text: "#000" },
  { id: "moov", name: "Moov Money", color: "#0055A5", text: "#fff" },
  { id: "wave", name: "Wave", color: "#1DC8FF", text: "#003" },
] as const;

const PRO_FEATURES = [
  { icon: Images, title: "Photos illimitées", desc: "Montrez tout votre travail, sans limite." },
  { icon: BarChart3, title: "Statistiques complètes", desc: "30 et 90 jours, provenance des visiteurs, pays." },
  { icon: BadgeCheck, title: "Badge Pro vérifié", desc: "Plus de confiance, mis en avant dans l'annuaire." },
  { icon: Palette, title: "Couleur de votre marque", desc: "Une couleur sur mesure pour votre page." },
  { icon: Sparkles, title: "Sans mention AfriFolio", desc: "Votre page, 100 % à votre nom." },
  { icon: Zap, title: "Support prioritaire", desc: "Une réponse rapide sur WhatsApp." },
];

export default function Subscription() {
  const { user, refreshUser } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { data: plans } = useGetPlans();
  const { data: summary } = useGetDashboardSummary();
  const { data: history } = useGetSubscriptionHistory();
  const [period, setPeriod] = useState<"monthly" | "yearly">("yearly");
  const [operator, setOperator] = useState<"mtn" | "moov" | "wave">("mtn");
  const [phone, setPhone] = useState("");
  const [pending, setPending] = useState<string | null>(null);

  const isPro = user?.plan === "premium";
  const price = plans ? (period === "yearly" ? plans.yearly : plans.monthly) : null;
  const monthlyEquivalent = plans ? Math.round(plans.yearly / 12) : null;
  const saving = plans ? plans.monthly * 12 - plans.yearly : 0;

  const afterPayment = async () => {
    await refreshUser();
    queryClient.invalidateQueries({ queryKey: getGetDashboardSummaryQueryKey() });
    queryClient.invalidateQueries({ queryKey: getGetSubscriptionHistoryQueryKey() });
  };

  const pay = useInitiatePayment({
    onSuccess: (res) => {
      if (res.paymentUrl) window.location.href = res.paymentUrl;
      else setPending(res.message);
      queryClient.invalidateQueries({ queryKey: getGetSubscriptionHistoryQueryKey() });
    },
    onError: (e: any) => toast({ title: "Paiement impossible", description: e?.message, variant: "destructive" }),
  });
  const simulate = useSimulatePayment({
    onSuccess: async (res) => {
      await afterPayment();
      toast({ title: res.message });
    },
    onError: (e: any) => toast({ title: "Erreur", description: e?.message, variant: "destructive" }),
  });

  const expires = summary?.subscriptionExpiresAt ? new Date(summary.subscriptionExpiresAt) : null;

  return (
    <DashboardLayout>
      <PageHeader title="Abonnement" description="Paiement simple par Mobile Money. Sans carte bancaire, sans engagement." />

      {isPro && (
        <section className="mb-6 flex flex-col gap-4 rounded-2xl bg-gradient-to-r from-amber-500 to-primary p-6 text-white sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/20"><Sparkles className="h-6 w-6" /></span>
            <div>
              <p className="text-lg font-bold">Vous êtes Pro</p>
              <p className="text-sm text-white/85">{expires ? `Actif jusqu'au ${expires.toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" })}` : "Actif"}</p>
            </div>
          </div>
          <p className="text-sm text-white/85">Vous pouvez prolonger dès maintenant : la durée s'ajoute à la date actuelle.</p>
        </section>
      )}

      <div className="grid grid-cols-[minmax(0,1fr)] gap-6 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)]">
        <Panel title="AfriFolio Pro" description="Tout ce qu'il faut pour être pris au sérieux et trouver plus de clients.">
          <ul className="grid gap-4 sm:grid-cols-2">
            {PRO_FEATURES.map((f) => (
              <li key={f.title} className="flex gap-3">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary"><f.icon className="h-4 w-4" /></span>
                <span>
                  <span className="block text-sm font-semibold">{f.title}</span>
                  <span className="block text-sm text-muted-foreground">{f.desc}</span>
                </span>
              </li>
            ))}
          </ul>
          <div className="mt-6 rounded-xl bg-muted/60 p-4 text-sm">
            <p className="font-semibold">Plan gratuit</p>
            <p className="mt-1 text-muted-foreground">
              Page complète, tous les styles, contact WhatsApp et messages, jusqu'à {plans?.freeLimits.photos ?? 12} photos, statistiques sur 7 jours.
            </p>
          </div>
        </Panel>

        <Panel title={isPro ? "Prolonger mon abonnement" : "Passer Pro"}>
          <div className="grid grid-cols-2 gap-2 rounded-xl bg-muted p-1">
            {(["monthly", "yearly"] as const).map((p) => (
              <button key={p} onClick={() => setPeriod(p)} className={`relative rounded-lg py-2.5 text-sm font-semibold transition-colors ${period === p ? "bg-card shadow-sm" : "text-muted-foreground"}`}>
                {p === "monthly" ? "Mensuel" : "Annuel"}
                {p === "yearly" && saving > 0 && <span className="absolute -right-1 -top-2 rounded-full bg-emerald-500 px-1.5 py-0.5 text-[10px] font-bold text-white">-{Math.round((saving / (plans!.monthly * 12)) * 100)} %</span>}
              </button>
            ))}
          </div>

          <div className="mt-5 text-center">
            <p className="text-4xl font-extrabold tracking-tight">{price != null ? formatNumber(price) : "–"} <span className="text-lg font-semibold text-muted-foreground">FCFA</span></p>
            <p className="mt-1 text-sm text-muted-foreground">
              {period === "yearly" ? `soit ${formatNumber(monthlyEquivalent ?? 0)} F/mois · ${formatNumber(saving)} F d'économie` : "par mois, sans engagement"}
            </p>
          </div>

          {pending ? (
            <div className="mt-6 rounded-xl border border-amber-500/30 bg-amber-500/10 p-4 text-sm">
              <p className="flex items-center gap-2 font-semibold"><Smartphone className="h-4 w-4" /> Validez sur votre téléphone</p>
              <p className="mt-1 text-muted-foreground">{pending}</p>
              <button onClick={async () => { await afterPayment(); setPending(null); }} className="mt-3 font-semibold text-primary hover:underline">J'ai validé le paiement</button>
            </div>
          ) : (
            <form
              className="mt-6 space-y-4"
              onSubmit={(e) => {
                e.preventDefault();
                pay.mutate({ data: { operator, phoneNumber: phone, period } });
              }}
            >
              <div>
                <span className="mb-1.5 block text-sm font-medium">Opérateur</span>
                <div className="grid grid-cols-3 gap-2">
                  {OPERATORS.map((o) => (
                    <button
                      key={o.id}
                      type="button"
                      onClick={() => setOperator(o.id)}
                      className={`flex flex-col items-center gap-1.5 rounded-xl border-2 p-2.5 text-xs font-semibold transition-colors ${operator === o.id ? "border-foreground" : "border-transparent bg-muted/60"}`}
                    >
                      <span className="flex h-8 w-8 items-center justify-center rounded-full text-[10px] font-black" style={{ background: o.color, color: o.text }}>{o.name.charAt(0)}</span>
                      {o.name}
                    </button>
                  ))}
                </div>
              </div>
              <FormField label="Numéro Mobile Money">
                <input type="tel" required value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+229 97 00 00 00" className={fieldCls} />
              </FormField>
              <button type="submit" disabled={pay.isPending || phone.replace(/\D/g, "").length < 8} className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary py-3.5 font-semibold text-primary-foreground disabled:opacity-50">
                {pay.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
                Payer {price != null ? `${formatNumber(price)} FCFA` : ""}
              </button>
              {import.meta.env.DEV && (
                <button type="button" onClick={() => simulate.mutate({ period })} disabled={simulate.isPending} className="w-full rounded-xl border border-dashed py-2.5 text-xs font-medium text-muted-foreground hover:bg-muted">
                  Mode développement : simuler un paiement réussi
                </button>
              )}
            </form>
          )}
        </Panel>
      </div>

      {history && history.length > 0 && (
        <Panel title="Historique" className="mt-6" padded={false}>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b text-left text-muted-foreground">
                <tr>
                  <th className="px-5 py-3 font-medium">Date</th>
                  <th className="px-5 py-3 font-medium">Formule</th>
                  <th className="px-5 py-3 font-medium">Montant</th>
                  <th className="px-5 py-3 font-medium">Statut</th>
                  <th className="px-5 py-3 font-medium">Valable jusqu'au</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {history.map((h) => (
                  <tr key={h.id}>
                    <td className="whitespace-nowrap px-5 py-3">{new Date(h.createdAt).toLocaleDateString("fr-FR")}</td>
                    <td className="px-5 py-3">{h.grantedByAdmin ? "Offert" : h.period === "yearly" ? "Annuel" : "Mensuel"}</td>
                    <td className="whitespace-nowrap px-5 py-3">{formatNumber(h.amount)} F</td>
                    <td className="px-5 py-3">
                      <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${h.status === "success" ? "bg-emerald-500/10 text-emerald-700" : h.status === "pending" ? "bg-amber-500/10 text-amber-700" : "bg-red-500/10 text-red-600"}`}>
                        {h.status === "success" ? "Payé" : h.status === "pending" ? "En attente" : "Échoué"}
                      </span>
                    </td>
                    <td className="whitespace-nowrap px-5 py-3 text-muted-foreground">{h.expiresAt ? new Date(h.expiresAt).toLocaleDateString("fr-FR") : "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Panel>
      )}
    </DashboardLayout>
  );
}
