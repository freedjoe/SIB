export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export interface Database {
  public: {
    Tables: {
      fiscal_years: {
        Row: {
          id: string;
          year: number;
          status: "planning" | "active" | "closed" | "draft";
          description: string | null;
        };
        Insert: {
          id?: string;
          year: number; // UNIQUE NOT NULL
          status?: "planning" | "active" | "closed" | "draft"; // DEFAULT 'draft'
          description?: string | null;
        };
        Update: {
          id?: string;
          year?: number;
          status?: "planning" | "active" | "closed" | "draft";
          description?: string | null;
        };
      };
      ministries: {
        Row: {
          id: string;
          code: string | null; // VARCHAR(10)
          name_ar: string;
          name_en: string | null;
          name_fr: string; // NOT NULL
          address: string | null;
          email: string | null;
          phone: string | null;
          phone2: string | null;
          fax: string | null;
          fax2: string | null;
          is_active: boolean | null;
          parent_id: string | null; // UUID REFERENCES ministries(id)
          description: string | null;
        };
        Insert: {
          id?: string;
          code?: string | null;
          name_ar: string;
          name_en?: string | null;
          name_fr: string; // NOT NULL
          address?: string | null;
          email?: string | null;
          phone?: string | null;
          phone2?: string | null;
          fax?: string | null;
          fax2?: string | null;
          is_active?: boolean | null;
          parent_id?: string | null;
          description?: string | null;
        };
        Update: {
          id?: string;
          code?: string | null;
          name_ar?: string;
          name_en?: string | null;
          name_fr?: string;
          address?: string | null;
          email?: string | null;
          phone?: string | null;
          phone2?: string | null;
          fax?: string | null;
          fax2?: string | null;
          is_active?: boolean | null;
          parent_id?: string | null;
          description?: string | null;
        };
      };
      budget_categories: {
        Row: {
          id: string;
          code: string | null;
          label: string | null;
          description: string | null;
        };
        Insert: {
          id?: string;
          code?: string | null;
          label?: string | null;
          description?: string | null;
        };
        Update: {
          id?: string;
          code?: string | null;
          label?: string | null;
          description?: string | null;
        };
      };
      portfolios: {
        Row: {
          id: string;
          ministry_id: string | null;
          name: string;
          code: string | null;
          allocated_ae: number | null;
          allocated_cp: number | null;
          status: "draft" | "active" | "archived";
          description: string | null;
        };
        Insert: {
          id?: string;
          ministry_id?: string | null;
          name: string;
          code?: string | null;
          allocated_ae?: number | null;
          allocated_cp?: number | null;
          status?: "draft" | "active" | "archived";
          description?: string | null;
        };
        Update: {
          id?: string;
          ministry_id?: string | null;
          name?: string;
          code?: string | null;
          allocated_ae?: number | null;
          allocated_cp?: number | null;
          status?: "draft" | "active" | "archived";
          description?: string | null;
        };
      };
      programs: {
        Row: {
          id: string;
          portfolio_id: string | null;
          code: string | null;
          name: string;
          type: "program" | "subprogram" | "dotation" | null;
          parent_id: string | null;
          allocated_ae: number | null;
          allocated_cp: number | null;
          status: "draft" | "active" | "archived";
          description: string | null;
        };
        Insert: {
          id?: string;
          portfolio_id?: string | null;
          code?: string | null;
          name: string;
          type?: "program" | "subprogram" | "dotation" | null;
          parent_id?: string | null;
          allocated_ae?: number | null;
          allocated_cp?: number | null;
          status?: "draft" | "active" | "archived";
          description?: string | null;
        };
        Update: {
          id?: string;
          portfolio_id?: string | null;
          code?: string | null;
          name?: string;
          type?: "program" | "subprogram" | "dotation" | null;
          parent_id?: string | null;
          allocated_ae?: number | null;
          allocated_cp?: number | null;
          status?: "draft" | "active" | "archived";
          description?: string | null;
        };
      };
      actions: {
        Row: {
          id: string;
          program_id: string | null;
          code: string | null;
          name: string | null;
          type: "Centralized" | "Decentralized" | "Unique" | "Programmed" | "Complementary" | null;
          allocated_ae: number | null;
          allocated_cp: number | null;
          status: "draft" | "active" | "archived";
          description: string | null;
        };
        Insert: {
          id?: string;
          program_id?: string | null;
          code?: string | null;
          name?: string | null;
          type?: "Centralized" | "Decentralized" | "Unique" | "Programmed" | "Complementary" | null;
          allocated_ae?: number | null;
          allocated_cp?: number | null;
          status?: "draft" | "active" | "archived";
          description?: string | null;
        };
        Update: {
          id?: string;
          program_id?: string | null;
          code?: string | null;
          name?: string | null;
          type?: "Centralized" | "Decentralized" | "Unique" | "Programmed" | "Complementary" | null;
          allocated_ae?: number | null;
          allocated_cp?: number | null;
          status?: "draft" | "active" | "archived";
          description?: string | null;
        };
      };
      wilayas: {
        Row: {
          id: string;
          code: string | null;
          name: string | null;
          description: string | null;
        };
        Insert: {
          id?: string;
          code?: string | null;
          name?: string | null;
          description?: string | null;
        };
        Update: {
          id?: string;
          code?: string | null;
          name?: string | null;
          description?: string | null;
        };
      };
      operations: {
        Row: {
          id: string;
          action_id: string | null;
          wilaya_id: string | null;
          code: string | null;
          title: string | null;
          inscription_date: string | null;
          budget_category_id: string | null;
          allocated_ae: number | null;
          allocated_cp: number | null;
          consumed_ae: number | null;
          consumed_cp: number | null;
          physical_rate: number | null;
          financial_rate: number | null;
          delay: number | null;
          status: "draft" | "submitted" | "reviewed" | "approved" | "rejected";
          description: string | null;
        };
        Insert: {
          id?: string;
          action_id?: string | null;
          wilaya_id?: string | null;
          code?: string | null;
          title?: string | null;
          inscription_date?: string | null;
          budget_category_id?: string | null;
          allocated_ae?: number | null;
          allocated_cp?: number | null;
          consumed_ae?: number | null;
          consumed_cp?: number | null;
          physical_rate?: number | null;
          financial_rate?: number | null;
          delay?: number | null;
          status?: "draft" | "submitted" | "reviewed" | "approved" | "rejected";
          description?: string | null;
        };
        Update: {
          id?: string;
          action_id?: string | null;
          wilaya_id?: string | null;
          code?: string | null;
          title?: string | null;
          inscription_date?: string | null;
          budget_category_id?: string | null;
          allocated_ae?: number | null;
          allocated_cp?: number | null;
          consumed_ae?: number | null;
          consumed_cp?: number | null;
          physical_rate?: number | null;
          financial_rate?: number | null;
          delay?: number | null;
          status?: "draft" | "submitted" | "reviewed" | "approved" | "rejected";
          description?: string | null;
        };
      };
      engagements: {
        Row: {
          id: string;
          operation_id: string | null;
          code: string | null;
          inscription_date: string | null;
          amount: number | null;
          year: number | null;
          type: string | null;
          history: string | null;
          status: "draft" | "submitted" | "reviewed" | "approved" | "rejected";
          description: string | null;
        };
        Insert: {
          id?: string;
          operation_id?: string | null;
          code?: string | null;
          inscription_date?: string | null;
          amount?: number | null;
          year?: number | null;
          type?: string | null;
          history?: string | null;
          status?: "draft" | "submitted" | "reviewed" | "approved" | "rejected";
          description?: string | null;
        };
        Update: {
          id?: string;
          operation_id?: string | null;
          code?: string | null;
          inscription_date?: string | null;
          amount?: number | null;
          year?: number | null;
          type?: string | null;
          history?: string | null;
          status?: "draft" | "submitted" | "reviewed" | "approved" | "rejected";
          description?: string | null;
        };
      };
      revaluations: {
        Row: {
          id: string;
          engagement_id: string | null;
          code: string | null;
          revaluation_amount: number | null;
          reason: string | null;
          description: string | null;
          status: "draft" | "submitted" | "reviewed" | "approved" | "rejected";
          revaluation_date: string | null;
        };
        Insert: {
          id?: string;
          engagement_id?: string | null;
          code?: string | null;
          revaluation_amount?: number | null;
          reason?: string | null;
          description?: string | null;
          status?: "draft" | "submitted" | "reviewed" | "approved" | "rejected";
          revaluation_date?: string | null;
        };
        Update: {
          id?: string;
          engagement_id?: string | null;
          code?: string | null;
          revaluation_amount?: number | null;
          reason?: string | null;
          description?: string | null;
          status?: "draft" | "submitted" | "reviewed" | "approved" | "rejected";
          revaluation_date?: string | null;
        };
      };
      credit_payments: {
        Row: {
          id: string;
          code: string | null;
          operation_id: string | null;
          fiscal_year_id: string | null;
          amount: number | null;
          status: "draft" | "submitted" | "reviewed" | "approved" | "rejected";
          description: string | null;
        };
        Insert: {
          id?: string;
          code?: string | null;
          operation_id?: string | null;
          fiscal_year_id?: string | null;
          amount?: number | null;
          status?: "draft" | "submitted" | "reviewed" | "approved" | "rejected";
          description?: string | null;
        };
        Update: {
          id?: string;
          code?: string | null;
          operation_id?: string | null;
          fiscal_year_id?: string | null;
          amount?: number | null;
          status?: "draft" | "submitted" | "reviewed" | "approved" | "rejected";
          description?: string | null;
        };
      };
      cp_forecasts: {
        Row: {
          id: string;
          operation_id: string | null;
          fiscal_year_id: string | null;
          forecast_cp: number | null;
          status: "draft" | "submitted" | "reviewed" | "approved" | "rejected";
          description: string | null;
        };
        Insert: {
          id?: string;
          operation_id?: string | null;
          fiscal_year_id?: string | null;
          forecast_cp?: number | null;
          status?: "draft" | "submitted" | "reviewed" | "approved" | "rejected";
          description?: string | null;
        };
        Update: {
          id?: string;
          operation_id?: string | null;
          fiscal_year_id?: string | null;
          forecast_cp?: number | null;
          status?: "draft" | "submitted" | "reviewed" | "approved" | "rejected";
          description?: string | null;
        };
      };
      cp_mobilisations: {
        Row: {
          id: string;
          operation_id: string | null;
          mobilised_cp: number | null;
          mobilisation_date: string | null;
          status: "draft" | "submitted" | "reviewed" | "approved" | "rejected";
          description: string | null;
        };
        Insert: {
          id?: string;
          operation_id?: string | null;
          mobilised_cp?: number | null;
          mobilisation_date?: string | null;
          status?: "draft" | "submitted" | "reviewed" | "approved" | "rejected";
          description?: string | null;
        };
        Update: {
          id?: string;
          operation_id?: string | null;
          mobilised_cp?: number | null;
          mobilisation_date?: string | null;
          status?: "draft" | "submitted" | "reviewed" | "approved" | "rejected";
          description?: string | null;
        };
      };
      cp_consumptions: {
        Row: {
          id: string;
          mobilisation_id: string | null;
          consumed_cp: number | null;
          consumption_date: string | null;
          status: "draft" | "submitted" | "reviewed" | "approved" | "rejected";
          description: string | null;
        };
        Insert: {
          id?: string;
          mobilisation_id?: string | null;
          consumed_cp?: number | null;
          consumption_date?: string | null;
          status?: "draft" | "submitted" | "reviewed" | "approved" | "rejected";
          description?: string | null;
        };
        Update: {
          id?: string;
          mobilisation_id?: string | null;
          consumed_cp?: number | null;
          consumption_date?: string | null;
          status?: "draft" | "submitted" | "reviewed" | "approved" | "rejected";
          description?: string | null;
        };
      };
      payments: {
        Row: {
          id: string;
          operation_id: string | null;
          amount: number | null;
          payment_date: string | null;
          status: "draft" | "submitted" | "reviewed" | "approved" | "rejected";
          description: string | null;
        };
        Insert: {
          id?: string;
          operation_id?: string | null;
          amount?: number | null;
          payment_date?: string | null;
          status?: "draft" | "submitted" | "reviewed" | "approved" | "rejected";
          description?: string | null;
        };
        Update: {
          id?: string;
          operation_id?: string | null;
          amount?: number | null;
          payment_date?: string | null;
          status?: "draft" | "submitted" | "reviewed" | "approved" | "rejected";
          description?: string | null;
        };
      };
      payment_requests: {
        Row: {
          id: string;
          operation_id: string | null;
          requested_amount: number | null;
          period: string | null;
          status: "draft" | "submitted" | "reviewed" | "approved" | "rejected";
          justification: string | null;
          document: string | null;
        };
        Insert: {
          id?: string;
          operation_id?: string | null;
          requested_amount?: number | null;
          period?: string | null;
          status?: "draft" | "submitted" | "reviewed" | "approved" | "rejected";
          justification?: string | null;
          document?: string | null;
        };
        Update: {
          id?: string;
          operation_id?: string | null;
          requested_amount?: number | null;
          period?: string | null;
          status?: "draft" | "submitted" | "reviewed" | "approved" | "rejected";
          justification?: string | null;
          document?: string | null;
        };
      };
      cp_alerts: {
        Row: {
          id: string;
          operation_id: string | null;
          threshold_exceeded: boolean | null;
          alert_level: string | null;
          message: string | null;
          status: "draft" | "submitted" | "reviewed" | "approved" | "rejected";
          alert_date: string | null;
        };
        Insert: {
          id?: string;
          operation_id?: string | null;
          threshold_exceeded?: boolean | null;
          alert_level?: string | null;
          message?: string | null;
          status?: "draft" | "submitted" | "reviewed" | "approved" | "rejected";
          alert_date?: string | null;
        };
        Update: {
          id?: string;
          operation_id?: string | null;
          threshold_exceeded?: boolean | null;
          alert_level?: string | null;
          message?: string | null;
          status?: "draft" | "submitted" | "reviewed" | "approved" | "rejected";
          alert_date?: string | null;
        };
      };
      extra_engagements: {
        Row: {
          id: string;
          operation_id: string | null;
          requested_amount: number | null;
          justification: string | null;
          status: "draft" | "submitted" | "reviewed" | "approved" | "rejected";
          engagement_date: string | null;
        };
        Insert: {
          id?: string;
          operation_id?: string | null;
          requested_amount?: number | null;
          justification?: string | null;
          status?: "draft" | "submitted" | "reviewed" | "approved" | "rejected";
          engagement_date?: string | null;
        };
        Update: {
          id?: string;
          operation_id?: string | null;
          requested_amount?: number | null;
          justification?: string | null;
          status?: "draft" | "submitted" | "reviewed" | "approved" | "rejected";
          engagement_date?: string | null;
        };
      };
      tax_revenues: {
        Row: {
          id: string;
          tax_name: string | null;
          beneficiary: string | null;
          allocation_percent: number | null;
          amount: number | null;
          fiscal_year_id: string | null;
        };
        Insert: {
          id?: string;
          tax_name?: string | null;
          beneficiary?: string | null;
          allocation_percent?: number | null;
          amount?: number | null;
          fiscal_year_id?: string | null;
        };
        Update: {
          id?: string;
          tax_name?: string | null;
          beneficiary?: string | null;
          allocation_percent?: number | null;
          amount?: number | null;
          fiscal_year_id?: string | null;
        };
      };
      special_funds: {
        Row: {
          id: string;
          account_number: string | null;
          name: string | null;
          description: string | null;
          category: string | null;
          balance_2023: number | null;
        };
        Insert: {
          id?: string;
          account_number?: string | null;
          name?: string | null;
          description?: string | null;
          category?: string | null;
          balance_2023?: number | null;
        };
        Update: {
          id?: string;
          account_number?: string | null;
          name?: string | null;
          description?: string | null;
          category?: string | null;
          balance_2023?: number | null;
        };
      };
      roles: {
        Row: {
          id: string;
          name: string;
          description: string | null;
        };
        Insert: {
          id?: string;
          name: string;
          description?: string | null;
        };
        Update: {
          id?: string;
          name?: string;
          description?: string | null;
        };
      };
      users: {
        Row: {
          id: string;
          email: string;
          password: string;
          full_name: string | null;
          role_id: string | null;
          organization: string | null;
          phone: string | null;
          created_at: string | null;
        };
        Insert: {
          id?: string;
          email: string;
          password: string;
          full_name?: string | null;
          role_id?: string | null;
          organization?: string | null;
          phone?: string | null;
          created_at?: string | null;
        };
        Update: {
          id?: string;
          email?: string;
          password?: string;
          full_name?: string | null;
          role_id?: string | null;
          organization?: string | null;
          phone?: string | null;
          created_at?: string | null;
        };
      };
      user_profiles: {
        Row: {
          id: string;
          user_id: string | null;
          position: string | null;
          structure: string | null;
          wilaya_id: string | null;
          created_at: string | null;
        };
        Insert: {
          id?: string;
          user_id?: string | null;
          position?: string | null;
          structure?: string | null;
          wilaya_id?: string | null;
          created_at?: string | null;
        };
        Update: {
          id?: string;
          user_id?: string | null;
          position?: string | null;
          structure?: string | null;
          wilaya_id?: string | null;
          created_at?: string | null;
        };
      };
      enterprises: {
        Row: {
          id: string;
          name: string;
          nif: string | null;
          rc: string | null;
          address: string | null;
          phone: string | null;
          email: string | null;
        };
        Insert: {
          id?: string;
          name: string;
          nif?: string | null;
          rc?: string | null;
          address?: string | null;
          phone?: string | null;
          email?: string | null;
        };
        Update: {
          id?: string;
          name?: string;
          nif?: string | null;
          rc?: string | null;
          address?: string | null;
          phone?: string | null;
          email?: string | null;
        };
      };
      report_types: {
        Row: {
          id: string;
          name: string;
          description: string | null;
        };
        Insert: {
          id?: string;
          name: string;
          description?: string | null;
        };
        Update: {
          id?: string;
          name?: string;
          description?: string | null;
        };
      };
      statuses: {
        Row: {
          id: string;
          name: string;
          description: string | null;
        };
        Insert: {
          id?: string;
          name: string;
          description?: string | null;
        };
        Update: {
          id?: string;
          name?: string;
          description?: string | null;
        };
      };
      requests: {
        Row: {
          id: string;
          ministry_id: string | null; // UUID REFERENCES ministries(id) ON DELETE CASCADE
          fiscal_year_id: string | null; // UUID REFERENCES fiscal_years(id)
          title: string | null;
          ref: string | null;
          date_submitted: string | null; // DATE DEFAULT CURRENT_DATE
          cp_amount: number; // DECIMAL(18,2) NOT NULL
          ae_amount: number; // DECIMAL(18,2) NOT NULL
          type:
            | "New registration"
            | "Revaluation"
            | "Payment credit"
            | "Allocation"
            | "Reallocation"
            | "Transfer"
            | "Additional request"
            | "Previous commitments"
            | "Balance to regularize"
            | "Other"
            | null;
          priority: "low" | "medium" | "high"; // DEFAULT 'medium'
          status: "draft" | "submitted" | "reviewed" | "approved" | "rejected"; // DEFAULT 'draft'
          comments: string | null;
          description: string | null;
        };
        Insert: {
          id?: string;
          ministry_id?: string | null;
          fiscal_year_id?: string | null;
          title?: string | null;
          ref?: string | null;
          date_submitted?: string | null;
          cp_amount: number; // NOT NULL
          ae_amount: number; // NOT NULL
          type?:
            | "New registration"
            | "Revaluation"
            | "Payment credit"
            | "Allocation"
            | "Reallocation"
            | "Transfer"
            | "Additional request"
            | "Previous commitments"
            | "Balance to regularize"
            | "Other"
            | null;
          priority?: "low" | "medium" | "high";
          status?: "draft" | "submitted" | "reviewed" | "approved" | "rejected";
          comments?: string | null;
          description?: string | null;
        };
        Update: {
          id?: string;
          ministry_id?: string | null;
          fiscal_year_id?: string | null;
          title?: string | null;
          ref?: string | null;
          date_submitted?: string | null;
          cp_amount?: number;
          ae_amount?: number;
          type?:
            | "New registration"
            | "Revaluation"
            | "Payment credit"
            | "Allocation"
            | "Reallocation"
            | "Transfer"
            | "Additional request"
            | "Previous commitments"
            | "Balance to regularize"
            | "Other"
            | null;
          priority?: "low" | "medium" | "high";
          status?: "draft" | "submitted" | "reviewed" | "approved" | "rejected";
          comments?: string | null;
          description?: string | null;
        };
      };
      deals: {
        Row: {
          id: string;
          operation_id: string | null;
          entreprise_name: string;
          amount: number | null;
          date_signed: string | null;
          physical_rate: number | null;
          financial_rate: number | null;
          delay: number | null;
          description: string | null;
        };
        Insert: {
          id?: string;
          operation_id?: string | null;
          entreprise_name: string;
          amount?: number | null;
          date_signed?: string | null;
          physical_rate?: number | null;
          financial_rate?: number | null;
          delay?: number | null;
          description?: string | null;
        };
        Update: {
          id?: string;
          operation_id?: string | null;
          entreprise_name?: string;
          amount?: number | null;
          date_signed?: string | null;
          physical_rate?: number | null;
          financial_rate?: number | null;
          delay?: number | null;
          description?: string | null;
        };
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
  };
}

// Create more specific types for use in components
export type FiscalYear = Database["public"]["Tables"]["fiscal_years"]["Row"];
export type Ministry = Database["public"]["Tables"]["ministries"]["Row"];
export type BudgetCategory = Database["public"]["Tables"]["budget_categories"]["Row"];
export type Portfolio = Database["public"]["Tables"]["portfolios"]["Row"];
export type Program = Database["public"]["Tables"]["programs"]["Row"];
export type Action = Database["public"]["Tables"]["actions"]["Row"];
export type Wilaya = Database["public"]["Tables"]["wilayas"]["Row"];
export type Operation = Database["public"]["Tables"]["operations"]["Row"];
export type Engagement = Database["public"]["Tables"]["engagements"]["Row"];
export type Revaluation = Database["public"]["Tables"]["revaluations"]["Row"];
export type CreditPayment = Database["public"]["Tables"]["credit_payments"]["Row"];
export type CPForecast = Database["public"]["Tables"]["cp_forecasts"]["Row"];
export type CPMobilisation = Database["public"]["Tables"]["cp_mobilisations"]["Row"];
export type CPConsumption = Database["public"]["Tables"]["cp_consumptions"]["Row"];
export type Payment = Database["public"]["Tables"]["payments"]["Row"];
export type PaymentRequest = Database["public"]["Tables"]["payment_requests"]["Row"];
export type CPAlert = Database["public"]["Tables"]["cp_alerts"]["Row"];
export type ExtraEngagement = Database["public"]["Tables"]["extra_engagements"]["Row"];
export type TaxRevenue = Database["public"]["Tables"]["tax_revenues"]["Row"];
export type SpecialFund = Database["public"]["Tables"]["special_funds"]["Row"];
export type Role = Database["public"]["Tables"]["roles"]["Row"];
export type User = Database["public"]["Tables"]["users"]["Row"];
export type UserProfile = Database["public"]["Tables"]["user_profiles"]["Row"];
export type Enterprise = Database["public"]["Tables"]["enterprises"]["Row"];
export type ReportType = Database["public"]["Tables"]["report_types"]["Row"];
export type Status = Database["public"]["Tables"]["statuses"]["Row"];
export type Request = Database["public"]["Tables"]["requests"]["Row"];
export type Deal = Database["public"]["Tables"]["deals"]["Row"];

// Alias for backward compatibility
export type Entreprise = Enterprise;
export type PrevisionCP = CPForecast;

// Common types
export type StatusOptions = "draft" | "submitted" | "reviewed" | "approved" | "rejected";

// Define join types with related tables for common queries
export interface OperationWithRelations extends Operation {
  action?: Action;
  wilaya?: Wilaya;
  budget_category?: BudgetCategory;
}

export interface ActionWithRelations extends Action {
  program?: Program;
}

export interface ProgramWithRelations extends Program {
  portfolio?: Portfolio;
}

export interface PortfolioWithRelations extends Portfolio {
  ministry?: Ministry;
}

export interface EngagementWithRelations extends Engagement {
  operation?: OperationWithRelations;
}

export interface CPForecastWithRelations extends CPForecast {
  operation?: OperationWithRelations;
  fiscal_year?: FiscalYear;
}

export interface RequestWithRelations extends Request {
  ministry?: Ministry;
  fiscal_year?: FiscalYear;
}

export interface UserWithRelations extends User {
  role?: Role;
  profile?: UserProfile;
}

export interface UserProfileWithRelations extends UserProfile {
  user?: User;
  wilaya?: Wilaya;
}
