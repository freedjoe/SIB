export type PrevisionCPStatus = "prévu" | "demandé" | "mobilisé" | "en retard" | "partiellement mobilisé";

export interface PrevisionCP {
  id: string;
  engagement_id: string;
  engagement_name: string;
  operation_id: string;
  operation_name: string;
  programme_name: string;
  ministere_id: string;
  ministere_name: string;
  exercice: number;
  periode: string;
  montant_prevu: number;
  montant_demande: number | null;
  montant_mobilise: number | null;
  montant_consomme: number | null;
  date_prevu: string;
  date_demande: string | null;
  date_mobilise: string | null;
  statut: PrevisionCPStatus;
  notes?: string;
}
