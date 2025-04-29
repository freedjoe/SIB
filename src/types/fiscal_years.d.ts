export interface FiscalYear {
  id: string;
  year: number; // INTEGER UNIQUE NOT NULL
  status: "planning" | "active" | "closed" | "draft";
  description?: string;
  created_at: string;
}

// Utility type for creating a new fiscal year
export type NewFiscalYear = Omit<FiscalYear, "id" | "created_at">;

// Utility type for updating a fiscal year
export type UpdateFiscalYear = Partial<NewFiscalYear>;
