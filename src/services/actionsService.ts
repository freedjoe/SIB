
import { supabase } from "@/integrations/supabase/client";
import { Tables } from "@/integrations/supabase/types";
import { Program } from "@/types/programs";

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
  operation?: { name: string };
}

export async function getAllActions(): Promise<ActionWithRelations[]> {
  const { data, error } = await supabase
    .from('actions')
    .select(`
      *,
      program:program_id (
        name, 
        fiscal_year, 
        ministry:ministry_id (name, code), 
        portfolio:portfolio_id (name)
      ),
      operation:operation_id (name)
    `)
    .order('name');
  
  if (error) {
    console.error("Error fetching actions:", error);
    throw error;
  }
  
  return data.map(action => ({
    ...action,
    code_action: action.code_action || '',
    program: action.program ? {
      ...action.program,
      fiscal_year: action.program.fiscal_year || 2024
    } : undefined
  })) || [];
}

export async function getActionsByProgram(programId: string): Promise<ActionWithRelations[]> {
  const { data, error } = await supabase
    .from('actions')
    .select(`
      *,
      program:program_id (
        name, 
        fiscal_year, 
        ministry:ministry_id (name, code), 
        portfolio:portfolio_id (name)
      ),
      operation:operation_id (name)
    `)
    .eq('program_id', programId)
    .order('name');
  
  if (error) {
    console.error(`Error fetching actions for program ${programId}:`, error);
    throw error;
  }
  
  return data.map(action => ({
    ...action,
    code_action: action.code_action || '',
    program: action.program ? {
      ...action.program,
      fiscal_year: action.program.fiscal_year || 2024
    } : undefined
  })) || [];
}

export async function getActionById(id: string): Promise<ActionWithRelations | null> {
  const { data, error } = await supabase
    .from('actions')
    .select(`
      *,
      program:program_id (
        name, 
        fiscal_year, 
        ministry:ministry_id (name, code), 
        portfolio:portfolio_id (name)
      ),
      operation:operation_id (name)
    `)
    .eq('id', id)
    .single();
  
  if (error) {
    console.error(`Error fetching action with id ${id}:`, error);
    throw error;
  }
  
  if (!data) return null;

  return {
    ...data,
    code_action: data.code_action || '',
    program: data.program ? {
      ...data.program,
      fiscal_year: data.program.fiscal_year || 2024
    } : undefined
  };
}
