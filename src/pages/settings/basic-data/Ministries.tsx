import { useState, useEffect } from "react";
import { Plus } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useForm } from "react-hook-form";
import { toast } from "@/components/ui/use-toast";
import { format } from "date-fns";
import { supabase } from "@/lib/supabase";
import { Label } from "@/components/ui/label";
import { MinistryTable } from "@/components/tables/MinistryTable";

interface MinistryFormData {
  name: string;
  code: string;
  description: string;
  address?: string;
  email?: string;
  phone?: string;
  head_name?: string;
  is_active: boolean;
}

interface Ministry {
  id: string;
  name: string;
  code: string;
  description?: string;
  address?: string;
  email?: string;
  phone?: string;
  head_name?: string;
  is_active: boolean;
  programs_count?: number;
  created_at: string;
  updated_at: string;
}

export default function Ministries() {
  const [ministries, setMinistries] = useState<Ministry[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogMode, setDialogMode] = useState<"add" | "edit" | "view" | "delete">("add");
  const [currentMinistry, setCurrentMinistry] = useState<Ministry | null>(null);

  const form = useForm({
    defaultValues: {
      name: "",
      code: "",
      description: "",
      address: "",
      email: "",
      phone: "",
      head_name: "",
      is_active: true,
    },
  });

  useEffect(() => {
    fetchMinistries();
  }, []);

  useEffect(() => {
    if (currentMinistry && dialogMode === "edit") {
      form.reset({
        name: currentMinistry.name || "",
        code: currentMinistry.code || "",
        description: currentMinistry.description || "",
        address: currentMinistry.address || "",
        email: currentMinistry.email || "",
        phone: currentMinistry.phone || "",
        head_name: currentMinistry.head_name || "",
        is_active: currentMinistry.is_active,
      });
    }
  }, [currentMinistry, dialogMode, form]);

  const formatDate = (dateString: string) => {
    return format(new Date(dateString), "dd/MM/yyyy");
  };

  async function fetchMinistries() {
    try {
      // Get ministries
      const { data: ministriesData, error: ministriesError } = await supabase.from("ministries").select("*").order("name");

      if (ministriesError) throw ministriesError;

      // Get portfolios that might be associated with ministries
      // (this is a guess - we may need to find a different relationship)
      const { data: portfoliosData, error: portfoliosError } = await supabase.from("portfolios").select("id, name");

      if (portfoliosError) throw portfoliosError;

      // For now, we'll set program counts to 0 since the relationship is unclear
      const ministriesWithCounts = ministriesData.map((ministry) => ({
        ...ministry,
        programs_count: 0, // Set to 0 until we establish the correct relationship
      }));

      setMinistries(ministriesWithCounts);
    } catch (error) {
      console.error("Error fetching ministries:", error);
      toast({
        title: "Erreur",
        description: "Impossible de charger les ministères",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }

  const handleAddMinistry = () => {
    setDialogMode("add");
    form.reset();
    setDialogOpen(true);
  };

  const handleViewMinistry = (ministry: Ministry) => {
    setCurrentMinistry(ministry);
    setDialogMode("view");
    setDialogOpen(true);
  };

  const handleEditMinistry = (ministry: Ministry) => {
    setCurrentMinistry(ministry);
    setDialogMode("edit");
    setDialogOpen(true);
  };

  const handleDeleteMinistry = (ministry: Ministry) => {
    setCurrentMinistry(ministry);
    setDialogMode("delete");
    setDialogOpen(true);
  };

  const onSubmit = async (data: MinistryFormData) => {
    try {
      if (dialogMode === "add") {
        await supabase.from("ministries").insert([data]);
      } else if (dialogMode === "edit" && currentMinistry) {
        await supabase.from("ministries").update(data).eq("id", currentMinistry.id);
      }
      toast({
        title: "Succès",
        description: dialogMode === "add" ? "Ministère ajouté" : "Ministère modifié",
      });
      fetchMinistries();
      setDialogOpen(false);
    } catch (error) {
      console.error("Error:", error);
      toast({
        title: "Erreur",
        description: "Une erreur est survenue",
        variant: "destructive",
      });
    }
  };

  const handleDeleteConfirm = async () => {
    if (!currentMinistry) return;

    try {
      await supabase.from("ministries").delete().eq("id", currentMinistry.id);
      toast({
        title: "Succès",
        description: "Ministère supprimé",
      });
      fetchMinistries();
      setDialogOpen(false);
    } catch (error) {
      console.error("Error:", error);
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors de la suppression",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>Ministères</CardTitle>
              <CardDescription>Gérez les ministères du système</CardDescription>
            </div>
            <Button onClick={handleAddMinistry}>
              <Plus className="mr-2 h-4 w-4" />
              Ajouter un ministère
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div>Chargement...</div>
          ) : (
            <MinistryTable
              ministries={ministries}
              formatDate={formatDate}
              onView={handleViewMinistry}
              onEdit={handleEditMinistry}
              onDelete={handleDeleteMinistry}
              onRefresh={fetchMinistries}
            />
          )}
        </CardContent>
      </Card>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>
              {dialogMode === "add"
                ? "Ajouter un ministère"
                : dialogMode === "edit"
                  ? "Modifier le ministère"
                  : dialogMode === "view"
                    ? "Détails du ministère"
                    : "Supprimer le ministère"}
            </DialogTitle>
            <DialogDescription>
              {dialogMode === "add"
                ? "Créer un nouveau ministère"
                : dialogMode === "edit"
                  ? "Modifier les informations du ministère"
                  : dialogMode === "view"
                    ? "Voir les détails du ministère"
                    : "Êtes-vous sûr de vouloir supprimer ce ministère ?"}
            </DialogDescription>
          </DialogHeader>

          {(dialogMode === "add" || dialogMode === "edit") && (
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nom</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="code"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Code</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description</FormLabel>
                      <FormControl>
                        <Textarea rows={3} {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="phone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Téléphone</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="address"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Adresse</FormLabel>
                      <FormControl>
                        <Textarea {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="head_name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Responsable</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="is_active"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                      <FormControl>
                        <input
                          type="checkbox"
                          checked={field.value}
                          onChange={field.onChange}
                          className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel>Actif</FormLabel>
                        <FormDescription>Ce ministère est-il actuellement actif?</FormDescription>
                      </div>
                    </FormItem>
                  )}
                />

                <DialogFooter>
                  <Button type="submit">Sauvegarder</Button>
                </DialogFooter>
              </form>
            </Form>
          )}

          {dialogMode === "view" && currentMinistry && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="font-medium">Nom</Label>
                  <p>{currentMinistry.name}</p>
                </div>
                <div>
                  <Label className="font-medium">Code</Label>
                  <p>{currentMinistry.code}</p>
                </div>
              </div>
              <div>
                <Label className="font-medium">Description</Label>
                <p>{currentMinistry.description || "N/A"}</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="font-medium">Email</Label>
                  <p>{currentMinistry.email || "N/A"}</p>
                </div>
                <div>
                  <Label className="font-medium">Téléphone</Label>
                  <p>{currentMinistry.phone || "N/A"}</p>
                </div>
              </div>
              <div>
                <Label className="font-medium">Adresse</Label>
                <p>{currentMinistry.address || "N/A"}</p>
              </div>
              <div>
                <Label className="font-medium">Responsable</Label>
                <p>{currentMinistry.head_name || "N/A"}</p>
              </div>
              <div>
                <Label className="font-medium">Statut</Label>
                <p>{currentMinistry.is_active ? "Actif" : "Inactif"}</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="font-medium">Date de création</Label>
                  <p>{formatDate(currentMinistry.created_at)}</p>
                </div>
                <div>
                  <Label className="font-medium">Dernière mise à jour</Label>
                  <p>{formatDate(currentMinistry.updated_at)}</p>
                </div>
              </div>
            </div>
          )}

          {dialogMode === "delete" && (
            <div className="space-y-4">
              <p>Êtes-vous sûr de vouloir supprimer ce ministère ? Cette action est irréversible.</p>

              <DialogFooter>
                <Button variant="outline" onClick={() => setDialogOpen(false)}>
                  Annuler
                </Button>
                <Button variant="destructive" onClick={handleDeleteConfirm}>
                  Supprimer
                </Button>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
