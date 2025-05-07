import { useState, useEffect } from "react";
import { Plus } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useForm } from "react-hook-form";
import { toast } from "@/components/ui/use-toast";
import { useLoading } from "@/hooks/useLoading";
import { WilayaTable } from "@/components/tables/WilayaTable";
import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useWilayas, useWilayaMutation } from "@/hooks/supabase/entities/wilayas";
import { Wilaya } from "@/types/database.types";
import { PageLoadingSpinner } from "@/components/ui-custom/PageLoadingSpinner";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FormDescription } from "@/components/ui/form";

const formSchema = z.object({
  code: z.string().min(1, "Le code est requis"),
  name_fr: z.string().min(1, "Le nom en français est requis"),
  name_ar: z.string().min(1, "Le nom en arabe est requis"),
  name_en: z.string().min(1, "Le nom en anglais est requis"),
  description: z.string().optional(),
  is_active: z.boolean().default(true),
  parent_id: z.string().nullable(),
});

type FormData = z.infer<typeof formSchema>;

export default function Wilayas() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogMode, setDialogMode] = useState<"add" | "edit" | "view" | "delete">("add");
  const [currentItem, setCurrentItem] = useState<Wilaya | null>(null);
  const { setLoading } = useLoading();

  // Use the real-time hooks
  const {
    data: wilayaItems = [],
    isLoading,
    refetch: refetchWilayas,
  } = useWilayas({
    staleTime: 1000 * 60 * 5, // Cache for 5 minutes
  });

  const wilayaMutation = useWilayaMutation({
    onSuccess: () => {
      setDialogOpen(false);
      toast({
        title: "Succès",
        description: "Opération effectuée avec succès",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Erreur",
        description: error.message || "Une erreur est survenue",
        variant: "destructive",
      });
    },
  });

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      code: "",
      name_fr: "",
      name_ar: "",
      name_en: "",
      description: "",
      is_active: true,
      parent_id: null,
    },
  });

  // Update form when editing
  useEffect(() => {
    if (currentItem && dialogMode === "edit") {
      form.reset({
        code: currentItem.code,
        name_fr: currentItem.name_fr,
        name_ar: currentItem.name_ar,
        name_en: currentItem.name_en,
        description: currentItem.description,
        is_active: currentItem.is_active,
        parent_id: currentItem.parent_id,
      });
    }
  }, [currentItem, dialogMode, form]);

  const handleAddItem = () => {
    setDialogMode("add");
    form.reset({
      code: "",
      name_fr: "",
      name_ar: "",
      name_en: "",
      description: "",
      is_active: true,
      parent_id: null,
    });
    setDialogOpen(true);
  };

  const handleViewItem = (item: Wilaya) => {
    setCurrentItem(item);
    setDialogMode("view");
    setDialogOpen(true);
  };

  const handleEditItem = (item: Wilaya) => {
    setCurrentItem(item);
    setDialogMode("edit");
    setDialogOpen(true);
  };

  const handleDeleteItem = (item: Wilaya) => {
    setCurrentItem(item);
    setDialogMode("delete");
    setDialogOpen(true);
  };

  const onSubmit = async (data: FormData) => {
    try {
      setLoading(true);
      if (dialogMode === "add") {
        await wilayaMutation.mutateAsync({
          type: "INSERT",
          data,
        });
      } else if (dialogMode === "edit" && currentItem) {
        await wilayaMutation.mutateAsync({
          type: "UPDATE",
          id: currentItem.id,
          data,
        });
      }
      refetchWilayas();
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!currentItem) return;

    try {
      setLoading(true);
      await wilayaMutation.mutateAsync({
        type: "DELETE",
        id: currentItem.id,
      });
      setDialogOpen(false);
      refetchWilayas();
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString("fr-FR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  if (isLoading) {
    return <PageLoadingSpinner message="Chargement des wilayas..." />;
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>Catalogue des Wilayas</CardTitle>
              <CardDescription>Gérez les wilayas du système</CardDescription>
            </div>
            <Button onClick={handleAddItem}>
              <Plus className="mr-2 h-4 w-4" />
              Ajouter une wilaya
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <WilayaTable
            wilayas={wilayaItems}
            formatDate={formatDate}
            onView={handleViewItem}
            onEdit={handleEditItem}
            onDelete={handleDeleteItem}
            onRefresh={() => refetchWilayas()}
          />
        </CardContent>
      </Card>

      <Dialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-[550px]">
          <DialogHeader>
            <DialogTitle>
              {dialogMode === "add"
                ? "Ajouter une wilaya"
                : dialogMode === "edit"
                ? "Modifier la wilaya"
                : dialogMode === "view"
                ? "Détails de la wilaya"
                : "Supprimer la wilaya"}
            </DialogTitle>
            <DialogDescription>
              {dialogMode === "add"
                ? "Créer une nouvelle wilaya dans le système"
                : dialogMode === "edit"
                ? "Modifier les informations de la wilaya"
                : dialogMode === "view"
                ? "Voir les détails de la wilaya"
                : "Êtes-vous sûr de vouloir supprimer cette wilaya ?"}
            </DialogDescription>
          </DialogHeader>

          {(dialogMode === "add" || dialogMode === "edit") && (
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-4">
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
                    name="name_fr"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nom (Français)</FormLabel>
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
                    name="name_ar"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nom (Arabe)</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            dir="rtl"
                          />
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
                        <FormLabel>Nom (Anglais)</FormLabel>
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

                <FormField
                  control={form.control}
                  name="parent_id"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Wilaya Parent</FormLabel>
                      <Select
                        onValueChange={(value) => field.onChange(value === "none" ? null : value)}
                        value={field.value === null ? "none" : field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Sélectionner une wilaya parent (optionnel)" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="none">Aucun</SelectItem>
                          {wilayaItems
                            .filter((w) => !currentItem || w.id !== currentItem.id) // Prevent selecting self
                            .map((wilaya) => (
                              <SelectItem
                                key={wilaya.id}
                                value={wilaya.id}>
                                {wilaya.name_fr} ({wilaya.code})
                              </SelectItem>
                            ))}
                        </SelectContent>
                      </Select>
                      <FormDescription>Sélectionnez la wilaya à laquelle celle-ci est rattachée, le cas échéant.</FormDescription>
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
                        <FormDescription>Cette wilaya est-elle actuellement active?</FormDescription>
                      </div>
                    </FormItem>
                  )}
                />

                <DialogFooter>
                  <Button
                    type="submit"
                    disabled={wilayaMutation.isPending}>
                    {wilayaMutation.isPending ? "Enregistrement..." : "Sauvegarder"}
                  </Button>
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
                  <Label className="font-medium">Statut</Label>
                  <p>{currentItem.is_active ? "Actif" : "Inactif"}</p>
                </div>
              </div>

              <div className="space-y-2">
                <Label className="font-medium">Nom (Français)</Label>
                <p>{currentItem.name_fr}</p>
              </div>

              <div className="space-y-2">
                <Label className="font-medium">Nom (Arabe)</Label>
                <p dir="rtl">{currentItem.name_ar}</p>
              </div>

              <div className="space-y-2">
                <Label className="font-medium">Nom (Anglais)</Label>
                <p>{currentItem.name_en}</p>
              </div>

              <div className="space-y-2">
                <Label className="font-medium">Description</Label>
                <p>{currentItem.description || "N/A"}</p>
              </div>

              {currentItem.parent_id && (
                <div className="space-y-2">
                  <Label className="font-medium">Wilaya Parent</Label>
                  <p>{wilayaItems.find((w) => w.id === currentItem.parent_id)?.name_fr || "N/A"}</p>
                </div>
              )}
            </div>
          )}

          {dialogMode === "delete" && (
            <div className="space-y-4">
              <p>Êtes-vous sûr de vouloir supprimer cette wilaya ? Cette action est irréversible.</p>

              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => setDialogOpen(false)}>
                  Annuler
                </Button>
                <Button
                  variant="destructive"
                  onClick={handleDeleteConfirm}
                  disabled={wilayaMutation.isPending}>
                  {wilayaMutation.isPending ? "Suppression..." : "Supprimer"}
                </Button>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
