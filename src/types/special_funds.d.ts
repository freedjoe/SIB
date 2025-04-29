export interface SpecialFund {
  id: string;
  account_number: string;
  name: string;
  description: string | null;
  category: string | null;
  balance_2023: number;
  created_at: string;
}

export type NewSpecialFund = Omit<SpecialFund, "id" | "created_at">;
export type UpdateSpecialFund = Partial<NewSpecialFund>;
