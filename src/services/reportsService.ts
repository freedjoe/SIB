
import { supabase } from "@/integrations/supabase/client";
import { Tables } from "@/integrations/supabase/types";

export type Report = Tables<"reports">;

export interface ReportWithRelations extends Report {
  description?: string;
  frequency?: string;
  file_path?: string;
  report_type?: string;
}

export async function getAllReports(): Promise<ReportWithRelations[]> {
  const { data, error } = await supabase
    .from('reports')
    .select('*')
    .order('generated_date', { ascending: false });
  
  if (error) {
    console.error("Error fetching reports:", error);
    throw error;
  }

  // Add missing properties with default values for UI compatibility
  return (data || []).map(report => ({
    ...report,
    description: report.content?.substring(0, 100) || '',
    frequency: 'monthly', // Default value
    file_path: '', // Default value
    report_type: report.type || '',
    type: report.type || '' // Ensure original field is preserved
  }));
}

export async function getReportsByType(reportType: string): Promise<ReportWithRelations[]> {
  const { data, error } = await supabase
    .from('reports')
    .select('*')
    .eq('type', reportType)
    .order('generated_date', { ascending: false });
  
  if (error) {
    console.error(`Error fetching reports of type ${reportType}:`, error);
    throw error;
  }
  
  // Add missing properties with default values for UI compatibility
  return (data || []).map(report => ({
    ...report,
    description: report.content?.substring(0, 100) || '',
    frequency: 'monthly', // Default value
    file_path: '', // Default value
    report_type: report.type || '',
    type: report.type || '' // Ensure original field is preserved
  }));
}

export async function getReportById(id: string): Promise<ReportWithRelations | null> {
  const { data, error } = await supabase
    .from('reports')
    .select('*')
    .eq('id', id)
    .single();
  
  if (error) {
    console.error(`Error fetching report with id ${id}:`, error);
    throw error;
  }
  
  if (!data) return null;

  // Add missing properties with default values for UI compatibility
  return {
    ...data,
    description: data.content?.substring(0, 100) || '',
    frequency: 'monthly', // Default value
    file_path: '', // Default value
    report_type: data.type || '',
    type: data.type || '' // Ensure original field is preserved
  };
}
