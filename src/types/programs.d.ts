import { ActionWithRelations } from "./database.types";

export type Program = {
  id: string;
  portfolio_id: string;
  code: string;
  name: string;
  type: "program" | "subprogram" | "dotation";
  parent_id: string;
  allocated_ae: number;
  allocated_cp: number;
  status: "draft" | "active" | "archived";
  description: string;
  fiscalYears?: Array<{
    id: string;
    year: number;
    allocatedAE: number;
    allocatedCP: number;
    consumedAE: number;
    consumedCP: number;
    progress: number;
  }>;
  actions?: Array<{
    id: string;
    code: string;
    name: string;
    fiscalYears?: Array<{
      id: string;
      allocatedAE: number;
      consumedAE: number;
      progress: number;
    }>;
  }>;
};

// UI Display type to track computed values for fiscal year data
export type FiscalYearData = {
  id: string;
  year: number;
  allocatedAE: number;
  allocatedCP: number;
  consumedAE: number;
  consumedCP: number;
  progress: number;
  actions?: ActionWithRelations[];
};

// Form data type for program forms
export type ProgramFormData = {
  code: string;
  name: string;
  description: string;
  portfolio_id: string;
  parent_id: string | null;
  type: Program["type"] | undefined;
  status: Program["status"] | undefined;
  allocated_ae: number | undefined;
  allocated_cp: number | undefined;
  fiscalYear: string;
};
