import { Engagement } from "./engagements";

export interface Revaluation {
  id: string;
  engagement_id: string;
  code: string;
  revaluation_amount: number;
  reason: string | null;
  description: string | null;
  status: "draft" | "submitted" | "reviewed" | "approved" | "rejected";
  revaluation_date: string;
  created_at: string;
}

export interface RevaluationWithRelations extends Revaluation {
  engagement?: Engagement;
}

export type NewRevaluation = Omit<Revaluation, "id" | "created_at" | "revaluation_date">;
export type UpdateRevaluation = Partial<NewRevaluation>;
