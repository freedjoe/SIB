
import { supabase } from "@/integrations/supabase/client";
import { Tables } from "@/integrations/supabase/types";

export type Ministry = Tables<"ministries">;

export async function getAllMinistries(): Promise<Ministry[]> {
  const { data, error } = await supabase
    .from('ministries')
    .select('*')
    .order('name');
  
  if (error) {
    console.error("Error fetching ministries:", error);
    throw error;
  }
  
  return data || [];
}

export async function getMinistryById(id: string): Promise<Ministry | null> {
  const { data, error } = await supabase
    .from('ministries')
    .select('*')
    .eq('id', id)
    .single();
  
  if (error) {
    console.error(`Error fetching ministry with id ${id}:`, error);
    throw error;
  }
  
  return data;
}
