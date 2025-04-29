import { supabase } from "@/lib/supabase";
import { Tables } from "@/integrations/supabase/types";

export type User = Tables<"users">;

export interface UserWithRelations extends User {
  company?: {
    name: string;
    code: string;
  };
  role?: {
    name: string;
    permissions?: {
      permission: {
        name: string;
        module: string;
      };
    }[];
  };
}

export async function getAllUsers(): Promise<UserWithRelations[]> {
  const { data, error } = await supabase
    .from("users")
    .select(
      `
      *,
      company:company_id (name, code),
      role:role_id (
        name,
        permissions:role_permissions (
          permission:permission_id (name, module)
        )
      )
    `
    )
    .order("username", { ascending: true });

  if (error) {
    console.error("Error fetching users:", error);
    throw error;
  }

  return data || [];
}

export async function getUserById(id: string): Promise<UserWithRelations | null> {
  const { data, error } = await supabase
    .from("users")
    .select(
      `
      *,
      company:company_id (name, code),
      role:role_id (
        name,
        permissions:role_permissions (
          permission:permission_id (name, module)
        )
      )
    `
    )
    .eq("id", id)
    .single();

  if (error) {
    console.error(`Error fetching user with id ${id}:`, error);
    throw error;
  }

  return data;
}

export async function getUserByUsername(username: string): Promise<UserWithRelations | null> {
  const { data, error } = await supabase
    .from("users")
    .select(
      `
      *,
      company:company_id (name, code),
      role:role_id (
        name,
        permissions:role_permissions (
          permission:permission_id (name, module)
        )
      )
    `
    )
    .eq("username", username)
    .single();

  if (error) {
    console.error(`Error fetching user with username ${username}:`, error);
    throw error;
  }

  return data;
}

export async function createUser(user: Omit<User, "id" | "created_at" | "updated_at">): Promise<User> {
  const { data, error } = await supabase.from("users").insert(user).select().single();

  if (error) {
    console.error("Error creating user:", error);
    throw error;
  }

  return data;
}

export async function updateUser(id: string, user: Partial<Omit<User, "id" | "created_at" | "updated_at">>): Promise<User> {
  const { data, error } = await supabase.from("users").update(user).eq("id", id).select().single();

  if (error) {
    console.error(`Error updating user with id ${id}:`, error);
    throw error;
  }

  return data;
}

export async function deleteUser(id: string): Promise<void> {
  const { error } = await supabase.from("users").delete().eq("id", id);

  if (error) {
    console.error(`Error deleting user with id ${id}:`, error);
    throw error;
  }
}

export async function updateUserLastLogin(id: string): Promise<void> {
  const { error } = await supabase.from("users").update({ last_login: new Date().toISOString() }).eq("id", id);

  if (error) {
    console.error(`Error updating last login for user ${id}:`, error);
    throw error;
  }
}

export async function getUsersByCompany(companyId: string): Promise<UserWithRelations[]> {
  const { data, error } = await supabase
    .from("users")
    .select(
      `
      *,
      company:company_id (name, code),
      role:role_id (
        name,
        permissions:role_permissions (
          permission:permission_id (name, module)
        )
      )
    `
    )
    .eq("company_id", companyId)
    .order("username", { ascending: true });

  if (error) {
    console.error(`Error fetching users for company ${companyId}:`, error);
    throw error;
  }

  return data || [];
}

export async function getUsersByRole(roleId: string): Promise<UserWithRelations[]> {
  const { data, error } = await supabase
    .from("users")
    .select(
      `
      *,
      company:company_id (name, code),
      role:role_id (
        name,
        permissions:role_permissions (
          permission:permission_id (name, module)
        )
      )
    `
    )
    .eq("role_id", roleId)
    .order("username", { ascending: true });

  if (error) {
    console.error(`Error fetching users for role ${roleId}:`, error);
    throw error;
  }

  return data || [];
}
