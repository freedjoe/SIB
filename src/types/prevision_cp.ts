export interface Operation {
  id: string;
  name: string;
  description: string;
  program_id: string;
  action_id: string;
  code_operation: string;
  wilaya: string;
  titre_budgetaire: number;
  origine_financement: "budget_national" | "financement_exterieur";
  created_at: string;
  updated_at: string;
}

export interface Engagement {
  id: string;
  code: string;
  libelle: string;
  description: string;
  montant: number;
  date_engagement: string;
  statut: string;
  operation_id: string;
  created_at: string;
  updated_at: string;
}

export type PrevisionCPStatus = "prévu" | "demandé" | "mobilisé" | "en retard" | "partiellement mobilisé";

export type PrevisionCP = {
  id: string;
  engagement_id: string;
  operation_id: string;
  exercice: number;
  periode: string;
  montant_prevu: number;
  montant_demande: number;
  montant_mobilise: number;
  montant_consomme: number;
  statut: PrevisionCPStatus;
  date_soumission: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
  engagement?: {
    libelle: string;
    operation_id: string;
    ministry_id: string | null;
  };
  operation?: {
    name: string;
    ministry_id: string | null;
  };
};
