export interface OperationDocument {
  id: string;
  type: "document" | "photo";
  title: string;
  description?: string;
  fileUrl: string;
  fileName: string;
  createdAt: string;
  updatedAt: string;
}

export interface Operation {
  id: string;
  action_id: string;
  program_id: string;
  wilaya_id: string;
  budget_title_id: string;
  portfolio_program: string;
  program_type: string;
  code: string;
  name: string;
  description: string;
  documents: OperationDocument[];
  observations: string;
  status: "draft" | "pending" | "approved" | "rejected";
}
