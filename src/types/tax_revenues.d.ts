import { FiscalYear } from "./fiscal_years";

export interface TaxRevenue {
  id: string;
  tax_name: string;
  beneficiary: string | null;
  allocation_percent: number;
  amount: number;
  fiscal_year_id: string;
  created_at: string;
}

export interface TaxRevenueWithRelations extends TaxRevenue {
  fiscal_year?: FiscalYear;
}

export type NewTaxRevenue = Omit<TaxRevenue, "id" | "created_at">;
export type UpdateTaxRevenue = Partial<NewTaxRevenue>;
