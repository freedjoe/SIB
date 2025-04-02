
import { supabase } from "@/integrations/supabase/client";
import { Tables } from "@/integrations/supabase/types";

export type Action = Tables<"actions">;

export interface ActionWithRelations extends Action {
  program?: { 
    name: string;
    fiscal_year: number;
    ministry_id?: string;
    portfolio_id?: string;
    ministry?: { name: string; code: string };
    portfolio?: { name: string };
  };
}

export async function getAllActions(): Promise<ActionWithRelations[]> {
  const { data, error } = await supabase
    .from('actions')
    .select(`
      *,
      program:program_id (
        name, 
        fiscal_year,
        ministry_id,
        portfolio_id,
        ministry:ministry_id (name, code),
        portfolio:portfolio_id (name)
      )
    `)
    .order('name');
  
  if (error) {
    console.error("Error fetching actions:", error);
    throw error;
  }
  
  return data || [];
}

export async function getActionsByProgramId(programId: string): Promise<ActionWithRelations[]> {
  const { data, error } = await supabase
    .from('actions')
    .select(`
      *,
      program:program_id (
        name, 
        fiscal_year,
        ministry_id,
        portfolio_id,
        ministry:ministry_id (name, code),
        portfolio:portfolio_id (name)
      )
    `)
    .eq('program_id', programId)
    .order('name');
  
  if (error) {
    console.error(`Error fetching actions for program ${programId}:`, error);
    throw error;
  }
  
  return data || [];
}

export async function getActionById(id: string): Promise<ActionWithRelations | null> {
  const { data, error } = await supabase
    .from('actions')
    .select(`
      *,
      program:program_id (
        name, 
        fiscal_year,
        ministry_id,
        portfolio_id,
        ministry:ministry_id (name, code),
        portfolio:portfolio_id (name)
      )
    `)
    .eq('id', id)
    .single();
  
  if (error) {
    console.error(`Error fetching action with id ${id}:`, error);
    throw error;
  }
  
  return data;
}
