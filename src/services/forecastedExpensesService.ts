import { supabase } from "@/lib/supabase";
import { Tables } from "@/integrations/supabase/types";
import { Program } from "@/types/programs";

export type ForecastedExpense = Tables<"cp_forecasts">;

export interface ProgramData {
  name: string;
  fiscal_year: number;
}

export interface MinistryData {
  name: string;
  code: string;
}

export interface ForecastedExpenseWithRelations extends ForecastedExpense {
  program?: ProgramData;
  ministry?: MinistryData;
}

export async function getAllForecastedExpenses(): Promise<ForecastedExpenseWithRelations[]> {
  const { data, error } = await supabase
    .from("cp_forecasts")
    .select(
      `
      *,
      program:program_id (name),
      ministry:ministry_id (name, code)
    `
    )
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching forecasted expenses:", error);
    throw error;
  }

  return (
    data?.map((item) => ({
      ...item,
      program: {
        name: item.program?.name || "",
        fiscal_year: 2024, // Default fiscal year
      },
      ministry: {
        ...item.ministry,
        name: item.ministry?.name || "",
        code: item.ministry?.code || "",
      },
    })) || []
  );
}

export async function getForecastedExpensesByProgramId(programId: string): Promise<ForecastedExpenseWithRelations[]> {
  const { data, error } = await supabase
    .from("cp_forecasts")
    .select(
      `
      *,
      program:program_id (name),
      ministry:ministry_id (name, code)
    `
    )
    .eq("program_id", programId)
    .order("created_at", { ascending: false });

  if (error) {
    console.error(`Error fetching forecasted expenses for program ${programId}:`, error);
    throw error;
  }

  return (
    data?.map((item) => ({
      ...item,
      program: {
        name: item.program?.name || "",
        fiscal_year: 2024, // Default fiscal year
      },
      ministry: {
        ...item.ministry,
        name: item.ministry?.name || "",
        code: item.ministry?.code || "",
      },
    })) || []
  );
}

export async function getForecastedExpenseById(id: string): Promise<ForecastedExpenseWithRelations | null> {
  const { data, error } = await supabase
    .from("cp_forecasts")
    .select(
      `
      *,
      program:program_id (name),
      ministry:ministry_id (name, code)
    `
    )
    .eq("id", id)
    .single();

  if (error) {
    console.error(`Error fetching forecasted expense with id ${id}:`, error);
    throw error;
  }

  if (!data) return null;

  return {
    ...data,
    program: {
      name: data.program?.name || "",
      fiscal_year: 2024, // Default fiscal year
    },
    ministry: {
      ...data.ministry,
      name: data.ministry?.name || "",
      code: data.ministry?.code || "",
    },
  };
}
