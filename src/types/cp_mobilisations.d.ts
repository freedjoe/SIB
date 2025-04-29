import { Operation } from "./operations";

export interface CPMobilisation {
  id: string;
  operation_id: string;
  mobilised_cp: number;
  mobilisation_date: string;
  status: "draft" | "submitted" | "reviewed" | "approved" | "rejected";
  description: string | null;
  created_at: string;
}

export interface CPMobilisationWithRelations extends CPMobilisation {
  operation?: Operation;
}

export type NewCPMobilisation = Omit<CPMobilisation, "id" | "created_at">;
export type UpdateCPMobilisation = Partial<NewCPMobilisation>;
