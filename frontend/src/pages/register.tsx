import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useRegister } from "@workspace/api-client-react";
import { useAuth } from "@/contexts/auth";
import { useLocation, Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { Eye, EyeOff } from "lucide-react";

const registerSchema = z.object({
  username: z.string().min(3, "Min 3 caractères").regex(/^[a-zA-Z0-9_-]+$/, "Lettres, nombres, tirets et underscores uniquement"),
  email: z.string().email("Email invalide"),
  password: z.string().min(6, "Min 6 caractères"),
  referralCode: z.string().optional(),
});

export default function Register() {
  const [, setLocation] = useLocation();
  const { login } = useAuth();
  const { toast } = useToast();
  const registerMutation = useRegister();
  const [showPassword, setShowPassword] = useState(false);

  const form = useForm<z.infer<typeof registerSchema>>({
    resolver: zodResolver(registerSchema),
    defaultValues: { username: "", email: "", password: "", referralCode: "" },
  });

  useEffect(() => {
    const ref = new URLSearchParams(window.location.search).get("ref");
    if (ref) form.setValue("referralCode", ref);
  }, [form]);

  function onSubmit(values: z.infer<typeof registerSchema>) {
    registerMutation.mutate({ data: values }, {
      onSuccess: (response) => {
        login(response.token, response.user);
        toast({ title: "Inscription réussie", description: "Bienvenue sur AfriFolio" });
        setLocation("/dashboard");
      },
      onError: (error: any) => {
        toast({ title: "Erreur", description: error?.data?.message || "Erreur lors de l'inscription", variant: "destructive" });
      }
    });
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/30 px-4 py-8">
      <div className="w-full max-w-md bg-card border rounded-xl shadow-sm p-8">
        <div className="text-center mb-8">
          <Link href="/" className="inline-block font-display font-bold text-3xl text-primary mb-2">AfriFolio</Link>
          <h1 className="text-2xl font-bold">Créer un compte</h1>
          <p className="text-muted-foreground text-sm mt-1">Rejoignez la communauté des freelances africains</p>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="username"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nom d'utilisateur (lien du portfolio)</FormLabel>
                  <FormControl>
                    <div className="flex items-center">
                      <span className="bg-muted px-3 py-2 border border-r-0 rounded-l-md text-muted-foreground text-sm">afrifolio.com/</span>
                      <Input className="rounded-l-none" placeholder="mon-pseudo" {...field} />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input placeholder="nom@exemple.com" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Mot de passe</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Input type={showPassword ? "text" : "password"} placeholder="••••••••" {...field} className="pr-10" />
                      <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors">
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="referralCode"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Code de parrainage (optionnel)</FormLabel>
                  <FormControl>
                    <Input placeholder="CODE" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" className="w-full" disabled={registerMutation.isPending}>
              {registerMutation.isPending ? "Inscription..." : "S'inscrire"}
            </Button>
          </form>
        </Form>

        <div className="mt-6 text-center text-sm">
          <span className="text-muted-foreground">Déjà un compte ? </span>
          <Link href="/connexion" className="text-primary hover:underline font-medium">Se connecter</Link>
        </div>
      </div>
    </div>
  );
}
