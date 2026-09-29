import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { Check, Copy, Gift, Loader2, MessageCircle, UserPlus, Users, Wallet, X } from "lucide-react";
import {
  getGetReferralStatsQueryKey, useGetCommissions, useGetPlans, useGetReferralStats, useRequestWithdrawal,
} from "@workspace/api-client-react";
import { DashboardLayout } from "@/components/dashboard-layout";
import { EmptyState, FormField, PageHeader, Panel, StatCard, fieldCls } from "@/components/dashboard/ui";
import { useToast } from "@/hooks/use-toast";
import { copyText, whatsappShare } from "@/lib/share";
import { formatNumber } from "@/lib/utils";

const MIN_WITHDRAWAL = 500;

export default function Referral() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { data: stats } = useGetReferralStats();
  const { data: commissions } = useGetCommissions();
  const { data: plans } = useGetPlans();
  const [copied, setCopied] = useState(false);
  const [open, setOpen] = useState(false);
  const [amount, setAmount] = useState("");
  const [method, setMethod] = useState<"mobile_money" | "subscription_credit">("mobile_money");
  const [phone, setPhone] = useState("");

  const withdraw = useRequestWithdrawal({
    onSuccess: () => {
      toast({ title: "Demande envoyée", description: "Elle sera traitée sous 72 h." });
      setOpen(false);
      setAmount("");
      queryClient.invalidateQueries({ queryKey: getGetReferralStatsQueryKey() });
    },
    onError: (e: any) => toast({ title: "Demande refusée", description: e?.message, variant: "destructive" }),
  });

  const rate = plans?.commissionRate ?? 0.1;
  const link = stats?.referralLink ?? "";
  const invite = `Je crée mon portfolio pro avec AfriFolio : en 5 minutes, ta page avec tes réalisations, tes prix et ton WhatsApp. Essaie gratuitement : ${link}`;

  return (
    <DashboardLayout>
      <PageHeader title="Parrainage" description={`Invitez d'autres professionnels et gagnez ${Math.round(rate * 100)} % de chacun de leurs paiements Pro.`} />

      <section className="rounded-3xl border bg-gradient-to-br from-primary/10 via-card to-card p-5 sm:p-7">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="flex items-center gap-2 text-sm font-semibold text-primary"><Gift className="h-4 w-4" /> Votre lien d'invitation</p>
            <p className="mt-2 break-all font-mono text-sm sm:text-base">{link || "…"}</p>
            <p className="mt-1 text-sm text-muted-foreground">Code : <strong>{stats?.referralCode}</strong></p>
          </div>
          <div className="grid shrink-0 grid-cols-2 gap-2">
            <a href={whatsappShare(invite)} target="_blank" rel="noreferrer" className="col-span-2 inline-flex items-center justify-center gap-2 rounded-xl bg-[#25D366] px-5 py-3 text-sm font-semibold text-white sm:col-span-1">
              <MessageCircle className="h-4 w-4" /> Inviter sur WhatsApp
            </a>
            <button
              onClick={async () => {
                if (await copyText(link)) {
                  setCopied(true);
                  setTimeout(() => setCopied(false), 2000);
                }
              }}
              className="col-span-2 inline-flex items-center justify-center gap-2 rounded-xl border bg-card px-5 py-3 text-sm font-semibold hover:bg-muted sm:col-span-1"
            >
              {copied ? <Check className="h-4 w-4 text-emerald-600" /> : <Copy className="h-4 w-4" />} {copied ? "Copié" : "Copier le lien"}
            </button>
          </div>
        </div>
        <ol className="mt-6 grid gap-3 border-t pt-6 text-sm sm:grid-cols-3">
          {["Partagez votre lien à des collègues, amis, clients pros", "Ils créent leur portfolio gratuitement", `Quand ils passent Pro, vous gagnez ${Math.round(rate * 100)} % de chaque paiement`].map((s, i) => (
            <li key={i} className="flex gap-3">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">{i + 1}</span>
              <span className="text-muted-foreground">{s}</span>
            </li>
          ))}
        </ol>
      </section>

      <div className="mt-6 grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
        <StatCard label="Inscrits via vous" value={stats?.totalReferrals ?? "–"} icon={UserPlus} />
        <StatCard label="Filleuls Pro" value={stats?.activeReferrals ?? "–"} icon={Users} tone="green" />
        <StatCard label="Gains totaux" value={`${formatNumber(stats?.totalEarned ?? 0)} F`} icon={Gift} tone="amber" />
        <StatCard label="Solde disponible" value={`${formatNumber(stats?.walletBalance ?? 0)} F`} icon={Wallet} tone="blue" hint={`${formatNumber(stats?.totalWithdrawn ?? 0)} F retirés`} />
      </div>

      <div className="mt-6 grid grid-cols-[minmax(0,1fr)] gap-6 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,0.8fr)]">
        <Panel title="Commissions" padded={false}>
          {!commissions || commissions.length === 0 ? (
            <EmptyState icon={Gift} title="Pas encore de commission" description="Vos gains apparaîtront ici dès qu'un filleul passera Pro." />
          ) : (
            <ul className="divide-y">
              {commissions.map((c) => (
                <li key={c.id} className="flex items-center justify-between px-5 py-3 text-sm">
                  <span>
                    <span className="font-medium">{c.refereeUsername}</span>
                    <span className="ml-2 text-muted-foreground">{c.month}</span>
                  </span>
                  <span className="font-semibold text-emerald-600">+{formatNumber(c.amount)} F</span>
                </li>
              ))}
            </ul>
          )}
        </Panel>

        <Panel title="Retirer mes gains" description={`À partir de ${MIN_WITHDRAWAL} FCFA, par Mobile Money ou en mois d'abonnement Pro.`}>
          <button
            onClick={() => setOpen(true)}
            disabled={(stats?.walletBalance ?? 0) < MIN_WITHDRAWAL}
            className="w-full rounded-xl bg-foreground py-3 text-sm font-semibold text-background disabled:opacity-40"
          >
            Demander un retrait
          </button>
          {(stats?.walletBalance ?? 0) < MIN_WITHDRAWAL && (
            <p className="mt-3 text-center text-xs text-muted-foreground">Encore {formatNumber(MIN_WITHDRAWAL - (stats?.walletBalance ?? 0))} F avant votre premier retrait.</p>
          )}
        </Panel>
      </div>

      {open && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 sm:items-center sm:p-4" onClick={() => setOpen(false)}>
          <form
            onClick={(e) => e.stopPropagation()}
            onSubmit={(e) => {
              e.preventDefault();
              withdraw.mutate({ data: { amount: parseInt(amount), method, phoneNumber: method === "mobile_money" ? phone : undefined } });
            }}
            className="w-full max-w-md space-y-4 rounded-t-3xl bg-card p-6 sm:rounded-3xl"
          >
            <div className="flex items-center justify-between">
              <p className="text-lg font-bold">Demande de retrait</p>
              <button type="button" onClick={() => setOpen(false)} className="rounded-lg p-1.5 hover:bg-muted" aria-label="Fermer"><X className="h-5 w-5" /></button>
            </div>
            <FormField label="Montant (FCFA)" hint={`Solde disponible : ${formatNumber(stats?.walletBalance ?? 0)} F`}>
              <input type="number" min={MIN_WITHDRAWAL} max={stats?.walletBalance} required value={amount} onChange={(e) => setAmount(e.target.value)} className={fieldCls} />
            </FormField>
            <div className="grid grid-cols-2 gap-2">
              {([["mobile_money", "Mobile Money"], ["subscription_credit", "Mois de Pro"]] as const).map(([v, l]) => (
                <button key={v} type="button" onClick={() => setMethod(v)} className={`rounded-xl border-2 py-2.5 text-sm font-semibold ${method === v ? "border-primary bg-primary/5" : ""}`}>{l}</button>
              ))}
            </div>
            {method === "mobile_money" && (
              <FormField label="Numéro Mobile Money">
                <input type="tel" required value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+229 97 00 00 00" className={fieldCls} />
              </FormField>
            )}
            <button type="submit" disabled={withdraw.isPending} className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary py-3 font-semibold text-primary-foreground">
              {withdraw.isPending && <Loader2 className="h-4 w-4 animate-spin" />} Envoyer la demande
            </button>
          </form>
        </div>
      )}
    </DashboardLayout>
  );
}
