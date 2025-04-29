import { supabase } from "@/lib/supabase";
import { Tables } from "@/integrations/supabase/types";

export type EngagementReevaluation = Tables<"engagement_reevaluations">;

export interface EngagementReevaluationWithRelations extends EngagementReevaluation {
  engagement?: {
    reference: string;
    beneficiary: string;
    operation?: {
      name: string;
    };
  };
}

export async function getAllEngagementReevaluations(): Promise<EngagementReevaluationWithRelations[]> {
  const { data, error } = await supabase
    .from("engagement_reevaluations")
    .select(
      `
      *,
      engagement:engagement_id (
        reference,
        beneficiary,
        operation:operation_id (name)
      )
    `
    )
    .order("date_reevaluation", { ascending: false });

  if (error) {
    console.error("Error fetching engagement reevaluations:", error);
    throw error;
  }

  return data || [];
}

export async function createEngagementReevaluation(reevaluation: Omit<EngagementReevaluation, "id" | "created_at">): Promise<EngagementReevaluation> {
  // Assurons-nous que tous les champs requis sont définis
  const completeReevaluation = {
    ...reevaluation,
    // Définir des valeurs par défaut pour les champs manquants
    date_validation: reevaluation.date_validation || null,
    document_justificatif: reevaluation.document_justificatif || null,
    valide_par: reevaluation.valide_par || null,
  };

  const { data, error } = await supabase.from("engagement_reevaluations").insert(completeReevaluation).select().single();

  if (error) {
    console.error("Error creating engagement reevaluation:", error);
    throw error;
  }

  return data;
}

export async function updateEngagementReevaluationStatus(id: string, status: string, validePar: string): Promise<void> {
  const { error } = await supabase
    .from("engagement_reevaluations")
    .update({
      statut_reevaluation: status,
      valide_par: validePar,
      date_validation: new Date().toISOString(),
    })
    .eq("id", id);

  if (error) {
    console.error(`Error updating engagement reevaluation status for id ${id}:`, error);
    throw error;
  }
}
