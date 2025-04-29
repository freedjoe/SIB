import { Operation } from "./operations";

export interface Engagement {
  id: string;
  operation_id: string;
  code: string;
  inscription_date: string; // Will be stored as ISO date string
  amount: number;
  year: number;
  type: string;
  history: string | null;
  status: "draft" | "submitted" | "reviewed" | "approved" | "rejected";
  description: string | null;
  created_at: string;
}

export interface EngagementWithRelations extends Engagement {
  operation?: Operation;
}

export type NewEngagement = Omit<Engagement, "id" | "created_at">;
export type UpdateEngagement = Partial<NewEngagement>;
