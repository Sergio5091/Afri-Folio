import { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "wouter";
import { useQueryClient } from "@tanstack/react-query";
import {
  ArrowDown, ArrowUp, Check, CloudOff, Eye, EyeOff, Loader2, Pencil, Plus, Sparkles, Trash2, X,
} from "lucide-react";
import {
  getGetBlocksQueryKey, getGetDashboardSummaryQueryKey, useGetBlocks, useGetPlans, useGetProfile, useSaveBlocks,
} from "@workspace/api-client-react";
import { DashboardLayout } from "@/components/dashboard-layout";
import { PageHeader } from "@/components/dashboard/ui";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { BlockEditor, blockSummary } from "@/components/editor/block-editors";
import { PortfolioView } from "@/components/portfolio/PortfolioView";
import { PhoneMockup, PreviewFrame } from "@/components/portfolio/PreviewFrame";
import { sectionTitle } from "@/components/portfolio/blocks";
import { useAuth } from "@/contexts/auth";
import { useToast } from "@/hooks/use-toast";
import { BLOCKS, BLOCK_TYPES, countPhotos, newBlock, type BlockType, type TypedBlock } from "@/lib/blocks";
import { getProfession } from "@/lib/professions";
import { blocksToApi, type PortfolioData } from "@/lib/portfolio";

type SaveState = "idle" | "saving" | "saved" | "error";

export default function PageEditor() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { data: profile } = useGetProfile();
  const { data: serverBlocks, isLoading } = useGetBlocks();
  const { data: plans } = useGetPlans();
  const save = useSaveBlocks();

  const [blocks, setBlocks] = useState<TypedBlock[]>([]);
  const [editing, setEditing] = useState<number | null>(null);
  const [adding, setAdding] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [saveState, setSaveState] = useState<SaveState>("idle");
  const loaded = useRef(false);
  const version = useRef(0);
  const savedVersion = useRef(0);

  const profession = getProfession(profile?.profession);
  const tpl = profile?.template ?? profession.template;
  const isPro = user?.plan === "premium";
  const photoLimit = isPro ? null : (plans?.freeLimits.photos ?? 12) - countPhotos(blocks);

  useEffect(() => {
    if (serverBlocks && !loaded.current) {
      loaded.current = true;
      setBlocks(serverBlocks as TypedBlock[]);
    }
  }, [serverBlocks]);

  /** Toute modification passe par ici : elle déclenche la sauvegarde automatique */
  const change = (updater: (prev: TypedBlock[]) => TypedBlock[]) => {
    version.current += 1;
    setBlocks(updater);
  };

  // Sauvegarde automatique, 700 ms après la dernière modification
  useEffect(() => {
    if (!loaded.current || version.current === savedVersion.current) return;
    setSaveState("saving");
    const v = version.current;
    const t = setTimeout(() => {
      save.mutate(
        { blocks: blocksToApi(blocks) },
        {
          onSuccess: (res) => {
            savedVersion.current = v;
            // Récupérer les identifiants des nouvelles sections sans écraser une saisie en cours
            setBlocks((prev) => prev.map((b, i) => (b.id || !res[i] || res[i].type !== b.type ? b : { ...b, id: res[i].id })));
            queryClient.setQueryData(getGetBlocksQueryKey(), res);
            queryClient.invalidateQueries({ queryKey: getGetDashboardSummaryQueryKey() });
            if (version.current === v) setSaveState("saved");
          },
          onError: (err: any) => {
            setSaveState("error");
            toast({
              title: err?.data?.code === "PHOTO_LIMIT" ? "Limite de photos atteinte" : "Enregistrement impossible",
              description: err?.message,
              variant: "destructive",
            });
          },
        }
      );
    }, 700);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [blocks]);

  // Prévenir avant de quitter avec des modifications non enregistrées
  useEffect(() => {
    const onLeave = (e: BeforeUnloadEvent) => {
      if (version.current !== savedVersion.current) e.preventDefault();
    };
    window.addEventListener("beforeunload", onLeave);
    return () => window.removeEventListener("beforeunload", onLeave);
  }, []);

  const move = (i: number, dir: -1 | 1) =>
    change((prev) => {
      const j = i + dir;
      if (j < 0 || j >= prev.length) return prev;
      const next = [...prev];
      [next[i], next[j]] = [next[j], next[i]];
      return next;
    });

  const addBlock = (type: BlockType) => {
    const title = profession.blockTitles?.[type];
    change((prev) => [...prev, newBlock(type, title ? { title } : undefined)]);
    setAdding(false);
    setEditing(blocks.length);
  };

  const preview: PortfolioData | null = useMemo(
    () => (profile && user ? { username: user.username, plan: user.plan, profile, blocks } : null),
    [profile, user, blocks]
  );

  const current = editing != null ? blocks[editing] : null;
  const recommended = profession.blocks.filter((t) => !blocks.some((b) => b.type === t));

  const saveBadge = {
    idle: null,
    saving: <span className="inline-flex items-center gap-1.5 text-sm text-muted-foreground"><Loader2 className="h-4 w-4 animate-spin" /> Enregistrement...</span>,
    saved: <span className="inline-flex items-center gap-1.5 text-sm text-emerald-600"><Check className="h-4 w-4" /> Enregistré</span>,
    error: <span className="inline-flex items-center gap-1.5 text-sm text-destructive"><CloudOff className="h-4 w-4" /> Non enregistré</span>,
  }[saveState];

  return (
    <DashboardLayout>
      <PageHeader
        title="Contenu de ma page"
        description="Ajoutez, modifiez et réorganisez les sections de votre portfolio. Tout est enregistré automatiquement."
        actions={saveBadge}
      />

      <div className="grid grid-cols-[minmax(0,1fr)] gap-8 lg:grid-cols-[minmax(0,1fr)_340px]">
        <div>
          {isLoading ? (
            <div className="space-y-3">{[0, 1, 2].map((i) => <div key={i} className="h-20 animate-pulse rounded-2xl bg-muted" />)}</div>
          ) : (
            <ol className="space-y-3">
              {blocks.map((b, i) => {
                const meta = BLOCKS[b.type];
                if (!meta) return null;
                const summary = blockSummary(b.type, b.data);
                const title = sectionTitle(b, tpl, profession.blockTitles);
                return (
                  <li key={b.id ?? `new-${i}`} className={`group flex items-center gap-3 rounded-2xl border bg-card p-3 pr-2 transition-shadow hover:shadow-sm sm:p-4 ${!b.visible ? "opacity-60" : ""}`}>
                    <button onClick={() => setEditing(i)} className="flex min-w-0 flex-1 items-center gap-3 text-left">
                      <span className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${summary.empty ? "bg-amber-500/10 text-amber-600" : "bg-primary/10 text-primary"}`}>
                        <meta.icon className="h-5 w-5" />
                      </span>
                      <span className="min-w-0">
                        <span className="block truncate font-semibold">{title}</span>
                        <span className={`block truncate text-sm ${summary.empty ? "text-amber-600" : "text-muted-foreground"}`}>
                          {summary.empty ? "À compléter : n'apparaît pas encore sur votre page" : !b.visible ? `Masquée · ${summary.text}` : summary.text}
                        </span>
                      </span>
                    </button>
                    <div className="flex shrink-0 items-center">
                      <button onClick={() => move(i, -1)} disabled={i === 0} className="hidden rounded-lg p-2 text-muted-foreground hover:bg-muted disabled:opacity-30 sm:block" aria-label="Monter"><ArrowUp className="h-4 w-4" /></button>
                      <button onClick={() => move(i, 1)} disabled={i === blocks.length - 1} className="hidden rounded-lg p-2 text-muted-foreground hover:bg-muted disabled:opacity-30 sm:block" aria-label="Descendre"><ArrowDown className="h-4 w-4" /></button>
                      <button
                        onClick={() => change((prev) => prev.map((x, j) => (j === i ? { ...x, visible: !x.visible } : x)))}
                        className="rounded-lg p-2 text-muted-foreground hover:bg-muted"
                        aria-label={b.visible ? "Masquer" : "Afficher"}
                        title={b.visible ? "Masquer cette section" : "Afficher cette section"}
                      >
                        {b.visible ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                      </button>
                      <button onClick={() => setEditing(i)} className="rounded-lg p-2 text-muted-foreground hover:bg-muted" aria-label="Modifier"><Pencil className="h-4 w-4" /></button>
                    </div>
                  </li>
                );
              })}
            </ol>
          )}

          <button onClick={() => setAdding(true)} className="mt-4 flex w-full items-center justify-center gap-2 rounded-2xl border-2 border-dashed py-4 font-semibold text-muted-foreground transition-colors hover:border-primary hover:text-primary">
            <Plus className="h-5 w-5" /> Ajouter une section
          </button>

          {!isPro && (
            <p className="mt-4 text-sm text-muted-foreground">
              Photos : {countPhotos(blocks)}/{plans?.freeLimits.photos ?? 12} avec le plan gratuit.{" "}
              <Link href="/dashboard/abonnement" className="font-semibold text-primary hover:underline">Photos illimitées avec Pro</Link>
            </p>
          )}
        </div>

        {/* ── Aperçu ── */}
        <aside className="hidden lg:block">
          <div className="sticky top-8">
            <p className="mb-3 flex items-center justify-between text-sm font-medium text-muted-foreground">
              Aperçu en direct
              {user && <a href={`/${user.username}`} target="_blank" rel="noreferrer" className="font-semibold text-primary hover:underline">Ouvrir</a>}
            </p>
            <PhoneMockup>
              <PreviewFrame virtualWidth={390} aspect={1.95} interactive>
                {preview ? <PortfolioView data={preview} mode="preview" /> : <div className="h-full animate-pulse bg-muted" />}
              </PreviewFrame>
            </PhoneMockup>
          </div>
        </aside>
      </div>

      {/* Aperçu mobile */}
      <button onClick={() => setPreviewOpen(true)} className="fixed bottom-20 right-4 z-30 flex items-center gap-2 rounded-full bg-foreground px-5 py-3 text-sm font-semibold text-background shadow-xl lg:hidden">
        <Eye className="h-4 w-4" /> Aperçu
      </button>
      {previewOpen && preview && (
        <div className="fixed inset-0 z-50 flex flex-col bg-[#1a1410] lg:hidden">
          <div className="flex items-center justify-between px-4 py-3 text-white">
            <span className="text-sm font-semibold">Aperçu de votre page</span>
            <button onClick={() => setPreviewOpen(false)} className="rounded-lg p-2 hover:bg-white/10" aria-label="Fermer"><X className="h-5 w-5" /></button>
          </div>
          <div className="flex-1 overflow-y-auto bg-white"><PortfolioView data={preview} mode="preview" /></div>
        </div>
      )}

      {/* ── Édition d'une section ── */}
      <Sheet open={current != null} onOpenChange={(o) => !o && setEditing(null)}>
        <SheetContent side="right" className="flex w-full flex-col gap-0 p-0 sm:max-w-lg">
          {current && editing != null && (
            <>
              <SheetHeader className="border-b px-5 py-4 text-left">
                <SheetTitle className="flex items-center gap-2">
                  {(() => { const Icon = BLOCKS[current.type].icon; return <Icon className="h-5 w-5 text-primary" />; })()}
                  {BLOCKS[current.type].label}
                </SheetTitle>
                <SheetDescription>{BLOCKS[current.type].description}</SheetDescription>
              </SheetHeader>
              <div className="flex-1 overflow-y-auto px-5 py-5">
                <BlockEditor
                  type={current.type}
                  data={current.data}
                  onChange={(data) => change((prev) => prev.map((b, j) => (j === editing ? { ...b, data } : b)))}
                  defaultTitle={sectionTitle({ type: current.type, data: {} }, tpl, profession.blockTitles)}
                  photoLimit={photoLimit}
                />
              </div>
              <div className="flex items-center justify-between gap-3 border-t px-5 py-3.5">
                <button
                  onClick={() => {
                    if (!window.confirm("Supprimer cette section et son contenu ?")) return;
                    const i = editing;
                    setEditing(null);
                    change((prev) => prev.filter((_, j) => j !== i));
                  }}
                  className="inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium text-destructive hover:bg-destructive/10"
                >
                  <Trash2 className="h-4 w-4" /> Supprimer
                </button>
                <div className="flex items-center gap-3">
                  {saveBadge}
                  <button onClick={() => setEditing(null)} className="rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground">Terminé</button>
                </div>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>

      {/* ── Ajout d'une section ── */}
      <Sheet open={adding} onOpenChange={setAdding}>
        <SheetContent side="right" className="w-full overflow-y-auto sm:max-w-lg">
          <SheetHeader className="text-left">
            <SheetTitle>Ajouter une section</SheetTitle>
            <SheetDescription>Choisissez le type de contenu à ajouter à votre page.</SheetDescription>
          </SheetHeader>
          {recommended.length > 0 && (
            <>
              <p className="mb-2 mt-6 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-primary">
                <Sparkles className="h-3.5 w-3.5" /> Recommandé pour {profession.title ? profession.title.toLowerCase() : "vous"}
              </p>
              <div className="grid gap-2">
                {recommended.map((t) => <AddOption key={t} type={t} onPick={addBlock} />)}
              </div>
            </>
          )}
          <p className="mb-2 mt-6 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Toutes les sections</p>
          <div className="grid gap-2">
            {BLOCK_TYPES.filter((t) => !recommended.includes(t)).map((t) => <AddOption key={t} type={t} onPick={addBlock} />)}
          </div>
        </SheetContent>
      </Sheet>
    </DashboardLayout>
  );
}

function AddOption({ type, onPick }: { type: BlockType; onPick: (t: BlockType) => void }) {
  const meta = BLOCKS[type];
  return (
    <button onClick={() => onPick(type)} className="flex items-center gap-3 rounded-xl border p-3 text-left transition-colors hover:border-primary hover:bg-primary/5">
      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-muted text-foreground/70">
        <meta.icon className="h-5 w-5" />
      </span>
      <span>
        <span className="block text-sm font-semibold">{meta.label}</span>
        <span className="block text-xs text-muted-foreground">{meta.description}</span>
      </span>
    </button>
  );
}
