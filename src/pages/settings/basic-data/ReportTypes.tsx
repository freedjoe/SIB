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
import { ReportTypesTable } from "@/components/tables/ReportTypesTable";

interface ReportTypeFormData {
  name: string;
  description: string;
  category: string;
  frequency: string;
  template_url?: string;
  is_active: boolean;
}

interface ReportType {
  id: string;
  name: string;
  description?: string;
  category: string;
  frequency: string;
  template_url?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

const reportCategories = [
  { value: "financial", label: "Financier" },
  { value: "operational", label: "Opérationnel" },
  { value: "performance", label: "Performance" },
  { value: "compliance", label: "Conformité" },
  { value: "strategic", label: "Stratégique" },
];

const reportFrequencies = [
  { value: "daily", label: "Quotidien" },
  { value: "weekly", label: "Hebdomadaire" },
  { value: "monthly", label: "Mensuel" },
  { value: "quarterly", label: "Trimestriel" },
  { value: "semi_annual", label: "Semestriel" },
  { value: "annual", label: "Annuel" },
  { value: "ad_hoc", label: "Ad hoc" },
];

export default function ReportTypes() {
  const [reportTypes, setReportTypes] = useState<ReportType[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogMode, setDialogMode] = useState<"add" | "edit" | "view" | "delete">("add");
  const [currentReportType, setCurrentReportType] = useState<ReportType | null>(null);

  const form = useForm<ReportTypeFormData>({
    defaultValues: {
      name: "",
      description: "",
      category: "financial",
      frequency: "monthly",
      template_url: "",
      is_active: true,
    },
  });

  useEffect(() => {
    fetchReportTypes();
  }, []);

  useEffect(() => {
    if (currentReportType && dialogMode === "edit") {
      form.reset({
        name: currentReportType.name || "",
        description: currentReportType.description || "",
        category: currentReportType.category || "financial",
        frequency: currentReportType.frequency || "monthly",
        template_url: currentReportType.template_url || "",
        is_active: currentReportType.is_active,
      });
    }
  }, [currentReportType, dialogMode, form]);

  const formatDate = (dateString: string) => {
    return format(new Date(dateString), "dd/MM/yyyy");
  };

  async function fetchReportTypes() {
    try {
      const { data, error } = await supabase.from("report_types").select("*").order("category").order("name");

      if (error) throw error;

      setReportTypes(data);
    } catch (error) {
      console.error("Error fetching report types:", error);
      toast({
        title: "Erreur",
        description: "Impossible de charger les types de rapports",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }

  const handleAddReportType = () => {
    setDialogMode("add");
    form.reset({
      name: "",
      description: "",
      category: "financial",
      frequency: "monthly",
      template_url: "",
      is_active: true,
    });
    setDialogOpen(true);
  };

  const handleViewReportType = (reportType: ReportType) => {
    setCurrentReportType(reportType);
    setDialogMode("view");
    setDialogOpen(true);
  };

  const handleEditReportType = (reportType: ReportType) => {
    setCurrentReportType(reportType);
    setDialogMode("edit");
    setDialogOpen(true);
  };

  const handleDeleteReportType = (reportType: ReportType) => {
    setCurrentReportType(reportType);
    setDialogMode("delete");
    setDialogOpen(true);
  };

  const onSubmit = async (data: ReportTypeFormData) => {
    try {
      if (dialogMode === "add") {
        await supabase.from("report_types").insert([data]);
        toast({
          title: "Succès",
          description: "Type de rapport ajouté",
        });
      } else if (dialogMode === "edit" && currentReportType) {
        await supabase.from("report_types").update(data).eq("id", currentReportType.id);
        toast({
          title: "Succès",
          description: "Type de rapport modifié",
        });
      }

      fetchReportTypes();
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
    if (!currentReportType) return;

    try {
      // Here you could check if this report type is in use
      // For example, check if there are any reports using this type

      await supabase.from("report_types").delete().eq("id", currentReportType.id);
      toast({
        title: "Succès",
        description: "Type de rapport supprimé",
      });
      fetchReportTypes();
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

  const getCategoryLabel = (value: string) => {
    return reportCategories.find((c) => c.value === value)?.label || value;
  };

  const getFrequencyLabel = (value: string) => {
    return reportFrequencies.find((f) => f.value === value)?.label || value;
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>Types de Rapports</CardTitle>
              <CardDescription>Gérez les différents types de rapports du système</CardDescription>
            </div>
            <Button onClick={handleAddReportType}>
              <Plus className="mr-2 h-4 w-4" />
              Ajouter un type
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div>Chargement...</div>
          ) : (
            <ReportTypesTable
              reportTypes={reportTypes}
              formatDate={formatDate}
              getCategoryLabel={getCategoryLabel}
              getFrequencyLabel={getFrequencyLabel}
              onView={handleViewReportType}
              onEdit={handleEditReportType}
              onDelete={handleDeleteReportType}
              onRefresh={fetchReportTypes}
            />
          )}
        </CardContent>
      </Card>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-[550px]">
          <DialogHeader>
            <DialogTitle>
              {dialogMode === "add"
                ? "Ajouter un type de rapport"
                : dialogMode === "edit"
                  ? "Modifier le type de rapport"
                  : dialogMode === "view"
                    ? "Détails du type de rapport"
                    : "Supprimer le type de rapport"}
            </DialogTitle>
            <DialogDescription>
              {dialogMode === "add"
                ? "Créer un nouveau type de rapport dans le système"
                : dialogMode === "edit"
                  ? "Modifier les informations du type de rapport"
                  : dialogMode === "view"
                    ? "Voir les détails du type de rapport"
                    : "Êtes-vous sûr de vouloir supprimer ce type de rapport ?"}
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
                            {reportCategories.map((category) => (
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
                    name="frequency"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Fréquence</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Sélectionner la fréquence" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {reportFrequencies.map((frequency) => (
                              <SelectItem key={frequency.value} value={frequency.value}>
                                {frequency.label}
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
                  name="template_url"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>URL du modèle</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormDescription>Lien vers le modèle de document (optionnel)</FormDescription>
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
                        <FormDescription>Ce type de rapport est-il actuellement actif?</FormDescription>
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

          {dialogMode === "view" && currentReportType && (
            <div className="space-y-4">
              <div>
                <Label className="font-medium">Nom</Label>
                <p>{currentReportType.name}</p>
              </div>

              <div>
                <Label className="font-medium">Description</Label>
                <p>{currentReportType.description || "N/A"}</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="font-medium">Catégorie</Label>
                  <p>{getCategoryLabel(currentReportType.category)}</p>
                </div>
                <div>
                  <Label className="font-medium">Fréquence</Label>
                  <p>{getFrequencyLabel(currentReportType.frequency)}</p>
                </div>
              </div>

              <div>
                <Label className="font-medium">URL du modèle</Label>
                <p>
                  {currentReportType.template_url ? (
                    <a href={currentReportType.template_url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                      {currentReportType.template_url}
                    </a>
                  ) : (
                    "N/A"
                  )}
                </p>
              </div>

              <div>
                <Label className="font-medium">Statut</Label>
                <p>{currentReportType.is_active ? "Actif" : "Inactif"}</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="font-medium">Date de création</Label>
                  <p>{formatDate(currentReportType.created_at)}</p>
                </div>
                <div>
                  <Label className="font-medium">Dernière mise à jour</Label>
                  <p>{formatDate(currentReportType.updated_at)}</p>
                </div>
              </div>
            </div>
          )}

          {dialogMode === "delete" && (
            <div className="space-y-4">
              <p>Êtes-vous sûr de vouloir supprimer ce type de rapport ? Cette action est irréversible.</p>

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
