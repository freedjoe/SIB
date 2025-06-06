import { Database } from "./supabase";
import type {
  Enterprise,
  CPForecast,
  FiscalYear,
  Ministry,
  BudgetTitle,
  Portfolio,
  Program,
  Action,
  Wilaya,
  Operation,
  Engagement,
  Revaluation,
  CreditPayment,
  CPMobilisation,
  CPConsumption,
  Payment,
  PaymentRequest,
  CPAlert,
  ExtraEngagement,
  TaxRevenue,
  SpecialFund,
  Role,
  User,
  UserProfile,
  ReportType,
  Status,
  Request,
  Deal,
  StatusOptions,
  OperationWithRelations,
  ActionWithRelations,
  ProgramWithRelations,
  PortfolioWithRelations,
  EngagementWithRelations,
  CPForecastWithRelations,
  RequestWithRelations,
  UserWithRelations,
  UserProfileWithRelations,
  // New table types from SQL schema
  Subprogram,
  OperationCP,
  Allocation,
  BudgetModification,
  Disbursement,
  PerformanceIndicator,
  ExternalFunding,
  ActivityLog,
  Notification,
  Comment,
  Document,
  Setting,
  Permission,
  Tag,
  TagAssociation,
  Milestone,
  Attachment,
  Audit,
  // New relation types
  SubprogramWithRelations,
  DisbursementWithRelations,
  PerformanceIndicatorWithRelations,
  MilestoneWithRelations,
  CommentWithRelations,
  DocumentWithRelations,
} from "./supabase";

// Extract all row types from the Database type
export type Tables<T extends keyof Database["public"]["Tables"]> = Database["public"]["Tables"][T]["Row"];
export type InsertTables<T extends keyof Database["public"]["Tables"]> = Database["public"]["Tables"][T]["Insert"];
export type UpdateTables<T extends keyof Database["public"]["Tables"]> = Database["public"]["Tables"][T]["Update"];

// Re-export all types from supabase.ts
export type {
  FiscalYear,
  Ministry,
  BudgetTitle,
  Portfolio,
  Program,
  Action,
  Wilaya,
  Operation,
  Engagement,
  Revaluation,
  CreditPayment,
  CPForecast,
  CPMobilisation,
  CPConsumption,
  Payment,
  PaymentRequest,
  CPAlert,
  ExtraEngagement,
  TaxRevenue,
  SpecialFund,
  Role,
  User,
  UserProfile,
  Enterprise,
  ReportType,
  Status,
  Request,
  Deal,
  // New table types from SQL schema
  Subprogram,
  OperationCP,
  Allocation,
  BudgetModification,
  Disbursement,
  PerformanceIndicator,
  ExternalFunding,
  ActivityLog,
  Notification,
  Comment,
  Document,
  Setting,
  Permission,
  Tag,
  TagAssociation,
  Milestone,
  Attachment,
  Audit,
  // Common types and relations
  StatusOptions,
  OperationWithRelations,
  ActionWithRelations,
  ProgramWithRelations,
  PortfolioWithRelations,
  EngagementWithRelations,
  CPForecastWithRelations,
  RequestWithRelations,
  UserWithRelations,
  UserProfileWithRelations,
  SubprogramWithRelations,
  DisbursementWithRelations,
  PerformanceIndicatorWithRelations,
  MilestoneWithRelations,
  CommentWithRelations,
  DocumentWithRelations,
};

// Define more specific union types for various status and type values
export type RecordStatus = "draft" | "submitted" | "reviewed" | "approved" | "rejected";
export type ArchiveStatus = "draft" | "active" | "archived";
export type FiscalYearStatus = "planning" | "active" | "closed" | "draft";
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
export type PriorityLevel = "low" | "medium" | "high";
export type ActionType = "Centralized" | "Decentralized" | "Unique" | "Programmed" | "Complementary";
export type ProgramType = "program" | "subprogram" | "dotation";

// Maintain backward compatibility aliases
export type Entreprise = Enterprise;
export type PrevisionCP = CPForecast;

// Type to map table names to their row types
export type TableTypes = {
  fiscal_years: Tables<"fiscal_years">;
  ministries: Tables<"ministries">;
  budget_titles: Tables<"budget_titles">;
  portfolios: Tables<"portfolios">;
  programs: Tables<"programs">;
  actions: Tables<"actions">;
  wilayas: Tables<"wilayas">;
  operations: Tables<"operations">;
  engagements: Tables<"engagements">;
  revaluations: Tables<"revaluations">;
  credit_payments: Tables<"credit_payments">;
  cp_forecasts: Tables<"cp_forecasts">;
  cp_mobilisations: Tables<"cp_mobilisations">;
  cp_consumptions: Tables<"cp_consumptions">;
  payments: Tables<"payments">;
  payment_requests: Tables<"payment_requests">;
  cp_alerts: Tables<"cp_alerts">;
  extra_engagements: Tables<"extra_engagements">;
  tax_revenues: Tables<"tax_revenues">;
  special_funds: Tables<"special_funds">;
  roles: Tables<"roles">;
  users: Tables<"users">;
  user_profiles: Tables<"user_profiles">;
  enterprises: Tables<"enterprises">;
  report_types: Tables<"report_types">;
  statuses: Tables<"statuses">;
  requests: Tables<"requests">;
  deals: Tables<"deals">;
  subprograms: Tables<"subprograms">;
  operation_cps: Tables<"operation_cps">;
  allocations: Tables<"allocations">;
  budget_modifications: Tables<"budget_modifications">;
  disbursements: Tables<"disbursements">;
  performance_indicators: Tables<"performance_indicators">;
  external_fundings: Tables<"external_fundings">;
  activity_logs: Tables<"activity_logs">;
  notifications: Tables<"notifications">;
  comments: Tables<"comments">;
  documents: Tables<"documents">;
  settings: Tables<"settings">;
  permissions: Tables<"permissions">;
  tags: Tables<"tags">;
  tag_associations: Tables<"tag_associations">;
  milestones: Tables<"milestones">;
  attachments: Tables<"attachments">;
  audits: Tables<"audits">;
};

// Type to get row type for a specific table
export type TableRow<T extends keyof TableTypes> = TableTypes[T];
