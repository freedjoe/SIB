import { useState, useEffect } from "react";
import { Plus, FileEdit, Trash2, Eye, Search } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useForm } from "react-hook-form";
import { toast } from "@/components/ui/use-toast";
import { DataTable } from "@/components/ui/data-table";
import { supabase } from "@/lib/supabase";
import { Label } from "@/components/ui/label";
import { ColumnDef } from "@tanstack/react-table";
import { DataTableColumnHeader } from "@/components/ui/data-table-column-header";

interface Ministry {
  id: string;
  name: string;
  code: string;
  created_at: string;
}

interface Company {
  id: string;
  name: string;
  sector: string;
  registrationNumber: string;
  contactPerson: string;
  email: string;
  phone: string;
}

interface Role {
  id: string;
  name: string;
  description: string;
  permissions: string[];
}

interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  ministryId?: string;
  ministryName?: string;
}

export default function BasicDataSettings() {
  const [activeDataTab, setActiveDataTab] = useState("ministries");
  const [ministries, setMinistries] = useState<Ministry[]>([]);
  const [loading, setLoading] = useState(true);
  const [newMinistry, setNewMinistry] = useState({ name: "", code: "" });
  const [companies, setCompanies] = useState<Company[]>([
    {
      id: "c1",
      name: "Entreprise de construction ABC",
      sector: "Construction",
      registrationNumber: "RC123456789",
      contactPerson: "Ahmed Benali",
      email: "contact@abc-construction.dz",
      phone: "+213555123456",
    },
  ]);

  const [roles, setRoles] = useState<Role[]>([
    {
      id: "r1",
      name: "Administrateur",
      description: "Accès complet à toutes les fonctionnalités du système",
      permissions: ["create", "read", "update", "delete", "approve", "report"],
    },
  ]);

  const [users, setUsers] = useState<User[]>([
    {
      id: "u1",
      firstName: "Admin",
      lastName: "User",
      email: "admin@sib.dz",
      role: "Administrateur",
    },
  ]);

  // Dialog states
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogMode, setDialogMode] = useState<"add" | "edit" | "view" | "delete">("add");
  const [currentMinistry, setCurrentMinistry] = useState<Ministry | null>(null);
  const [currentCompany, setCurrentCompany] = useState<Company | null>(null);
  const [currentRole, setCurrentRole] = useState<Role | null>(null);
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  // Forms
  const ministryForm = useForm({
    defaultValues: {
      code: "",
      name: "",
    },
  });

  const companyForm = useForm({
    defaultValues: {
      name: "",
      sector: "",
      registrationNumber: "",
      contactPerson: "",
      email: "",
      phone: "",
    },
  });

  const roleForm = useForm({
    defaultValues: {
      name: "",
      description: "",
      permissions: [] as string[],
    },
  });

  const userForm = useForm({
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      role: "",
      ministryId: "",
    },
  });

  // Format date helper
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("fr-DZ", {
      day: "numeric",
      month: "long",
      year: "numeric",
    }).format(date);
  };

  const columns: ColumnDef<Ministry>[] = [
    {
      accessorKey: "name",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Nom du Ministère" />,
      cell: ({ row }) => row.getValue("name"),
      filterFn: "includesString",
    },
    {
      accessorKey: "code",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Code" />,
      cell: ({ row }) => row.getValue("code"),
      filterFn: "includesString",
    },
    {
      accessorKey: "created_at",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Date de création" />,
      cell: ({ row }) => formatDate(row.getValue("created_at")),
      filterFn: "includesString",
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => {
        const ministry = row.original;
        return (
          <div className="flex justify-end gap-2">
            <Button variant="ghost" size="icon" onClick={() => handleOpenViewMinistryDialog(ministry)}>
              <Eye className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" onClick={() => handleOpenEditMinistryDialog(ministry)}>
              <FileEdit className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" onClick={() => handleOpenDeleteMinistryDialog(ministry)}>
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        );
      },
    },
  ];

  useEffect(() => {
    fetchMinistries();
  }, []);

  async function fetchMinistries() {
    try {
      const { data, error } = await supabase.from("ministries").select("*").order("name");

      if (error) throw error;
      setMinistries(data);
    } catch (error) {
      console.error("Error fetching ministries:", error);
      toast({
        title: "Erreur",
        description: "Impossible de charger les ministères",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }

  async function handleAddMinistry(e: React.FormEvent) {
    e.preventDefault();
    try {
      const { data, error } = await supabase
        .from("ministries")
        .insert([
          {
            name: newMinistry.name,
            code: newMinistry.code,
          },
        ])
        .select();

      if (error) throw error;

      setMinistries([...ministries, ...(data as Ministry[])]);
      setNewMinistry({ name: "", code: "" });
      setDialogOpen(false);
      toast({
        title: "Succès",
        description: "Ministère ajouté avec succès",
      });
    } catch (error) {
      console.error("Error adding ministry:", error);
      toast({
        title: "Erreur",
        description: "Impossible d'ajouter le ministère",
        variant: "destructive",
      });
    }
  }

  // Ministry handlers
  const handleOpenAddMinistryDialog = () => {
    setDialogMode("add");
    ministryForm.reset({
      code: "",
      name: "",
    });
    setDialogOpen(true);
  };

  const handleOpenEditMinistryDialog = (ministry: Ministry) => {
    setDialogMode("edit");
    setCurrentMinistry(ministry);
    ministryForm.reset({
      code: ministry.code,
      name: ministry.name,
    });
    setDialogOpen(true);
  };

  const handleOpenViewMinistryDialog = (ministry: Ministry) => {
    setDialogMode("view");
    setCurrentMinistry(ministry);
    setDialogOpen(true);
  };

  const handleOpenDeleteMinistryDialog = (ministry: Ministry) => {
    setDialogMode("delete");
    setCurrentMinistry(ministry);
    setDialogOpen(true);
  };

  const handleSaveMinistry = async (data: { code: string; name: string }) => {
    try {
      if (dialogMode === "add") {
        const { data: newMinistry, error } = await supabase
          .from("ministries")
          .insert([{ code: data.code, name: data.name }])
          .select()
          .single();

        if (error) throw error;

        setMinistries([...ministries, newMinistry]);
        toast({
          title: "Ministère ajouté",
          description: `Le ministère "${data.name}" a été ajouté avec succès.`,
        });
      } else if (dialogMode === "edit" && currentMinistry) {
        const { error } = await supabase.from("ministries").update({ code: data.code, name: data.name }).eq("id", currentMinistry.id);

        if (error) throw error;

        const updatedMinistries = ministries.map((m) => (m.id === currentMinistry.id ? { ...m, code: data.code, name: data.name } : m));
        setMinistries(updatedMinistries);
        toast({
          title: "Ministère modifié",
          description: `Le ministère "${data.name}" a été modifié avec succès.`,
        });
      }
    } catch (error) {
      console.error("Error saving ministry:", error);
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors de l'enregistrement du ministère",
        variant: "destructive",
      });
    }
    setDialogOpen(false);
  };

  const handleDeleteMinistry = async () => {
    if (!currentMinistry) return;
    try {
      const { error } = await supabase.from("ministries").delete().eq("id", currentMinistry.id);

      if (error) throw error;

      const updatedMinistries = ministries.filter((m) => m.id !== currentMinistry.id);
      setMinistries(updatedMinistries);
      toast({
        title: "Ministère supprimé",
        description: `Le ministère "${currentMinistry.name}" a été supprimé avec succès.`,
      });
    } catch (error) {
      console.error("Error deleting ministry:", error);
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors de la suppression du ministère",
        variant: "destructive",
      });
    }
    setDialogOpen(false);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>Ministères</CardTitle>
              <CardDescription>Gérez la liste des ministères du système</CardDescription>
            </div>
            <Button onClick={handleOpenAddMinistryDialog}>
              <Plus className="mr-2 h-4 w-4" />
              Ajouter un ministère
            </Button>
          </div>
        </CardHeader>
        <CardContent>{loading ? <div>Chargement...</div> : <DataTable columns={columns} data={ministries} />}</CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Données de Base</CardTitle>
          <CardDescription>Gérez les données de référence du système</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="ministries" value={activeDataTab} onValueChange={setActiveDataTab}>
            <TabsList className="mb-6">
              <TabsTrigger value="ministries">Ministères</TabsTrigger>
              <TabsTrigger value="companies">Entreprises</TabsTrigger>
              <TabsTrigger value="roles">Rôles</TabsTrigger>
              <TabsTrigger value="users">Utilisateurs</TabsTrigger>
            </TabsList>

            <TabsContent value="ministries">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Code</TableHead>
                    <TableHead>Nom</TableHead>
                    <TableHead>Date de création</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {ministries.map((ministry) => (
                    <TableRow key={ministry.id}>
                      <TableCell>{ministry.code}</TableCell>
                      <TableCell>{ministry.name}</TableCell>
                      <TableCell>{formatDate(ministry.created_at)}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button variant="ghost" size="icon" onClick={() => handleOpenViewMinistryDialog(ministry)}>
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" onClick={() => handleOpenEditMinistryDialog(ministry)}>
                            <FileEdit className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" onClick={() => handleOpenDeleteMinistryDialog(ministry)}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TabsContent>

            {/* Similar TabsContent sections for companies, roles, and users */}
          </Tabs>
        </CardContent>
      </Card>

      {/* Ministry Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>
              {dialogMode === "add"
                ? "Ajouter un ministère"
                : dialogMode === "edit"
                  ? "Modifier le ministère"
                  : dialogMode === "view"
                    ? "Détails du ministère"
                    : "Supprimer le ministère"}
            </DialogTitle>
            <DialogDescription>
              {dialogMode === "add"
                ? "Complétez le formulaire pour créer un nouveau ministère."
                : dialogMode === "edit"
                  ? "Modifiez les détails du ministère."
                  : dialogMode === "view"
                    ? "Informations détaillées sur le ministère."
                    : "Êtes-vous sûr de vouloir supprimer ce ministère? Cette action est irréversible."}
            </DialogDescription>
          </DialogHeader>

          {dialogMode === "view" && currentMinistry ? (
            <div className="py-4 space-y-4">
              <div className="grid grid-cols-2 gap-2">
                <div className="font-semibold">Code:</div>
                <div>{currentMinistry.code}</div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div className="font-semibold">Nom:</div>
                <div>{currentMinistry.name}</div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div className="font-semibold">Date de création:</div>
                <div>{formatDate(currentMinistry.created_at)}</div>
              </div>
            </div>
          ) : dialogMode === "delete" && currentMinistry ? (
            <div className="py-4">
              <p>
                <strong>Code:</strong> {currentMinistry.code}
              </p>
              <p>
                <strong>Nom:</strong> {currentMinistry.name}
              </p>
            </div>
          ) : dialogMode === "add" || dialogMode === "edit" ? (
            <Form {...ministryForm}>
              <form onSubmit={ministryForm.handleSubmit(handleSaveMinistry)} className="space-y-4">
                <FormField
                  control={ministryForm.control}
                  name="code"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Code</FormLabel>
                      <FormControl>
                        <Input placeholder="Code du ministère" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={ministryForm.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nom</FormLabel>
                      <FormControl>
                        <Input placeholder="Nom du ministère" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <DialogFooter>
                  <Button variant="outline" onClick={() => setDialogOpen(false)} type="button">
                    Annuler
                  </Button>
                  <Button type="submit">{dialogMode === "add" ? "Ajouter" : "Enregistrer"}</Button>
                </DialogFooter>
              </form>
            </Form>
          ) : null}

          {(dialogMode === "view" || dialogMode === "delete") && (
            <DialogFooter>
              {dialogMode === "view" ? (
                <Button onClick={() => setDialogOpen(false)}>Fermer</Button>
              ) : (
                <>
                  <Button variant="outline" onClick={() => setDialogOpen(false)}>
                    Annuler
                  </Button>
                  <Button variant="destructive" onClick={handleDeleteMinistry}>
                    Supprimer
                  </Button>
                </>
              )}
            </DialogFooter>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
