
export interface Program {
  id: string;
  name: string;
  description?: string;
  portfolio_id: string;
  created_at: string;
  // Required properties for ForecastedExpenses.tsx
  budget: number;
  allocated: number;
  fiscal_year?: number;
}
