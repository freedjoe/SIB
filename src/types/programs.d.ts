export interface Program {
  id: string;
  name: string;
  description?: string;
  portfolio_id: string;
  created_at: string;
  budget: number;
  allocated: number;
  fiscal_year?: number;
  code_programme: string;
}
