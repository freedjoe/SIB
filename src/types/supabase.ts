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
          year: number;
          status?: "planning" | "active" | "closed" | "draft";
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
          code: string | null;
          name_ar: string;
          name_en: string | null;
          name_fr: string;
          address: string | null;
          email: string | null;
          phone: string | null;
          phone2: string | null;
          fax: string | null;
          fax2: string | null;
          is_active: boolean | null;
          parent_id: string | null;
          description: string | null;
        };
        Insert: {
          id?: string;
          code?: string | null;
          name_ar: string;
          name_en?: string | null;
          name_fr: string;
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
      budget_titles: {
        Row: {
          id: string;
          code: string;
          name: string;
          description: string | null;
        };
        Insert: {
          id?: string;
          code: string;
          name: string;
          description?: string | null;
        };
        Update: {
          id?: string;
          code?: string;
          name?: string;
          description?: string | null;
        };
      };
      portfolios: {
        Row: {
          id: string;
          ministry_id: string | null;
          name: string;
          managing_entity: string | null;
          responsible_person: string | null;
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
          managing_entity?: string | null;
          responsible_person?: string | null;
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
          managing_entity?: string | null;
          responsible_person?: string | null;
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
          portfolio_id: string;
          name: string;
          description: string | null;
          objectives: string[] | null;
          expected_results: string[] | null;
          performance_indicators: Json | null;
          code: string | null;
          type: "program" | "subprogram" | "dotation" | null;
          parent_id: string | null;
          allocated_ae: number | null;
          allocated_cp: number | null;
          status: "draft" | "active" | "archived";
        };
        Insert: {
          id?: string;
          portfolio_id: string;
          name: string;
          description?: string | null;
          objectives?: string[] | null;
          expected_results?: string[] | null;
          performance_indicators?: Json | null;
          code?: string | null;
          type?: "program" | "subprogram" | "dotation" | null;
          parent_id?: string | null;
          allocated_ae?: number | null;
          allocated_cp?: number | null;
          status?: "draft" | "active" | "archived";
        };
        Update: {
          id?: string;
          portfolio_id?: string;
          name?: string;
          description?: string | null;
          objectives?: string[] | null;
          expected_results?: string[] | null;
          performance_indicators?: Json | null;
          code?: string | null;
          type?: "program" | "subprogram" | "dotation" | null;
          parent_id?: string | null;
          allocated_ae?: number | null;
          allocated_cp?: number | null;
          status?: "draft" | "active" | "archived";
        };
      };
      subprograms: {
        Row: {
          id: string;
          program_id: string;
          name: string;
          purpose: string | null;
        };
        Insert: {
          id?: string;
          program_id: string;
          name: string;
          purpose?: string | null;
        };
        Update: {
          id?: string;
          program_id?: string;
          name?: string;
          purpose?: string | null;
        };
      };
      actions: {
        Row: {
          id: string;
          program_id: string | null;
          subprogram_id: string | null;
          responsible_id: string | null;
          name: string;
          code: string;
          description: string | null;
          type: "Centralized" | "Decentralized" | "Unique" | "Programmed" | "Complementary" | null;
          objectives: string[] | null;
          indicators: Json | null;
          start_date: string | null;
          end_date: string | null;
          montant_ae_total: number | null;
          montant_cp_total: number | null;
          status: "proposed" | "validated" | "draft" | "active" | "archived";
          commentaires: string | null;
          nb_operations: number | null;
          taux_execution_cp: number | null;
          taux_execution_physique: number | null;
          allocated_ae: number | null;
          allocated_cp: number | null;
        };
        Insert: {
          id?: string;
          program_id?: string | null;
          subprogram_id?: string | null;
          responsible_id?: string | null;
          name: string;
          code: string;
          description?: string | null;
          type?: "Centralized" | "Decentralized" | "Unique" | "Programmed" | "Complementary" | null;
          objectives?: string[] | null;
          indicators?: Json | null;
          start_date?: string | null;
          end_date?: string | null;
          montant_ae_total?: number | null;
          montant_cp_total?: number | null;
          status?: "proposed" | "validated" | "draft" | "active" | "archived";
          commentaires?: string | null;
          nb_operations?: number | null;
          taux_execution_cp?: number | null;
          taux_execution_physique?: number | null;
          allocated_ae?: number | null;
          allocated_cp?: number | null;
        };
        Update: {
          id?: string;
          program_id?: string | null;
          subprogram_id?: string | null;
          responsible_id?: string | null;
          name?: string;
          code?: string;
          description?: string | null;
          type?: "Centralized" | "Decentralized" | "Unique" | "Programmed" | "Complementary" | null;
          objectives?: string[] | null;
          indicators?: Json | null;
          start_date?: string | null;
          end_date?: string | null;
          montant_ae_total?: number | null;
          montant_cp_total?: number | null;
          status?: "proposed" | "validated" | "draft" | "active" | "archived";
          commentaires?: string | null;
          nb_operations?: number | null;
          taux_execution_cp?: number | null;
          taux_execution_physique?: number | null;
          allocated_ae?: number | null;
          allocated_cp?: number | null;
        };
      };
      wilayas: {
        Row: {
          id: string;
          code: string | null;
          name_ar: string;
          name_en: string | null;
          name_fr: string;
          is_active: boolean | null;
          parent_id: string | null;
          description: string | null;
        };
        Insert: {
          id?: string;
          code?: string | null;
          name_ar: string;
          name_en?: string | null;
          name_fr: string;
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
          is_active?: boolean | null;
          parent_id?: string | null;
          description?: string | null;
        };
      };
      operations: {
        Row: {
          id: string;
          action_id: string | null;
          program_id: string | null;
          wilaya_id: string | null;
          budget_title_id: string | null;
          portfolio_program: string | null;
          program_type: string | null;
          code: string | null;
          name: string | null;
          description: string | null;
          province: string | null;
          municipality: string | null;
          location: string | null;
          beneficiary: string | null;
          project_owner: string | null;
          regional_budget_directorate: string | null;
          individualization_number: string | null;
          notification_year: string | null;
          inscription_date: string | null;
          start_year: number | null;
          end_year: number | null;
          start_order_date: string | null;
          completion_date: string | null;
          delay: number | null;
          initial_ae: number | null;
          current_ae: number | null;
          allocated_ae: number | null;
          committed_ae: number | null;
          consumed_ae: number | null;
          allocated_cp: number | null;
          notified_cp: number | null;
          consumed_cp: number | null;
          cumulative_commitments: number | null;
          cumulative_payments: number | null;
          physical_rate: number | null;
          financial_rate: number | null;
          recent_photos: string[] | null;
          observations: string | null;
          execution_mode: "state" | "delegation" | "PPP" | null;
          project_status:
            | "not_started"
            | "planned"
            | "in_progress"
            | "completed"
            | "on_hold"
            | "suspended"
            | "delayed"
            | "canceled"
            | "completely_frozen"
            | "partially_frozen"
            | null;
          status: "draft" | "submitted" | "reviewed" | "approved" | "rejected";
        };
        Insert: {
          id?: string;
          action_id: string | null;
          program_id?: string | null;
          wilaya_id?: string | null;
          budget_title_id?: string | null;
          portfolio_program?: string | null;
          program_type?: string | null;
          code?: string | null;
          name?: string | null;
          description?: string | null;
          province?: string | null;
          municipality?: string | null;
          location?: string | null;
          beneficiary?: string | null;
          project_owner?: string | null;
          regional_budget_directorate?: string | null;
          individualization_number?: string | null;
          notification_year?: string | null;
          inscription_date?: string | null;
          start_year?: number | null;
          end_year?: number | null;
          start_order_date?: string | null;
          completion_date?: string | null;
          delay?: number | null;
          initial_ae?: number | null;
          current_ae?: number | null;
          allocated_ae?: number | null;
          committed_ae?: number | null;
          consumed_ae?: number | null;
          allocated_cp?: number | null;
          notified_cp?: number | null;
          consumed_cp?: number | null;
          cumulative_commitments?: number | null;
          cumulative_payments?: number | null;
          physical_rate?: number | null;
          financial_rate?: number | null;
          recent_photos?: string[] | null;
          observations?: string | null;
          execution_mode?: "state" | "delegation" | "PPP" | null;
          project_status?:
            | "not_started"
            | "planned"
            | "in_progress"
            | "completed"
            | "on_hold"
            | "suspended"
            | "delayed"
            | "canceled"
            | "completely_frozen"
            | "partially_frozen"
            | null;
          status?: "draft" | "submitted" | "reviewed" | "approved" | "rejected";
        };
        Update: {
          id?: string;
          action_id?: string | null;
          program_id?: string | null;
          wilaya_id?: string | null;
          budget_title_id?: string | null;
          portfolio_program?: string | null;
          program_type?: string | null;
          code?: string | null;
          name?: string | null;
          description?: string | null;
          province?: string | null;
          municipality?: string | null;
          location?: string | null;
          beneficiary?: string | null;
          project_owner?: string | null;
          regional_budget_directorate?: string | null;
          individualization_number?: string | null;
          notification_year?: string | null;
          inscription_date?: string | null;
          start_year?: number | null;
          end_year?: number | null;
          start_order_date?: string | null;
          completion_date?: string | null;
          delay?: number | null;
          initial_ae?: number | null;
          current_ae?: number | null;
          allocated_ae?: number | null;
          committed_ae?: number | null;
          consumed_ae?: number | null;
          allocated_cp?: number | null;
          notified_cp?: number | null;
          consumed_cp?: number | null;
          cumulative_commitments?: number | null;
          cumulative_payments?: number | null;
          physical_rate?: number | null;
          financial_rate?: number | null;
          recent_photos?: string[] | null;
          observations?: string | null;
          execution_mode?: "state" | "delegation" | "PPP" | null;
          project_status?:
            | "not_started"
            | "planned"
            | "in_progress"
            | "completed"
            | "on_hold"
            | "suspended"
            | "delayed"
            | "canceled"
            | "completely_frozen"
            | "partially_frozen"
            | null;
          status?: "draft" | "submitted" | "reviewed" | "approved" | "rejected";
        };
      };
      operation_cps: {
        Row: {
          id: string;
          operation_id: string;
          fiscal_year_id: string;
          montant_cp: number;
        };
        Insert: {
          id?: string;
          operation_id: string;
          fiscal_year_id: string;
          montant_cp: number;
        };
        Update: {
          id?: string;
          operation_id?: string;
          fiscal_year_id?: string;
          montant_cp?: number;
        };
      };
      allocations: {
        Row: {
          id: string;
          operation_id: string;
          budget_title_id: string;
          ae_amount: number;
          cp_amount: number;
          state: "initial" | "revised";
          source: string | null;
        };
        Insert: {
          id?: string;
          operation_id: string;
          budget_title_id: string;
          ae_amount: number;
          cp_amount: number;
          state: "initial" | "revised";
          source?: string | null;
        };
        Update: {
          id?: string;
          operation_id?: string;
          budget_title_id?: string;
          ae_amount?: number;
          cp_amount?: number;
          state?: "initial" | "revised";
          source?: string | null;
        };
      };
      budget_modifications: {
        Row: {
          id: string;
          action_id: string;
          type: "new_entry" | "revaluation" | "reallocation";
          reason: string | null;
          amount: number;
          decision: string | null;
        };
        Insert: {
          id?: string;
          action_id: string;
          type: "new_entry" | "revaluation" | "reallocation";
          reason?: string | null;
          amount: number;
          decision?: string | null;
        };
        Update: {
          id?: string;
          action_id?: string;
          type?: "new_entry" | "revaluation" | "reallocation";
          reason?: string | null;
          amount?: number;
          decision?: string | null;
        };
      };
      engagements: {
        Row: {
          id: string;
          operation_id: string;
          reference: string | null;
          date: string | null;
          vendor: string | null;
          amount: number | null;
          status: "proposed" | "validated" | "liquidated" | "draft" | "submitted" | "reviewed" | "approved" | "rejected";
          code: string | null;
          inscription_date: string | null;
          year: number | null;
          type: string | null;
          history: string | null;
          description: string | null;
        };
        Insert: {
          id?: string;
          operation_id: string;
          reference?: string | null;
          date?: string | null;
          vendor?: string | null;
          amount?: number | null;
          status?: "proposed" | "validated" | "liquidated" | "draft" | "submitted" | "reviewed" | "approved" | "rejected";
          code?: string | null;
          inscription_date?: string | null;
          year?: number | null;
          type?: string | null;
          history?: string | null;
          description?: string | null;
        };
        Update: {
          id?: string;
          operation_id?: string;
          reference?: string | null;
          date?: string | null;
          vendor?: string | null;
          amount?: number | null;
          status?: "proposed" | "validated" | "liquidated" | "draft" | "submitted" | "reviewed" | "approved" | "rejected";
          code?: string | null;
          inscription_date?: string | null;
          year?: number | null;
          type?: string | null;
          history?: string | null;
          description?: string | null;
        };
      };
      revaluations: {
        Row: {
          id: string;
          engagement_id: string;
          code: string | null;
          revaluation_amount: number | null;
          reason: string | null;
          description: string | null;
          status: "draft" | "submitted" | "reviewed" | "approved" | "rejected";
          revaluation_date: string | null;
        };
        Insert: {
          id?: string;
          engagement_id: string;
          code?: string | null;
          revaluation_amount?: number | null;
          reason?: string | null;
          description?: string | null;
          status?: "draft" | "submitted" | "reviewed" | "approved" | "rejected";
          revaluation_date?: string | null;
        };
        Update: {
          id?: string;
          engagement_id?: string;
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
          operation_id: string;
          fiscal_year_id: string;
          amount: number | null;
          status: "draft" | "submitted" | "reviewed" | "approved" | "rejected";
          description: string | null;
        };
        Insert: {
          id?: string;
          code?: string | null;
          operation_id: string;
          fiscal_year_id: string;
          amount?: number | null;
          status?: "draft" | "submitted" | "reviewed" | "approved" | "rejected";
          description?: string | null;
        };
        Update: {
          id?: string;
          code?: string | null;
          operation_id?: string;
          fiscal_year_id?: string;
          amount?: number | null;
          status?: "draft" | "submitted" | "reviewed" | "approved" | "rejected";
          description?: string | null;
        };
      };
      cp_forecasts: {
        Row: {
          id: string;
          operation_id: string;
          fiscal_year_id: string;
          forecast_cp: number | null;
          status: "draft" | "submitted" | "reviewed" | "approved" | "rejected";
          description: string | null;
        };
        Insert: {
          id?: string;
          operation_id: string;
          fiscal_year_id: string;
          forecast_cp?: number | null;
          status?: "draft" | "submitted" | "reviewed" | "approved" | "rejected";
          description?: string | null;
        };
        Update: {
          id?: string;
          operation_id?: string;
          fiscal_year_id?: string;
          forecast_cp?: number | null;
          status?: "draft" | "submitted" | "reviewed" | "approved" | "rejected";
          description?: string | null;
        };
      };
      cp_mobilisations: {
        Row: {
          id: string;
          operation_id: string;
          mobilised_cp: number | null;
          mobilisation_date: string | null;
          status: "draft" | "submitted" | "reviewed" | "approved" | "rejected";
          description: string | null;
        };
        Insert: {
          id?: string;
          operation_id: string;
          mobilised_cp?: number | null;
          mobilisation_date?: string | null;
          status?: "draft" | "submitted" | "reviewed" | "approved" | "rejected";
          description?: string | null;
        };
        Update: {
          id?: string;
          operation_id?: string;
          mobilised_cp?: number | null;
          mobilisation_date?: string | null;
          status?: "draft" | "submitted" | "reviewed" | "approved" | "rejected";
          description?: string | null;
        };
      };
      cp_consumptions: {
        Row: {
          id: string;
          mobilisation_id: string;
          consumed_cp: number | null;
          consumption_date: string | null;
          status: "draft" | "submitted" | "reviewed" | "approved" | "rejected";
          description: string | null;
        };
        Insert: {
          id?: string;
          mobilisation_id: string;
          consumed_cp?: number | null;
          consumption_date?: string | null;
          status?: "draft" | "submitted" | "reviewed" | "approved" | "rejected";
          description?: string | null;
        };
        Update: {
          id?: string;
          mobilisation_id?: string;
          consumed_cp?: number | null;
          consumption_date?: string | null;
          status?: "draft" | "submitted" | "reviewed" | "approved" | "rejected";
          description?: string | null;
        };
      };
      payments: {
        Row: {
          id: string;
          engagement_id: string;
          payment_date: string | null;
          payment_mode: string | null;
          amount: number | null;
          status: "draft" | "pending" | "approved" | "paid" | "rejected";
          operation_id: string;
          beneficiary: string | null;
          description: string | null;
        };
        Insert: {
          id?: string;
          engagement_id: string;
          payment_date?: string | null;
          payment_mode?: string | null;
          amount?: number | null;
          status?: "draft" | "pending" | "approved" | "paid" | "rejected";
          operation_id: string;
          beneficiary?: string | null;
          description?: string | null;
        };
        Update: {
          id?: string;
          engagement_id?: string;
          payment_date?: string | null;
          payment_mode?: string | null;
          amount?: number | null;
          status?: "draft" | "pending" | "approved" | "paid" | "rejected";
          operation_id?: string;
          beneficiary?: string | null;
          description?: string | null;
        };
      };
      disbursements: {
        Row: {
          id: string;
          payment_id: string;
          accounting_reference: string | null;
          amount: number;
          disbursement_date: string;
        };
        Insert: {
          id?: string;
          payment_id: string;
          accounting_reference?: string | null;
          amount: number;
          disbursement_date: string;
        };
        Update: {
          id?: string;
          payment_id?: string;
          accounting_reference?: string | null;
          amount?: number;
          disbursement_date?: string;
        };
      };
      payment_requests: {
        Row: {
          id: string;
          engagement_id: string;
          operation_id: string;
          requested_amount: number | null;
          request_date: string | null;
          period: string | null;
          frequency: "monthly" | "quarterly" | "annual";
          justification: string | null;
          status: "draft" | "pending" | "reviewed" | "approved" | "rejected";
          document: string | null;
          beneficiary: string | null;
          description: string | null;
        };
        Insert: {
          id?: string;
          engagement_id: string;
          operation_id: string;
          requested_amount?: number | null;
          request_date?: string | null;
          period?: string | null;
          frequency?: "monthly" | "quarterly" | "annual";
          justification?: string | null;
          status?: "draft" | "pending" | "reviewed" | "approved" | "rejected";
          document?: string | null;
          beneficiary?: string | null;
          description?: string | null;
        };
        Update: {
          id?: string;
          engagement_id?: string;
          operation_id?: string;
          requested_amount?: number | null;
          request_date?: string | null;
          period?: string | null;
          frequency?: "monthly" | "quarterly" | "annual";
          justification?: string | null;
          status?: "draft" | "pending" | "reviewed" | "approved" | "rejected";
          document?: string | null;
          beneficiary?: string | null;
          description?: string | null;
        };
      };
      cp_alerts: {
        Row: {
          id: string;
          operation_id: string;
          threshold_exceeded: boolean | null;
          alert_level: string | null;
          message: string | null;
          status: "draft" | "submitted" | "reviewed" | "approved" | "rejected";
          alert_date: string | null;
        };
        Insert: {
          id?: string;
          operation_id: string;
          threshold_exceeded?: boolean | null;
          alert_level?: string | null;
          message?: string | null;
          status?: "draft" | "submitted" | "reviewed" | "approved" | "rejected";
          alert_date?: string | null;
        };
        Update: {
          id?: string;
          operation_id?: string;
          threshold_exceeded?: boolean | null;
          alert_level?: string | null;
          message?: string | null;
          status?: "draft" | "submitted" | "reviewed" | "approved" | "rejected";
          alert_date?: string | null;
        };
      };
      performance_indicators: {
        Row: {
          id: string;
          program_id: string | null;
          action_id: string | null;
          name: string;
          current_value: number | null;
          target_value: number | null;
          unit: string | null;
          year: number | null;
          source: string | null;
        };
        Insert: {
          id?: string;
          program_id?: string | null;
          action_id?: string | null;
          name: string;
          current_value?: number | null;
          target_value?: number | null;
          unit?: string | null;
          year?: number | null;
          source?: string | null;
        };
        Update: {
          id?: string;
          program_id?: string | null;
          action_id?: string | null;
          name?: string;
          current_value?: number | null;
          target_value?: number | null;
          unit?: string | null;
          year?: number | null;
          source?: string | null;
        };
      };
      external_fundings: {
        Row: {
          id: string;
          donor: string | null;
          program_id: string | null;
          operation_id: string | null;
          conditional: boolean;
          funding_type: string | null;
          amount: number | null;
        };
        Insert: {
          id?: string;
          donor?: string | null;
          program_id?: string | null;
          operation_id?: string | null;
          conditional?: boolean;
          funding_type?: string | null;
          amount?: number | null;
        };
        Update: {
          id?: string;
          donor?: string | null;
          program_id?: string | null;
          operation_id?: string | null;
          conditional?: boolean;
          funding_type?: string | null;
          amount?: number | null;
        };
      };
      extra_engagements: {
        Row: {
          id: string;
          operation_id: string;
          requested_amount: number | null;
          request_date: string | null;
          justification: string | null;
          status: "draft" | "submitted" | "reviewed" | "approved" | "rejected";
          engagement_date: string | null;
        };
        Insert: {
          id?: string;
          operation_id: string;
          requested_amount?: number | null;
          request_date?: string | null;
          justification?: string | null;
          status?: "draft" | "submitted" | "reviewed" | "approved" | "rejected";
          engagement_date?: string | null;
        };
        Update: {
          id?: string;
          operation_id?: string;
          requested_amount?: number | null;
          request_date?: string | null;
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
          phone2: string | null;
          fax: string | null;
          fax2: string | null;
          email: string | null;
          website: string | null;
          description: string | null;
        };
        Insert: {
          id?: string;
          name: string;
          nif?: string | null;
          rc?: string | null;
          address?: string | null;
          phone?: string | null;
          phone2?: string | null;
          fax?: string | null;
          fax2?: string | null;
          email?: string | null;
          website?: string | null;
          description?: string | null;
        };
        Update: {
          id?: string;
          name?: string;
          nif?: string | null;
          rc?: string | null;
          address?: string | null;
          phone?: string | null;
          phone2?: string | null;
          fax?: string | null;
          fax2?: string | null;
          email?: string | null;
          website?: string | null;
          description?: string | null;
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
          ministry_id: string | null;
          fiscal_year_id: string | null;
          title: string | null;
          ref: string | null;
          date_submitted: string | null;
          cp_amount: number;
          ae_amount: number;
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
          priority: "low" | "medium" | "high";
          status: "draft" | "submitted" | "reviewed" | "approved" | "rejected";
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
          cp_amount: number;
          ae_amount: number;
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
      activity_logs: {
        Row: {
          id: string;
          user_id: string | null;
          action_type: string;
          entity_type: string;
          entity_id: string | null;
          details: Json | null;
          created_at: string | null;
          ip_address: string | null;
        };
        Insert: {
          id?: string;
          user_id?: string | null;
          action_type: string;
          entity_type: string;
          entity_id?: string | null;
          details?: Json | null;
          created_at?: string | null;
          ip_address?: string | null;
        };
        Update: {
          id?: string;
          user_id?: string | null;
          action_type?: string;
          entity_type?: string;
          entity_id?: string | null;
          details?: Json | null;
          created_at?: string | null;
          ip_address?: string | null;
        };
      };
      notifications: {
        Row: {
          id: string;
          user_id: string | null;
          title: string;
          message: string;
          entity_type: string | null;
          entity_id: string | null;
          is_read: boolean | null;
          priority: "low" | "medium" | "high" | null;
          created_at: string | null;
          action_url: string | null;
        };
        Insert: {
          id?: string;
          user_id?: string | null;
          title: string;
          message: string;
          entity_type?: string | null;
          entity_id?: string | null;
          is_read?: boolean | null;
          priority?: "low" | "medium" | "high" | null;
          created_at?: string | null;
          action_url?: string | null;
        };
        Update: {
          id?: string;
          user_id?: string | null;
          title?: string;
          message?: string;
          entity_type?: string | null;
          entity_id?: string | null;
          is_read?: boolean | null;
          priority?: "low" | "medium" | "high" | null;
          created_at?: string | null;
          action_url?: string | null;
        };
      };
      comments: {
        Row: {
          id: string;
          user_id: string | null;
          entity_type: string;
          entity_id: string;
          content: string;
          parent_id: string | null;
          created_at: string | null;
          updated_at: string | null;
          is_deleted: boolean | null;
        };
        Insert: {
          id?: string;
          user_id?: string | null;
          entity_type: string;
          entity_id: string;
          content: string;
          parent_id?: string | null;
          created_at?: string | null;
          updated_at?: string | null;
          is_deleted?: boolean | null;
        };
        Update: {
          id?: string;
          user_id?: string | null;
          entity_type?: string;
          entity_id?: string;
          content?: string;
          parent_id?: string | null;
          created_at?: string | null;
          updated_at?: string | null;
          is_deleted?: boolean | null;
        };
      };
      documents: {
        Row: {
          id: string;
          user_id: string | null;
          entity_type: string;
          entity_id: string;
          file_name: string;
          file_path: string;
          file_size: number | null;
          file_type: string | null;
          title: string | null;
          description: string | null;
          created_at: string | null;
          updated_at: string | null;
          access_level: "public" | "private" | "restricted" | null;
        };
        Insert: {
          id?: string;
          user_id?: string | null;
          entity_type: string;
          entity_id: string;
          file_name: string;
          file_path: string;
          file_size?: number | null;
          file_type?: string | null;
          title?: string | null;
          description?: string | null;
          created_at?: string | null;
          updated_at?: string | null;
          access_level?: "public" | "private" | "restricted" | null;
        };
        Update: {
          id?: string;
          user_id?: string | null;
          entity_type?: string;
          entity_id?: string;
          file_name?: string;
          file_path?: string;
          file_size?: number | null;
          file_type?: string | null;
          title?: string | null;
          description?: string | null;
          created_at?: string | null;
          updated_at?: string | null;
          access_level?: "public" | "private" | "restricted" | null;
        };
      };
      settings: {
        Row: {
          id: string;
          key: string;
          value: string | null;
          value_type: "string" | "number" | "boolean" | "json" | null;
          description: string | null;
          category: string | null;
          is_system: boolean | null;
          created_at: string | null;
          updated_at: string | null;
        };
        Insert: {
          id?: string;
          key: string;
          value?: string | null;
          value_type?: "string" | "number" | "boolean" | "json" | null;
          description?: string | null;
          category?: string | null;
          is_system?: boolean | null;
          created_at?: string | null;
          updated_at?: string | null;
        };
        Update: {
          id?: string;
          key?: string;
          value?: string | null;
          value_type?: "string" | "number" | "boolean" | "json" | null;
          description?: string | null;
          category?: string | null;
          is_system?: boolean | null;
          created_at?: string | null;
          updated_at?: string | null;
        };
      };
      permissions: {
        Row: {
          id: string;
          role_id: string | null;
          resource: string;
          action: string;
          conditions: Json | null;
          description: string | null;
          created_at: string | null;
        };
        Insert: {
          id?: string;
          role_id?: string | null;
          resource: string;
          action: string;
          conditions?: Json | null;
          description?: string | null;
          created_at?: string | null;
        };
        Update: {
          id?: string;
          role_id?: string | null;
          resource?: string;
          action?: string;
          conditions?: Json | null;
          description?: string | null;
          created_at?: string | null;
        };
      };
      tags: {
        Row: {
          id: string;
          name: string;
          color: string | null;
          description: string | null;
          created_at: string | null;
        };
        Insert: {
          id?: string;
          name: string;
          color?: string | null;
          description?: string | null;
          created_at?: string | null;
        };
        Update: {
          id?: string;
          name?: string;
          color?: string | null;
          description?: string | null;
          created_at?: string | null;
        };
      };
      tag_associations: {
        Row: {
          id: string;
          tag_id: string;
          entity_type: string;
          entity_id: string;
          created_at: string | null;
        };
        Insert: {
          id?: string;
          tag_id: string;
          entity_type: string;
          entity_id: string;
          created_at?: string | null;
        };
        Update: {
          id?: string;
          tag_id?: string;
          entity_type?: string;
          entity_id?: string;
          created_at?: string | null;
        };
      };
      milestones: {
        Row: {
          id: string;
          operation_id: string;
          title: string;
          description: string | null;
          due_date: string | null;
          completion_date: string | null;
          status: "pending" | "in_progress" | "completed" | "delayed" | "cancelled" | null;
          progress: number | null;
          created_at: string | null;
          updated_at: string | null;
        };
        Insert: {
          id?: string;
          operation_id: string;
          title: string;
          description?: string | null;
          due_date?: string | null;
          completion_date?: string | null;
          status?: "pending" | "in_progress" | "completed" | "delayed" | "cancelled" | null;
          progress?: number | null;
          created_at?: string | null;
          updated_at?: string | null;
        };
        Update: {
          id?: string;
          operation_id?: string;
          title?: string;
          description?: string | null;
          due_date?: string | null;
          completion_date?: string | null;
          status?: "pending" | "in_progress" | "completed" | "delayed" | "cancelled" | null;
          progress?: number | null;
          created_at?: string | null;
          updated_at?: string | null;
        };
      };
      attachments: {
        Row: {
          id: string;
          user_id: string | null;
          entity_type: string;
          entity_id: string;
          file_name: string;
          file_path: string;
          file_size: number | null;
          file_type: string | null;
          description: string | null;
          uploaded_at: string | null;
          is_public: boolean | null;
        };
        Insert: {
          id?: string;
          user_id?: string | null;
          entity_type: string;
          entity_id: string;
          file_name: string;
          file_path: string;
          file_size?: number | null;
          file_type?: string | null;
          description?: string | null;
          uploaded_at?: string | null;
          is_public?: boolean | null;
        };
        Update: {
          id?: string;
          user_id?: string | null;
          entity_type?: string;
          entity_id?: string;
          file_name?: string;
          file_path?: string;
          file_size?: number | null;
          file_type?: string | null;
          description?: string | null;
          uploaded_at?: string | null;
          is_public?: boolean | null;
        };
      };
      audits: {
        Row: {
          id: string;
          user_id: string | null;
          entity_type: string;
          entity_id: string | null;
          action: string;
          old_values: Json | null;
          new_values: Json | null;
          timestamp: string | null;
          ip_address: string | null;
          user_agent: string | null;
        };
        Insert: {
          id?: string;
          user_id?: string | null;
          entity_type: string;
          entity_id?: string | null;
          action: string;
          old_values?: Json | null;
          new_values?: Json | null;
          timestamp?: string | null;
          ip_address?: string | null;
          user_agent?: string | null;
        };
        Update: {
          id?: string;
          user_id?: string | null;
          entity_type?: string;
          entity_id?: string | null;
          action?: string;
          old_values?: Json | null;
          new_values?: Json | null;
          timestamp?: string | null;
          ip_address?: string | null;
          user_agent?: string | null;
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
export type BudgetTitle = Database["public"]["Tables"]["budget_titles"]["Row"];
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

// New table types from SQL schema
export type Subprogram = Database["public"]["Tables"]["subprograms"]["Row"];
export type OperationCP = Database["public"]["Tables"]["operation_cps"]["Row"];
export type Allocation = Database["public"]["Tables"]["allocations"]["Row"];
export type BudgetModification = Database["public"]["Tables"]["budget_modifications"]["Row"];
export type Disbursement = Database["public"]["Tables"]["disbursements"]["Row"];
export type PerformanceIndicator = Database["public"]["Tables"]["performance_indicators"]["Row"];
export type ExternalFunding = Database["public"]["Tables"]["external_fundings"]["Row"];
export type ActivityLog = Database["public"]["Tables"]["activity_logs"]["Row"];
export type Notification = Database["public"]["Tables"]["notifications"]["Row"];
export type Comment = Database["public"]["Tables"]["comments"]["Row"];
export type Document = Database["public"]["Tables"]["documents"]["Row"];
export type Setting = Database["public"]["Tables"]["settings"]["Row"];
export type Permission = Database["public"]["Tables"]["permissions"]["Row"];
export type Tag = Database["public"]["Tables"]["tags"]["Row"];
export type TagAssociation = Database["public"]["Tables"]["tag_associations"]["Row"];
export type Milestone = Database["public"]["Tables"]["milestones"]["Row"];
export type Attachment = Database["public"]["Tables"]["attachments"]["Row"];
export type Audit = Database["public"]["Tables"]["audits"]["Row"];

// Alias for backward compatibility
export type Entreprise = Enterprise;
export type PrevisionCP = CPForecast;

// Common types
export type StatusOptions = "draft" | "submitted" | "reviewed" | "approved" | "rejected";

// Define join types with related tables for common queries
export interface OperationWithRelations extends Operation {
  program?: Program;
  action?: Action;
  wilaya?: Wilaya;
  budget_title?: BudgetTitle;
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

// New relation types
export interface SubprogramWithRelations extends Subprogram {
  program?: Program;
}

export interface DisbursementWithRelations extends Disbursement {
  payment?: Payment;
}

export interface PerformanceIndicatorWithRelations extends PerformanceIndicator {
  program?: Program;
  action?: Action;
}

export interface MilestoneWithRelations extends Milestone {
  operation?: Operation;
}

export interface CommentWithRelations extends Comment {
  user?: User;
  parent?: Comment;
  replies?: Comment[];
}

export interface DocumentWithRelations extends Document {
  user?: User;
}
