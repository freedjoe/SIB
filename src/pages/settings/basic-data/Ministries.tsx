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
import { MinistryTable } from "@/components/tables/MinistryTable";
import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMinistries, useMinistryMutation } from "@/hooks/supabase/entities/ministries";
import { Ministry } from "@/types/database.types";
import { PageLoadingSpinner } from "@/components/ui-custom/PageLoadingSpinner";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FormDescription } from "@/components/ui/form";

const formSchema = z.object({
  code: z.string().min(1, "Le code est requis"),
  name_fr: z.string().min(1, "Le nom en français est requis"),
  name_ar: z.string().min(1, "Le nom en arabe est requis"),
  name_en: z.string().min(1, "Le nom en anglais est requis"),
  description: z.string().optional(),
  address: z.string().optional(),
  email: z.string().email("Email invalide").optional().or(z.literal("")),
  phone: z.string().optional(),
  phone2: z.string().optional(),
  fax: z.string().optional(),
  fax2: z.string().optional(),
  is_active: z.boolean().default(true),
  parent_id: z.string().nullable(),
});

type FormData = z.infer<typeof formSchema>;

export default function Ministries() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogMode, setDialogMode] = useState<"add" | "edit" | "view" | "delete">("add");
  const [currentItem, setCurrentItem] = useState<Ministry | null>(null);
  const { setLoading } = useLoading();

  // Use the real-time hooks
  const {
    data: ministryItems = [],
    isLoading,
    refetch: refetchMinistries,
  } = useMinistries({
    staleTime: 1000 * 60 * 5, // Cache for 5 minutes
  });

  const ministryMutation = useMinistryMutation({
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
      address: "",
      email: "",
      phone: "",
      phone2: "",
      fax: "",
      fax2: "",
      is_active: true,
      parent_id: null,
    },
  });

  // Update form when editing
  useEffect(() => {
    if (currentItem && dialogMode === "edit") {
      form.reset({
        code: currentItem.code || "",
        name_fr: currentItem.name_fr || "",
        name_ar: currentItem.name_ar || "",
        name_en: currentItem.name_en || "",
        description: currentItem.description || "",
        address: currentItem.address || "",
        email: currentItem.email || "",
        phone: currentItem.phone || "",
        phone2: currentItem.phone2 || "",
        fax: currentItem.fax || "",
        fax2: currentItem.fax2 || "",
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
      address: "",
      email: "",
      phone: "",
      phone2: "",
      fax: "",
      fax2: "",
      is_active: true,
      parent_id: null,
    });
    setDialogOpen(true);
  };

  const handleViewItem = (item: Ministry) => {
    setCurrentItem(item);
    setDialogMode("view");
    setDialogOpen(true);
  };

  const handleEditItem = (item: Ministry) => {
    setCurrentItem(item);
    setDialogMode("edit");
    setDialogOpen(true);
  };

  const handleDeleteItem = (item: Ministry) => {
    setCurrentItem(item);
    setDialogMode("delete");
    setDialogOpen(true);
  };

  const onSubmit = async (data: FormData) => {
    try {
      setLoading(true);
      if (dialogMode === "add") {
        await ministryMutation.mutateAsync({
          type: "INSERT",
          data,
        });
      } else if (dialogMode === "edit" && currentItem) {
        await ministryMutation.mutateAsync({
          type: "UPDATE",
          id: currentItem.id,
          data,
        });
      }
      refetchMinistries();
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
      await ministryMutation.mutateAsync({
        type: "DELETE",
        id: currentItem.id,
      });
      setDialogOpen(false);
      refetchMinistries();
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
    return <PageLoadingSpinner message="Chargement des institutions gouvernementales..." />;
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>Institutions gouvernementales</CardTitle>
              <CardDescription>Gérez les institutions gouvernementales du système</CardDescription>
            </div>
            <Button onClick={handleAddItem}>
              <Plus className="mr-2 h-4 w-4" />
              Ajouter une institution
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <MinistryTable
            ministries={ministryItems}
            formatDate={formatDate}
            onView={handleViewItem}
            onEdit={handleEditItem}
            onDelete={handleDeleteItem}
            onRefresh={() => refetchMinistries()}
          />
        </CardContent>
      </Card>

      <Dialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-[550px] max-h-[80vh] overflow-y-auto">
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
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-4">
                <FormField
                  control={form.control}
                  name="name_ar"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nom en arabe</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="الاسم بالعربية"
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
                      <FormLabel>Nom en anglais</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Name in English"
                          {...field}
                        />
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
                        <Input
                          placeholder="Nom en français"
                          {...field}
                        />
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
                        <Input
                          {...field}
                          placeholder="Code de l'institution"
                        />
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
                        <Textarea
                          {...field}
                          placeholder="Description de l'institution"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-1 gap-4">
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            type="email"
                            placeholder="Email de contact"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

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
                    name="fax"
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
                      <Select
                        onValueChange={(value) => field.onChange(value === "none" ? null : value)}
                        value={field.value === null ? "none" : field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Sélectionner un ministère parent (optionnel)" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="none">Aucun</SelectItem>
                          {ministryItems
                            .filter((m) => !currentItem || m.id !== currentItem.id) // Prevent selecting self
                            .map((ministry) => (
                              <SelectItem
                                key={ministry.id}
                                value={ministry.id}>
                                {ministry.name_fr}
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
                  <Button
                    type="submit"
                    disabled={ministryMutation.isPending}>
                    {ministryMutation.isPending ? "Enregistrement..." : "Sauvegarder"}
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          )}

          {dialogMode === "view" && currentItem && (
            <div className="space-y-6 p-4">
              <div className="flex justify-between items-start border-b pb-4 mb-6">
                <div className="space-y-1">
                  <Label className="text-sm font-medium text-gray-500">Code</Label>
                  <p className="font-mono text-base bg-muted px-3 py-1.5 rounded-md inline-block text-foreground">{currentItem.code}</p>
                </div>
                <div>
                  <Badge
                    variant={currentItem.is_active ? "default" : "destructive"}
                    className={
                      currentItem.is_active
                        ? "bg-green-100 text-green-800 border-green-300 text-sm px-3 py-1"
                        : "bg-red-100 text-red-800 border-red-300 text-sm px-3 py-1"
                    }>
                    {currentItem.is_active ? "Actif" : "Inactif"}
                  </Badge>
                </div>
              </div>

              <div className="space-y-6">
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-gray-500">Noms</Label>
                  <div className="space-y-2">
                    <div>
                      <Label className="text-xs text-muted-foreground">Français</Label>
                      <p className="text-base font-medium text-foreground">{currentItem.name_fr}</p>
                    </div>
                    <div>
                      <Label className="text-xs text-muted-foreground">Arabe</Label>
                      <p
                        className="text-base font-medium text-foreground"
                        dir="rtl">
                        {currentItem.name_ar}
                      </p>
                    </div>
                    <div>
                      <Label className="text-xs text-muted-foreground">Anglais</Label>
                      <p className="text-base font-medium text-foreground">{currentItem.name_en}</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-medium text-gray-500">Description</Label>
                  <p className="text-base text-gray-700 leading-relaxed">
                    {currentItem.description || <span className="italic text-gray-400">Non spécifiée</span>}
                  </p>
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-medium text-gray-500">Adresse</Label>
                  <p className="text-base text-gray-700">{currentItem.address || <span className="italic text-gray-400">Non spécifiée</span>}</p>
                </div>

                <div className="space-y-6">
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-muted-foreground">Email</Label>
                    <p className="text-base text-foreground">
                      {currentItem.email || <span className="italic text-muted-foreground">Non spécifié</span>}
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div>
                        <Label className="text-sm font-medium text-muted-foreground">Téléphone 1</Label>
                        <p className="text-base text-foreground">
                          {currentItem.phone || <span className="italic text-muted-foreground">Non spécifié</span>}
                        </p>
                      </div>
                      <div>
                        <Label className="text-sm font-medium text-muted-foreground">Téléphone 2</Label>
                        <p className="text-base text-foreground">
                          {currentItem.phone2 || <span className="italic text-muted-foreground">Non spécifié</span>}
                        </p>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div>
                        <Label className="text-sm font-medium text-muted-foreground">Fax 1</Label>
                        <p className="text-base text-foreground">
                          {currentItem.fax || <span className="italic text-muted-foreground">Non spécifié</span>}
                        </p>
                      </div>
                      <div>
                        <Label className="text-sm font-medium text-muted-foreground">Fax 2</Label>
                        <p className="text-base text-foreground">
                          {currentItem.fax2 || <span className="italic text-muted-foreground">Non spécifié</span>}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {currentItem.parent_id && (
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-gray-500">Institution Parent</Label>
                    <p className="text-base text-gray-700">{ministryItems.find((m) => m.id === currentItem.parent_id)?.name_fr || "N/A"}</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {dialogMode === "delete" && (
            <div className="space-y-4">
              <p>Êtes-vous sûr de vouloir supprimer cette institution ? Cette action est irréversible.</p>

              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => setDialogOpen(false)}>
                  Annuler
                </Button>
                <Button
                  variant="destructive"
                  onClick={handleDeleteConfirm}
                  disabled={ministryMutation.isPending}>
                  {ministryMutation.isPending ? "Suppression..." : "Supprimer"}
                </Button>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
