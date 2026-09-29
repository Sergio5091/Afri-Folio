import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { AlertTriangle, CheckCircle2, Loader2, X } from "lucide-react";
import { checkUsername, useChangeEmail, useChangePassword, useChangeUsername, useDeleteAccount } from "@workspace/api-client-react";
import { DashboardLayout } from "@/components/dashboard-layout";
import { FormField, PageHeader, Panel, fieldCls } from "@/components/dashboard/ui";
import { useAuth } from "@/contexts/auth";
import { useToast } from "@/hooks/use-toast";
import { slugify } from "@/lib/utils";

const btn = "inline-flex items-center justify-center gap-2 rounded-xl bg-foreground px-5 py-2.5 text-sm font-semibold text-background disabled:opacity-40";

export default function Account() {
  const { user, updateUser, logout } = useAuth();
  const { toast } = useToast();
  const [, navigate] = useLocation();

  // ── Adresse de la page ──
  const [username, setUsername] = useState(user?.username ?? "");
  const [check, setCheck] = useState<{ loading: boolean; ok: boolean | null; reason: string | null }>({ loading: false, ok: null, reason: null });
  useEffect(() => {
    if (!user || username === user.username || username.length < 3) {
      setCheck({ loading: false, ok: null, reason: username.length < 3 ? "3 caractères minimum" : null });
      return;
    }
    setCheck({ loading: true, ok: null, reason: null });
    const t = setTimeout(async () => {
      try {
        const r = await checkUsername({ u: username });
        setCheck({ loading: false, ok: r.available, reason: r.reason });
      } catch {
        setCheck({ loading: false, ok: null, reason: null });
      }
    }, 350);
    return () => clearTimeout(t);
  }, [username, user]);
  const changeUsername = useChangeUsername({
    onSuccess: (u) => {
      updateUser(u);
      toast({ title: "Adresse modifiée", description: `Votre page est maintenant sur /${u.username}. Pensez à partager le nouveau lien.` });
    },
    onError: (e: any) => toast({ title: "Erreur", description: e?.message, variant: "destructive" }),
  });

  // ── Email ──
  const [email, setEmail] = useState(user?.email ?? "");
  const [emailPwd, setEmailPwd] = useState("");
  const changeEmail = useChangeEmail({
    onSuccess: (u) => {
      updateUser(u);
      setEmailPwd("");
      toast({ title: "Email modifié" });
    },
    onError: (e: any) => toast({ title: "Erreur", description: e?.message, variant: "destructive" }),
  });

  // ── Mot de passe ──
  const [pwd, setPwd] = useState({ current: "", next: "" });
  const changePassword = useChangePassword({
    onSuccess: () => {
      setPwd({ current: "", next: "" });
      toast({ title: "Mot de passe modifié" });
    },
    onError: (e: any) => toast({ title: "Erreur", description: e?.message, variant: "destructive" }),
  });

  // ── Suppression ──
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deletePwd, setDeletePwd] = useState("");
  const deleteAccount = useDeleteAccount({
    onSuccess: () => {
      logout();
      navigate("/");
    },
    onError: (e: any) => toast({ title: "Erreur", description: e?.message, variant: "destructive" }),
  });

  return (
    <DashboardLayout>
      <PageHeader title="Paramètres du compte" />
      <div className="max-w-2xl space-y-6">
        <Panel title="Adresse de votre page" description="Attention : l'ancien lien ne fonctionnera plus.">
          <form onSubmit={(e) => { e.preventDefault(); changeUsername.mutate({ username }); }} className="space-y-3">
            <div className={`flex items-center overflow-hidden rounded-xl border bg-background focus-within:border-primary ${check.ok === false ? "border-destructive" : ""}`}>
              <span className="pl-3.5 text-[15px] text-muted-foreground">{window.location.host}/</span>
              <input value={username} onChange={(e) => setUsername(slugify(e.target.value))} className="min-w-0 flex-1 bg-transparent py-2.5 pr-3 text-[15px] font-semibold outline-none" />
              <span className="pr-3">
                {check.loading ? <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" /> : check.ok ? <CheckCircle2 className="h-4 w-4 text-emerald-600" /> : check.ok === false ? <X className="h-4 w-4 text-destructive" /> : null}
              </span>
            </div>
            {check.reason && username !== user?.username && <p className="text-xs text-destructive">{check.reason}</p>}
            <button type="submit" disabled={!check.ok || changeUsername.isPending} className={btn}>
              {changeUsername.isPending && <Loader2 className="h-4 w-4 animate-spin" />} Changer l'adresse
            </button>
          </form>
        </Panel>

        <Panel title="Email de connexion">
          <form onSubmit={(e) => { e.preventDefault(); changeEmail.mutate({ email, password: emailPwd }); }} className="grid gap-4 sm:grid-cols-2">
            <FormField label="Nouvel email">
              <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className={fieldCls} />
            </FormField>
            <FormField label="Mot de passe actuel">
              <input type="password" required value={emailPwd} onChange={(e) => setEmailPwd(e.target.value)} className={fieldCls} autoComplete="current-password" />
            </FormField>
            <div className="sm:col-span-2">
              <button type="submit" disabled={email === user?.email || !emailPwd || changeEmail.isPending} className={btn}>Modifier l'email</button>
            </div>
          </form>
        </Panel>

        <Panel title="Mot de passe">
          <form onSubmit={(e) => { e.preventDefault(); changePassword.mutate({ currentPassword: pwd.current, newPassword: pwd.next }); }} className="grid gap-4 sm:grid-cols-2">
            <FormField label="Mot de passe actuel">
              <input type="password" required value={pwd.current} onChange={(e) => setPwd({ ...pwd, current: e.target.value })} className={fieldCls} autoComplete="current-password" />
            </FormField>
            <FormField label="Nouveau mot de passe" hint="6 caractères minimum">
              <input type="password" required minLength={6} value={pwd.next} onChange={(e) => setPwd({ ...pwd, next: e.target.value })} className={fieldCls} autoComplete="new-password" />
            </FormField>
            <div className="sm:col-span-2">
              <button type="submit" disabled={!pwd.current || pwd.next.length < 6 || changePassword.isPending} className={btn}>Changer le mot de passe</button>
            </div>
          </form>
        </Panel>

        <Panel title="Zone sensible" className="border-destructive/30">
          {!deleteOpen ? (
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-sm text-muted-foreground">Supprimer définitivement votre compte, votre page et vos messages.</p>
              <button onClick={() => setDeleteOpen(true)} className="rounded-xl border border-destructive/40 px-4 py-2.5 text-sm font-semibold text-destructive hover:bg-destructive/10">Supprimer mon compte</button>
            </div>
          ) : (
            <form onSubmit={(e) => { e.preventDefault(); deleteAccount.mutate({ password: deletePwd }); }} className="space-y-3">
              <p className="flex items-start gap-2 text-sm text-destructive"><AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" /> Cette action est irréversible. Votre page disparaîtra immédiatement.</p>
              <FormField label="Confirmez avec votre mot de passe">
                <input type="password" required value={deletePwd} onChange={(e) => setDeletePwd(e.target.value)} className={fieldCls} />
              </FormField>
              <div className="flex gap-2">
                <button type="submit" disabled={!deletePwd || deleteAccount.isPending} className="rounded-xl bg-destructive px-4 py-2.5 text-sm font-semibold text-destructive-foreground disabled:opacity-40">Supprimer définitivement</button>
                <button type="button" onClick={() => setDeleteOpen(false)} className="rounded-xl px-4 py-2.5 text-sm font-medium hover:bg-muted">Annuler</button>
              </div>
            </form>
          )}
        </Panel>
      </div>
    </DashboardLayout>
  );
}
