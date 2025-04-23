import { useState, useEffect } from "react";
import { Plus } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormDescription, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useForm } from "react-hook-form";
import { toast } from "@/components/ui/use-toast";
import { format } from "date-fns";
import { supabase } from "@/lib/supabase";
import { Label } from "@/components/ui/label";
import { BudgetCatalogTable } from "@/components/tables/BudgetCatalogTable";

interface BudgetItemFormData {
  code: string;
  name: string;
  description: string;
  category: string;
  type: string;
  year: number;
  is_active: boolean;
}

interface BudgetItem {
  id: string;
  code: string;
  name: string;
  description?: string;
  category: string;
  type: string;
  year: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

const budgetCategories = [
  { value: "income", label: "Recette" },
  { value: "expense", label: "Dépense" },
  { value: "investment", label: "Investissement" },
  { value: "transfer", label: "Transfert" },
];

const budgetTypes = [
  { value: "ae", label: "Autorisation d'Engagement (AE)" },
  { value: "cp", label: "Crédit de Paiement (CP)" },
];

export default function BudgetCatalog() {
  const [budgetItems, setBudgetItems] = useState<BudgetItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogMode, setDialogMode] = useState<"add" | "edit" | "view" | "delete">("add");
  const [currentItem, setCurrentItem] = useState<BudgetItem | null>(null);
  const currentYear = new Date().getFullYear();

  const form = useForm<BudgetItemFormData>({
    defaultValues: {
      code: "",
      name: "",
      description: "",
      category: "expense",
      type: "cp",
      year: currentYear,
      is_active: true,
    },
  });

  useEffect(() => {
    fetchBudgetItems();
  }, []);

  useEffect(() => {
    if (currentItem && dialogMode === "edit") {
      form.reset({
        code: currentItem.code || "",
        name: currentItem.name || "",
        description: currentItem.description || "",
        category: currentItem.category || "expense",
        type: currentItem.type || "cp",
        year: currentItem.year || currentYear,
        is_active: currentItem.is_active,
      });
    }
  }, [currentItem, dialogMode, form, currentYear]);

  const formatDate = (dateString: string) => {
    return format(new Date(dateString), "dd/MM/yyyy");
  };

  async function fetchBudgetItems() {
    try {
      const { data, error } = await supabase.from("budget_items").select("*").order("code");

      if (error) throw error;
      setBudgetItems(data || []);
    } catch (error) {
      console.error("Error fetching budget items:", error);
      toast({
        title: "Erreur",
        description: "Impossible de charger le catalogue budgétaire",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }

  const handleAddItem = () => {
    setDialogMode("add");
    form.reset({
      code: "",
      name: "",
      description: "",
      category: "expense",
      type: "cp",
      year: currentYear,
      is_active: true,
    });
    setDialogOpen(true);
  };

  const handleViewItem = (item: BudgetItem) => {
    setCurrentItem(item);
    setDialogMode("view");
    setDialogOpen(true);
  };

  const handleEditItem = (item: BudgetItem) => {
    setCurrentItem(item);
    setDialogMode("edit");
    setDialogOpen(true);
  };

  const handleDeleteItem = (item: BudgetItem) => {
    setCurrentItem(item);
    setDialogMode("delete");
    setDialogOpen(true);
  };

  const onSubmit = async (data: BudgetItemFormData) => {
    try {
      if (dialogMode === "add") {
        await supabase.from("budget_items").insert([data]);
        toast({
          title: "Succès",
          description: "Élément ajouté au catalogue budgétaire",
        });
      } else if (dialogMode === "edit" && currentItem) {
        await supabase.from("budget_items").update(data).eq("id", currentItem.id);
        toast({
          title: "Succès",
          description: "Élément du catalogue budgétaire modifié",
        });
      }

      fetchBudgetItems();
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
    if (!currentItem) return;

    try {
      await supabase.from("budget_items").delete().eq("id", currentItem.id);
      toast({
        title: "Succès",
        description: "Élément du catalogue budgétaire supprimé",
      });
      fetchBudgetItems();
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
              <CardTitle>Catalogue Budgétaire</CardTitle>
              <CardDescription>Gérez les classifications budgétaires</CardDescription>
            </div>
            <Button onClick={handleAddItem}>
              <Plus className="mr-2 h-4 w-4" />
              Ajouter un élément
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div>Chargement...</div>
          ) : (
            <BudgetCatalogTable
              budgetItems={budgetItems}
              formatDate={formatDate}
              onView={handleViewItem}
              onEdit={handleEditItem}
              onDelete={handleDeleteItem}
              onRefresh={fetchBudgetItems}
            />
          )}
        </CardContent>
      </Card>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-[550px]">
          <DialogHeader>
            <DialogTitle>
              {dialogMode === "add"
                ? "Ajouter un élément au catalogue"
                : dialogMode === "edit"
                  ? "Modifier l'élément du catalogue"
                  : dialogMode === "view"
                    ? "Détails de l'élément du catalogue"
                    : "Supprimer l'élément du catalogue"}
            </DialogTitle>
            <DialogDescription>
              {dialogMode === "add"
                ? "Créer un nouvel élément dans le catalogue budgétaire"
                : dialogMode === "edit"
                  ? "Modifier les informations de l'élément du catalogue"
                  : dialogMode === "view"
                    ? "Voir les détails de l'élément du catalogue"
                    : "Êtes-vous sûr de vouloir supprimer cet élément du catalogue ?"}
            </DialogDescription>
          </DialogHeader>

          {(dialogMode === "add" || dialogMode === "edit") && (
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
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
                </div>

                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description</FormLabel>
                      <FormControl>
                        <Textarea {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="category"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Catégorie</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Sélectionner la catégorie" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {budgetCategories.map((category) => (
                              <SelectItem key={category.value} value={category.value}>
                                {category.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="type"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Type</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Sélectionner le type" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {budgetTypes.map((type) => (
                              <SelectItem key={type.value} value={type.value}>
                                {type.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="year"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Année</FormLabel>
                      <FormControl>
                        <Input type="number" min={2000} max={2100} {...field} onChange={(e) => field.onChange(parseInt(e.target.value, 10))} />
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
                        <FormDescription>Cet élément est-il actuellement actif?</FormDescription>
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

          {dialogMode === "view" && currentItem && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="font-medium">Code</Label>
                  <p>{currentItem.code}</p>
                </div>
                <div>
                  <Label className="font-medium">Nom</Label>
                  <p>{currentItem.name}</p>
                </div>
              </div>

              <div>
                <Label className="font-medium">Description</Label>
                <p>{currentItem.description || "N/A"}</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="font-medium">Catégorie</Label>
                  <p>{budgetCategories.find((c) => c.value === currentItem.category)?.label || currentItem.category}</p>
                </div>
                <div>
                  <Label className="font-medium">Type</Label>
                  <p>{budgetTypes.find((t) => t.value === currentItem.type)?.label || currentItem.type}</p>
                </div>
              </div>

              <div>
                <Label className="font-medium">Année</Label>
                <p>{currentItem.year}</p>
              </div>

              <div>
                <Label className="font-medium">Statut</Label>
                <p>{currentItem.is_active ? "Actif" : "Inactif"}</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="font-medium">Date de création</Label>
                  <p>{formatDate(currentItem.created_at)}</p>
                </div>
                <div>
                  <Label className="font-medium">Dernière mise à jour</Label>
                  <p>{formatDate(currentItem.updated_at)}</p>
                </div>
              </div>
            </div>
          )}

          {dialogMode === "delete" && (
            <div className="space-y-4">
              <p>Êtes-vous sûr de vouloir supprimer cet élément du catalogue ? Cette action est irréversible.</p>

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
