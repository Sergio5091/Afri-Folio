import { useState } from "react";
import { useGetAdminUsers, getGetAdminUsersQueryKey } from "@workspace/api-client-react";
import { AdminLayout } from "@/components/admin-layout";
import { ExternalLink, Search, Crown, User } from "lucide-react";

export default function AdminUsers() {
  const [search, setSearch] = useState("");
  const { data: usersData, isLoading } = useGetAdminUsers(undefined, {
    query: { queryKey: getGetAdminUsersQueryKey(), retry: false },
  });

  const users = usersData?.users ?? [];
  const filtered = users.filter(
    (u) =>
      u.username.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <AdminLayout>
      <div className="mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-display font-black">Utilisateurs</h1>
          <p className="text-muted-foreground mt-1">{usersData?.total ?? 0} inscrits au total</p>
        </div>
        {/* Barre de recherche */}
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Rechercher un utilisateur..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 rounded-xl border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
          />
        </div>
      </div>

      <div className="bg-card border rounded-2xl overflow-hidden">
        {/* Header tableau */}
        <div className="grid grid-cols-12 gap-4 px-6 py-3 border-b bg-muted/30 text-xs font-bold uppercase tracking-wider text-muted-foreground">
          <div className="col-span-4">Utilisateur</div>
          <div className="col-span-3 hidden md:block">Email</div>
          <div className="col-span-2">Plan</div>
          <div className="col-span-2 hidden md:block">Inscrit le</div>
          <div className="col-span-1 text-right">Vues</div>
        </div>

        {/* Lignes */}
        {isLoading ? (
          <div className="divide-y">
            {[1,2,3,4,5].map(i => (
              <div key={i} className="px-6 py-4 animate-pulse flex gap-4">
                <div className="w-8 h-8 rounded-full bg-muted shrink-0" />
                <div className="flex-1 space-y-2">
                  <div className="h-3 bg-muted rounded w-1/3" />
                  <div className="h-3 bg-muted rounded w-1/2" />
                </div>
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="py-16 text-center text-muted-foreground">
            <User className="w-8 h-8 mx-auto mb-2 opacity-30" />
            <p className="text-sm">Aucun utilisateur trouvé</p>
          </div>
        ) : (
          <div className="divide-y">
            {filtered.map((user) => (
              <div key={user.id} className="grid grid-cols-12 gap-4 px-6 py-4 items-center hover:bg-muted/20 transition-colors">
                {/* Avatar + username */}
                <div className="col-span-4 flex items-center gap-3 min-w-0">
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold text-primary shrink-0">
                    {user.username.substring(0, 2).toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold truncate">@{user.username}</p>
                    <p className="text-xs text-muted-foreground md:hidden truncate">{user.email}</p>
                  </div>
                </div>
                {/* Email */}
                <div className="col-span-3 hidden md:block">
                  <p className="text-sm text-muted-foreground truncate">{user.email}</p>
                </div>
                {/* Plan */}
                <div className="col-span-2">
                  <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-2.5 py-1 rounded-full ${
                    user.plan === "premium"
                      ? "bg-amber-500/10 text-amber-600"
                      : "bg-muted text-muted-foreground"
                  }`}>
                    {user.plan === "premium" && <Crown className="w-3 h-3" />}
                    {user.plan === "premium" ? "Pro" : "Free"}
                  </span>
                </div>
                {/* Date */}
                <div className="col-span-2 hidden md:block">
                  <p className="text-xs text-muted-foreground">
                    {new Date(user.createdAt).toLocaleDateString("fr-FR")}
                  </p>
                </div>
                {/* Vues + lien */}
                <div className="col-span-1 flex items-center justify-end gap-2">
                  <span className="text-sm font-semibold">{user.totalViews}</span>
                  <a href={`/portfolio/${user.username}`} target="_blank" rel="noreferrer"
                    className="text-muted-foreground hover:text-primary transition-colors">
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
