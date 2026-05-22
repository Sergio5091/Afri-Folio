import { useState, useRef } from "react";
import { useQueryClient } from "@tanstack/react-query";
import {
  useGetProjects, useCreateProject, useUpdateProject, useDeleteProject,
  getGetProjectsQueryKey, useGetProfile, getGetProfileQueryKey,
} from "@workspace/api-client-react";
import { DashboardLayout } from "@/components/dashboard-layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Plus, Pencil, Trash2, ExternalLink, ImagePlus, Loader2, FolderOpen } from "lucide-react";
import { getCategoryById } from "@/lib/profile-types";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:3001";

interface ProjectForm {
  title: string;
  description: string;
  imageUrl: string;
  projectUrl: string;
}

const EMPTY_FORM: ProjectForm = { title: "", description: "", imageUrl: "", projectUrl: "" };

export default function ProjectsDashboard() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { data: projects = [], isLoading } = useGetProjects({ query: { queryKey: getGetProjectsQueryKey() } });
  const { data: profile } = useGetProfile({ query: { queryKey: getGetProfileQueryKey() } });
  const category = getCategoryById(profile?.profileType);

  const createMutation = useCreateProject();
  const updateMutation = useUpdateProject();
  const deleteMutation = useDeleteProject();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState<ProjectForm>(EMPTY_FORM);
  const [uploadingId, setUploadingId] = useState<number | null>(null);
  const [dialogUploading, setDialogUploading] = useState(false);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<number | null>(null);

  const invalidate = () => queryClient.invalidateQueries({ queryKey: getGetProjectsQueryKey() });

  function openCreate() {
    setEditingId(null);
    setForm(EMPTY_FORM);
    setDialogOpen(true);
  }

  function openEdit(p: any) {
    setEditingId(p.id);
    setForm({ title: p.title, description: p.description || "", imageUrl: p.imageUrl || "", projectUrl: p.projectUrl || "" });
    setDialogOpen(true);
  }

  // Upload image to backend, returns the server URL
  async function uploadProjectImageToServer(file: File): Promise<string> {
    const token = localStorage.getItem("portfolio_token");
    const fd = new FormData();
    fd.append("image", file);
    
    // For new projects, we need to create without image first, then upload
    // But easier: convert blob to base64 and send as data URL
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }

  async function handleSave() {
    if (!form.title.trim()) {
      toast({ title: "Titre requis", variant: "destructive" });
      return;
    }

    let finalImageUrl = form.imageUrl;
    
    // If image is a local blob (newly uploaded), we need to handle it
    if (form.imageUrl.startsWith("blob:")) {
      // Extract the blob and convert to a data URL that can be used
      // For new projects, create first then upload via API
      if (!editingId) {
        // For new projects: create without image first, then upload image
        createMutation.mutate({ data: { title: form.title, description: form.description, imageUrl: null, projectUrl: form.projectUrl } }, {
          onSuccess: async (project) => {
            // Now upload the image
            try {
              // Convert blob URL to file
              const response = await fetch(form.imageUrl);
              const blob = await response.blob();
              const file = new File([blob], "project-image", { type: blob.type });
              
              const token = localStorage.getItem("portfolio_token");
              const fd = new FormData();
              fd.append("image", file);
              
              const res = await fetch(`${API_BASE}/api/projects/${project.id}/image`, {
                method: "POST",
                headers: { Authorization: `Bearer ${token}` },
                body: fd,
              });
              
              if (res.ok) {
                const data = await res.json();
                // Update with the real URL
                await fetch(`${API_BASE}/api/projects/${project.id}`, {
                  method: "PUT",
                  headers: { 
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json"
                  },
                  body: JSON.stringify({ title: form.title, description: form.description, imageUrl: data.url, projectUrl: form.projectUrl }),
                });
              }
            } catch (err) {
              console.error("Failed to upload image:", err);
            }
            toast({ title: "Projet ajouté" });
            invalidate();
            setDialogOpen(false);
          },
          onError: () => toast({ title: "Erreur", variant: "destructive" }),
        });
        return;
      } else {
        // For existing projects: upload image first, then update
        try {
          const response = await fetch(form.imageUrl);
          const blob = await response.blob();
          const file = new File([blob], "project-image", { type: blob.type });
          
          const token = localStorage.getItem("portfolio_token");
          const fd = new FormData();
          fd.append("image", file);
          
          const res = await fetch(`${API_BASE}/api/projects/${editingId}/image`, {
            method: "POST",
            headers: { Authorization: `Bearer ${token}` },
            body: fd,
          });
          
          if (res.ok) {
            const data = await res.json();
            finalImageUrl = data.url;
          }
        } catch (err) {
          console.error("Failed to upload image:", err);
        }
      }
    }

    if (editingId) {
      updateMutation.mutate({ id: editingId, data: { title: form.title, description: form.description, imageUrl: finalImageUrl, projectUrl: form.projectUrl } }, {
        onSuccess: () => { toast({ title: "Projet mis à jour" }); invalidate(); setDialogOpen(false); },
        onError: () => toast({ title: "Erreur", variant: "destructive" }),
      });
    } else if (!form.imageUrl.startsWith("blob:")) {
      // Already handled above for blob URLs
      createMutation.mutate({ data: { title: form.title, description: form.description, imageUrl: finalImageUrl, projectUrl: form.projectUrl } }, {
        onSuccess: () => { toast({ title: "Projet ajouté" }); invalidate(); setDialogOpen(false); },
        onError: () => toast({ title: "Erreur", variant: "destructive" }),
      });
    }
  }

  async function handleImageUpload(projectId: number, file: File) {
    setUploadingId(projectId);
    try {
      const token = localStorage.getItem("portfolio_token");
      const fd = new FormData();
      fd.append("image", file);
      const res = await fetch(`${API_BASE}/api/projects/${projectId}/image`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: fd,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      toast({ title: "Image mise à jour" });
      invalidate();
    } catch (err: any) {
      toast({ title: "Erreur upload", description: err.message, variant: "destructive" });
    } finally {
      setUploadingId(null);
    }
  }

  // Upload image from dialog form - creates local preview
  function handleDialogImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    // Create local blob URL for preview (will be converted to real URL on save if editing)
    const localUrl = URL.createObjectURL(file);
    setForm({ ...form, imageUrl: localUrl });
    if (imageInputRef.current) imageInputRef.current.value = "";
  }

  function handleDelete(id: number) {
    deleteMutation.mutate({ id }, {
      onSuccess: () => { toast({ title: "Projet supprimé" }); invalidate(); setDeleteConfirmId(null); },
      onError: () => toast({ title: "Erreur", variant: "destructive" }),
    });
  }

  const isPending = createMutation.isPending || updateMutation.isPending;

  return (
    <DashboardLayout>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold font-display">{category.projectsSectionLabel}</h1>
          <p className="text-muted-foreground mt-1">Ajoutez vos meilleures réalisations à votre portfolio.</p>
        </div>
        <Button onClick={openCreate} className="gap-2 shrink-0">
          <Plus className="w-4 h-4" /> Ajouter un projet
        </Button>
      </div>

      {/* Empty state */}
      {!isLoading && projects.length === 0 && (
        <div className="flex flex-col items-center justify-center py-24 text-center animate-in fade-in duration-500">
          <div className="w-20 h-20 rounded-2xl bg-primary/10 flex items-center justify-center mb-6">
            <FolderOpen className="w-10 h-10 text-primary/60" />
          </div>
          <h3 className="text-xl font-semibold mb-2">Aucun projet pour l'instant</h3>
          <p className="text-muted-foreground mb-6 max-w-sm">Ajoutez vos réalisations pour les afficher sur votre portfolio public.</p>
          <Button onClick={openCreate} className="gap-2">
            <Plus className="w-4 h-4" /> Ajouter mon premier projet
          </Button>
        </div>
      )}

      {/* Loading skeleton */}
      {isLoading && (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="animate-pulse rounded-2xl bg-muted h-64" />
          ))}
        </div>
      )}

      {/* Projects grid */}
      {!isLoading && projects.length > 0 && (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((project: any, index: number) => (
            <Card
              key={project.id}
              className="group overflow-hidden border hover:shadow-lg transition-all duration-300 hover:-translate-y-1 animate-in fade-in slide-in-from-bottom-4"
              style={{ animationDelay: `${index * 60}ms` }}
            >
              {/* Image */}
              <div className="relative aspect-video bg-muted overflow-hidden">
                {project.imageUrl ? (
                  <img src={project.imageUrl} alt={project.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-muted-foreground/30">
                    <ImagePlus className="w-12 h-12" />
                  </div>
                )}
                {/* Upload overlay */}
                <label className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center cursor-pointer">
                  <input type="file" accept="image/*" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) handleImageUpload(project.id, f); }} />
                  {uploadingId === project.id ? (
                    <Loader2 className="w-8 h-8 text-white animate-spin" />
                  ) : (
                    <div className="flex flex-col items-center gap-2 text-white">
                      <ImagePlus className="w-8 h-8" />
                      <span className="text-xs font-medium">Changer l'image</span>
                    </div>
                  )}
                </label>
              </div>

              <CardContent className="p-4">
                <h3 className="font-semibold text-base mb-1 line-clamp-1">{project.title}</h3>
                {project.description && (
                  <p className="text-sm text-muted-foreground line-clamp-2 mb-3">{project.description}</p>
                )}
                <div className="flex items-center justify-between gap-2 mt-2">
                  {project.projectUrl ? (
                    <a href={project.projectUrl} target="_blank" rel="noreferrer" className="text-xs text-primary flex items-center gap-1 hover:underline">
                      <ExternalLink className="w-3 h-3" /> Voir le projet
                    </a>
                  ) : <span />}
                  <div className="flex gap-1">
                    <Button size="icon" variant="ghost" className="h-8 w-8 hover:bg-primary/10 hover:text-primary" onClick={() => openEdit(project)}>
                      <Pencil className="w-3.5 h-3.5" />
                    </Button>
                    <Button size="icon" variant="ghost" className="h-8 w-8 hover:bg-destructive/10 hover:text-destructive" onClick={() => setDeleteConfirmId(project.id)}>
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Create / Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>{editingId ? "Modifier le projet" : "Nouveau projet"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label>Titre *</Label>
              <Input placeholder="Ex: Application mobile de livraison" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label>Description</Label>
              <Textarea placeholder="Décrivez brièvement ce projet..." className="resize-none h-24" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label>Lien du projet (URL)</Label>
              <Input placeholder="https://..." value={form.projectUrl} onChange={(e) => setForm({ ...form, projectUrl: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label>Image du projet</Label>
              <div className="flex items-center gap-3">
                <input
                  ref={imageInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleDialogImageUpload}
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="gap-2"
                  onClick={() => imageInputRef.current?.click()}
                  disabled={dialogUploading}
                >
                  {dialogUploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <ImagePlus className="w-4 h-4" />}
                  {dialogUploading ? "Upload..." : "Choisir un fichier"}
                </Button>
                {form.imageUrl && (
                  <div className="flex items-center gap-2">
                    <img src={form.imageUrl} alt="Preview" className="w-10 h-10 object-cover rounded border" />
                    <button type="button" onClick={() => setForm({ ...form, imageUrl: "" })} className="text-muted-foreground hover:text-destructive">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>
              <p className="text-xs text-muted-foreground">Vous pouvez aussi coller une URL d'image directement.</p>
              {form.imageUrl && !form.imageUrl.startsWith("blob:") && (
                <Input
                  placeholder="Ou collez une URL..."
                  value={form.imageUrl}
                  onChange={(e) => setForm({ ...form, imageUrl: e.target.value })}
                />
              )}
            </div>
            <div className="flex gap-3 pt-2">
              <Button variant="outline" className="flex-1" onClick={() => setDialogOpen(false)}>Annuler</Button>
              <Button className="flex-1" onClick={handleSave} disabled={isPending}>
                {isPending ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                {editingId ? "Enregistrer" : "Créer le projet"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete confirm dialog */}
      <Dialog open={deleteConfirmId !== null} onOpenChange={() => setDeleteConfirmId(null)}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Supprimer ce projet ?</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">Cette action est irréversible. Le projet sera retiré de votre portfolio.</p>
          <div className="flex gap-3 pt-2">
            <Button variant="outline" className="flex-1" onClick={() => setDeleteConfirmId(null)}>Annuler</Button>
            <Button variant="destructive" className="flex-1" onClick={() => deleteConfirmId && handleDelete(deleteConfirmId)} disabled={deleteMutation.isPending}>
              {deleteMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
              Supprimer
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}
