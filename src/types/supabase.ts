export interface Operation {
  id: string;
  name: string;
  ministry_id: string;
  ministry: Ministry;
  description: string | null;
  created_at: string;
  updated_at: string;
}

export interface Engagement {
  id: string;
  amount: number;
  engagement_date: string;
  status: "DRAFT" | "PENDING" | "COMPLETED" | "CANCELLED";
  operation_id: string;
  operation: Operation;
  exercice: number;
  description: string | null;
  created_at: string;
  updated_at: string;
}

export interface PrevisionCP {
  id: string;
  amount: number;
  payment_date: string | null;
  status: "DRAFT" | "PENDING" | "COMPLETED" | "CANCELLED";
  exercice: number;
  engagement_id: string;
  operation_id: string;
  engagement: Engagement;
  operation: Operation;
  description: string | null;
  created_at: string;
  updated_at: string;
}

export interface Ministry {
  id: string;
  name: string;
  code: string;
  created_at: string;
  updated_at: string;
}

export interface BudgetCategory {
  id: string;
  name: string;
  code: string | null;
  parent_id: string | null;
  created_at: string;
  updated_at: string;
  parent?: BudgetCategory;
}

export interface FinancialOperation {
  id: string;
  ministry_id: string;
  category_id: string;
  fiscal_year: number;
  amount: number;
  operation_type: "CREDIT" | "DEBIT";
  operation_date: string;
  description: string | null;
  status: string;
  created_at: string;
  updated_at: string;
  ministry?: Ministry;
  category?: BudgetCategory;
}

export interface BudgetAllocation {
  id: string;
  ministry_id: string;
  category_id: string;
  fiscal_year: number;
  initial_amount: number;
  revised_amount: number | null;
  actual_amount: number | null;
  status: string;
  created_at: string;
  updated_at: string;
  ministry?: Ministry;
  category?: BudgetCategory;
}

export interface Database {
  public: {
    Tables: {
      ministries: {
        Row: Ministry;
        Insert: Omit<Ministry, "id" | "created_at" | "updated_at">;
        Update: Partial<Omit<Ministry, "id" | "created_at" | "updated_at">>;
      };
      budget_categories: {
        Row: BudgetCategory;
        Insert: Omit<BudgetCategory, "id" | "created_at" | "updated_at">;
        Update: Partial<Omit<BudgetCategory, "id" | "created_at" | "updated_at">>;
      };
      financial_operations: {
        Row: FinancialOperation;
        Insert: Omit<FinancialOperation, "id" | "created_at" | "updated_at">;
        Update: Partial<Omit<FinancialOperation, "id" | "created_at" | "updated_at">>;
      };
      budget_allocations: {
        Row: BudgetAllocation;
        Insert: Omit<BudgetAllocation, "id" | "created_at" | "updated_at">;
        Update: Partial<Omit<BudgetAllocation, "id" | "created_at" | "updated_at">>;
      };
      operations: {
        Row: Operation;
        Insert: Omit<Operation, "id" | "created_at" | "updated_at">;
        Update: Partial<Omit<Operation, "id" | "created_at" | "updated_at">>;
      };
      engagements: {
        Row: Engagement;
        Insert: Omit<Engagement, "id" | "created_at" | "updated_at">;
        Update: Partial<Omit<Engagement, "id" | "created_at" | "updated_at">>;
      };
      prevision_cp: {
        Row: PrevisionCP;
        Insert: Omit<PrevisionCP, "id" | "created_at" | "updated_at">;
        Update: Partial<Omit<PrevisionCP, "id" | "created_at" | "updated_at">>;
      };
    };
    Views: {
      [key: string]: {
        Row: Record<string, unknown>;
      };
    };
    Functions: {
      [key: string]: {
        Args: Record<string, unknown>;
        Returns: unknown;
      };
    };
    Enums: {
      [key: string]: string[];
    };
  };
}
