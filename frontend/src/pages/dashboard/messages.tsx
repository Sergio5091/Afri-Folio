import { useEffect, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { CheckCheck, Inbox, Mail, MailOpen, MessageCircle, Phone, Trash2 } from "lucide-react";
import {
  getGetDashboardSummaryQueryKey, getGetLeadsQueryKey, useDeleteLead, useGetLeads, useGetProfile, useMarkAllLeadsRead, useUpdateLead, type Lead,
} from "@workspace/api-client-react";
import { DashboardLayout } from "@/components/dashboard-layout";
import { EmptyState, PageHeader, Panel } from "@/components/dashboard/ui";
import { whatsappLink, telLink } from "@/lib/portfolio";
import { timeAgo } from "@/lib/utils";

export default function Messages() {
  const queryClient = useQueryClient();
  const { data: leads, isLoading } = useGetLeads();
  const { data: profile } = useGetProfile();
  const [selected, setSelected] = useState<number | null>(null);
  const [filter, setFilter] = useState<"all" | "unread">("all");

  const refresh = () => {
    queryClient.invalidateQueries({ queryKey: getGetLeadsQueryKey() });
    queryClient.invalidateQueries({ queryKey: getGetDashboardSummaryQueryKey() });
  };
  const updateLead = useUpdateLead({ onSuccess: refresh });
  const deleteLead = useDeleteLead({ onSuccess: refresh });
  const markAll = useMarkAllLeadsRead({ onSuccess: refresh });

  const list = (leads ?? []).filter((l) => filter === "all" || !l.isRead);
  const current = (leads ?? []).find((l) => l.id === selected) ?? null;
  const unread = (leads ?? []).filter((l) => !l.isRead).length;

  // Ouvrir un message le marque comme lu
  useEffect(() => {
    if (current && !current.isRead) updateLead.mutate({ id: current.id, isRead: true });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [current?.id]);

  const reply = (l: Lead) =>
    whatsappLink(l.phone, `Bonjour ${l.name}, merci pour votre message sur ma page${profile?.fullName ? ` (${profile.fullName})` : ""}. `);

  return (
    <DashboardLayout>
      <PageHeader
        title="Messages"
        description="Les demandes laissées par vos visiteurs depuis votre page."
        actions={
          unread > 0 && (
            <button onClick={() => markAll.mutate()} className="inline-flex items-center gap-2 rounded-xl border bg-card px-4 py-2.5 text-sm font-medium hover:bg-muted">
              <CheckCheck className="h-4 w-4" /> Tout marquer comme lu
            </button>
          )
        }
      />

      <div className="mb-4 flex gap-2">
        {(["all", "unread"] as const).map((f) => (
          <button key={f} onClick={() => setFilter(f)} className={`rounded-full px-4 py-2 text-sm font-medium ${filter === f ? "bg-foreground text-background" : "border bg-card hover:bg-muted"}`}>
            {f === "all" ? `Tous (${leads?.length ?? 0})` : `Non lus (${unread})`}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-[minmax(0,1fr)] gap-6 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
        <Panel padded={false}>
          {isLoading ? (
            <div className="space-y-2 p-4">{[0, 1, 2].map((i) => <div key={i} className="h-16 animate-pulse rounded-xl bg-muted" />)}</div>
          ) : list.length === 0 ? (
            <EmptyState icon={Inbox} title={filter === "unread" ? "Aucun message non lu" : "Aucun message pour l'instant"} description="Quand un visiteur vous écrit depuis votre page, sa demande arrive ici." />
          ) : (
            <ul className="divide-y">
              {list.map((l) => (
                <li key={l.id}>
                  <button onClick={() => setSelected(l.id)} className={`flex w-full gap-3 px-5 py-4 text-left transition-colors ${selected === l.id ? "bg-primary/5" : "hover:bg-muted/50"}`}>
                    <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-sm font-bold ${l.isRead ? "bg-muted text-muted-foreground" : "bg-primary text-primary-foreground"}`}>
                      {l.name.charAt(0).toUpperCase()}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="flex items-baseline gap-2">
                        <span className={`truncate ${l.isRead ? "font-medium" : "font-bold"}`}>{l.name}</span>
                        <span className="ml-auto shrink-0 text-xs text-muted-foreground">{timeAgo(l.createdAt)}</span>
                      </span>
                      <span className={`mt-0.5 line-clamp-2 text-sm ${l.isRead ? "text-muted-foreground" : "text-foreground"}`}>{l.message}</span>
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </Panel>

        {current ? (
          <Panel
            title={current.name}
            description={new Date(current.createdAt).toLocaleString("fr-FR", { dateStyle: "long", timeStyle: "short" })}
            action={
              <div className="flex gap-1">
                <button onClick={() => updateLead.mutate({ id: current.id, isRead: !current.isRead })} className="rounded-lg p-2 text-muted-foreground hover:bg-muted" title={current.isRead ? "Marquer comme non lu" : "Marquer comme lu"}>
                  {current.isRead ? <Mail className="h-4 w-4" /> : <MailOpen className="h-4 w-4" />}
                </button>
                <button
                  onClick={() => {
                    if (!window.confirm("Supprimer ce message ?")) return;
                    deleteLead.mutate({ id: current.id });
                    setSelected(null);
                  }}
                  className="rounded-lg p-2 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                  title="Supprimer"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            }
          >
            <p className="whitespace-pre-wrap leading-relaxed">{current.message}</p>
            <dl className="mt-6 grid gap-3 rounded-xl bg-muted/50 p-4 text-sm sm:grid-cols-2">
              {current.phone && (<div><dt className="text-muted-foreground">Téléphone</dt><dd className="font-medium">{current.phone}</dd></div>)}
              {current.email && (<div><dt className="text-muted-foreground">Email</dt><dd className="truncate font-medium">{current.email}</dd></div>)}
            </dl>
            <div className="mt-5 grid gap-2 sm:grid-cols-3">
              {reply(current) && (
                <a href={reply(current)!} target="_blank" rel="noreferrer" className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#25D366] px-4 py-3 text-sm font-semibold text-white sm:col-span-3">
                  <MessageCircle className="h-4 w-4" /> Répondre sur WhatsApp
                </a>
              )}
              {telLink(current.phone) && (
                <a href={telLink(current.phone)!} className="inline-flex items-center justify-center gap-2 rounded-xl border px-4 py-2.5 text-sm font-semibold hover:bg-muted">
                  <Phone className="h-4 w-4" /> Appeler
                </a>
              )}
              {current.email && (
                <a href={`mailto:${current.email}`} className="inline-flex items-center justify-center gap-2 rounded-xl border px-4 py-2.5 text-sm font-semibold hover:bg-muted">
                  <Mail className="h-4 w-4" /> Email
                </a>
              )}
            </div>
          </Panel>
        ) : (
          <div className="hidden items-center justify-center rounded-2xl border border-dashed p-10 text-center text-sm text-muted-foreground lg:flex">
            Sélectionnez un message pour le lire et répondre.
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
