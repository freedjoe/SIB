import { Action } from "./actions";
import { Wilaya } from "./wilayas";
import { BudgetCategory } from "./budget_categories";

export interface Operation {
  id: string;
  action_id: string;
  wilaya_id: string;
  code: string;
  title: string;
  description?: string;
  inscription_date: string; // ISO date string format
  budget_category_id: string;
  allocated_ae: number;
  allocated_cp: number;
  consumed_ae: number;
  consumed_cp: number;
  physical_rate: number;
  financial_rate: number;
  delay: number;
  status: "draft" | "submitted" | "reviewed" | "approved" | "rejected";
  created_at: string;
}

export interface OperationWithRelations extends Operation {
  action?: Action;
  wilaya?: Wilaya;
  budget_category?: BudgetCategory;
}

// Utility type for creating a new operation
export type NewOperation = Omit<Operation, "id" | "created_at">;

// Utility type for updating an operation
export type UpdateOperation = Partial<NewOperation>;
