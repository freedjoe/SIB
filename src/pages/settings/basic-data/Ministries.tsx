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
import { supabase, RealtimeChannel } from "@/lib/supabase";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { MinistryTable } from "@/components/tables/MinistryTable";
import { Badge } from "@/components/ui/badge"; // Import Badge

interface MinistryFormData {
  name_ar: string;
  name_en: string;
  name_fr: string;
  code: string;
  description: string;
  address?: string;
  email?: string;
  phone?: string;
  phone2?: string;
  fax1?: string;
  fax2?: string;
  is_active: boolean;
}

interface Ministry {
  id: string;
  name_ar: string;
  name_en: string;
  name_fr: string;
  code: string;
  description?: string;
  address?: string;
  email?: string;
  phone?: string;
  phone2?: string;
  fax1?: string;
  fax2?: string;
  is_active: boolean;
  parent_id?: string;
}

export default function Ministries() {
  const [ministries, setMinistries] = useState<Ministry[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogMode, setDialogMode] = useState<"add" | "edit" | "view" | "delete">("add");
  const [currentMinistry, setCurrentMinistry] = useState<Ministry | null>(null);

  const form = useForm({
    defaultValues: {
      name_ar: "",
      name_en: "",
      name_fr: "",
      code: "",
      description: "",
      address: "",
      email: "",
      phone: "",
      is_active: true,
      parent_id: "null" // Default to 'null' string for the 'Aucun' option
    },
  });

  useEffect(() => {
    fetchMinistries();

    const channel: RealtimeChannel = supabase
      .channel('ministries-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'ministries' },
        (payload) => {
          console.log('Change received!', payload);
          fetchMinistries(); // Re-fetch data on any change
        }
      )
      .subscribe();

    // Cleanup subscription on component unmount
    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  useEffect(() => {
    if (currentMinistry && dialogMode === "edit") {
      form.reset({
        name_ar: currentMinistry.name_ar || "",
        name_en: currentMinistry.name_en || "",
        name_fr: currentMinistry.name_fr || "",
        code: currentMinistry.code || "",
        description: currentMinistry.description || "",
        address: currentMinistry.address || "",
        email: currentMinistry.email || "",
        phone: currentMinistry.phone || "",
        is_active: currentMinistry.is_active,
        parent_id: currentMinistry.parent_id || "null", // Reset to 'null' string if no parent
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

      // Set the fetched ministries directly
      setMinistries(ministriesData);
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

  const onSubmit = async (formData: MinistryFormData) => {
    // Convert 'null' string back to actual null for the database
    const dataToSubmit = {
      ...formData,
      parent_id: formData.parent_id === "null" ? null : formData.parent_id,
    };

    try {
      if (dialogMode === "add") {
        await supabase.from("ministries").insert([dataToSubmit]);
      } else if (dialogMode === "edit" && currentMinistry) {
        await supabase.from("ministries").update(dataToSubmit).eq("id", currentMinistry.id);
      }
      toast({
        title: "Succès",
        description: dialogMode === "add" ? "Ministère ajouté" : "Ministère modifié",
      });
      // fetchMinistries(); // Removed: Realtime handles updates
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
      // fetchMinistries(); // Removed: Realtime handles updates
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
              <CardTitle>Institutions gouvernementales</CardTitle>
              <CardDescription>Gérez les Institutions gouvernementales du système</CardDescription>
            </div>
            <Button onClick={handleAddMinistry}>
              <Plus className="mr-2 h-4 w-4" />
              Ajouter une institution
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
        <DialogContent className="sm:max-w-[500px] max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {dialogMode === "add"
                ? "Ajouter une institution gouvernementale"
                : dialogMode === "edit"
                  ? "Modifier l'institution gouvernementale"
                  : dialogMode === "view"
                    ? "Détails de l'institution gouvernementale"
                    : "Supprimer l'institution gouvernementale"}
            </DialogTitle>
            <DialogDescription>
              {dialogMode === "add"
                ? "Créer une nouvelle institution gouvernementale"
                : dialogMode === "edit"
                  ? "Modifier les informations de l'institution gouvernementale"
                  : dialogMode === "view"
                    ? "Voir les détails de l'institution gouvernementale"
                    : "Êtes-vous sûr de vouloir supprimer cette institution gouvernementale ?"}
            </DialogDescription>
          </DialogHeader>

          {(dialogMode === "add" || dialogMode === "edit") && (
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="name_ar"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nom en arabe</FormLabel>
                      <FormControl>
                        <Input placeholder="الاسم بالعربية" {...field} dir="rtl" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="name_en"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nom en anglais</FormLabel>
                      <FormControl>
                        <Input placeholder="Name in English" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="name_fr"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nom en français</FormLabel>
                      <FormControl>
                        <Input placeholder="Nom en français" {...field} />
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

                <div className="space-y-4">
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
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="phone"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Téléphone 1</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="phone2"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Téléphone 2</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="fax1"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Fax 1</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="fax2"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Fax 2</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
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

                {/* Parent Ministry Select */}
                <FormField
                  control={form.control}
                  name="parent_id"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Ministère Parent</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value || ""} defaultValue={field.value || ""}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Sélectionner un ministère parent (optionnel)" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="null">Aucun</SelectItem>
                          {ministries
                            .filter((m) => !currentMinistry || m.id !== currentMinistry.id) // Prevent selecting self
                            .map((ministry) => (
                              <SelectItem key={ministry.id} value={ministry.id}>
                                {ministry.name}
                              </SelectItem>
                            ))}
                        </SelectContent>
                      </Select>
                      <FormDescription>Sélectionnez le ministère auquel celui-ci est rattaché, le cas échéant.</FormDescription>
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
            <div className="space-y-6 p-4">
              <div className="flex justify-between items-start border-b pb-4 mb-6">
                <div className="space-y-1">
                   <Label className="text-sm font-medium text-gray-500">Code</Label>
                  <p className="font-mono text-base bg-muted px-3 py-1.5 rounded-md inline-block text-foreground">{currentMinistry.code}</p>
                </div>
                <div>
                  <Badge variant={currentMinistry.is_active ? "default" : "destructive"} className={currentMinistry.is_active ? "bg-green-100 text-green-800 border-green-300 text-sm px-3 py-1" : "bg-red-100 text-red-800 border-red-300 text-sm px-3 py-1"}>
                    {currentMinistry.is_active ? "Actif" : "Inactif"}
                  </Badge>
                </div>
              </div>
              
              <div className="space-y-6">
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-gray-500">Noms</Label>
                  <div className="space-y-2">
                    <div>
                      <Label className="text-xs text-muted-foreground">Français</Label>
                      <p className="text-base font-medium text-foreground">{currentMinistry.name_fr}</p>
                    </div>
                    <div>
                      <Label className="text-xs text-muted-foreground">Arabe</Label>
                      <p className="text-base font-medium text-foreground" dir="rtl">{currentMinistry.name_ar}</p>
                    </div>
                    <div>
                      <Label className="text-xs text-muted-foreground">Anglais</Label>
                      <p className="text-base font-medium text-foreground">{currentMinistry.name_en}</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-medium text-gray-500">Description</Label>
                  <p className="text-base text-gray-700 leading-relaxed">{currentMinistry.description || <span className="italic text-gray-400">Non spécifiée</span>}</p>
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-medium text-gray-500">Adresse</Label>
                  <p className="text-base text-gray-700">{currentMinistry.address || <span className="italic text-gray-400">Non spécifiée</span>}</p>
                </div>

                <div className="space-y-6">
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-muted-foreground">Email</Label>
                  <p className="text-base text-foreground">{currentMinistry.email || <span className="italic text-muted-foreground">Non spécifié</span>}</p>
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <Label className="text-sm font-medium text-muted-foreground">Téléphone 1</Label>
                      <p className="text-base text-foreground">{currentMinistry.phone || <span className="italic text-muted-foreground">Non spécifié</span>}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-muted-foreground">Téléphone 2</Label>
                      <p className="text-base text-foreground">{currentMinistry.phone2 || <span className="italic text-muted-foreground">Non spécifié</span>}</p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <Label className="text-sm font-medium text-muted-foreground">Fax 1</Label>
                      <p className="text-base text-foreground">{currentMinistry.fax1 || <span className="italic text-muted-foreground">Non spécifié</span>}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-muted-foreground">Fax 2</Label>
                      <p className="text-base text-foreground">{currentMinistry.fax2 || <span className="italic text-muted-foreground">Non spécifié</span>}</p>
                    </div>
                  </div>
                </div>
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
