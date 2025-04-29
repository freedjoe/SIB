import { supabase } from "@/lib/supabase";
import { Tables } from "@/integrations/supabase/types";

export type Operation = Tables<"operations">;

export interface OperationWithRelations extends Operation {
  action?: {
    name: string;
    action_type: string;
    program_id: string;
    program?: {
      name: string;
      fiscal_year: number;
    };
  };
}

export async function getAllOperations(): Promise<OperationWithRelations[]> {
  const { data, error } = await supabase
    .from("operations")
    .select(
      `
      *,
      action:action_id (
        name, 
        action_type,
        program_id,
        program:program_id (name, fiscal_year)
      )
    `
    )
    .order("name");

  if (error) {
    console.error("Error fetching operations:", error);
    throw error;
  }

  return data || [];
}

export async function getOperationsByActionId(actionId: string): Promise<OperationWithRelations[]> {
  const { data, error } = await supabase
    .from("operations")
    .select(
      `
      *,
      action:action_id (
        name, 
        action_type,
        program_id,
        program:program_id (name, fiscal_year)
      )
    `
    )
    .eq("action_id", actionId)
    .order("name");

  if (error) {
    console.error(`Error fetching operations for action ${actionId}:`, error);
    throw error;
  }

  return data || [];
}

export async function getOperationById(id: string): Promise<OperationWithRelations | null> {
  const { data, error } = await supabase
    .from("operations")
    .select(
      `
      *,
      action:action_id (
        name, 
        action_type,
        program_id,
        program:program_id (name, fiscal_year)
      )
    `
    )
    .eq("id", id)
    .single();

  if (error) {
    console.error(`Error fetching operation with id ${id}:`, error);
    throw error;
  }

  return data;
}
