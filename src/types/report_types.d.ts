export interface ReportType {
  id: string;
  name: string;
  description: string | null;
  created_at: string;
}

export type NewReportType = Omit<ReportType, "id" | "created_at">;
export type UpdateReportType = Partial<NewReportType>;
