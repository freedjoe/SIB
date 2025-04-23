import { useState, useEffect } from "react";
import { Plus, FileEdit, Trash2, Eye } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useForm } from "react-hook-form";
import { toast } from "@/components/ui/use-toast";
import { supabase } from "@/lib/supabase";
import { UsersTable } from "@/components/tables/UsersTable";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";

interface User {
  id: string;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  status: "active" | "inactive" | "pending";
  role: { id: string; name: string };
  company: { id: string; name: string } | null;
  is_active: boolean;
  created_at: string;
  last_login: string | null;
}

interface UserFormData {
  first_name: string;
  last_name: string;
  email: string;
  username: string;
  password_hash: string;
  role_id: string;
  company_id?: string;
}

export default function Users() {
  const [users, setUsers] = useState<User[]>([]);
  const [roles, setRoles] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogMode, setDialogMode] = useState<"add" | "edit" | "view" | "delete">("add");
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  const form = useForm({
    defaultValues: {
      first_name: "",
      last_name: "",
      email: "",
      username: "",
      password_hash: "",
      role_id: "",
      company_id: "",
    },
  });

  useEffect(() => {
    fetchUsers();
    fetchRoles();
    fetchCompanies();
  }, []);

  async function fetchUsers() {
    try {
      const { data, error } = await supabase
        .from("users")
        .select(
          `
          *,
          company:company_id(name),
          role:role_id(name)
        `
        )
        .order("last_name");

      if (error) throw error;
      setUsers(data);
    } catch (error) {
      console.error("Error fetching users:", error);
      toast({
        title: "Erreur",
        description: "Impossible de charger les utilisateurs",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }

  async function fetchRoles() {
    try {
      const { data, error } = await supabase.from("roles").select("*").order("name");

      if (error) throw error;
      setRoles(data);
    } catch (error) {
      console.error("Error fetching roles:", error);
      toast({
        title: "Erreur",
        description: "Impossible de charger les rôles",
        variant: "destructive",
      });
    }
  }

  async function fetchCompanies() {
    try {
      const { data, error } = await supabase.from("companies").select("*").order("name");

      if (error) throw error;
      setCompanies(data);
    } catch (error) {
      console.error("Error fetching companies:", error);
      toast({
        title: "Erreur",
        description: "Impossible de charger les organisations",
        variant: "destructive",
      });
    }
  }

  const handleAddUser = () => {
    setDialogMode("add");
    form.reset();
    setDialogOpen(true);
  };

  const onSubmit = async (data: UserFormData) => {
    try {
      if (dialogMode === "add") {
        await supabase.from("users").insert([data]);
      } else if (dialogMode === "edit" && currentUser) {
        await supabase.from("users").update(data).eq("id", currentUser.id);
      }
      toast({
        title: "Succès",
        description: dialogMode === "add" ? "Utilisateur ajouté" : "Utilisateur modifié",
      });
      fetchUsers();
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

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "N/A";
    return format(new Date(dateString), "dd/MM/yyyy");
  };

  const getStatusBadge = (status: string) => {
    const statusMap: Record<string, { color: string; label: string }> = {
      active: { color: "bg-green-100 text-green-800 border-green-400", label: "Actif" },
      inactive: { color: "bg-red-100 text-red-800 border-red-400", label: "Inactif" },
      pending: { color: "bg-yellow-100 text-yellow-800 border-yellow-400", label: "En attente" },
    };

    const { color, label } = statusMap[status] || { color: "bg-gray-100 text-gray-800 border-gray-400", label: status };

    return (
      <Badge variant="outline" className={color}>
        {label}
      </Badge>
    );
  };

  const handleViewUser = (user: User) => {
    setCurrentUser(user);
    setDialogMode("view");
    setDialogOpen(true);
  };

  const handleEditUser = (user: User) => {
    setCurrentUser(user);
    setDialogMode("edit");
    form.reset(user);
    setDialogOpen(true);
  };

  const handleDeleteUser = (user: User) => {
    setCurrentUser(user);
    setDialogMode("delete");
    setDialogOpen(true);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>Utilisateurs</CardTitle>
              <CardDescription>Gérez les utilisateurs du système</CardDescription>
            </div>
            <Button onClick={handleAddUser}>
              <Plus className="mr-2 h-4 w-4" />
              Ajouter un utilisateur
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div>Chargement...</div>
          ) : (
            <UsersTable
              users={users.map((user) => ({
                ...user,
                status: user.is_active ? "active" : "inactive",
              }))}
              formatDate={formatDate}
              getStatusBadge={getStatusBadge}
              onView={handleViewUser}
              onEdit={handleEditUser}
              onDelete={handleDeleteUser}
              onRefresh={fetchUsers}
            />
          )}
        </CardContent>
      </Card>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {dialogMode === "add"
                ? "Ajouter un utilisateur"
                : dialogMode === "edit"
                  ? "Modifier l'utilisateur"
                  : dialogMode === "view"
                    ? "Détails de l'utilisateur"
                    : "Supprimer l'utilisateur"}
            </DialogTitle>
            <DialogDescription>
              {dialogMode === "add"
                ? "Créer un nouvel utilisateur"
                : dialogMode === "edit"
                  ? "Modifier les informations de l'utilisateur"
                  : dialogMode === "view"
                    ? "Voir les détails de l'utilisateur"
                    : "Êtes-vous sûr de vouloir supprimer cet utilisateur ?"}
            </DialogDescription>
          </DialogHeader>

          {(dialogMode === "add" || dialogMode === "edit") && (
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="first_name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Prénom</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="last_name"
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
                <FormField
                  control={form.control}
                  name="username"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nom d'utilisateur</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="password_hash"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Mot de passe</FormLabel>
                      <FormControl>
                        <Input type="password" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="role_id"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Rôle</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Sélectionnez un rôle" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {roles.map((role) => (
                            <SelectItem key={role.id} value={role.id}>
                              {role.name}
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
                  name="company_id"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Organisation</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Sélectionnez une organisation" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {companies.map((company) => (
                            <SelectItem key={company.id} value={company.id}>
                              {company.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <DialogFooter>
                  <Button type="submit">{dialogMode === "add" ? "Ajouter" : "Enregistrer"}</Button>
                </DialogFooter>
              </form>
            </Form>
          )}

          {dialogMode === "view" && currentUser && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <FormLabel>Prénom</FormLabel>
                  <div>{currentUser.first_name}</div>
                </div>
                <div>
                  <FormLabel>Nom</FormLabel>
                  <div>{currentUser.last_name}</div>
                </div>
                <div>
                  <FormLabel>Email</FormLabel>
                  <div>{currentUser.email}</div>
                </div>
                <div>
                  <FormLabel>Rôle</FormLabel>
                  <div>{currentUser.role}</div>
                </div>
                {currentUser.ministry && (
                  <div>
                    <FormLabel>Ministère</FormLabel>
                    <div>{currentUser.ministry.name}</div>
                  </div>
                )}
              </div>
              <DialogFooter>
                <Button onClick={() => setDialogOpen(false)}>Fermer</Button>
              </DialogFooter>
            </div>
          )}

          {dialogMode === "delete" && currentUser && (
            <>
              <p>
                Êtes-vous sûr de vouloir supprimer l'utilisateur {currentUser.first_name} {currentUser.last_name} ?
              </p>
              <DialogFooter>
                <Button variant="outline" onClick={() => setDialogOpen(false)}>
                  Annuler
                </Button>
                <Button
                  variant="destructive"
                  onClick={async () => {
                    try {
                      await supabase.from("users").delete().eq("id", currentUser.id);
                      toast({
                        title: "Succès",
                        description: "Utilisateur supprimé",
                      });
                      fetchUsers();
                      setDialogOpen(false);
                    } catch (error) {
                      console.error("Error:", error);
                      toast({
                        title: "Erreur",
                        description: "Une erreur est survenue",
                        variant: "destructive",
                      });
                    }
                  }}
                >
                  Supprimer
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
