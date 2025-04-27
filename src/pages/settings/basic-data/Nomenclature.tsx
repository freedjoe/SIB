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
import { NomenclatureTable } from "@/components/tables/NomenclatureTable";

interface NomenclatureItemFormData {
  code: string;
  name: string;
  description: string;
  category: string;
  parent_id?: string;
  level: number;
  is_active: boolean;
}

interface NomenclatureItem {
  id: string;
  code: string;
  name: string;
  description?: string;
  category: string;
  parent_id?: string;
  parent_name?: string;
  level: number;
  has_children: boolean;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

const nomenclatureCategories = [
  { value: "budget", label: "Budget" },
  { value: "planning", label: "Planification" },
  { value: "procurement", label: "Marchés Publics" },
  { value: "accounting", label: "Comptabilité" },
  { value: "organization", label: "Organisation" },
];

export default function Nomenclature() {
  const [items, setItems] = useState<NomenclatureItem[]>([]);
  const [parents, setParents] = useState<NomenclatureItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogMode, setDialogMode] = useState<"add" | "edit" | "view" | "delete">("add");
  const [currentItem, setCurrentItem] = useState<NomenclatureItem | null>(null);

  const form = useForm<NomenclatureItemFormData>({
    defaultValues: {
      code: "",
      name: "",
      description: "",
      category: "budget",
      parent_id: undefined,
      level: 1,
      is_active: true,
    },
  });

  useEffect(() => {
    fetchNomenclatureItems();
  }, []);

  useEffect(() => {
    if (currentItem && dialogMode === "edit") {
      form.reset({
        code: currentItem.code || "",
        name: currentItem.name || "",
        description: currentItem.description || "",
        category: currentItem.category || "budget",
        parent_id: currentItem.parent_id,
        level: currentItem.level || 1,
        is_active: currentItem.is_active,
      });
    }
  }, [currentItem, dialogMode, form]);

  const formatDate = (dateString: string) => {
    return format(new Date(dateString), "dd/MM/yyyy");
  };

  async function fetchNomenclatureItems() {
    try {
      const { data, error } = await supabase
        .from("nomenclature")
        .select(
          `
          *,
          parent:parent_id (
            id,
            name
          )
        `
        )
        .order("category")
        .order("level")
        .order("code");

      if (error) throw error;

      // Transform the data for the NomenclatureTable
      const transformedData = data.map((item: any) => {
        return {
          ...item,
          parent_name: item.parent?.name || null,
          has_children: false, // Will be updated below
        };
      });

      // Calculate has_children property
      const childrenCounts: Record<string, number> = {};
      data.forEach((item: any) => {
        if (item.parent_id) {
          childrenCounts[item.parent_id] = (childrenCounts[item.parent_id] || 0) + 1;
        }
      });

      transformedData.forEach((item: NomenclatureItem) => {
        item.has_children = !!childrenCounts[item.id];
      });

      setItems(transformedData);

      // Set potential parents (items that can be parents of other items)
      const potentialParents = transformedData.filter((item) => item.level < 3); // limit nesting to 3 levels
      setParents(potentialParents);
    } catch (error) {
      console.error("Error fetching nomenclature items:", error);
      toast({
        title: "Erreur",
        description: "Impossible de charger les nomenclatures",
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
      category: "budget",
      parent_id: undefined,
      level: 1,
      is_active: true,
    });
    setDialogOpen(true);
  };

  const handleViewItem = (item: NomenclatureItem) => {
    setCurrentItem(item);
    setDialogMode("view");
    setDialogOpen(true);
  };

  const handleEditItem = (item: NomenclatureItem) => {
    setCurrentItem(item);
    setDialogMode("edit");
    setDialogOpen(true);
  };

  const handleDeleteItem = (item: NomenclatureItem) => {
    setCurrentItem(item);
    setDialogMode("delete");
    setDialogOpen(true);
  };

  const onSubmit = async (data: NomenclatureItemFormData) => {
    try {
      // If a parent is selected, set the level to parent's level + 1
      if (data.parent_id) {
        const parent = parents.find((p) => p.id === data.parent_id);
        if (parent) {
          data.level = parent.level + 1;
        }
      } else {
        data.level = 1; // Top level item
      }

      if (dialogMode === "add") {
        await supabase.from("nomenclature").insert([data]);
        toast({
          title: "Succès",
          description: "Élément de nomenclature ajouté",
        });
      } else if (dialogMode === "edit" && currentItem) {
        await supabase.from("nomenclature").update(data).eq("id", currentItem.id);
        toast({
          title: "Succès",
          description: "Élément de nomenclature modifié",
        });
      }

      fetchNomenclatureItems();
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
      // Check if the item has children
      const hasChildren = items.some((item) => item.parent_id === currentItem.id);

      if (hasChildren) {
        toast({
          title: "Impossible de supprimer",
          description: "Cet élément a des enfants. Veuillez d'abord supprimer ou réassigner les éléments enfants.",
          variant: "destructive",
        });
        return;
      }

      await supabase.from("nomenclature").delete().eq("id", currentItem.id);
      toast({
        title: "Succès",
        description: "Élément de nomenclature supprimé",
      });
      fetchNomenclatureItems();
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
              <CardTitle>Nomenclatures</CardTitle>
              <CardDescription>Gérez les nomenclatures et référentiels</CardDescription>
            </div>
            <Button onClick={handleAddItem}>
              <Plus className="mr-2 h-4 w-4" />
              Ajouter un élément
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex flex-col items-center justify-center min-h-[40vh]">
              <svg className="animate-spin h-12 w-12 text-primary mb-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"></path>
              </svg>
              <span className="text-lg text-muted-foreground text-center">Chargement des nomenclatures...</span>
            </div>
          ) : (
            <NomenclatureTable
              items={items}
              formatDate={formatDate}
              onView={handleViewItem}
              onEdit={handleEditItem}
              onDelete={handleDeleteItem}
              onRefresh={fetchNomenclatureItems}
            />
          )}
        </CardContent>
      </Card>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-[550px]">
          <DialogHeader>
            <DialogTitle>
              {dialogMode === "add"
                ? "Ajouter un élément de nomenclature"
                : dialogMode === "edit"
                ? "Modifier l'élément de nomenclature"
                : dialogMode === "view"
                ? "Détails de l'élément de nomenclature"
                : "Supprimer l'élément de nomenclature"}
            </DialogTitle>
            <DialogDescription>
              {dialogMode === "add"
                ? "Créer un nouvel élément dans les nomenclatures"
                : dialogMode === "edit"
                ? "Modifier les informations de l'élément"
                : dialogMode === "view"
                ? "Voir les détails de l'élément"
                : "Êtes-vous sûr de vouloir supprimer cet élément ?"}
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
                            {nomenclatureCategories.map((category) => (
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
                    name="parent_id"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Parent</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Sélectionner un parent (optionnel)" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="">Aucun (Élément racine)</SelectItem>
                            {parents
                              .filter((parent) => parent.id !== currentItem?.id) // Prevent self-reference
                              .map((parent) => (
                                <SelectItem key={parent.id} value={parent.id}>
                                  {parent.name} ({parent.code})
                                </SelectItem>
                              ))}
                          </SelectContent>
                        </Select>
                        <FormDescription>Sélectionnez le parent de cet élément</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

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
                  <p>{nomenclatureCategories.find((c) => c.value === currentItem.category)?.label || currentItem.category}</p>
                </div>
                <div>
                  <Label className="font-medium">Niveau</Label>
                  <p>{currentItem.level}</p>
                </div>
              </div>

              <div>
                <Label className="font-medium">Parent</Label>
                <p>{currentItem.parent_name || "Aucun (Élément racine)"}</p>
              </div>

              <div>
                <Label className="font-medium">A des enfants</Label>
                <p>{currentItem.has_children ? "Oui" : "Non"}</p>
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
              <p>Êtes-vous sûr de vouloir supprimer cet élément de nomenclature ? Cette action est irréversible.</p>

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
