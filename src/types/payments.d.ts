import { Operation } from "./operations";

export interface Payment {
  id: string;
  operation_id: string;
  amount: number;
  payment_date: string;
  status: "draft" | "submitted" | "reviewed" | "approved" | "rejected";
  description: string | null;
  created_at: string;
}

export interface PaymentWithRelations extends Payment {
  operation?: Operation;
}

export type NewPayment = Omit<Payment, "id" | "created_at">;
export type UpdatePayment = Partial<NewPayment>;
