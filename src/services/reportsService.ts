
import { supabase } from "@/integrations/supabase/client";
import { Tables } from "@/integrations/supabase/types";

export type Report = Tables<"reports">;

export async function getAllReports(): Promise<Report[]> {
  const { data, error } = await supabase
    .from('reports')
    .select('*')
    .order('generated_date', { ascending: false });
  
  if (error) {
    console.error("Error fetching reports:", error);
    throw error;
  }
  
  return data || [];
}

export async function getReportsByType(reportType: string): Promise<Report[]> {
  const { data, error } = await supabase
    .from('reports')
    .select('*')
    .eq('report_type', reportType)
    .order('generated_date', { ascending: false });
  
  if (error) {
    console.error(`Error fetching reports of type ${reportType}:`, error);
    throw error;
  }
  
  return data || [];
}

export async function getReportById(id: string): Promise<Report | null> {
  const { data, error } = await supabase
    .from('reports')
    .select('*')
    .eq('id', id)
    .single();
  
  if (error) {
    console.error(`Error fetching report with id ${id}:`, error);
    throw error;
  }
  
  return data;
}
