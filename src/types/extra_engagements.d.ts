import { Operation } from "./operations";

export interface ExtraEngagement {
  id: string;
  operation_id: string;
  requested_amount: number;
  justification: string | null;
  status: "draft" | "submitted" | "reviewed" | "approved" | "rejected";
  engagement_date: string;
  created_at: string;
}

export interface ExtraEngagementWithRelations extends ExtraEngagement {
  operation?: Operation;
}

export type NewExtraEngagement = Omit<ExtraEngagement, "id" | "created_at" | "engagement_date">;
export type UpdateExtraEngagement = Partial<NewExtraEngagement>;
