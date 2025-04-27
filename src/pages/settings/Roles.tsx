import { useState, useEffect } from "react";
import { Plus } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { useForm } from "react-hook-form";
import { toast } from "@/components/ui/use-toast";
import { format } from "date-fns";
import { supabase } from "@/lib/supabase";
import { RolesTable } from "@/components/tables/RolesTable";

interface Permission {
  id: string;
  name: string;
  description: string;
}

interface RoleFormData {
  name: string;
  description: string;
  permissions: string[];
}

interface Role {
  id: string;
  name: string;
  description: string;
  permissions: Permission[];
  is_system_role: boolean;
  created_at: string;
  updated_at?: string;
  user_count: number;
  role_permissions?: { permission_id: string }[];
}

const availablePermissions = [
  { id: "create", label: "Créer", description: "Permission de création" },
  { id: "read", label: "Lire", description: "Permission de lecture" },
  { id: "update", label: "Modifier", description: "Permission de modification" },
  { id: "delete", label: "Supprimer", description: "Permission de suppression" },
  { id: "approve", label: "Approuver", description: "Permission d'approbation" },
  { id: "report", label: "Rapports", description: "Permission de rapport" },
];

export default function Roles() {
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogMode, setDialogMode] = useState<"add" | "edit" | "view" | "delete">("add");
  const [currentRole, setCurrentRole] = useState<Role | null>(null);

  const form = useForm({
    defaultValues: {
      name: "",
      description: "",
      permissions: [],
    },
  });

  useEffect(() => {
    fetchRoles();
  }, []);

  const formatDate = (dateString: string) => {
    return format(new Date(dateString), "dd/MM/yyyy");
  };

  const handleViewRole = (role: Role) => {
    setCurrentRole(role);
    setDialogMode("view");
    setDialogOpen(true);
  };

  const handleEditRole = (role: Role) => {
    setCurrentRole(role);
    setDialogMode("edit");
    form.reset({
      name: role.name,
      description: role.description,
      permissions: role.permissions.map((p) => p.id),
    });
    setDialogOpen(true);
  };

  const handleDeleteRole = (role: Role) => {
    setCurrentRole(role);
    setDialogMode("delete");
    setDialogOpen(true);
  };

  async function fetchRoles() {
    try {
      const { data, error } = await supabase
        .from("roles")
        .select(
          `
          *,
          role_permissions (
            permission_id
          )
        `
        )
        .order("name");

      if (error) throw error;

      // Count users by role
      const { data: usersCount, error: usersError } = await supabase
        .from("users")
        .select("role_id, count")
        .select("role_id", { count: "exact" })
        .group("role_id");

      if (usersError) throw usersError;

      const userCountByRole: Record<string, number> = {};
      usersCount?.forEach((item) => {
        userCountByRole[item.role_id] = item.count || 0;
      });

      // Transform the data to format needed by the RolesTable
      const rolesWithPermissions = data.map((role: any) => {
        const permIds = role.role_permissions?.map((rp: any) => rp.permission_id) || [];
        const perms = permIds.map((id) => {
          const found = availablePermissions.find((p) => p.id === id);
          return found ? { id, name: found.label, description: found.description } : { id, name: id, description: "" };
        });

        return {
          ...role,
          permissions: perms,
          is_system_role: role.is_system_role || false,
          user_count: userCountByRole[role.id] || 0,
        };
      });

      setRoles(rolesWithPermissions);
    } catch (error) {
      console.error("Error fetching roles:", error);
      toast({
        title: "Erreur",
        description: "Impossible de charger les rôles",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }

  const handleAddRole = () => {
    setDialogMode("add");
    form.reset();
    setDialogOpen(true);
  };

  const onSubmit = async (data: RoleFormData) => {
    try {
      if (dialogMode === "add") {
        // Insert the role first
        const { data: roleData, error: roleError } = await supabase
          .from("roles")
          .insert([{ name: data.name, description: data.description }])
          .select()
          .single();

        if (roleError) throw roleError;

        // Then insert the role permissions
        if (data.permissions.length > 0) {
          const rolePermissions = data.permissions.map((permissionId) => ({
            role_id: roleData.id,
            permission_id: permissionId,
          }));

          const { error: permError } = await supabase.from("role_permissions").insert(rolePermissions);

          if (permError) throw permError;
        }
      } else if (dialogMode === "edit" && currentRole) {
        // Update the role
        const { error: roleError } = await supabase.from("roles").update({ name: data.name, description: data.description }).eq("id", currentRole.id);

        if (roleError) throw roleError;

        // Delete existing permissions
        const { error: deleteError } = await supabase.from("role_permissions").delete().eq("role_id", currentRole.id);

        if (deleteError) throw deleteError;

        // Insert new permissions
        if (data.permissions.length > 0) {
          const rolePermissions = data.permissions.map((permissionId) => ({
            role_id: currentRole.id,
            permission_id: permissionId,
          }));

          const { error: permError } = await supabase.from("role_permissions").insert(rolePermissions);

          if (permError) throw permError;
        }
      }

      toast({
        title: "Succès",
        description: dialogMode === "add" ? "Rôle ajouté" : "Rôle modifié",
      });
      fetchRoles();
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

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>Rôles</CardTitle>
              <CardDescription>Gérez les rôles et permissions du système</CardDescription>
            </div>
            <Button onClick={handleAddRole}>
              <Plus className="mr-2 h-4 w-4" />
              Ajouter un rôle
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex flex-col items-center justify-center min-h-[40vh]">
              <svg className="animate-spin h-12 w-12 text-primary mb-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"></path>
              </svg>
              <span className="text-lg text-muted-foreground text-center">Chargement des rôles...</span>
            </div>
          ) : (
            <RolesTable
              roles={roles}
              formatDate={formatDate}
              onView={handleViewRole}
              onEdit={handleEditRole}
              onDelete={handleDeleteRole}
              onRefresh={fetchRoles}
            />
          )}
        </CardContent>
      </Card>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {dialogMode === "add"
                ? "Ajouter un rôle"
                : dialogMode === "edit"
                ? "Modifier le rôle"
                : dialogMode === "view"
                ? "Détails du rôle"
                : "Supprimer le rôle"}
            </DialogTitle>
            <DialogDescription>
              {dialogMode === "add"
                ? "Créer un nouveau rôle"
                : dialogMode === "edit"
                ? "Modifier les informations du rôle"
                : dialogMode === "view"
                ? "Voir les détails du rôle"
                : "Êtes-vous sûr de vouloir supprimer ce rôle ?"}
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
                <FormField
                  control={form.control}
                  name="permissions"
                  render={() => (
                    <FormItem>
                      <FormLabel>Permissions</FormLabel>
                      <div className="grid grid-cols-2 gap-4">
                        {availablePermissions.map((permission) => (
                          <FormField
                            key={permission.id}
                            control={form.control}
                            name="permissions"
                            render={({ field }) => {
                              return (
                                <FormItem key={permission.id} className="flex flex-row items-start space-x-3 space-y-0">
                                  <FormControl>
                                    <Checkbox
                                      checked={field.value?.includes(permission.id)}
                                      onCheckedChange={(checked) => {
                                        return checked
                                          ? field.onChange([...field.value, permission.id])
                                          : field.onChange(field.value?.filter((value) => value !== permission.id));
                                      }}
                                    />
                                  </FormControl>
                                  <Label className="font-normal">{permission.label}</Label>
                                </FormItem>
                              );
                            }}
                          />
                        ))}
                      </div>
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

          {dialogMode === "view" && currentRole && (
            <div className="space-y-4">
              <div className="grid gap-4">
                <div>
                  <Label>Nom</Label>
                  <div>{currentRole.name}</div>
                </div>
                <div>
                  <Label>Description</Label>
                  <div>{currentRole.description}</div>
                </div>
                <div>
                  <Label>Permissions</Label>
                  <div>{currentRole.permissions.map((p) => availablePermissions.find((ap) => ap.id === p.id)?.label).join(", ")}</div>
                </div>
              </div>
              <DialogFooter>
                <Button onClick={() => setDialogOpen(false)}>Fermer</Button>
              </DialogFooter>
            </div>
          )}

          {dialogMode === "delete" && currentRole && (
            <>
              <p>Êtes-vous sûr de vouloir supprimer le rôle {currentRole.name} ?</p>
              <DialogFooter>
                <Button variant="outline" onClick={() => setDialogOpen(false)}>
                  Annuler
                </Button>
                <Button
                  variant="destructive"
                  onClick={async () => {
                    try {
                      // Delete role permissions first
                      const { error: permError } = await supabase.from("role_permissions").delete().eq("role_id", currentRole.id);

                      if (permError) throw permError;

                      // Then delete the role
                      const { error: roleError } = await supabase.from("roles").delete().eq("id", currentRole.id);

                      if (roleError) throw roleError;

                      toast({
                        title: "Succès",
                        description: "Rôle supprimé",
                      });
                      fetchRoles();
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
