import { Operation } from "./operations";
import { Engagement } from "./engagements";

export interface Payment {
  id: string;
  engagement_id: string;
  operation_id: string;
  amount: number;
  payment_date: string;
  status: "pending" | "approved" | "rejected" | "paid" | "draft";
  beneficiary: string;
  description: string | null;
  created_at: string;
}

export interface PaymentWithRelations extends Payment {
  operation?: Operation;
  engagement?: Engagement;
}

export type NewPayment = Omit<Payment, "id" | "created_at">;
export type UpdatePayment = Partial<NewPayment>;
