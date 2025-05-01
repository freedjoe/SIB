import { useState, useEffect } from "react";
import { Plus } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useForm } from "react-hook-form";
import { toast } from "@/components/ui/use-toast";
import { format } from "date-fns";
import { Label } from "@/components/ui/label";
import { EnterpriseTable } from "@/components/tables/EnterpriseTable";
import { useEnterprises, useEnterpriseMutation } from "@/hooks/supabase";
import { Enterprise } from "@/types/database.types";

// Define the Enterprise form data interface based on the database schema
interface EnterpriseFormData {
  name: string;
  nif?: string;
  rc?: string;
  address?: string;
  phone?: string;
  email?: string;
}

export default function Enterprises() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogMode, setDialogMode] = useState<"add" | "edit" | "view" | "delete">("add");
  const [currentEnterprise, setCurrentEnterprise] = useState<Enterprise | null>(null);

  const {
    data: enterprises = [],
    isLoading: loading,
    refetch: refreshEnterprises,
  } = useEnterprises({
    sort: { column: "name", ascending: true },
    staleTime: 1000 * 60 * 5,
  });

  const enterpriseMutation = useEnterpriseMutation({
    onSuccess: () => {
      setDialogOpen(false);
      refreshEnterprises();
      toast({
        title: "Succès",
        description: "L'opération a été effectuée avec succès",
      });
    },
  });

  const form = useForm<EnterpriseFormData>({
    defaultValues: {
      name: "",
      nif: "",
      rc: "",
      address: "",
      phone: "",
      email: "",
    },
  });

  useEffect(() => {
    if (currentEnterprise && dialogMode === "edit") {
      form.reset({
        name: currentEnterprise.name || "",
        nif: currentEnterprise.nif || "",
        rc: currentEnterprise.rc || "",
        address: currentEnterprise.address || "",
        phone: currentEnterprise.phone || "",
        email: currentEnterprise.email || "",
      });
    }
  }, [currentEnterprise, dialogMode, form]);

  const formatDate = (dateString: string) => {
    return format(new Date(dateString), "dd/MM/yyyy");
  };

  const handleAddEnterprise = () => {
    setDialogMode("add");
    form.reset();
    setDialogOpen(true);
  };

  const handleViewEnterprise = (enterprise: Enterprise) => {
    setCurrentEnterprise(enterprise);
    setDialogMode("view");
    setDialogOpen(true);
  };

  const handleEditEnterprise = (enterprise: Enterprise) => {
    setCurrentEnterprise(enterprise);
    setDialogMode("edit");
    setDialogOpen(true);
  };

  const handleDeleteEnterprise = (enterprise: Enterprise) => {
    setCurrentEnterprise(enterprise);
    setDialogMode("delete");
    setDialogOpen(true);
  };

  const onSubmit = async (data: EnterpriseFormData) => {
    try {
      if (dialogMode === "add") {
        await enterpriseMutation.mutateAsync({
          type: "INSERT",
          data,
        });
      } else if (dialogMode === "edit" && currentEnterprise) {
        await enterpriseMutation.mutateAsync({
          type: "UPDATE",
          data,
          id: currentEnterprise.id,
        });
      }
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
    if (!currentEnterprise) return;

    try {
      await enterpriseMutation.mutateAsync({
        type: "DELETE",
        id: currentEnterprise.id,
      });
    } catch (error) {
      console.error("Error:", error);
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors de la suppression",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[40vh]">
        <svg className="animate-spin h-12 w-12 text-primary mb-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"></path>
        </svg>
        <span className="text-lg text-muted-foreground text-center">Chargement des organisations...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>Organisations</CardTitle>
              <CardDescription>Gérez les organisations et enterprises</CardDescription>
            </div>
            <Button onClick={handleAddEnterprise}>
              <Plus className="mr-2 h-4 w-4" />
              Ajouter une organisation
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <EnterpriseTable
            enterprises={enterprises}
            formatDate={formatDate}
            onView={handleViewEnterprise}
            onEdit={handleEditEnterprise}
            onDelete={handleDeleteEnterprise}
            onRefresh={refreshEnterprises}
          />
        </CardContent>
      </Card>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-[550px]">
          <DialogHeader>
            <DialogTitle>
              {dialogMode === "add"
                ? "Ajouter une organisation"
                : dialogMode === "edit"
                ? "Modifier l'organisation"
                : dialogMode === "view"
                ? "Détails de l'organisation"
                : "Supprimer l'organisation"}
            </DialogTitle>
            <DialogDescription>
              {dialogMode === "add"
                ? "Créer une nouvelle organisation"
                : dialogMode === "edit"
                ? "Modifier les informations de l'organisation"
                : dialogMode === "view"
                ? "Voir les détails de l'organisation"
                : "Êtes-vous sûr de vouloir supprimer cette organisation ?"}
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

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="nif"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>NIF</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="rc"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>RC</FormLabel>
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

                <div className="grid grid-cols-2 gap-4">
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
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <Input type="email" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <DialogFooter>
                  <Button type="submit" disabled={enterpriseMutation.isPending}>
                    {enterpriseMutation.isPending ? "Sauvegarde en cours..." : "Sauvegarder"}
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          )}

          {dialogMode === "view" && currentEnterprise && (
            <div className="space-y-4">
              <div>
                <Label className="font-medium">Nom</Label>
                <p>{currentEnterprise.name}</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="font-medium">NIF</Label>
                  <p>{currentEnterprise.nif || "N/A"}</p>
                </div>
                <div>
                  <Label className="font-medium">RC</Label>
                  <p>{currentEnterprise.rc || "N/A"}</p>
                </div>
              </div>

              <div>
                <Label className="font-medium">Adresse</Label>
                <p>{currentEnterprise.address || "N/A"}</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="font-medium">Téléphone</Label>
                  <p>{currentEnterprise.phone || "N/A"}</p>
                </div>
                <div>
                  <Label className="font-medium">Email</Label>
                  <p>{currentEnterprise.email || "N/A"}</p>
                </div>
              </div>
            </div>
          )}

          {dialogMode === "delete" && (
            <div className="space-y-4">
              <p>Êtes-vous sûr de vouloir supprimer cette organisation ? Cette action est irréversible.</p>

              <DialogFooter>
                <Button variant="outline" onClick={() => setDialogOpen(false)}>
                  Annuler
                </Button>
                <Button variant="destructive" onClick={handleDeleteConfirm} disabled={enterpriseMutation.isPending}>
                  {enterpriseMutation.isPending ? "Suppression en cours..." : "Supprimer"}
                </Button>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
