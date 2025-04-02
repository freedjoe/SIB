import { supabase } from "@/integrations/supabase/client";
import { Tables } from "@/integrations/supabase/types";

export type SystemParameter = Tables<"system_parameters">;

export async function getAllSystemParameters(): Promise<SystemParameter[]> {
  const { data, error } = await supabase.from("system_parameters").select("*").order("module", { ascending: true });

  if (error) {
    console.error("Error fetching system parameters:", error);
    throw error;
  }

  return data || [];
}

export async function getSystemParametersByModule(module: string): Promise<SystemParameter[]> {
  const { data, error } = await supabase.from("system_parameters").select("*").eq("module", module);

  if (error) {
    console.error(`Error fetching system parameters for module ${module}:`, error);
    throw error;
  }

  return data || [];
}

export async function getSystemParameter(module: string, key: string): Promise<SystemParameter | null> {
  const { data, error } = await supabase.from("system_parameters").select("*").eq("module", module).eq("parameter_key", key).single();

  if (error) {
    console.error(`Error fetching system parameter ${module}.${key}:`, error);
    throw error;
  }

  return data;
}

export async function createSystemParameter(parameter: Omit<SystemParameter, "id" | "created_at" | "updated_at">): Promise<SystemParameter> {
  const { data, error } = await supabase.from("system_parameters").insert(parameter).select().single();

  if (error) {
    console.error("Error creating system parameter:", error);
    throw error;
  }

  return data;
}

export async function updateSystemParameter(
  id: string,
  parameter: Partial<Omit<SystemParameter, "id" | "created_at" | "updated_at">>
): Promise<SystemParameter> {
  const { data, error } = await supabase.from("system_parameters").update(parameter).eq("id", id).select().single();

  if (error) {
    console.error(`Error updating system parameter with id ${id}:`, error);
    throw error;
  }

  return data;
}

export async function deleteSystemParameter(id: string): Promise<void> {
  const { error } = await supabase.from("system_parameters").delete().eq("id", id);

  if (error) {
    console.error(`Error deleting system parameter with id ${id}:`, error);
    throw error;
  }
}
