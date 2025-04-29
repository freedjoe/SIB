import { Operation } from "./operations";

export interface CPAlert {
  id: string;
  operation_id: string;
  threshold_exceeded: boolean;
  alert_level: string;
  message: string | null;
  status: "draft" | "submitted" | "reviewed" | "approved" | "rejected";
  alert_date: string;
  created_at: string;
}

export interface CPAlertWithRelations extends CPAlert {
  operation?: Operation;
}

export type NewCPAlert = Omit<CPAlert, "id" | "created_at" | "alert_date">;
export type UpdateCPAlert = Partial<NewCPAlert>;
