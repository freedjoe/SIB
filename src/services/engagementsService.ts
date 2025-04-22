
import { supabase } from "@/integrations/supabase/client";
import { Tables } from "@/integrations/supabase/types";

export type Engagement = Tables<"engagements">;

export interface EngagementWithRelations extends Engagement {
  operation?: {
    name: string;
    status: string;
    action_id: string;
    action?: {
      name: string;
      program_id: string;
      program?: {
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
        status,
        action_id,
        action:action_id (
          name,
          program_id,
          program:program_id (name)
        )
      )
    `
    )
    .order("request_date", { ascending: false });

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
        status,
        action_id,
        action:action_id (
          name,
          program_id,
          program:program_id (name)
        )
      )
    `
    )
    .eq("operation_id", operationId)
    .order("request_date", { ascending: false });

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
        status,
        action_id,
        action:action_id (
          name,
          program_id,
          program:program_id (name)
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
