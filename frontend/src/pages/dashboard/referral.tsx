import { useGetReferralStats, useGetCommissions, useRequestWithdrawal, getGetReferralStatsQueryKey, getGetCommissionsQueryKey } from "@workspace/api-client-react";
import { DashboardLayout } from "@/components/dashboard-layout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Copy, Users, Wallet, CreditCard, ArrowRightLeft } from "lucide-react";
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useQueryClient } from "@tanstack/react-query";

export default function Referral() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const MOCK_STATS = {
    referralCode: "REF-JEAN42",
    referralLink: `${window.location.origin}/inscription?ref=REF-JEAN42`,
    totalReferrals: 5,
    activeReferrals: 3,
    walletBalance: 108,
    totalEarned: 216,
    totalWithdrawn: 108,
  };

  const MOCK_COMMISSIONS = [
    { id: 1, refereeId: 2, refereeUsername: "aminata-k", amount: 36, month: "2025-04", status: "paid" as const, createdAt: "2025-04-01" },
    { id: 2, refereeId: 3, refereeUsername: "kofi-mensah", amount: 36, month: "2025-04", status: "paid" as const, createdAt: "2025-04-01" },
    { id: 3, refereeId: 4, refereeUsername: "fatou-d", amount: 36, month: "2025-05", status: "pending" as const, createdAt: "2025-05-01" },
  ];

  const { data: fetchedStats } = useGetReferralStats({
    query: { queryKey: getGetReferralStatsQueryKey(), retry: false, placeholderData: MOCK_STATS },
  });
  const { data: fetchedCommissions } = useGetCommissions({
    query: { queryKey: getGetCommissionsQueryKey(), retry: false, placeholderData: MOCK_COMMISSIONS },
  });

  const stats = fetchedStats ?? MOCK_STATS;
  const commissions = fetchedCommissions ?? MOCK_COMMISSIONS;
  const withdrawMutation = useRequestWithdrawal();
  
  const [withdrawAmount, setWithdrawAmount] = useState("");
  const [withdrawMethod, setWithdrawMethod] = useState<"mobile_money" | "subscription_credit">("mobile_money");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const copyReferralLink = () => {
    if (stats?.referralLink) {
      navigator.clipboard.writeText(stats.referralLink);
      toast({ title: "Lien copié !", description: "Partagez ce lien pour parrainer vos amis." });
    }
  };

  const handleWithdrawal = () => {
    const amount = parseInt(withdrawAmount);
    if (isNaN(amount) || amount < 500) {
      toast({ title: "Montant invalide", description: "Le minimum de retrait est de 500 FCFA.", variant: "destructive" });
      return;
    }
    
    if (stats && amount > stats.walletBalance) {
      toast({ title: "Fonds insuffisants", description: "Votre solde est inférieur au montant demandé.", variant: "destructive" });
      return;
    }

    if (withdrawMethod === "mobile_money" && !phoneNumber) {
      toast({ title: "Numéro requis", description: "Veuillez entrer votre numéro Mobile Money.", variant: "destructive" });
      return;
    }

    withdrawMutation.mutate({
      data: {
        amount,
        method: withdrawMethod,
        phoneNumber: withdrawMethod === "mobile_money" ? phoneNumber : undefined
      }
    }, {
      onSuccess: () => {
        toast({ title: "Demande envoyée", description: "Votre demande de retrait a été enregistrée." });
        setIsDialogOpen(false);
        queryClient.invalidateQueries({ queryKey: getGetReferralStatsQueryKey() });
      },
      onError: (error: any) => {
        toast({ title: "Erreur", description: error?.data?.message || "Impossible de traiter la demande.", variant: "destructive" });
      }
    });
  };

  if (false) {
    return (
      <DashboardLayout>
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-muted rounded w-1/4"></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="h-32 bg-muted rounded-xl"></div>
            <div className="h-32 bg-muted rounded-xl"></div>
            <div className="h-32 bg-muted rounded-xl"></div>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="mb-8">
        <h1 className="text-3xl font-bold font-display">Parrainage</h1>
        <p className="text-muted-foreground mt-1">Gagnez des commissions en invitant d'autres freelances.</p>
      </div>

      {/* Bloc explication gains */}
      <div className="bg-card border rounded-2xl p-5 mb-8 grid sm:grid-cols-3 gap-4 text-center">
        <div className="p-3">
          <p className="text-2xl font-black text-primary">36 FCFA</p>
          <p className="text-xs text-muted-foreground mt-1">par ami abonné / mois</p>
        </div>
        <div className="p-3 border-x">
          <p className="text-2xl font-black text-primary">360 FCFA</p>
          <p className="text-xs text-muted-foreground mt-1">si 10 amis = 1 an gratuit</p>
        </div>
        <div className="p-3">
          <p className="text-2xl font-black text-primary">Sans limite</p>
          <p className="text-xs text-muted-foreground mt-1">de filleuls possibles</p>
        </div>
      </div>

      {stats && (
        <Card className="mb-8 border-primary/20 bg-primary/5">
          <CardHeader>
            <CardTitle>Votre lien de parrainage</CardTitle>
            <CardDescription>Partagez ce lien et gagnez des commissions pour chaque abonnement Premium.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="bg-background border rounded-md px-4 py-2 flex-1 font-mono text-sm overflow-hidden text-ellipsis whitespace-nowrap">
                {stats.referralLink}
              </div>
              <Button onClick={copyReferralLink} className="gap-2 shrink-0">
                <Copy className="w-4 h-4" /> Copier le lien
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Filleuls Inscrits</CardTitle>
            <Users className="w-4 h-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.totalReferrals || 0}</div>
            <p className="text-xs text-muted-foreground mt-1">{stats?.activeReferrals || 0} actifs (Premium)</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Gains Totaux</CardTitle>
            <Wallet className="w-4 h-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.totalEarned || 0} FCFA</div>
            <p className="text-xs text-muted-foreground mt-1">{stats?.totalWithdrawn || 0} FCFA retirés</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Solde Disponible</CardTitle>
            <CreditCard className="w-4 h-4 text-primary" />
          </CardHeader>
          <CardContent className="flex justify-between items-end">
            <div>
              <div className="text-2xl font-bold">{stats?.walletBalance || 0} FCFA</div>
            </div>
            
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button size="sm" variant="secondary" disabled={!stats || stats.walletBalance < 500}>
                  Retirer
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Demander un retrait</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label>Montant (FCFA)</Label>
                    <Input 
                      type="number" 
                      placeholder="500 minimum" 
                      value={withdrawAmount} 
                      onChange={(e) => setWithdrawAmount(e.target.value)} 
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Méthode de retrait</Label>
                    <Select value={withdrawMethod} onValueChange={(v: any) => setWithdrawMethod(v)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="mobile_money">Mobile Money</SelectItem>
                        <SelectItem value="subscription_credit">Crédit d'abonnement</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  {withdrawMethod === "mobile_money" && (
                    <div className="space-y-2">
                      <Label>Numéro de téléphone</Label>
                      <Input 
                        placeholder="Ex: +229..." 
                        value={phoneNumber} 
                        onChange={(e) => setPhoneNumber(e.target.value)} 
                      />
                    </div>
                  )}
                  <Button 
                    className="w-full" 
                    onClick={handleWithdrawal}
                    disabled={withdrawMutation.isPending}
                  >
                    {withdrawMutation.isPending ? "Traitement..." : "Confirmer le retrait"}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>

          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Historique des commissions</CardTitle>
        </CardHeader>
        <CardContent>
          {!commissions || commissions.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground text-sm">
              Aucune commission pour le moment. Partagez votre lien !
            </div>
          ) : (
            <div className="space-y-4">
              {commissions.map((comm) => (
                <div key={comm.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-4">
                    <div className="bg-primary/10 p-2 rounded-full text-primary">
                      <ArrowRightLeft className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="font-medium text-sm">Parrainage : @{comm.refereeUsername}</div>
                      <div className="text-xs text-muted-foreground">{new Date(comm.createdAt).toLocaleDateString()}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-primary">+{comm.amount} FCFA</div>
                    <div className={`text-xs capitalize ${
                      comm.status === "paid" ? "text-emerald-600" : "text-amber-600"
                    }`}>
                      {comm.status === "paid" ? "✅ Payé" : "⏳ En attente"}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </DashboardLayout>
  );
}
