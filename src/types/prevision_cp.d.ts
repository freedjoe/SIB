export type PrevisionCPStatus = "prévu" | "demandé" | "mobilisé" | "en retard" | "partiellement mobilisé";

export interface PrevisionCP {
  id: string;
  engagement_id: string;
  operation_id: string;
  exercice: number;
  periode: string;
  montant_prevu: number;
  montant_demande?: number;
  montant_mobilise?: number;
  montant_consomme?: number;
  statut: PrevisionCPStatus;
  date_soumission?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
  engagement_name?: string;
  operation_name?: string;
}
