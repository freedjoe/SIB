import { CPMobilisation } from "./cp_mobilisations";

export interface CPConsumption {
  id: string;
  mobilisation_id: string;
  consumed_cp: number;
  consumption_date: string;
  status: "draft" | "submitted" | "reviewed" | "approved" | "rejected";
  description: string | null;
  created_at: string;
}

export interface CPConsumptionWithRelations extends CPConsumption {
  mobilisation?: CPMobilisation;
}

export type NewCPConsumption = Omit<CPConsumption, "id" | "created_at">;
export type UpdateCPConsumption = Partial<NewCPConsumption>;
