import { supabase } from "@/integrations/supabase/client";
import { Tables } from "@/integrations/supabase/types";

export type Role = Tables<"roles">;
export type Permission = Tables<"permissions">;
export type RolePermission = Tables<"role_permissions">;

export interface RoleWithPermissions extends Role {
  permissions?: Permission[];
}

export async function getAllRoles(): Promise<RoleWithPermissions[]> {
  const { data, error } = await supabase
    .from("roles")
    .select(
      `
      *,
      permissions:role_permissions (
        permission:permission_id (*)
      )
    `
    )
    .order("name", { ascending: true });

  if (error) {
    console.error("Error fetching roles:", error);
    throw error;
  }

  return data || [];
}

export async function getRoleById(id: string): Promise<RoleWithPermissions | null> {
  const { data, error } = await supabase
    .from("roles")
    .select(
      `
      *,
      permissions:role_permissions (
        permission:permission_id (*)
      )
    `
    )
    .eq("id", id)
    .single();

  if (error) {
    console.error(`Error fetching role with id ${id}:`, error);
    throw error;
  }

  return data;
}

export async function createRole(role: Omit<Role, "id" | "created_at" | "updated_at">): Promise<Role> {
  const { data, error } = await supabase.from("roles").insert(role).select().single();

  if (error) {
    console.error("Error creating role:", error);
    throw error;
  }

  return data;
}

export async function updateRole(id: string, role: Partial<Omit<Role, "id" | "created_at" | "updated_at">>): Promise<Role> {
  const { data, error } = await supabase.from("roles").update(role).eq("id", id).select().single();

  if (error) {
    console.error(`Error updating role with id ${id}:`, error);
    throw error;
  }

  return data;
}

export async function deleteRole(id: string): Promise<void> {
  const { error } = await supabase.from("roles").delete().eq("id", id);

  if (error) {
    console.error(`Error deleting role with id ${id}:`, error);
    throw error;
  }
}

export async function getAllPermissions(): Promise<Permission[]> {
  const { data, error } = await supabase.from("permissions").select("*").order("module", { ascending: true });

  if (error) {
    console.error("Error fetching permissions:", error);
    throw error;
  }

  return data || [];
}

export async function getPermissionsByModule(module: string): Promise<Permission[]> {
  const { data, error } = await supabase.from("permissions").select("*").eq("module", module);

  if (error) {
    console.error(`Error fetching permissions for module ${module}:`, error);
    throw error;
  }

  return data || [];
}

export async function assignPermissionsToRole(roleId: string, permissionIds: string[]): Promise<void> {
  // First, remove all existing permissions for this role
  const { error: deleteError } = await supabase.from("role_permissions").delete().eq("role_id", roleId);

  if (deleteError) {
    console.error(`Error removing existing permissions for role ${roleId}:`, deleteError);
    throw deleteError;
  }

  // Then, insert the new permissions
  const rolePermissions = permissionIds.map((permissionId) => ({
    role_id: roleId,
    permission_id: permissionId,
  }));

  const { error: insertError } = await supabase.from("role_permissions").insert(rolePermissions);

  if (insertError) {
    console.error(`Error assigning permissions to role ${roleId}:`, insertError);
    throw insertError;
  }
}

export async function getRolePermissions(roleId: string): Promise<Permission[]> {
  const { data, error } = await supabase
    .from("role_permissions")
    .select(
      `
      permission:permission_id (*)
    `
    )
    .eq("role_id", roleId);

  if (error) {
    console.error(`Error fetching permissions for role ${roleId}:`, error);
    throw error;
  }

  return data?.map((rp) => rp.permission) || [];
}
