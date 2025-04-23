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

export interface PrevisionCP {
  id: string;
  exercice: string;
  periode: string;
  operation_id: string;
  operation: Operation;
  engagement_id: string;
  engagement: Engagement;
  montant_prevu: number;
  montant_demande: number;
  montant_mobilise: number;
  montant_consomme: number;
  statut: "prévu" | "demandé" | "mobilisé" | "partiellement mobilisé" | "consommé";
  notes: string | null;
  date_soumission: string | null;
  created_at: string;
  updated_at: string;
}
