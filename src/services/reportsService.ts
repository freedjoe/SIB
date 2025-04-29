import { supabase } from "@/lib/supabase";
import { Tables } from "@/integrations/supabase/types";

export type Report = Tables<"reports">;

export interface ReportWithRelations extends Report {
  description: string;
  frequency: string;
  file_path: string;
  report_type: string;
}

export async function getAllReports(): Promise<ReportWithRelations[]> {
  const { data, error } = await supabase.from("reports").select("*").order("generated_date", { ascending: false });

  if (error) {
    console.error("Error fetching reports:", error);
    throw error;
  }

  return (data || []).map((report) => ({
    ...report,
    description: report.content?.substring(0, 100) || "",
    frequency: "monthly",
    file_path: "",
    report_type: report.type || "",
    type: report.type || "",
  }));
}

export async function getReportsByType(reportType: string): Promise<ReportWithRelations[]> {
  const { data, error } = await supabase.from("reports").select("*").eq("type", reportType).order("generated_date", { ascending: false });

  if (error) {
    console.error(`Error fetching reports of type ${reportType}:`, error);
    throw error;
  }

  return (data || []).map((report) => ({
    ...report,
    description: report.content?.substring(0, 100) || "",
    frequency: "monthly",
    file_path: "",
    report_type: report.type || "",
    type: report.type || "",
  }));
}

export async function getReportById(id: string): Promise<ReportWithRelations | null> {
  const { data, error } = await supabase.from("reports").select("*").eq("id", id).single();

  if (error) {
    console.error(`Error fetching report with id ${id}:`, error);
    throw error;
  }

  if (!data) return null;

  return {
    ...data,
    description: data.content?.substring(0, 100) || "",
    frequency: "monthly",
    file_path: "",
    report_type: data.type || "",
    type: data.type || "",
  };
}
