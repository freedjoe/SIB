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
import { BudgetTitlesTable } from "@/components/tables/BudgetTitlesTable";
import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useBudgetTitles, useBudgetTitleMutation } from "@/hooks/supabase";
import { BudgetTitle } from "@/types/database.types";
import { PageLoadingSpinner } from "@/components/ui-custom/PageLoadingSpinner";

const formSchema = z.object({
  code: z.string().min(1, "Le code est requis"),
  name: z.string().min(1, "Le nom est requis"),
  description: z.string().optional(),
});

type FormData = z.infer<typeof formSchema>;

export default function BudgetTitles() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogMode, setDialogMode] = useState<"add" | "edit" | "view" | "delete">("add");
  const [currentItem, setCurrentItem] = useState<BudgetTitle | null>(null);
  const { setLoading } = useLoading();

  // Use the real-time hooks
  const {
    data: budgetItems = [],
    isLoading,
    refetch,
  } = useBudgetTitles({
    staleTime: 1000 * 60 * 5, // Cache for 5 minutes
  });

  const budgetTitleMutation = useBudgetTitleMutation({
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
      name: "",
      description: "",
    },
  });

  // Update form when editing
  useEffect(() => {
    if (currentItem && dialogMode === "edit") {
      form.reset({
        code: currentItem.code,
        name: currentItem.name,
        description: currentItem.description,
      });
    }
  }, [currentItem, dialogMode, form]);

  const handleAddItem = () => {
    setDialogMode("add");
    form.reset({
      code: "",
      name: "",
      description: "",
    });
    setDialogOpen(true);
  };

  const handleViewItem = (item: BudgetTitle) => {
    setCurrentItem(item);
    setDialogMode("view");
    setDialogOpen(true);
  };

  const handleEditItem = (item: BudgetTitle) => {
    setCurrentItem(item);
    setDialogMode("edit");
    setDialogOpen(true);
  };

  const handleDeleteItem = (item: BudgetTitle) => {
    setCurrentItem(item);
    setDialogMode("delete");
    setDialogOpen(true);
  };

  const onSubmit = async (data: FormData) => {
    try {
      setLoading(true);
      if (dialogMode === "add") {
        await budgetTitleMutation.mutateAsync({
          type: "INSERT",
          data,
        });
      } else if (dialogMode === "edit" && currentItem) {
        await budgetTitleMutation.mutateAsync({
          type: "UPDATE",
          id: currentItem.id,
          data,
        });
      }
      refetch();
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
      await budgetTitleMutation.mutateAsync({
        type: "DELETE",
        id: currentItem.id,
      });
      setDialogOpen(false);
      refetch();
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setLoading(false);
    }
  };

  if (isLoading) {
    return <PageLoadingSpinner message="Chargement du catalogue budgétaire..." />;
  }

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
          <BudgetTitlesTable
            budgetItems={budgetItems}
            onView={handleViewItem}
            onEdit={handleEditItem}
            onDelete={handleDeleteItem}
            onRefresh={() => refetch()}
          />
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

                <DialogFooter>
                  <Button type="submit" disabled={budgetTitleMutation.isPending}>
                    {budgetTitleMutation.isPending ? "Enregistrement..." : "Sauvegarder"}
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
                  <Label className="font-medium">Nom</Label>
                  <p>{currentItem.name}</p>
                </div>
              </div>

              <div>
                <Label className="font-medium">Description</Label>
                <p>{currentItem.description || "N/A"}</p>
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
                <Button variant="destructive" onClick={handleDeleteConfirm} disabled={budgetTitleMutation.isPending}>
                  {budgetTitleMutation.isPending ? "Suppression..." : "Supprimer"}
                </Button>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
