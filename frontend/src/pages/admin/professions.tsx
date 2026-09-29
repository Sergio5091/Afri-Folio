import { Link } from "wouter";
import { Lightbulb } from "lucide-react";
import { useGetAdminProfessions } from "@workspace/api-client-react";
import { AdminLayout } from "@/components/admin-layout";
import { EmptyState, PageHeader, Panel } from "@/components/dashboard/ui";
import { FAMILIES, PROFESSIONS, getProfession, type FamilyId } from "@/lib/professions";
import { timeAgo } from "@/lib/utils";

const COLOR = "#C8553D";

export default function AdminProfessions() {
  const { data } = useGetAdminProfessions();
  const byProfession = data?.byProfession ?? [];
  const max = Math.max(1, ...byProfession.map((p) => p.count));
  const unused = PROFESSIONS.filter((p) => !byProfession.some((b) => b.profession === p.id));

  return (
    <AdminLayout>
      <PageHeader title="Métiers" description="Qui utilise AfriFolio, et quels métiers ajouter au catalogue." />

      <div className="grid grid-cols-[minmax(0,1fr)] gap-6 lg:grid-cols-2">
        <Panel title="Métiers choisis" description={`${PROFESSIONS.length} métiers dans le catalogue`}>
          {byProfession.length === 0 ? (
            <p className="py-6 text-center text-sm text-muted-foreground">Aucun métier renseigné pour l'instant.</p>
          ) : (
            <ul className="space-y-3">
              {byProfession.map((p) => {
                const prof = getProfession(p.profession);
                return (
                  <li key={p.profession}>
                    <div className="mb-1 flex justify-between text-sm">
                      <Link href={`/admin/utilisateurs`} className="font-medium">{prof.emoji} {prof.label}</Link>
                      <span className="text-muted-foreground">{p.count}</span>
                    </div>
                    <div className="h-2 rounded-full bg-muted"><div className="h-full rounded-full" style={{ width: `${(p.count / max) * 100}%`, background: COLOR }} /></div>
                  </li>
                );
              })}
            </ul>
          )}
        </Panel>

        <Panel
          title={<span className="flex items-center gap-2"><Lightbulb className="h-4 w-4 text-amber-500" /> Métiers saisis librement</span>}
          description="Ces métiers ne sont pas dans le catalogue : les plus fréquents méritent leur propre modèle (fichier frontend/src/lib/professions.ts)."
          padded={false}
        >
          {(data?.custom ?? []).length === 0 ? (
            <EmptyState icon={Lightbulb} title="Rien pour l'instant" description="Quand un utilisateur choisit « Autre métier », il apparaît ici." />
          ) : (
            <ul className="divide-y">
              {data!.custom.map((c) => (
                <li key={c.label} className="flex items-center justify-between px-5 py-3 text-sm">
                  <span className="font-medium capitalize">{c.label}</span>
                  <span className="text-muted-foreground">{c.count} · {timeAgo(c.lastSeen)}</span>
                </li>
              ))}
            </ul>
          )}
        </Panel>

        <Panel title="Par famille">
          <ul className="grid grid-cols-2 gap-2">
            {(data?.byFamily ?? []).map((f) => (
              <li key={f.family} className="flex items-center justify-between rounded-xl border px-3 py-2.5 text-sm">
                <span>{FAMILIES[f.family as FamilyId]?.emoji ?? "❔"} {FAMILIES[f.family as FamilyId]?.label ?? (f.family === "inconnue" ? "Non renseigné" : f.family)}</span>
                <strong>{f.count}</strong>
              </li>
            ))}
          </ul>
        </Panel>

        <Panel title="Métiers du catalogue encore inutilisés" description="Pistes pour vos campagnes d'acquisition.">
          <div className="flex flex-wrap gap-1.5">
            {unused.map((p) => (
              <a key={p.id} href={`/exemples/${p.id}`} target="_blank" rel="noreferrer" className="rounded-full border px-3 py-1 text-xs hover:bg-muted">{p.emoji} {p.title}</a>
            ))}
          </div>
        </Panel>
      </div>
    </AdminLayout>
  );
}
