import { Operation } from "./operations";
import { FiscalYear } from "./fiscal_years";

export interface CPForecast {
  id: string;
  operation_id: string;
  fiscal_year_id: string;
  forecast_cp: number;
  status: "draft" | "submitted" | "reviewed" | "approved" | "rejected";
  description: string | null;
  created_at: string;
}

export interface CPForecastWithRelations extends CPForecast {
  operation?: Operation;
  fiscal_year?: FiscalYear;
}

export type NewCPForecast = Omit<CPForecast, "id" | "created_at">;
export type UpdateCPForecast = Partial<NewCPForecast>;
