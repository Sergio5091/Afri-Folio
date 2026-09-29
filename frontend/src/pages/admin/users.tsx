import { useEffect, useState } from "react";
import { useSearch } from "wouter";
import { useQueryClient } from "@tanstack/react-query";
import { Ban, Crown, ExternalLink, Loader2, MessageCircle, Search, Star, Trash2, UserCheck } from "lucide-react";
import {
  useDeleteAdminUser, useGetAdminUser, useGetAdminUsers, useSetUserPremium, useUpdateAdminUser,
} from "@workspace/api-client-react";
import { AdminLayout } from "@/components/admin-layout";
import { PageHeader, Panel } from "@/components/dashboard/ui";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { useToast } from "@/hooks/use-toast";
import { professionLabel } from "@/lib/professions";
import { whatsappLink } from "@/lib/portfolio";
import { formatNumber, timeAgo } from "@/lib/utils";

const selectCls = "rounded-xl border bg-card px-3 py-2.5 text-sm outline-none focus:border-primary";

function UserDetail({ id, onClose }: { id: number; onClose: () => void }) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { data, isLoading } = useGetAdminUser(id);
  const [months, setMonths] = useState(1);
  const refresh = () => queryClient.invalidateQueries({ queryKey: ["admin"] });
  const onDone = (msg: string) => { toast({ title: msg }); refresh(); };
  const onErr = (e: any) => toast({ title: "Erreur", description: e?.message, variant: "destructive" });

  const update = useUpdateAdminUser({ onSuccess: (r) => onDone(r.message), onError: onErr });
  const premium = useSetUserPremium({ onSuccess: (r) => onDone(r.message), onError: onErr });
  const remove = useDeleteAdminUser({ onSuccess: (r) => { onDone(r.message); onClose(); }, onError: onErr });

  if (isLoading || !data) return <div className="flex justify-center py-20"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>;
  const { user, profile, stats, subscriptions } = data;
  const wa = whatsappLink(profile?.whatsapp, `Bonjour ${profile?.fullName ?? ""}, c'est l'équipe AfriFolio. `);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        {profile?.photoUrl ? <img src={profile.photoUrl} alt="" className="h-16 w-16 rounded-full object-cover" /> : <span className="flex h-16 w-16 items-center justify-center rounded-full bg-muted text-xl font-bold">{(profile?.fullName ?? user.username).charAt(0).toUpperCase()}</span>}
        <div className="min-w-0">
          <p className="truncate text-lg font-bold">{profile?.fullName || user.username}</p>
          <p className="truncate text-sm text-muted-foreground">{professionLabel(profile?.profession, profile?.professionCustom)}{profile?.city ? ` · ${profile.city}` : ""}</p>
          <div className="mt-1.5 flex flex-wrap gap-1.5">
            <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${user.plan === "premium" ? "bg-amber-500/10 text-amber-700" : "bg-muted text-muted-foreground"}`}>{user.plan === "premium" ? "Pro" : "Gratuit"}</span>
            {user.status === "suspended" && <span className="rounded-full bg-red-500/10 px-2 py-0.5 text-xs font-semibold text-red-600">Suspendu</span>}
            {profile?.isFeatured && <span className="rounded-full bg-sky-500/10 px-2 py-0.5 text-xs font-semibold text-sky-700">Mis en avant</span>}
            {user.isAdmin && <span className="rounded-full bg-foreground px-2 py-0.5 text-xs font-semibold text-background">Admin</span>}
          </div>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        <a href={`/${user.username}`} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 rounded-lg border px-3 py-2 text-sm font-medium hover:bg-muted"><ExternalLink className="h-4 w-4" /> Voir la page</a>
        {wa && <a href={wa} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 rounded-lg bg-[#25D366] px-3 py-2 text-sm font-medium text-white"><MessageCircle className="h-4 w-4" /> WhatsApp</a>}
      </div>

      <dl className="grid grid-cols-3 gap-2 text-center">
        {[
          ["Visites", stats.totalViews], ["30 j", stats.views30d], ["Contacts", stats.contactClicks],
          ["Messages", stats.totalLeads], ["Sections", stats.blocks], ["Filleuls", stats.referrals],
        ].map(([l, v]) => (
          <div key={l as string} className="rounded-xl border p-3"><dd className="text-lg font-bold">{formatNumber(v as number)}</dd><dt className="text-xs text-muted-foreground">{l}</dt></div>
        ))}
      </dl>

      <dl className="space-y-2 rounded-xl bg-muted/50 p-4 text-sm">
        <div className="flex justify-between gap-4"><dt className="text-muted-foreground">Email</dt><dd className="truncate font-medium">{user.email}</dd></div>
        <div className="flex justify-between gap-4"><dt className="text-muted-foreground">WhatsApp</dt><dd className="font-medium">{profile?.whatsapp ?? "—"}</dd></div>
        <div className="flex justify-between gap-4"><dt className="text-muted-foreground">Inscrit</dt><dd className="font-medium">{new Date(user.createdAt).toLocaleDateString("fr-FR")}</dd></div>
        <div className="flex justify-between gap-4"><dt className="text-muted-foreground">Dernière connexion</dt><dd className="font-medium">{user.lastLoginAt ? timeAgo(user.lastLoginAt) : "—"}</dd></div>
        <div className="flex justify-between gap-4"><dt className="text-muted-foreground">Parrain</dt><dd className="font-medium">{user.referrer?.username ?? "—"}</dd></div>
      </dl>

      <Panel title="Abonnement Pro">
        <div className="flex flex-wrap items-center gap-2">
          <select value={months} onChange={(e) => setMonths(Number(e.target.value))} className={selectCls}>
            {[1, 3, 6, 12].map((m) => <option key={m} value={m}>{m} mois</option>)}
          </select>
          <button onClick={() => premium.mutate({ id: user.id, months })} disabled={premium.isPending} className="inline-flex items-center gap-1.5 rounded-xl bg-amber-500 px-4 py-2.5 text-sm font-semibold text-white">
            <Crown className="h-4 w-4" /> Offrir
          </button>
          {user.plan === "premium" && (
            <button onClick={() => window.confirm("Retirer le Pro à cet utilisateur ?") && premium.mutate({ id: user.id, months: 0 })} className="rounded-xl border px-4 py-2.5 text-sm font-medium hover:bg-muted">Retirer le Pro</button>
          )}
        </div>
        {subscriptions.length > 0 && (
          <ul className="mt-4 divide-y text-sm">
            {subscriptions.slice(0, 5).map((s) => (
              <li key={s.id} className="flex justify-between gap-2 py-2">
                <span>{new Date(s.createdAt).toLocaleDateString("fr-FR")} · {s.grantedByAdmin ? "Offert" : `${formatNumber(s.amount)} F (${s.operator.toUpperCase()})`}</span>
                <span className={s.status === "success" ? "text-emerald-600" : s.status === "pending" ? "text-amber-600" : "text-red-500"}>{s.status === "success" ? "Payé" : s.status === "pending" ? "En attente" : "Échoué"}</span>
              </li>
            ))}
          </ul>
        )}
      </Panel>

      <div className="grid gap-2">
        <button onClick={() => update.mutate({ id: user.id, data: { isFeatured: !profile?.isFeatured } })} className="inline-flex items-center justify-center gap-2 rounded-xl border px-4 py-2.5 text-sm font-medium hover:bg-muted">
          <Star className="h-4 w-4" /> {profile?.isFeatured ? "Ne plus mettre en avant" : "Mettre en avant (accueil & annuaire)"}
        </button>
        {!user.isAdmin && (
          <button
            onClick={() => update.mutate({ id: user.id, data: { status: user.status === "suspended" ? "active" : "suspended" } })}
            className={`inline-flex items-center justify-center gap-2 rounded-xl border px-4 py-2.5 text-sm font-medium ${user.status === "suspended" ? "hover:bg-muted" : "border-amber-500/40 text-amber-700 hover:bg-amber-500/10"}`}
          >
            {user.status === "suspended" ? <><UserCheck className="h-4 w-4" /> Réactiver le compte</> : <><Ban className="h-4 w-4" /> Suspendre (page masquée, connexion bloquée)</>}
          </button>
        )}
        {!user.isAdmin && (
          <button
            onClick={() => window.confirm(`Supprimer définitivement ${user.username} et toutes ses données ?`) && remove.mutate({ id: user.id })}
            className="inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-medium text-destructive hover:bg-destructive/10"
          >
            <Trash2 className="h-4 w-4" /> Supprimer le compte
          </button>
        )}
      </div>
    </div>
  );
}

export default function AdminUsers() {
  const search = useSearch();
  const initialId = Number(new URLSearchParams(search).get("id")) || null;
  const [q, setQ] = useState("");
  const [debounced, setDebounced] = useState("");
  const [plan, setPlan] = useState("");
  const [status, setStatus] = useState("");
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState<number | null>(initialId);

  useEffect(() => {
    const t = setTimeout(() => { setDebounced(q); setPage(1); }, 300);
    return () => clearTimeout(t);
  }, [q]);

  const { data, isLoading } = useGetAdminUsers({ search: debounced || undefined, plan: plan || undefined, status: status || undefined, page, limit: 25 });

  return (
    <AdminLayout>
      <PageHeader title="Utilisateurs" description={data ? `${formatNumber(data.total)} compte(s)` : undefined} />

      <div className="mb-4 flex flex-col gap-2 sm:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Nom, email, identifiant, ville..." className="w-full rounded-xl border bg-card py-2.5 pl-10 pr-3 text-sm outline-none focus:border-primary" />
        </div>
        <select value={plan} onChange={(e) => { setPlan(e.target.value); setPage(1); }} className={selectCls}>
          <option value="">Tous les plans</option>
          <option value="free">Gratuit</option>
          <option value="premium">Pro</option>
        </select>
        <select value={status} onChange={(e) => { setStatus(e.target.value); setPage(1); }} className={selectCls}>
          <option value="">Tous les statuts</option>
          <option value="active">Actifs</option>
          <option value="suspended">Suspendus</option>
        </select>
      </div>

      <Panel padded={false}>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="border-b bg-muted/40 text-left text-xs uppercase tracking-wider text-muted-foreground">
              <tr>
                <th className="px-4 py-3 font-semibold">Utilisateur</th>
                <th className="hidden px-4 py-3 font-semibold md:table-cell">Métier</th>
                <th className="px-4 py-3 font-semibold">Plan</th>
                <th className="hidden px-4 py-3 text-right font-semibold sm:table-cell">Visites</th>
                <th className="hidden px-4 py-3 text-right font-semibold lg:table-cell">Messages</th>
                <th className="hidden px-4 py-3 font-semibold lg:table-cell">Inscription</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {isLoading && Array.from({ length: 6 }).map((_, i) => (
                <tr key={i}><td colSpan={6} className="px-4 py-3"><div className="h-8 animate-pulse rounded bg-muted" /></td></tr>
              ))}
              {data?.users.map((u) => (
                <tr key={u.id} onClick={() => setSelected(u.id)} className="cursor-pointer hover:bg-muted/40">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      {u.photoUrl ? <img src={u.photoUrl} alt="" className="h-9 w-9 rounded-full object-cover" /> : <span className="flex h-9 w-9 items-center justify-center rounded-full bg-muted text-sm font-bold">{(u.fullName ?? u.username).charAt(0).toUpperCase()}</span>}
                      <div className="min-w-0">
                        <p className="flex items-center gap-1.5 truncate font-semibold">
                          {u.fullName || u.username}
                          {u.isFeatured && <Star className="h-3.5 w-3.5 fill-sky-500 text-sky-500" />}
                          {u.status === "suspended" && <span className="rounded bg-red-500/10 px-1.5 text-[10px] font-bold text-red-600">SUSPENDU</span>}
                        </p>
                        <p className="truncate text-xs text-muted-foreground">{u.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="hidden px-4 py-3 text-muted-foreground md:table-cell">{professionLabel(u.profession, u.professionCustom)}{u.city ? ` · ${u.city}` : ""}</td>
                  <td className="px-4 py-3"><span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${u.plan === "premium" ? "bg-amber-500/10 text-amber-700" : "bg-muted text-muted-foreground"}`}>{u.plan === "premium" ? "Pro" : "Gratuit"}</span></td>
                  <td className="hidden px-4 py-3 text-right sm:table-cell">{formatNumber(u.totalViews)}</td>
                  <td className="hidden px-4 py-3 text-right lg:table-cell">{formatNumber(u.totalLeads)}</td>
                  <td className="hidden whitespace-nowrap px-4 py-3 text-muted-foreground lg:table-cell">{new Date(u.createdAt).toLocaleDateString("fr-FR")}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {data && data.total > data.limit && (
          <div className="flex items-center justify-between border-t px-4 py-3 text-sm">
            <span className="text-muted-foreground">Page {page} / {Math.ceil(data.total / data.limit)}</span>
            <div className="flex gap-2">
              <button disabled={page <= 1} onClick={() => setPage(page - 1)} className="rounded-lg border px-3 py-1.5 disabled:opacity-40">Précédent</button>
              <button disabled={page * data.limit >= data.total} onClick={() => setPage(page + 1)} className="rounded-lg border px-3 py-1.5 disabled:opacity-40">Suivant</button>
            </div>
          </div>
        )}
      </Panel>

      <Sheet open={selected != null} onOpenChange={(o) => !o && setSelected(null)}>
        <SheetContent side="right" className="w-full overflow-y-auto sm:max-w-md">
          <SheetHeader className="mb-4 flex-row items-center justify-between space-y-0 text-left">
            <SheetTitle>Fiche utilisateur</SheetTitle>
          </SheetHeader>
          {selected != null && <UserDetail id={selected} onClose={() => setSelected(null)} />}
        </SheetContent>
      </Sheet>
    </AdminLayout>
  );
}

