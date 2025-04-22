import { supabase } from "@/integrations/supabase/client";
import { Tables } from "@/integrations/supabase/types";

export type Engagement = Tables<"engagements">;

export interface EngagementWithRelations extends Engagement {
  montant_initial?: number;
  montant_approuve?: number;
  montant_demande?: number;
  statut?: string;
  request_date?: string;
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
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching engagements:", error);
    throw error;
  }

  const enhancedData = data?.map(engagement => ({
    ...engagement,
    montant_initial: engagement.montant_initial ?? 0,
    montant_approuve: engagement.montant_approuve ?? null,
    montant_demande: engagement.montant_demande ?? 0,
    statut: engagement.statut ?? "En attente",
    request_date: engagement.created_at
  })) || [];

  return enhancedData;
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
    .order("created_at", { ascending: false });

  if (error) {
    console.error(`Error fetching engagements for operation ${operationId}:`, error);
    throw error;
  }

  const enhancedData = data?.map(engagement => ({
    ...engagement,
    montant_initial: engagement.montant_initial ?? 0,
    montant_approuve: engagement.montant_approuve ?? null,
    montant_demande: engagement.montant_demande ?? 0,
    statut: engagement.statut ?? "En attente",
    request_date: engagement.created_at
  })) || [];

  return enhancedData;
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

  if (data) {
    return {
      ...data,
      montant_initial: data.montant_initial ?? 0,
      montant_approuve: data.montant_approuve ?? null,
      montant_demande: data.montant_demande ?? 0,
      statut: data.statut ?? "En attente",
      request_date: data.created_at
    };
  }

  return data;
}
