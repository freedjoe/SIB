import { supabase } from "@/integrations/supabase/client";
import { Tables } from "@/integrations/supabase/types";
import { createAuditLog } from "./auditLogService";

export type EngagementRevaluation = Tables<"engagement_reevaluations">;

export interface CreateRevaluationParams {
  engagement_id: string;
  montant_initial: number;
  montant_reevalue: number;
  motif_reevaluation: string;
  created_by: string;
  statut_reevaluation: string;
  origine_financement: string;
}

export interface UpdateRevaluationStatusParams {
  id: string;
  statut_reevaluation: string;
  valide_par: string;
  comment?: string;
}

export async function createRevaluation(params: CreateRevaluationParams): Promise<EngagementRevaluation> {
  const { engagement_id, montant_initial, montant_reevalue, motif_reevaluation, created_by, statut_reevaluation, origine_financement } = params;

  // Validate that the engagement exists and is not already being revalued
  const { data: existingEngagement, error: engagementError } = await supabase.from("engagements").select().eq("id", engagement_id).single();

  if (engagementError || !existingEngagement) {
    throw new Error("Engagement not found");
  }

  const { data: existingRevaluation, error: revaluationError } = await supabase
    .from("engagement_reevaluations")
    .select()
    .eq("engagement_id", engagement_id)
    .eq("statut_reevaluation", "en_cours")
    .single();

  if (revaluationError && revaluationError.code !== "PGRST116") {
    throw new Error("Error checking existing revaluation");
  }

  if (existingRevaluation) {
    throw new Error("A pending revaluation already exists for this engagement");
  }

  // Create the revaluation
  const { data, error } = await supabase
    .from("engagement_reevaluations")
    .insert({
      engagement_id,
      montant_initial,
      montant_reevalue,
      motif_reevaluation,
      created_by,
      statut_reevaluation,
      origine_financement,
      date_reevaluation: new Date().toISOString(),
    })
    .select()
    .single();

  if (error) {
    console.error("Error creating revaluation:", error);
    throw error;
  }

  // Log the action
  await createAuditLog({
    action: "CREATE_REVALUATION",
    user_id: created_by,
    entity_type: "engagement_reevaluation",
    entity_id: data.id,
    changes: {
      before: {},
      after: {
        revaluation_id: data.id,
        engagement_id,
        montant_initial,
        montant_reevalue,
        motif_reevaluation,
        statut_reevaluation,
        origine_financement,
      },
    },
  });

  return data;
}

export async function updateRevaluationStatus(params: UpdateRevaluationStatusParams): Promise<EngagementRevaluation> {
  const { id, statut_reevaluation, valide_par, comment } = params;

  // Get the current revaluation
  const { data: currentRevaluation, error: fetchError } = await supabase.from("engagement_reevaluations").select().eq("id", id).single();

  if (fetchError || !currentRevaluation) {
    throw new Error("Revaluation not found");
  }

  if (currentRevaluation.statut_reevaluation !== "en_cours") {
    throw new Error("Can only update pending revaluations");
  }

  // Update the revaluation status
  const { data, error } = await supabase
    .from("engagement_reevaluations")
    .update({
      statut_reevaluation,
      valide_par,
      date_validation: new Date().toISOString(),
    })
    .eq("id", id)
    .select()
    .single();

  if (error) {
    console.error("Error updating revaluation status:", error);
    throw error;
  }

  // Log the action
  await createAuditLog({
    action: "UPDATE_REVALUATION_STATUS",
    user_id: valide_par,
    entity_type: "engagement_reevaluation",
    entity_id: id,
    changes: {
      before: {
        statut_reevaluation: currentRevaluation.statut_reevaluation,
      },
      after: {
        revaluation_id: id,
        statut_reevaluation,
        comment,
      },
    },
  });

  return data;
}

export async function getRevaluationsByEngagement(engagementId: string): Promise<EngagementRevaluation[]> {
  const { data, error } = await supabase
    .from("engagement_reevaluations")
    .select(
      `
      *,
      created_by_user:created_by (
        first_name,
        last_name,
        role:role_id (
          name
        )
      ),
      valide_par_user:valide_par (
        first_name,
        last_name,
        role:role_id (
          name
        )
      )
    `
    )
    .eq("engagement_id", engagementId)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching revaluations:", error);
    throw error;
  }

  return data || [];
}

export async function getRevaluationById(id: string): Promise<EngagementRevaluation | null> {
  const { data, error } = await supabase
    .from("engagement_reevaluations")
    .select(
      `
      *,
      created_by_user:created_by (
        first_name,
        last_name,
        role:role_id (
          name
        )
      ),
      valide_par_user:valide_par (
        first_name,
        last_name,
        role:role_id (
          name
        )
      )
    `
    )
    .eq("id", id)
    .single();

  if (error) {
    console.error("Error fetching revaluation:", error);
    throw error;
  }

  return data;
}
