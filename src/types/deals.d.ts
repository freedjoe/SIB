import { Operation } from "./operations";

export interface Deal {
  id: string;
  operation_id: string;
  company_name: string;
  amount: number;
  date_signed: string | null;
  physical_rate: number | null;
  financial_rate: number | null;
  delay: number | null;
  description: string | null;
  created_at: string;
}

export interface DealWithRelations extends Deal {
  operation?: Operation;
}

export type NewDeal = Omit<Deal, "id" | "created_at">;
export type UpdateDeal = Partial<NewDeal>;
