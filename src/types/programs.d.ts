
export interface Program {
  id: string;
  name: string;
  description?: string;
  portfolio_id: string;
  created_at: string;
  // Additional properties needed by ForecastedExpenses.tsx
  budget: number;
  allocated: number;
  fiscal_year?: number;
}
