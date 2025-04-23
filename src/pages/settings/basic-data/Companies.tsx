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
import { CompanyTable } from "@/components/tables/CompanyTable";

interface CompanyFormData {
  name: string;
  legal_name: string;
  type: string;
  tax_id: string;
  address: string;
  phone: string;
  email: string;
  website: string;
  is_active: boolean;
}

interface Company {
  id: string;
  name: string;
  legal_name?: string;
  type: string;
  tax_id?: string;
  address?: string;
  phone?: string;
  email?: string;
  website?: string;
  is_active: boolean;
  user_count?: number;
  created_at: string;
  updated_at: string;
}

const companyTypes = [
  { value: "public", label: "Publique" },
  { value: "private", label: "Privée" },
  { value: "ngo", label: "ONG" },
  { value: "international", label: "Internationale" },
  { value: "other", label: "Autre" },
];

export default function Companies() {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogMode, setDialogMode] = useState<"add" | "edit" | "view" | "delete">("add");
  const [currentCompany, setCurrentCompany] = useState<Company | null>(null);

  const form = useForm<CompanyFormData>({
    defaultValues: {
      name: "",
      legal_name: "",
      type: "public",
      tax_id: "",
      address: "",
      phone: "",
      email: "",
      website: "",
      is_active: true,
    },
  });

  useEffect(() => {
    fetchCompanies();
  }, []);

  useEffect(() => {
    if (currentCompany && dialogMode === "edit") {
      form.reset({
        name: currentCompany.name || "",
        legal_name: currentCompany.legal_name || "",
        type: currentCompany.type || "public",
        tax_id: currentCompany.tax_id || "",
        address: currentCompany.address || "",
        phone: currentCompany.phone || "",
        email: currentCompany.email || "",
        website: currentCompany.website || "",
        is_active: currentCompany.is_active,
      });
    }
  }, [currentCompany, dialogMode, form]);

  const formatDate = (dateString: string) => {
    return format(new Date(dateString), "dd/MM/yyyy");
  };

  async function fetchCompanies() {
    try {
      // Get companies
      const { data: companiesData, error: companiesError } = await supabase.from("companies").select("*").order("name");

      if (companiesError) throw companiesError;

      // Get user counts by company
      const { data: usersData, error: usersError } = await supabase
        .from("users")
        .select("company_id, count")
        .select("company_id", { count: "exact" })
        .group("company_id");

      if (usersError) throw usersError;

      // Create a mapping of company IDs to user counts
      const userCountsByCompany: Record<string, number> = {};
      usersData?.forEach((item) => {
        userCountsByCompany[item.company_id] = item.count || 0;
      });

      // Add user counts to companies
      const companiesWithCounts = companiesData.map((company) => ({
        ...company,
        user_count: userCountsByCompany[company.id] || 0,
      }));

      setCompanies(companiesWithCounts);
    } catch (error) {
      console.error("Error fetching companies:", error);
      toast({
        title: "Erreur",
        description: "Impossible de charger les organisations",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }

  const handleAddCompany = () => {
    setDialogMode("add");
    form.reset();
    setDialogOpen(true);
  };

  const handleViewCompany = (company: Company) => {
    setCurrentCompany(company);
    setDialogMode("view");
    setDialogOpen(true);
  };

  const handleEditCompany = (company: Company) => {
    setCurrentCompany(company);
    setDialogMode("edit");
    setDialogOpen(true);
  };

  const handleDeleteCompany = (company: Company) => {
    setCurrentCompany(company);
    setDialogMode("delete");
    setDialogOpen(true);
  };

  const onSubmit = async (data: CompanyFormData) => {
    try {
      if (dialogMode === "add") {
        await supabase.from("companies").insert([data]);
        toast({
          title: "Succès",
          description: "Organisation ajoutée",
        });
      } else if (dialogMode === "edit" && currentCompany) {
        await supabase.from("companies").update(data).eq("id", currentCompany.id);
        toast({
          title: "Succès",
          description: "Organisation modifiée",
        });
      }

      fetchCompanies();
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
    if (!currentCompany) return;

    try {
      await supabase.from("companies").delete().eq("id", currentCompany.id);
      toast({
        title: "Succès",
        description: "Organisation supprimée",
      });
      fetchCompanies();
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
              <CardTitle>Organisations</CardTitle>
              <CardDescription>Gérez les organisations et entreprises</CardDescription>
            </div>
            <Button onClick={handleAddCompany}>
              <Plus className="mr-2 h-4 w-4" />
              Ajouter une organisation
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div>Chargement...</div>
          ) : (
            <CompanyTable
              companies={companies}
              formatDate={formatDate}
              onView={handleViewCompany}
              onEdit={handleEditCompany}
              onDelete={handleDeleteCompany}
              onRefresh={fetchCompanies}
            />
          )}
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
                <div className="grid grid-cols-2 gap-4">
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
                    name="legal_name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Raison sociale</FormLabel>
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
                            {companyTypes.map((type) => (
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
                  <FormField
                    control={form.control}
                    name="tax_id"
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

                <FormField
                  control={form.control}
                  name="website"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Site web</FormLabel>
                      <FormControl>
                        <Input {...field} />
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
                        <FormDescription>Cette organisation est-elle actuellement active?</FormDescription>
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

          {dialogMode === "view" && currentCompany && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="font-medium">Nom</Label>
                  <p>{currentCompany.name}</p>
                </div>
                <div>
                  <Label className="font-medium">Raison sociale</Label>
                  <p>{currentCompany.legal_name || "N/A"}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="font-medium">Type</Label>
                  <p>{companyTypes.find((t) => t.value === currentCompany.type)?.label || currentCompany.type}</p>
                </div>
                <div>
                  <Label className="font-medium">NIF</Label>
                  <p>{currentCompany.tax_id || "N/A"}</p>
                </div>
              </div>

              <div>
                <Label className="font-medium">Adresse</Label>
                <p>{currentCompany.address || "N/A"}</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="font-medium">Téléphone</Label>
                  <p>{currentCompany.phone || "N/A"}</p>
                </div>
                <div>
                  <Label className="font-medium">Email</Label>
                  <p>{currentCompany.email || "N/A"}</p>
                </div>
              </div>

              <div>
                <Label className="font-medium">Site web</Label>
                <p>
                  {currentCompany.website ? (
                    <a href={currentCompany.website} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">
                      {currentCompany.website}
                    </a>
                  ) : (
                    "N/A"
                  )}
                </p>
              </div>

              <div>
                <Label className="font-medium">Statut</Label>
                <p>{currentCompany.is_active ? "Actif" : "Inactif"}</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="font-medium">Date de création</Label>
                  <p>{formatDate(currentCompany.created_at)}</p>
                </div>
                <div>
                  <Label className="font-medium">Dernière mise à jour</Label>
                  <p>{formatDate(currentCompany.updated_at)}</p>
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
