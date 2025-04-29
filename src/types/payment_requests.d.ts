import { Operation } from "./operations";
import { Engagement } from "./engagements";

export interface PaymentRequest {
  id: string;
  engagement_id: string;
  operation_id: string;
  requested_amount: number;
  requestDate: string;
  period: string;
  frequency: "monthly" | "quarterly" | "annual";
  justification: string | null;
  status: "draft" | "pending" | "reviewed" | "approved" | "rejected";
  document: string | null;
  beneficiary: string;
  description: string;
  created_at: string;
}

export interface PaymentRequestWithRelations extends PaymentRequest {
  operation?: Operation;
  engagement?: Engagement;
}

export type NewPaymentRequest = Omit<PaymentRequest, "id" | "created_at">;
export type UpdatePaymentRequest = Partial<NewPaymentRequest>;
