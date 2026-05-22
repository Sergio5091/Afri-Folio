import { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useGetProfile, useUpdateProfile, getGetProfileQueryKey } from "@workspace/api-client-react";
import { DashboardLayout } from "@/components/dashboard-layout";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { X, Plus, Palette, Type, Layout, CheckCircle2, Check, Upload, Loader2 } from "lucide-react";
import { PROFILE_CATEGORIES, getCategoryById, shouldShowField } from "@/lib/profile-types";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:3001";

/** Upload un fichier image vers le backend, retourne l'URL publique */
async function uploadImage(file: File, type: "avatar" | "logo"): Promise<string> {
  const token = localStorage.getItem("portfolio_token");
  const formData = new FormData();
  formData.append(type === "avatar" ? "avatar" : "logo", file);

  const res = await fetch(`${API_BASE}/api/upload/${type === "avatar" ? "avatar" : "logo"}`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
    body: formData,
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || "Erreur lors de l'upload");
  }

  const data = await res.json();
  return data.url;
}

/** Composant réutilisable pour uploader une image */
function ImageUploader({
  value,
  onChange,
  type,
  label,
  shape = "circle",
  placeholder,
}: {
  value: string;
  onChange: (url: string) => void;
  type: "avatar" | "logo";
  label: string;
  shape?: "circle" | "square";
  placeholder?: string;
}) {
  const { toast } = useToast();
  const [uploading, setUploading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const url = await uploadImage(file, type);
      onChange(url);
      toast({ title: "Image uploadée", description: "Votre image a été mise à jour." });
    } catch (err: any) {
      toast({ title: "Erreur upload", description: err.message, variant: "destructive" });
    } finally {
      setUploading(false);
      // Reset input pour permettre re-upload du même fichier
      if (inputRef.current) inputRef.current.value = "";
    }
  };

  return (
    <div className="flex items-center gap-4">
      {/* Preview */}
      <div
        className={`w-16 h-16 bg-primary/10 border flex items-center justify-center overflow-hidden shrink-0 ${
          shape === "circle" ? "rounded-full" : "rounded-lg p-2"
        }`}
      >
        {value ? (
          <img
            src={value}
            alt="Preview"
            className={`w-full h-full ${shape === "circle" ? "object-cover" : "object-contain"}`}
          />
        ) : (
          <span className="text-xs text-muted-foreground text-center">
            {placeholder || "Aucune image"}
          </span>
        )}
      </div>

      {/* Bouton upload */}
      <div className="flex flex-col gap-2 flex-1">
        <input
          ref={inputRef}
          type="file"
          accept="image/jpeg,image/jpg,image/png,image/webp,image/gif"
          className="hidden"
          onChange={handleFile}
        />
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={uploading}
          onClick={() => inputRef.current?.click()}
          className="gap-2 w-fit"
        >
          {uploading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Upload className="w-4 h-4" />
          )}
          {uploading ? "Upload en cours..." : `Choisir ${label}`}
        </Button>
        {value && (
          <p className="text-xs text-muted-foreground truncate max-w-[200px]">{value}</p>
        )}
      </div>
    </div>
  );
}

const profileSchema = z.object({
  profileType: z.string().optional().nullable(),
  fullName: z.string().min(2, "Le nom est requis"),
  title: z.string().min(2, "Le titre est requis (ex: Développeur Web)"),
  tagline: z.string().optional().nullable(),
  bio: z.string().min(10, "Une courte bio est requise"),
  photoUrl: z.string().url().optional().nullable().or(z.literal("")),
  logoUrl: z.string().url().optional().nullable().or(z.literal("")),
  skills: z.array(z.string()).default([]),
  services: z.string().nullable().optional().or(z.literal("")),
  whatsapp: z.string().optional().nullable(),
  emailContact: z.string().email("Email invalide"),
  linkedin: z.string().optional().nullable().or(z.literal("")),
  twitter: z.string().optional().nullable().or(z.literal("")),
  github: z.string().optional().nullable().or(z.literal("")),
  website: z.string().optional().nullable().or(z.literal("")),
  country: z.string().optional().nullable(),
  city: z.string().optional().nullable(),
  styleTheme: z.enum(["minimalist", "modern", "classic", "bold", "elegant", "sidebar", "card", "timeline", "magazine", "neon"]),
  primaryColor: z.string().optional().nullable(),
  fontFamily: z.string().optional().nullable(),
  yearsExperience: z.coerce.number().optional().nullable(),
  completedProjects: z.coerce.number().optional().nullable(),
  satisfiedClients: z.coerce.number().optional().nullable(),
  availableForWork: z.boolean().default(true),
});

type ProfileFormValues = z.infer<typeof profileSchema>;

const PREDEFINED_COLORS = [
  { name: "Indigo", value: "#4f46e5" },
  { name: "Terracotta", value: "#C2714F" },
  { name: "Émeraude", value: "#10b981" },
  { name: "Noir", value: "#000000" },
  { name: "Doré", value: "#d97706" },
  { name: "Océan", value: "#0ea5e9" },
];

const FONTS = [
  { name: "Inter", value: "Inter", class: "font-sans" },
  { name: "Playfair Display", value: "Playfair Display", class: "font-serif" },
  { name: "Space Grotesk", value: "Space Grotesk", class: "font-sans" },
  { name: "DM Serif Display", value: "DM Serif Display", class: "font-serif" },
  { name: "Syne", value: "Syne", class: "font-sans" },
  { name: "Cabinet Grotesk", value: "Cabinet Grotesk", class: "font-sans" },
];

const THEMES = [
  { 
    id: "minimalist", 
    name: "Minimaliste", 
    desc: "Épuré, beaucoup d'espace blanc",
    previewClass: "bg-white border-gray-200 text-black",
    previewElements: (
      <div className="space-y-2 p-2">
        <div className="h-4 w-3/4 bg-gray-100 rounded-sm"></div>
        <div className="h-2 w-1/2 bg-gray-50 rounded-sm"></div>
        <div className="h-6 w-full border border-gray-100 mt-4 rounded-sm flex items-center justify-center">
          <div className="h-1.5 w-8 bg-[var(--theme-primary,black)] rounded-full"></div>
        </div>
      </div>
    )
  },
  { 
    id: "modern", 
    name: "Moderne", 
    desc: "Glassmorphism, gradients, néons",
    previewClass: "bg-slate-900 border-slate-800 text-white",
    previewElements: (
      <div className="space-y-2 p-2 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-8 h-8 bg-[var(--theme-primary,#4f46e5)] rounded-full blur-xl opacity-50"></div>
        <div className="h-4 w-3/4 bg-white/20 rounded-full"></div>
        <div className="h-2 w-1/2 bg-white/10 rounded-full"></div>
        <div className="h-6 w-full bg-white/5 border border-white/10 mt-4 rounded-lg flex items-center justify-center">
          <div className="h-1.5 w-8 bg-[var(--theme-primary,#4f46e5)] rounded-full shadow-[0_0_8px_var(--theme-primary,#4f46e5)]"></div>
        </div>
      </div>
    )
  },
  { 
    id: "classic", 
    name: "Classique", 
    desc: "Serif, estructuré, pro",
    previewClass: "bg-[#FAFAF5] border-[#E5E2DC] text-[#2C363F]",
    previewElements: (
      <div className="space-y-2 p-2 border-t border-[#E5E2DC] mt-2">
        <div className="h-4 w-3/4 bg-[#2C363F] opacity-80 rounded-none"></div>
        <div className="h-2 w-1/2 bg-[#2C363F] opacity-40 rounded-none"></div>
        <div className="h-6 w-full border border-[#2C363F]/20 mt-4 rounded-none flex items-center justify-center">
          <div className="h-1 w-full border-t border-dashed border-[#2C363F]/30 mx-2"></div>
        </div>
      </div>
    )
  },
  { 
    id: "bold", 
    name: "Audacieux", 
    desc: "Texte géant, contraste maximal",
    previewClass: "bg-black border-zinc-800 text-white",
    previewElements: (
      <div className="space-y-1 p-2">
        <div className="h-6 w-full bg-white rounded-none"></div>
        <div className="h-6 w-5/6 bg-white rounded-none"></div>
        <div className="h-8 w-full bg-[var(--theme-primary,#facc15)] mt-2 rounded-none flex items-center justify-center">
          <div className="h-2 w-12 bg-black rounded-none"></div>
        </div>
      </div>
    )
  },
  { 
    id: "elegant", 
    name: "Élégant", 
    desc: "Chaud, raffiné, géométrique",
    previewClass: "bg-[#FDFBF7] border-[#EBE1D5] text-[#4A3B32]",
    previewElements: (
      <div className="space-y-2 p-2 relative">
        <div className="absolute top-2 right-2 w-4 h-4 rounded-full border-2 border-[var(--theme-primary,#C2714F)]"></div>
        <div className="h-4 w-2/3 bg-[#4A3B32] rounded-r-full"></div>
        <div className="h-2 w-1/3 bg-[#4A3B32]/50 rounded-r-full"></div>
        <div className="h-6 w-full bg-white shadow-sm border border-[#EBE1D5] mt-4 rounded-xl flex items-center justify-center">
          <div className="h-2 w-2 bg-[var(--theme-primary,#C2714F)] rounded-full"></div>
        </div>
      </div>
    )
  },
];

const MOCK_PROFILE = {
  fullName: "Jean Dupont",
  title: "Développeur Web Freelance",
  tagline: "Je transforme vos idées en produits digitaux",
  bio: "5 ans d'expérience dans la création d'interfaces modernes...",
  skills: ["React", "Node.js", "TypeScript"],
  services: "Création de sites vitrines et applications web",
  emailContact: "jean@exemple.com",
  photoUrl: null as string | null,
  logoUrl: null as string | null,
  whatsapp: null as string | null,
  linkedin: null as string | null,
  twitter: null as string | null,
  github: null as string | null,
  website: null as string | null,
  country: "Bénin",
  city: "Cotonou",
  styleTheme: "modern" as const,
  primaryColor: "#4f46e5",
  fontFamily: "Inter",
  yearsExperience: 5,
  completedProjects: 24,
  satisfiedClients: 18,
  availableForWork: true,
};

export default function ProfileEdit() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { data: profileData, isLoading } = useGetProfile({ query: { queryKey: getGetProfileQueryKey() } });
  const updateProfileMutation = useUpdateProfile();
  
  // N'utiliser le mock que si l'API a échoué ET qu'on n'est plus en chargement
  const profile = profileData ?? (!isLoading ? MOCK_PROFILE : null);

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      profileType: null,
      fullName: "",
      title: "",
      tagline: "",
      bio: "",
      photoUrl: "",
      logoUrl: "",
      skills: [],
      services: "",
      whatsapp: "",
      emailContact: "",
      linkedin: "",
      twitter: "",
      github: "",
      website: "",
      country: "",
      city: "",
      styleTheme: "modern",
      primaryColor: "#4f46e5",
      fontFamily: "Inter",
      yearsExperience: null,
      completedProjects: null,
      satisfiedClients: null,
      availableForWork: true,
    },
  });

  const initializedRef = useRef(false);

  useEffect(() => {
    if (profile && !initializedRef.current) {
      form.reset({
        ...profile,
        profileType: profile.profileType || null,
        tagline: profile.tagline || "",
        photoUrl: profile.photoUrl || "",
        logoUrl: profile.logoUrl || "",
        skills: profile.skills || [],
        services: profile.services || "",
        whatsapp: profile.whatsapp || "",
        linkedin: profile.linkedin || "",
        twitter: profile.twitter || "",
        github: profile.github || "",
        website: profile.website || "",
        country: profile.country || "",
        city: profile.city || "",
        styleTheme: profile.styleTheme || "modern",
        primaryColor: profile.primaryColor || "#4f46e5",
        fontFamily: profile.fontFamily || "Inter",
        yearsExperience: profile.yearsExperience || null,
        completedProjects: profile.completedProjects || null,
        satisfiedClients: profile.satisfiedClients || null,
        availableForWork: profile.availableForWork ?? true,
      });
      initializedRef.current = true;
    }
  }, [profile, form]);

  function onSubmit(values: ProfileFormValues) {
    updateProfileMutation.mutate({ data: values }, {
      onSuccess: (data) => {
        toast({ title: "Profil mis à jour", description: "Vos modifications ont été enregistrées." });
        queryClient.setQueryData(getGetProfileQueryKey(), data);
      },
      onError: (err: any) => {
        toast({ title: "Erreur", description: err?.data?.message || "Impossible de mettre à jour le profil.", variant: "destructive" });
      }
    });
  }

  function onValidationError(errors: any) {
    console.error("Erreurs de validation:", errors);
    const firstError = Object.values(errors)[0] as any;
    toast({
      title: "Formulaire incomplet",
      description: firstError?.message || "Veuillez remplir tous les champs requis.",
      variant: "destructive",
    });
  }

  // Tag Input Logic
  const [skillInput, setSkillInput] = useState("");
  const skills = form.watch("skills");

  const addSkill = () => {
    if (skillInput.trim() && !skills.includes(skillInput.trim())) {
      form.setValue("skills", [...skills, skillInput.trim()], { shouldDirty: true });
      setSkillInput("");
    }
  };

  const removeSkill = (skillToRemove: string) => {
    form.setValue("skills", skills.filter(s => s !== skillToRemove), { shouldDirty: true });
  };

  // Live Preview values
  const watchTheme = form.watch("styleTheme");
  const watchColor = form.watch("primaryColor") || "#4f46e5";
  const watchFont = form.watch("fontFamily") || "Inter";
  const watchName = form.watch("fullName") || "Votre Nom";
  const watchTitle = form.watch("title") || "Votre Titre";
  const watchProfileType = form.watch("profileType");
  const currentCategory = getCategoryById(watchProfileType);

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-muted rounded w-1/4"></div>
          <div className="h-[600px] bg-muted rounded-xl"></div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold font-display">Éditer le profil</h1>
          <p className="text-muted-foreground mt-1">Personnalisez l'apparence et le contenu de votre portfolio premium.</p>
        </div>
        <Button onClick={form.handleSubmit(onSubmit, onValidationError)} disabled={updateProfileMutation.isPending} data-testid="button-save-header">
          {updateProfileMutation.isPending ? "Enregistrement..." : "Publier les changements"}
        </Button>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit, onValidationError)} className="space-y-8">

          {/* Sélecteur de type de profil */}
          <div className="bg-card border rounded-2xl p-6 shadow-sm">
            <h2 className="text-base font-semibold mb-1">Votre domaine d'activité</h2>
            <p className="text-sm text-muted-foreground mb-4">Choisissez votre catégorie pour adapter le formulaire à votre métier.</p>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
              {PROFILE_CATEGORIES.map((cat) => {
                const isSelected = watchProfileType === cat.id;
                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => form.setValue("profileType", cat.id, { shouldDirty: true })}
                    className={`relative flex flex-col items-center gap-2 p-3 rounded-xl border-2 text-center transition-all duration-200 hover:scale-105 hover:shadow-md ${
                      isSelected
                        ? "border-primary bg-primary/5 shadow-sm scale-105"
                        : "border-border hover:border-primary/40"
                    }`}
                  >
                    <span className="text-2xl">{cat.emoji}</span>
                    <span className="text-xs font-medium leading-tight">{cat.label}</span>
                    {isSelected && (
                      <span className="absolute top-1.5 right-1.5 w-4 h-4 bg-primary rounded-full flex items-center justify-center">
                        <Check className="w-2.5 h-2.5 text-white" />
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
            {watchProfileType && (
              <p className="text-xs text-muted-foreground mt-3 animate-in fade-in duration-300">
                {currentCategory.emoji} <span className="font-medium">{currentCategory.label}</span> — {currentCategory.description}
              </p>
            )}
          </div>

          <Tabs defaultValue="identity" className="w-full">
            <TabsList className="grid w-full grid-cols-2 md:w-auto md:inline-grid md:grid-cols-4 mb-6">
              <TabsTrigger value="identity">Identité</TabsTrigger>
              <TabsTrigger value="skills">Compétences & Services</TabsTrigger>
              <TabsTrigger value="contact">Contact & Réseaux</TabsTrigger>
              <TabsTrigger value="appearance">Apparence</TabsTrigger>
            </TabsList>
            
            <div className="bg-card border rounded-2xl p-6 md:p-8 shadow-sm">
              
              {/* ONGLET IDENTITÉ */}
              <TabsContent value="identity" className="space-y-8 mt-0 focus-visible:outline-none">
                <div className="grid md:grid-cols-2 gap-8">
                  <div className="space-y-6">
                    <FormField
                      control={form.control}
                      name="fullName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Nom complet</FormLabel>
                          <FormControl>
                            <Input placeholder="John Doe" {...field} data-testid="input-fullname" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="title"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Titre professionnel</FormLabel>
                          <FormControl>
                            <Input placeholder="Développeur Web Freelance" {...field} data-testid="input-title" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="tagline"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Slogan / Tagline</FormLabel>
                          <FormControl>
                            <Input placeholder="Je transforme vos idées en produits digitaux" {...field} value={field.value || ""} data-testid="input-tagline" />
                          </FormControl>
                          <FormDescription>Une phrase d'accroche courte affichée sous votre titre.</FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="space-y-6">
                    <FormField
                      control={form.control}
                      name="photoUrl"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Photo de profil</FormLabel>
                          <FormControl>
                            <ImageUploader
                              value={field.value || ""}
                              onChange={field.onChange}
                              type="avatar"
                              label="une photo"
                              shape="circle"
                              placeholder={(form.watch("fullName") || "JD").substring(0, 2).toUpperCase()}
                            />
                          </FormControl>
                          <FormDescription>JPG, PNG ou WEBP — max 5 MB</FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="logoUrl"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Logo (optionnel)</FormLabel>
                          <FormControl>
                            <ImageUploader
                              value={field.value || ""}
                              onChange={field.onChange}
                              type="logo"
                              label="un logo"
                              shape="square"
                              placeholder="Aucun logo"
                            />
                          </FormControl>
                          <FormDescription>JPG, PNG ou WEBP — max 2 MB</FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>

                <FormField
                  control={form.control}
                  name="bio"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>À propos de moi (Bio)</FormLabel>
                      <FormControl>
                        <Textarea placeholder="Présentez-vous en quelques lignes..." className="h-32 resize-none" {...field} data-testid="input-bio" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-6 border-t">
                  {shouldShowField(watchProfileType, "showYearsExperience") && (
                  <FormField
                    control={form.control}
                    name="yearsExperience"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Années d'expérience</FormLabel>
                        <FormControl>
                          <Input type="number" min="0" placeholder="5" {...field} value={field.value || ""} onChange={e => field.onChange(e.target.value === "" ? null : Number(e.target.value))} data-testid="input-experience" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  )}
                  {shouldShowField(watchProfileType, "showCompletedProjects") && (
                  <FormField
                    control={form.control}
                    name="completedProjects"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{currentCategory.projectsSectionLabel.split(" ")[0]} réalisés</FormLabel>
                        <FormControl>
                          <Input type="number" min="0" placeholder="24" {...field} value={field.value || ""} onChange={e => field.onChange(e.target.value === "" ? null : Number(e.target.value))} data-testid="input-projects" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  )}
                  {shouldShowField(watchProfileType, "showSatisfiedClients") && (
                  <FormField
                    control={form.control}
                    name="satisfiedClients"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Clients satisfaits</FormLabel>
                        <FormControl>
                          <Input type="number" min="0" placeholder="18" {...field} value={field.value || ""} onChange={e => field.onChange(e.target.value === "" ? null : Number(e.target.value))} data-testid="input-clients" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  )}
                </div>

                <div className="grid md:grid-cols-2 gap-6 pt-6 border-t">
                  <div className="flex gap-4">
                    <FormField
                      control={form.control}
                      name="city"
                      render={({ field }) => (
                        <FormItem className="flex-1">
                          <FormLabel>Ville</FormLabel>
                          <FormControl>
                            <Input placeholder="Cotonou" {...field} value={field.value || ""} data-testid="input-city" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="country"
                      render={({ field }) => (
                        <FormItem className="flex-1">
                          <FormLabel>Pays</FormLabel>
                          <FormControl>
                            <Input placeholder="Bénin" {...field} value={field.value || ""} data-testid="input-country" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  <FormField
                    control={form.control}
                    name="availableForWork"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4 shadow-sm h-full">
                        <div className="space-y-0.5">
                          <FormLabel className="text-base">Disponible pour missions</FormLabel>
                          <FormDescription>Afficher un badge de disponibilité sur votre profil</FormDescription>
                        </div>
                        <FormControl>
                          <Switch checked={field.value} onCheckedChange={field.onChange} data-testid="switch-available" />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </div>
              </TabsContent>

              {/* ONGLET COMPÉTENCES & SERVICES */}
              <TabsContent value="skills" className="space-y-8 mt-0 focus-visible:outline-none">
                <FormField
                  control={form.control}
                  name="skills"
                  render={() => (
                    <FormItem>
                      <FormLabel>Compétences</FormLabel>
                      <div className="space-y-4">
                        <div className="flex gap-2">
                          <Input 
                            placeholder="Ajouter une compétence (ex: React) et appuyer sur Entrée" 
                            value={skillInput}
                            onChange={(e) => setSkillInput(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') {
                                e.preventDefault();
                                addSkill();
                              }
                            }}
                            data-testid="input-skill-add"
                          />
                          <Button type="button" variant="secondary" onClick={addSkill} data-testid="button-skill-add">
                            <Plus className="w-4 h-4" />
                          </Button>
                        </div>
                        
                        <div className="flex flex-wrap gap-2 min-h-[50px] p-4 bg-muted/30 rounded-lg border border-dashed">
                          {skills.length === 0 ? (
                            <span className="text-sm text-muted-foreground italic">Aucune compétence ajoutée.</span>
                          ) : (
                            skills.map((skill, index) => (
                              <div key={index} className="flex items-center gap-1 bg-primary/10 text-primary px-3 py-1.5 rounded-full text-sm font-medium border border-primary/20">
                                <span>{skill}</span>
                                <button type="button" onClick={() => removeSkill(skill)} className="text-primary/70 hover:text-primary transition-colors ml-1" data-testid={`button-skill-remove-${index}`}>
                                  <X className="w-3 h-3" />
                                </button>
                              </div>
                            ))
                          )}
                        </div>
                      </div>
                      <FormDescription>Ces tags apparaîtront stylisés selon votre thème.</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="services"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Services proposés</FormLabel>
                      <FormControl>
                        <Textarea placeholder="Décrivez en détail les services que vous offrez à vos clients..." className="h-48 resize-none" {...field} data-testid="input-services" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </TabsContent>

              {/* ONGLET CONTACT & RÉSEAUX */}
              <TabsContent value="contact" className="space-y-6 mt-0 focus-visible:outline-none">
                <div className="grid md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="emailContact"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email de contact public</FormLabel>
                        <FormControl>
                          <Input placeholder="contact@exemple.com" {...field} data-testid="input-email" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="whatsapp"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Numéro WhatsApp (avec indicatif)</FormLabel>
                        <FormControl>
                          <Input placeholder="+229 97 00 00 00" {...field} value={field.value || ""} data-testid="input-whatsapp" />
                        </FormControl>
                        <FormDescription>Générera un bouton direct vers votre WhatsApp.</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  {shouldShowField(watchProfileType, "showLinkedin") && (
                  <FormField
                    control={form.control}
                    name="linkedin"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Profil LinkedIn</FormLabel>
                        <FormControl>
                          <Input placeholder="https://linkedin.com/in/..." {...field} value={field.value || ""} data-testid="input-linkedin" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  )}
                  {shouldShowField(watchProfileType, "showGithub") && (
                  <FormField
                    control={form.control}
                    name="github"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Profil GitHub</FormLabel>
                        <FormControl>
                          <Input placeholder="https://github.com/..." {...field} value={field.value || ""} data-testid="input-github" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  )}
                  {shouldShowField(watchProfileType, "showTwitter") && (
                  <FormField
                    control={form.control}
                    name="twitter"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Profil Twitter / X</FormLabel>
                        <FormControl>
                          <Input placeholder="https://twitter.com/..." {...field} value={field.value || ""} data-testid="input-twitter" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  )}
                  <FormField
                    control={form.control}
                    name="website"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Site Web Personnel</FormLabel>
                        <FormControl>
                          <Input placeholder="https://mon-site.com" {...field} value={field.value || ""} data-testid="input-website" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </TabsContent>

              {/* ONGLET APPARENCE */}
              <TabsContent value="appearance" className="space-y-10 mt-0 focus-visible:outline-none">
                
                {/* LIVE PREVIEW HERO */}
                <div className="rounded-xl overflow-hidden border shadow-inner mb-10">
                  <div className="bg-muted p-2 text-xs font-mono border-b flex items-center justify-between px-4">
                    <div className="flex gap-1.5">
                      <span className="w-3 h-3 rounded-full bg-red-400" />
                      <span className="w-3 h-3 rounded-full bg-yellow-400" />
                      <span className="w-3 h-3 rounded-full bg-green-400" />
                    </div>
                    <span className="opacity-50">afrifolio.com/votre-nom</span>
                    <span className="opacity-0">000</span>
                  </div>

                  {/* Preview container */}
                  <div
                    className={`w-full transition-all duration-500 relative overflow-hidden ${
                      watchTheme === 'modern' ? 'bg-[#080B14] text-white' :
                      watchTheme === 'minimalist' ? 'bg-white text-gray-900' :
                      watchTheme === 'classic' ? 'bg-[#F9F8F5] text-[#1A2229]' :
                      watchTheme === 'bold' ? 'bg-black text-white' :
                      'bg-[#FDFBF7] text-[#2D241E]'
                    }`}
                    style={{ fontFamily: `"${watchFont}", sans-serif`, '--theme-primary': watchColor } as React.CSSProperties}
                  >
                    {/* Déco background */}
                    {watchTheme === 'modern' && (
                      <>
                        <div className="absolute top-0 right-0 w-48 h-48 rounded-full blur-[60px] opacity-25 pointer-events-none" style={{ background: watchColor }} />
                        <div className="absolute bottom-0 left-0 w-32 h-32 rounded-full blur-[40px] opacity-15 pointer-events-none" style={{ background: watchColor }} />
                      </>
                    )}
                    {watchTheme === 'bold' && <div className="absolute top-0 left-0 w-full h-1.5" style={{ background: watchColor }} />}
                    {watchTheme === 'elegant' && (
                      <div className="absolute top-0 right-0 w-48 h-48 rounded-full blur-[60px] opacity-20 pointer-events-none" style={{ background: watchColor + "88" }} />
                    )}

                    {/* Mini navbar */}
                    <div className={`flex items-center justify-between px-6 py-3 border-b ${
                      watchTheme === 'modern' ? 'border-white/10' :
                      watchTheme === 'bold' ? 'border-zinc-800' :
                      watchTheme === 'classic' ? 'border-[#E5E2DC]' :
                      watchTheme === 'elegant' ? 'border-[#EBE1D5]' :
                      'border-gray-100'
                    }`}>
                      <span className="font-bold text-sm" style={{ color: watchColor }}>
                        {watchName.split(" ")[0] || "Portfolio"}
                      </span>
                      <div className="flex items-center gap-4 text-xs opacity-50">
                        <span>À propos</span>
                        <span>Projets</span>
                        <span>Contact</span>
                      </div>
                      <div className="w-6 h-6 rounded-full border flex items-center justify-center opacity-40" style={{ borderColor: watchColor }}>
                        <span className="text-[8px]">☀</span>
                      </div>
                    </div>

                    {/* Hero split */}
                    <div className="flex flex-col md:flex-row items-center gap-6 px-6 py-8 relative z-10">
                      {/* Left */}
                      <div className="flex-1 space-y-3">
                        <div className="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-full" style={{ background: watchColor + "1a", color: watchColor }}>
                          ✦ Professionnel
                        </div>
                        <div>
                          <p className={`text-[10px] opacity-50 mb-1`}>Bonjour, je suis</p>
                          <h3 className={`leading-tight ${
                            watchTheme === 'bold' ? 'text-2xl font-black uppercase tracking-tighter' :
                            watchTheme === 'minimalist' ? 'text-2xl font-light' :
                            watchTheme === 'classic' ? 'text-2xl font-serif' :
                            'text-2xl font-bold'
                          }`}>
                            {watchName.split(" ")[0] || "Votre"}{" "}
                            <span style={{ color: watchColor }}>{watchName.split(" ").slice(1).join(" ") || "Nom"}</span>
                          </h3>
                        </div>
                        <p className="text-xs font-semibold" style={{ color: watchColor }}>
                          {watchTitle || "Votre titre professionnel"}
                        </p>
                        <p className={`text-[10px] leading-relaxed opacity-60 max-w-[200px]`}>
                          Votre tagline s'affichera ici pour accrocher vos visiteurs.
                        </p>
                        <div className="flex gap-2 pt-1">
                          <div className={`px-3 py-1.5 text-[10px] font-semibold text-white rounded-full`} style={{ background: watchColor }}>
                            Contact
                          </div>
                          <div className={`px-3 py-1.5 text-[10px] font-medium rounded-full border ${
                            watchTheme === 'modern' || watchTheme === 'bold' ? 'border-white/20 text-white/70' : 'border-current opacity-50'
                          }`}>
                            Voir projets →
                          </div>
                        </div>
                      </div>

                      {/* Right: photo placeholder */}
                      <div className="flex-shrink-0 flex items-center justify-center">
                        <div className="relative">
                          <div className="absolute -inset-2 rounded-full opacity-20 blur-md" style={{ background: watchColor }} />
                          <div className={`relative w-24 h-24 flex items-center justify-center text-white text-xl font-bold shadow-xl ${
                            watchTheme === 'minimalist' ? 'rounded-full' :
                            watchTheme === 'modern' ? 'rounded-2xl' :
                            watchTheme === 'classic' ? 'rounded-full border-2 border-white' :
                            watchTheme === 'bold' ? 'rounded-none' :
                            'rounded-[1.5rem]'
                          }`} style={{ background: `linear-gradient(135deg, ${watchColor}, ${watchColor}99)` }}>
                            {watchName ? watchName.split(" ").map((n: string) => n[0]).join("").toUpperCase().substring(0, 2) : "JD"}
                          </div>
                          <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 bg-emerald-500 text-white text-[8px] font-bold px-2 py-0.5 rounded-full whitespace-nowrap flex items-center gap-1">
                            <span className="w-1 h-1 bg-white rounded-full animate-pulse" /> Disponible
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Mini stats bar */}
                    <div className={`flex items-center justify-center gap-8 px-6 py-4 border-t text-center ${
                      watchTheme === 'modern' ? 'border-white/10 bg-white/[0.03]' :
                      watchTheme === 'bold' ? 'border-zinc-800 bg-zinc-950' :
                      watchTheme === 'classic' ? 'border-[#E5E2DC] bg-white' :
                      watchTheme === 'elegant' ? 'border-[#EBE1D5] bg-[#F8F4EF]' :
                      'border-gray-100 bg-gray-50'
                    }`}>
                      {[["5+", "Années"], ["24", "Projets"], ["18", "Clients"]].map(([val, label]) => (
                        <div key={label} className="flex flex-col items-center">
                          <span className="text-base font-bold" style={{ color: watchColor }}>{val}</span>
                          <span className="text-[9px] opacity-50 uppercase tracking-wider">{label}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <FormField
                  control={form.control}
                  name="styleTheme"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-lg flex items-center gap-2 mb-4"><Layout className="w-5 h-5 text-primary" /> Architecture Visuelle</FormLabel>
                      <div className="grid grid-cols-1 md:grid-cols-3 xl:grid-cols-5 gap-4" style={{ '--theme-primary': watchColor } as React.CSSProperties}>
                        {THEMES.map((theme) => (
                          <div 
                            key={theme.id}
                            className={`cursor-pointer rounded-xl border-2 transition-all overflow-hidden ${field.value === theme.id ? 'border-primary ring-2 ring-primary/20 ring-offset-2' : 'border-border hover:border-primary/50'}`}
                            onClick={() => field.onChange(theme.id)}
                            data-testid={`theme-card-${theme.id}`}
                          >
                            <div className={`h-32 w-full ${theme.previewClass} flex items-center justify-center`}>
                              <div className="w-4/5">
                                {theme.previewElements}
                              </div>
                            </div>
                            <div className="p-3 bg-card border-t">
                              <div className="font-semibold flex items-center justify-between">
                                {theme.name}
                                {field.value === theme.id && <CheckCircle2 className="w-4 h-4 text-primary" />}
                              </div>
                              <div className="text-xs text-muted-foreground mt-1">{theme.desc}</div>
                            </div>
                          </div>
                        ))}
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid md:grid-cols-2 gap-10">
                  <FormField
                    control={form.control}
                    name="primaryColor"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-lg flex items-center gap-2 mb-4"><Palette className="w-5 h-5 text-primary" /> Couleur Principale</FormLabel>
                        <div className="space-y-4">
                          <div className="flex flex-wrap gap-3">
                            {PREDEFINED_COLORS.map(color => (
                              <button
                                key={color.value}
                                type="button"
                                className={`w-10 h-10 rounded-full border-2 transition-all ${field.value === color.value ? 'ring-2 ring-offset-2 ring-primary scale-110 border-white dark:border-black' : 'border-transparent hover:scale-110'}`}
                                style={{ backgroundColor: color.value }}
                                onClick={() => field.onChange(color.value)}
                                title={color.name}
                                data-testid={`color-preset-${color.name}`}
                              />
                            ))}
                          </div>
                          
                          <div className="flex items-center gap-4 p-4 bg-muted/50 rounded-xl border">
                            <div className="relative w-12 h-12 rounded-lg overflow-hidden shrink-0 shadow-inner border border-black/10">
                              <input 
                                type="color" 
                                className="absolute -top-2 -left-2 w-16 h-16 cursor-pointer"
                                value={field.value || "#4f46e5"}
                                onChange={(e) => field.onChange(e.target.value)}
                                data-testid="input-color-picker"
                              />
                            </div>
                            <div>
                              <div className="font-medium">Couleur personnalisée</div>
                              <div className="text-xs text-muted-foreground font-mono uppercase">{field.value || "#4f46e5"}</div>
                            </div>
                          </div>
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="fontFamily"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-lg flex items-center gap-2 mb-4"><Type className="w-5 h-5 text-primary" /> Typographie</FormLabel>
                        <div className="grid grid-cols-2 gap-3">
                          {FONTS.map(font => (
                            <div
                              key={font.value}
                              className={`cursor-pointer border p-4 rounded-xl transition-all ${field.value === font.value ? 'border-primary bg-primary/5 shadow-sm' : 'hover:border-primary/40 hover:bg-muted/50'}`}
                              onClick={() => field.onChange(font.value)}
                              data-testid={`font-card-${font.name.replace(/\s+/g, '-')}`}
                            >
                              <div className="flex items-center justify-between mb-2">
                                <div className="text-xs font-medium text-muted-foreground">{font.name}</div>
                                {field.value === font.value && <Check className="w-4 h-4 text-primary" />}
                              </div>
                              <div className="text-xl" style={{ fontFamily: `"${font.value}", sans-serif` }}>
                                Ag
                              </div>
                            </div>
                          ))}
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
              </TabsContent>
            </div>
          </Tabs>

          <div className="flex justify-end pt-4">
            <Button type="submit" size="lg" disabled={updateProfileMutation.isPending} data-testid="button-save-footer">
              {updateProfileMutation.isPending ? "Enregistrement..." : "Enregistrer les modifications"}
            </Button>
          </div>
        </form>
      </Form>
    </DashboardLayout>
  );
}
