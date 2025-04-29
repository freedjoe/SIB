import { Operation } from "./operations";
import { FiscalYear } from "./fiscal_years";

export interface CreditPayment {
  id: string;
  code: string;
  operation_id: string;
  fiscal_year_id: string;
  amount: number;
  status: "draft" | "submitted" | "reviewed" | "approved" | "rejected";
  description: string | null;
  created_at: string;
}

export interface CreditPaymentWithRelations extends CreditPayment {
  operation?: Operation;
  fiscal_year?: FiscalYear;
}

export type NewCreditPayment = Omit<CreditPayment, "id" | "created_at">;
export type UpdateCreditPayment = Partial<NewCreditPayment>;
