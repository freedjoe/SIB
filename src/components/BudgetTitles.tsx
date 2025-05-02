import { useState, useEffect } from "react";
import { Plus } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Form, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useForm } from "react-hook-form";
import { toast } from "@/components/ui/use-toast";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { BudgetTitlesTable } from "./tables/BudgetTitlesTable";
import { useBudgetTitles, useBudgetTitleMutation } from "@/hooks/supabase";
import type { BudgetTitle } from "@/types/database.types";
import { PageLoadingSpinner } from "./ui-custom/PageLoadingSpinner";

// Form validation schema
const formSchema = z.object({
  code: z.string().min(1, "Le code est requis"),
  name: z.string().min(1, "Le nom est requis"),
  description: z.string().optional(),
});

type FormData = z.infer<typeof formSchema>;

export function BudgetTitles() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogMode, setDialogMode] = useState<"add" | "edit" | "view" | "delete">("add");
  const [currentItem, setCurrentItem] = useState<BudgetTitle | null>(null);

  // Use the real-time hooks
  const { data: budgetItems = [], isLoading } = useBudgetTitles({
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
    onError: (error) => {
      toast({
        title: "Erreur",
        description: error.message,
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
    form.reset();
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
    } catch (error) {
      console.error("Error:", error);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!currentItem) return;

    try {
      await budgetTitleMutation.mutateAsync({
        type: "DELETE",
        id: currentItem.id,
      });
      setDialogOpen(false);
    } catch (error) {
      console.error("Error:", error);
    }
  };

  if (isLoading) {
    return <PageLoadingSpinner message="Chargement du catalogue budgétaire..." />;
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle>Catalogue Budgétaire</CardTitle>
          <Button onClick={handleAddItem}>
            <Plus className="h-4 w-4 mr-2" />
            Nouveau Titre
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <BudgetTitlesTable budgetItems={budgetItems} onView={handleViewItem} onEdit={handleEditItem} onDelete={handleDeleteItem} />
      </CardContent>

      {/* Add/Edit Dialog */}
      <Dialog open={dialogOpen && (dialogMode === "add" || dialogMode === "edit")} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{dialogMode === "add" ? "Ajouter un titre" : "Modifier le titre"}</DialogTitle>
            <DialogDescription>
              {dialogMode === "add" ? "Créez un nouveau titre budgétaire." : "Modifiez les détails du titre budgétaire."}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <div className="space-y-4 py-4">
              <FormField
                control={form.control}
                name="code"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Code</FormLabel>
                    <Input {...field} placeholder="Code du titre" />
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
                    <Input {...field} placeholder="Nom du titre" />
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
                    <Textarea {...field} placeholder="Description du titre" />
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setDialogOpen(false)}>
                Annuler
              </Button>
              <Button type="submit" disabled={budgetTitleMutation.isPending}>
                {budgetTitleMutation.isPending
                  ? dialogMode === "add"
                    ? "Création..."
                    : "Modification..."
                  : dialogMode === "add"
                  ? "Créer"
                  : "Modifier"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* View Dialog */}
      <Dialog open={dialogOpen && dialogMode === "view"} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Détails du titre</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <div className="space-y-4">
              <div>
                <h4 className="text-sm font-medium">Code</h4>
                <p className="mt-1">{currentItem?.code}</p>
              </div>
              <div>
                <h4 className="text-sm font-medium">Nom</h4>
                <p className="mt-1">{currentItem?.name}</p>
              </div>
              <div>
                <h4 className="text-sm font-medium">Description</h4>
                <p className="mt-1">{currentItem?.description || "Aucune description"}</p>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Fermer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={dialogOpen && dialogMode === "delete"} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmer la suppression</DialogTitle>
            <DialogDescription>Êtes-vous sûr de vouloir supprimer le titre "{currentItem?.name}" ? Cette action est irréversible.</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Annuler
            </Button>
            <Button variant="destructive" onClick={handleDeleteConfirm} disabled={budgetTitleMutation.isPending}>
              {budgetTitleMutation.isPending ? "Suppression..." : "Supprimer"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
