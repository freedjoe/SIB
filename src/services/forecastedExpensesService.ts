
import { supabase } from "@/integrations/supabase/client";
import { Tables } from "@/integrations/supabase/types";

export type ForecastedExpense = Tables<"forecasted_expenses">;

export interface ForecastedExpenseWithRelations extends ForecastedExpense {
  program?: {
    name: string;
    fiscal_year: number;
  };
  ministry?: {
    name: string;
    code: string;
  };
}

export async function getAllForecastedExpenses(): Promise<ForecastedExpenseWithRelations[]> {
  const { data, error } = await supabase
    .from('forecasted_expenses')
    .select(`
      *,
      program:program_id (name, fiscal_year),
      ministry:ministry_id (name, code)
    `)
    .order('created_at', { ascending: false });
  
  if (error) {
    console.error("Error fetching forecasted expenses:", error);
    throw error;
  }
  
  return data || [];
}

export async function getForecastedExpensesByProgramId(programId: string): Promise<ForecastedExpenseWithRelations[]> {
  const { data, error } = await supabase
    .from('forecasted_expenses')
    .select(`
      *,
      program:program_id (name, fiscal_year),
      ministry:ministry_id (name, code)
    `)
    .eq('program_id', programId)
    .order('created_at', { ascending: false });
  
  if (error) {
    console.error(`Error fetching forecasted expenses for program ${programId}:`, error);
    throw error;
  }
  
  return data || [];
}

export async function getForecastedExpenseById(id: string): Promise<ForecastedExpenseWithRelations | null> {
  const { data, error } = await supabase
    .from('forecasted_expenses')
    .select(`
      *,
      program:program_id (name, fiscal_year),
      ministry:ministry_id (name, code)
    `)
    .eq('id', id)
    .single();
  
  if (error) {
    console.error(`Error fetching forecasted expense with id ${id}:`, error);
    throw error;
  }
  
  return data;
}
