import { useAuth } from "@/contexts/auth";
import { DashboardLayout } from "@/components/dashboard-layout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useInitiatePayment } from "@workspace/api-client-react";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ShieldCheck, Check, FlaskConical } from "lucide-react";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:3001";
const IS_DEV = import.meta.env.DEV;

export default function Subscription() {
  const { user, login, token } = useAuth();
  const { toast } = useToast();
  const paymentMutation = useInitiatePayment();
  const [simulating, setSimulating] = useState(false);
  const [operator, setOperator] = useState<"mtn" | "moov" | "wave">("mtn");
  const [phoneNumber, setPhoneNumber] = useState("");

  const handlePayment = () => {
    if (!phoneNumber) {
      toast({ title: "Numéro requis", description: "Veuillez entrer votre numéro de téléphone.", variant: "destructive" });
      return;
    }
    paymentMutation.mutate({ data: { operator, phoneNumber } }, {
      onSuccess: (response) => {
        if (response.paymentUrl) {
          window.location.href = response.paymentUrl;
        } else {
          toast({ title: "Paiement initié", description: "Veuillez valider le paiement sur votre téléphone." });
        }
      },
      onError: () => {
        toast({ title: "Erreur", description: "Impossible d'initier le paiement.", variant: "destructive" });
      }
    });
  };

  // DEV ONLY — simule un paiement réussi sans provider
  const handleSimulatePayment = async () => {
    setSimulating(true);
    try {
      const res = await fetch(`${API_BASE}/api/subscription/simulate-payment`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("portfolio_token")}`,
        },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);

      if (user && token) {
        login(token, { ...user, plan: "premium" });
      }

      toast({
        title: "✅ Paiement simulé",
        description: "Votre compte est maintenant Premium. Rechargez la page.",
      });

      setTimeout(() => window.location.reload(), 1500);
    } catch (err: any) {
      toast({ title: "Erreur", description: err.message, variant: "destructive" });
    } finally {
      setSimulating(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="mb-8">
        <h1 className="text-3xl font-bold font-display">Abonnement</h1>
        <p className="text-muted-foreground mt-1">Gérez votre plan et vos options de facturation.</p>
      </div>

      {/* Bannière DEV uniquement */}
      {IS_DEV && user?.plan !== "premium" && (
        <div className="mb-6 p-4 rounded-xl border border-dashed border-amber-400 bg-amber-50 dark:bg-amber-950/20 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <FlaskConical className="w-5 h-5 text-amber-600 shrink-0" />
            <div>
              <p className="font-semibold text-amber-800 dark:text-amber-400 text-sm">Mode développement</p>
              <p className="text-xs text-amber-700 dark:text-amber-500">Simulez un paiement réussi sans provider Mobile Money.</p>
            </div>
          </div>
          <Button
            variant="outline"
            size="sm"
            className="border-amber-400 text-amber-700 hover:bg-amber-100 gap-2 shrink-0"
            onClick={handleSimulatePayment}
            disabled={simulating}
          >
            <FlaskConical className="w-4 h-4" />
            {simulating ? "Simulation..." : "Simuler le paiement"}
          </Button>
        </div>
      )}

      {/* Plan Premium actif */}
      {user?.plan === "premium" && (
        <div className="grid md:grid-cols-2 gap-8 items-start">
          <Card className="border-emerald-500/30 bg-emerald-500/5">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-emerald-600">
                <ShieldCheck className="w-5 h-5" /> Plan Pro actif
              </CardTitle>
              <CardDescription>Vous bénéficiez de toutes les fonctionnalités premium.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <ul className="space-y-3">
                {["Projets illimités", "Thèmes premium", "Analytiques avancées", "Gains de parrainage"].map((feat, i) => (
                  <li key={i} className="flex items-center gap-2 text-sm">
                    <div className="bg-emerald-500/10 text-emerald-600 rounded-full p-1"><Check className="w-3 h-3" /></div>
                    {feat}
                  </li>
                ))}
              </ul>
              <div className="pt-4 border-t">
                <p className="text-xs text-muted-foreground">Renouvellement mensuel automatique</p>
                <p className="font-bold text-sm mt-1">360 FCFA / mois via Mobile Money</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Renouveler l'abonnement</CardTitle>
              <CardDescription>Payez le mois suivant via Mobile Money</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Opérateur</Label>
                <Select value={operator} onValueChange={(v: any) => setOperator(v)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="mtn">MTN Mobile Money</SelectItem>
                    <SelectItem value="moov">Moov Money</SelectItem>
                    <SelectItem value="wave">Wave</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Numéro de téléphone</Label>
                <Input placeholder="Ex: +229..." value={phoneNumber} onChange={(e) => setPhoneNumber(e.target.value)} />
              </div>
              <Button className="w-full" onClick={handlePayment} disabled={paymentMutation.isPending}>
                {paymentMutation.isPending ? "Initiation..." : "Payer 360 FCFA"}
              </Button>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Plan Free — formulaire de passage Pro */}
      {user?.plan !== "premium" && (
        <div className="grid md:grid-cols-2 gap-8 items-start">
          <Card className="border-primary">
            <CardHeader>
              <CardTitle>Passez au plan Pro</CardTitle>
              <CardDescription>Débloquez toutes les fonctionnalités pour 360 FCFA/mois.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="text-3xl font-bold font-display text-primary">
                  360 FCFA <span className="text-sm font-normal text-muted-foreground">/ mois</span>
                </div>
                <ul className="space-y-3">
                  {["Projets illimités", "Thèmes premium", "Analytiques avancées", "Gains de parrainage"].map((feat, i) => (
                    <li key={i} className="flex items-center gap-2 text-sm">
                      <div className="bg-primary/10 text-primary rounded-full p-1"><Check className="w-3 h-3" /></div>
                      {feat}
                    </li>
                  ))}
                </ul>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-primary" />
                Paiement Sécurisé
              </CardTitle>
              <CardDescription>
                Après le clic, vous recevrez une notification sur votre téléphone pour confirmer le paiement.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Opérateur</Label>
                <Select value={operator} onValueChange={(v: any) => setOperator(v)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="mtn">MTN Mobile Money</SelectItem>
                    <SelectItem value="moov">Moov Money</SelectItem>
                    <SelectItem value="wave">Wave</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Numéro de téléphone</Label>
                <Input placeholder="Ex: +229..." value={phoneNumber} onChange={(e) => setPhoneNumber(e.target.value)} />
              </div>
              <Button className="w-full" onClick={handlePayment} disabled={paymentMutation.isPending}>
                {paymentMutation.isPending ? "Initiation en cours..." : "Payer 360 FCFA — Devenir Pro"}
              </Button>
              <p className="text-xs text-center text-muted-foreground">Vous recevrez une notification sur votre téléphone pour valider.</p>
            </CardContent>
          </Card>
        </div>
      )}
    </DashboardLayout>
  );
}
