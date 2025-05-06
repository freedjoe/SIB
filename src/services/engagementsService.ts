import { supabase } from "@/lib/supabase";
import { Tables } from "@/integrations/supabase/types";

export type Engagement = Tables<"engagements">;

export interface EngagementWithRelations extends Engagement {
  operation?: {
    name: string;
    action_id: string | null;
    action?: {
      name: string;
      subprogram_id: string;
      subprogram?: {
        name: string;
      };
    };
  };
}

export async function getAllEngagements(): Promise<EngagementWithRelations[]> {
  const { data, error } = await supabase
    .from("engagements")
    .select(
      `
      *,
      operation:operation_id (
        name,
        action_id,
        action:action_id (
          name,
          subprogram_id,
          subprogram:subprogram_id (name)
        )
      )
    `
    )
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching engagements:", error);
    throw error;
  }

  return data || [];
}

export async function getEngagementsByOperationId(operationId: string): Promise<EngagementWithRelations[]> {
  const { data, error } = await supabase
    .from("engagements")
    .select(
      `
      *,
      operation:operation_id (
        name,
        action_id,
        action:action_id (
          name,
          subprogram_id,
          subprogram:subprogram_id (name)
        )
      )
    `
    )
    .eq("operation_id", operationId)
    .order("created_at", { ascending: false });

  if (error) {
    console.error(`Error fetching engagements for operation ${operationId}:`, error);
    throw error;
  }

  return data || [];
}

export async function getEngagementById(id: string): Promise<EngagementWithRelations | null> {
  const { data, error } = await supabase
    .from("engagements")
    .select(
      `
      *,
      operation:operation_id (
        name,
        action_id,
        action:action_id (
          name,
          subprogram_id,
          subprogram:subprogram_id (name)
        )
      )
    `
    )
    .eq("id", id)
    .single();

  if (error) {
    console.error(`Error fetching engagement with id ${id}:`, error);
    throw error;
  }

  return data;
}
