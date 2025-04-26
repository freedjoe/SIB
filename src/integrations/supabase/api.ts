import { supabase } from "./client";

// Ministry APIs
export const getMinistries = async () => {
  const { data, error } = await supabase.from("ministries").select("*").order("name_fr");

  if (error) throw error;
  return data;
};

export const getMinistryById = async (id: string) => {
  const { data, error } = await supabase.from("ministries").select("*").eq("id", id).single();

  if (error) throw error;
  return data;
};

// Budget Categories APIs
export const getBudgetCategories = async () => {
  const { data, error } = await supabase.from("budget_categories").select("*, parent:budget_categories(id, name)").order("name");

  if (error) throw error;
  return data;
};

// Financial Operations APIs
export const getFinancialOperations = async (ministryId?: string, categoryId?: string, fiscalYear?: number) => {
  let query = supabase
    .from("financial_operations")
    .select(
      `
      *,
      ministry:ministries(id, name),
      category:budget_categories(id, name)
    `
    )
    .order("operation_date", { ascending: false });

  if (ministryId) {
    query = query.eq("ministry_id", ministryId);
  }
  if (categoryId) {
    query = query.eq("category_id", categoryId);
  }
  if (fiscalYear) {
    query = query.eq("fiscal_year", fiscalYear);
  }

  const { data, error } = await query;
  if (error) throw error;
  return data;
};

// Budget Allocations APIs
export const getBudgetAllocations = async (fiscalYear: number, ministryId?: string, categoryId?: string) => {
  let query = supabase
    .from("budget_allocations")
    .select(
      `
      *,
      ministry:ministries(id, name),
      category:budget_categories(id, name)
    `
    )
    .eq("fiscal_year", fiscalYear)
    .order("created_at", { ascending: false });

  if (ministryId) {
    query = query.eq("ministry_id", ministryId);
  }
  if (categoryId) {
    query = query.eq("category_id", categoryId);
  }

  const { data, error } = await query;
  if (error) throw error;
  return data;
};

// Create new budget allocation
export const createBudgetAllocation = async (allocation: {
  ministry_id: string;
  category_id: string;
  fiscal_year: number;
  initial_amount: number;
  status?: string;
}) => {
  const { data, error } = await supabase.from("budget_allocations").insert(allocation).select().single();

  if (error) throw error;
  return data;
};

// Update budget allocation
export const updateBudgetAllocation = async (
  id: string,
  updates: Partial<{
    revised_amount: number;
    actual_amount: number;
    status: string;
  }>
) => {
  const { data, error } = await supabase.from("budget_allocations").update(updates).eq("id", id).select().single();

  if (error) throw error;
  return data;
};

// Create new financial operation
export const createFinancialOperation = async (operation: {
  ministry_id: string;
  category_id: string;
  fiscal_year: number;
  amount: number;
  operation_type: "CREDIT" | "DEBIT";
  operation_date: string;
  description?: string;
  status?: string;
}) => {
  const { data, error } = await supabase.from("financial_operations").insert(operation).select().single();

  if (error) throw error;
  return data;
};
