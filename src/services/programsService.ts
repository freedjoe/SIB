
import { supabase } from "@/integrations/supabase/client";
import { Tables } from "@/integrations/supabase/types";

export type Program = Tables<"programs">;

export interface ProgramWithRelations extends Program {
  ministry?: { name: string; code: string };
  portfolio?: { name: string; description: string | null };
}

export async function getAllPrograms(): Promise<ProgramWithRelations[]> {
  const { data, error } = await supabase
    .from('programs')
    .select(`
      *,
      ministry:ministry_id (name, code),
      portfolio:portfolio_id (name, description)
    `)
    .order('name');
  
  if (error) {
    console.error("Error fetching programs:", error);
    throw error;
  }
  
  return data.map(program => ({
    ...program,
    budget: program.budget || 0,
    allocated: program.allocated || 0,
    fiscal_year: program.fiscal_year || 2024,
    code_programme: program.code_programme || ''
  })) || [];
}

export async function getProgramsByFiscalYear(year: number): Promise<ProgramWithRelations[]> {
  const { data, error } = await supabase
    .from('programs')
    .select(`
      *,
      ministry:ministry_id (name, code),
      portfolio:portfolio_id (name, description)
    `)
    .eq('fiscal_year', year)
    .order('name');
  
  if (error) {
    console.error(`Error fetching programs for fiscal year ${year}:`, error);
    throw error;
  }
  
  return data.map(program => ({
    ...program,
    budget: program.budget || 0,
    allocated: program.allocated || 0,
    fiscal_year: program.fiscal_year || 2024,
    code_programme: program.code_programme || ''
  })) || [];
}

export async function getProgramById(id: string): Promise<ProgramWithRelations | null> {
  const { data, error } = await supabase
    .from('programs')
    .select(`
      *,
      ministry:ministry_id (name, code),
      portfolio:portfolio_id (name, description)
    `)
    .eq('id', id)
    .single();
  
  if (error) {
    console.error(`Error fetching program with id ${id}:`, error);
    throw error;
  }
  
  if (!data) return null;

  return {
    ...data,
    budget: data.budget || 0,
    allocated: data.allocated || 0,
    fiscal_year: data.fiscal_year || 2024,
    code_programme: data.code_programme || ''
  };
}
