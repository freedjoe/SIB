export type StatutDemande = "en_attente" | "validee" | "rejetee";

export interface Engagement {
  id: string;
  operation_id: string;
  reference: string;
  description?: string;
  statut_demande: StatutDemande;
  created_at: string;
}
