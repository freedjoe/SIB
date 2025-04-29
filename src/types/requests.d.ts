import { Ministry } from "./ministries";
import { FiscalYear } from "./fiscal_years";

export type RequestType =
  | "New registration"
  | "Revaluation"
  | "Payment credit"
  | "Allocation"
  | "Reallocation"
  | "Transfer"
  | "Additional request"
  | "Previous commitments"
  | "Balance to regularize"
  | "Other";

export type RequestPriority = "low" | "medium" | "high";

export interface Request {
  id: string;
  ministry_id: string;
  fiscal_year_id: string;
  title: string | null;
  ref: string | null;
  date_submitted: string;
  cp_amount: number;
  ae_amount: number;
  type: RequestType;
  priority: RequestPriority;
  status: "draft" | "submitted" | "reviewed" | "approved" | "rejected";
  comments: string | null;
  description: string | null;
  created_at: string;
}

export interface RequestWithRelations extends Request {
  ministry?: Ministry;
  fiscal_year?: FiscalYear;
}

export type NewRequest = Omit<Request, "id" | "created_at" | "date_submitted">;
export type UpdateRequest = Partial<NewRequest>;
