import { Operation } from "./operations";

export interface PaymentRequest {
  id: string;
  operation_id: string;
  requested_amount: number;
  period: string;
  justification: string | null;
  status: "draft" | "submitted" | "reviewed" | "approved" | "rejected";
  document: string | null;
  created_at: string;
}

export interface PaymentRequestWithRelations extends PaymentRequest {
  operation?: Operation;
}

export type NewPaymentRequest = Omit<PaymentRequest, "id" | "created_at">;
export type UpdatePaymentRequest = Partial<NewPaymentRequest>;
