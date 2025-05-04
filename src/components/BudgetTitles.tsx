import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
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

export function BudgetTitles() {
  const { t } = useTranslation();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogMode, setDialogMode] = useState<"add" | "edit" | "view" | "delete">("add");
  const [currentItem, setCurrentItem] = useState<BudgetTitle | null>(null);

  // Form validation schema
  const formSchema = z.object({
    code: z.string().min(1, t("validation.codeRequired", "Le code est requis")),
    name: z.string().min(1, t("validation.nameRequired", "Le nom est requis")),
    description: z.string().optional(),
  });

  type FormData = z.infer<typeof formSchema>;

  // Use the real-time hooks
  const { data: budgetItems = [], isLoading } = useBudgetTitles({
    staleTime: 1000 * 60 * 5, // Cache for 5 minutes
  });

  const budgetTitleMutation = useBudgetTitleMutation({
    onSuccess: () => {
      setDialogOpen(false);
      toast({
        title: t("app.common.success"),
        description: t("app.common.operationSuccess"),
      });
    },
    onError: (error) => {
      toast({
        title: t("app.common.error"),
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
    return <PageLoadingSpinner message={t("budgets.loadingCatalogue", "Chargement du catalogue budgétaire...")} />;
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle>{t("budgets.budgetCatalogue", "Catalogue Budgétaire")}</CardTitle>
          <Button onClick={handleAddItem}>
            <Plus className="h-4 w-4 mr-2" />
            {t("budgets.newTitle", "Nouveau Titre")}
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
            <DialogTitle>
              {dialogMode === "add" ? t("budgets.addTitle", "Ajouter un titre") : t("budgets.editTitle", "Modifier le titre")}
            </DialogTitle>
            <DialogDescription>
              {dialogMode === "add"
                ? t("budgets.createNewTitle", "Créez un nouveau titre budgétaire.")
                : t("budgets.editTitleDescription", "Modifiez les détails du titre budgétaire.")}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <div className="space-y-4 py-4">
              <FormField
                control={form.control}
                name="code"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("app.common.code")}</FormLabel>
                    <Input {...field} placeholder={t("budgets.titleCodePlaceholder", "Code du titre")} />
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("app.common.name")}</FormLabel>
                    <Input {...field} placeholder={t("budgets.titleNamePlaceholder", "Nom du titre")} />
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("app.common.description")}</FormLabel>
                    <Textarea {...field} placeholder={t("budgets.titleDescriptionPlaceholder", "Description du titre")} />
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setDialogOpen(false)}>
                {t("app.common.cancel")}
              </Button>
              <Button type="submit" disabled={budgetTitleMutation.isPending}>
                {budgetTitleMutation.isPending
                  ? dialogMode === "add"
                    ? t("budgets.creating", "Création...")
                    : t("budgets.updating", "Modification...")
                  : dialogMode === "add"
                    ? t("app.common.create")
                    : t("app.common.edit")}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* View Dialog */}
      <Dialog open={dialogOpen && dialogMode === "view"} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("budgets.titleDetails", "Détails du titre")}</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <div className="space-y-4">
              <div>
                <h4 className="text-sm font-medium">{t("app.common.code")}</h4>
                <p className="mt-1">{currentItem?.code}</p>
              </div>
              <div>
                <h4 className="text-sm font-medium">{t("app.common.name")}</h4>
                <p className="mt-1">{currentItem?.name}</p>
              </div>
              <div>
                <h4 className="text-sm font-medium">{t("app.common.description")}</h4>
                <p className="mt-1">{currentItem?.description || t("budgets.noDescription", "Aucune description")}</p>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              {t("app.common.close")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={dialogOpen && dialogMode === "delete"} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("budgets.confirmDeletion", "Confirmer la suppression")}</DialogTitle>
            <DialogDescription>
              {t("budgets.confirmDeleteTitle", 'Êtes-vous sûr de vouloir supprimer le titre "{{name}}" ? Cette action est irréversible.', {
                name: currentItem?.name,
              })}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              {t("app.common.cancel")}
            </Button>
            <Button variant="destructive" onClick={handleDeleteConfirm} disabled={budgetTitleMutation.isPending}>
              {budgetTitleMutation.isPending ? t("budgets.deleting", "Suppression...") : t("app.common.delete")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
