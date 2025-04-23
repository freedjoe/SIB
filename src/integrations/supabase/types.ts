export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type Database = {
  public: {
    Tables: {
      actions: {
        Row: {
          code_action: string | null;
          created_at: string;
          description: string | null;
          end_date: string | null;
          id: string;
          name: string;
          operation_id: string;
          program_id: string;
          start_date: string;
          status: string;
        };
        Insert: {
          code_action?: string | null;
          created_at?: string;
          description?: string | null;
          end_date?: string | null;
          id?: string;
          name: string;
          operation_id: string;
          program_id: string;
          start_date: string;
          status: string;
        };
        Update: {
          code_action?: string | null;
          created_at?: string;
          description?: string | null;
          end_date?: string | null;
          id?: string;
          name?: string;
          operation_id?: string;
          program_id?: string;
          start_date?: string;
          status?: string;
        };
        Relationships: [
          {
            foreignKeyName: "actions_operation_id_fkey";
            columns: ["operation_id"];
            isOneToOne: false;
            referencedRelation: "operations";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "actions_program_id_fkey";
            columns: ["program_id"];
            isOneToOne: false;
            referencedRelation: "programs";
            referencedColumns: ["id"];
          }
        ];
      };
      activity_logs: {
        Row: {
          action: string;
          created_at: string;
          description: string;
          id: string;
          ip_address: string | null;
          user_agent: string | null;
          user_id: string;
        };
        Insert: {
          action: string;
          created_at?: string;
          description: string;
          id?: string;
          ip_address?: string | null;
          user_agent?: string | null;
          user_id: string;
        };
        Update: {
          action?: string;
          created_at?: string;
          description?: string;
          id?: string;
          ip_address?: string | null;
          user_agent?: string | null;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "activity_logs_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "users";
            referencedColumns: ["id"];
          }
        ];
      };
      audit_followups: {
        Row: {
          action_taken: string;
          audit_id: string;
          created_at: string;
          due_date: string;
          id: string;
          status: string;
        };
        Insert: {
          action_taken: string;
          audit_id: string;
          created_at?: string;
          due_date: string;
          id?: string;
          status: string;
        };
        Update: {
          action_taken?: string;
          audit_id?: string;
          created_at?: string;
          due_date?: string;
          id?: string;
          status?: string;
        };
        Relationships: [
          {
            foreignKeyName: "audit_followups_audit_id_fkey";
            columns: ["audit_id"];
            isOneToOne: false;
            referencedRelation: "audits";
            referencedColumns: ["id"];
          }
        ];
      };
      audit_logs: {
        Row: {
          action: string;
          created_at: string;
          entity_id: string;
          entity_type: string;
          id: string;
          ip_address: string | null;
          new_values: Json | null;
          old_values: Json | null;
          user_agent: string | null;
          user_id: string;
        };
        Insert: {
          action: string;
          created_at?: string;
          entity_id: string;
          entity_type: string;
          id?: string;
          ip_address?: string | null;
          new_values?: Json | null;
          old_values?: Json | null;
          user_agent?: string | null;
          user_id: string;
        };
        Update: {
          action?: string;
          created_at?: string;
          entity_id?: string;
          entity_type?: string;
          id?: string;
          ip_address?: string | null;
          new_values?: Json | null;
          old_values?: Json | null;
          user_agent?: string | null;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "audit_logs_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "users";
            referencedColumns: ["id"];
          }
        ];
      };
      audits: {
        Row: {
          audit_date: string;
          auditor: string;
          created_at: string;
          findings: string;
          id: string;
          operation_id: string;
          recommendations: string | null;
          status: string;
        };
        Insert: {
          audit_date: string;
          auditor: string;
          created_at?: string;
          findings: string;
          id?: string;
          operation_id: string;
          recommendations?: string | null;
          status: string;
        };
        Update: {
          audit_date?: string;
          auditor?: string;
          created_at?: string;
          findings?: string;
          id?: string;
          operation_id?: string;
          recommendations?: string | null;
          status?: string;
        };
        Relationships: [
          {
            foreignKeyName: "audits_operation_id_fkey";
            columns: ["operation_id"];
            isOneToOne: false;
            referencedRelation: "operations";
            referencedColumns: ["id"];
          }
        ];
      };
      budget_lines: {
        Row: {
          amount: number;
          budget_id: string;
          created_at: string;
          description: string | null;
          id: string;
          program_id: string;
        };
        Insert: {
          amount: number;
          budget_id: string;
          created_at?: string;
          description?: string | null;
          id?: string;
          program_id: string;
        };
        Update: {
          amount?: number;
          budget_id?: string;
          created_at?: string;
          description?: string | null;
          id?: string;
          program_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "budget_lines_budget_id_fkey";
            columns: ["budget_id"];
            isOneToOne: false;
            referencedRelation: "budgets";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "budget_lines_program_id_fkey";
            columns: ["program_id"];
            isOneToOne: false;
            referencedRelation: "programs";
            referencedColumns: ["id"];
          }
        ];
      };
      budgets: {
        Row: {
          created_at: string;
          id: string;
          ministry_id: string;
          status: string;
          total_amount: number;
          year: number;
        };
        Insert: {
          created_at?: string;
          id?: string;
          ministry_id: string;
          status: string;
          total_amount: number;
          year: number;
        };
        Update: {
          created_at?: string;
          id?: string;
          ministry_id?: string;
          status?: string;
          total_amount?: number;
          year?: number;
        };
        Relationships: [
          {
            foreignKeyName: "budgets_ministry_id_fkey";
            columns: ["ministry_id"];
            isOneToOne: false;
            referencedRelation: "ministries";
            referencedColumns: ["id"];
          }
        ];
      };
      companies: {
        Row: {
          address: string | null;
          code: string;
          created_at: string;
          email: string | null;
          id: string;
          name: string;
          phone: string | null;
          updated_at: string;
        };
        Insert: {
          address?: string | null;
          code: string;
          created_at?: string;
          email?: string | null;
          id?: string;
          name: string;
          phone?: string | null;
          updated_at?: string;
        };
        Update: {
          address?: string | null;
          code?: string;
          created_at?: string;
          email?: string | null;
          id?: string;
          name?: string;
          phone?: string | null;
          updated_at?: string;
        };
        Relationships: [];
      };
      cp_forecasts: {
        Row: {
          category: string;
          company_id: string;
          created_at: string | null;
          date_soumission: string | null;
          description: string | null;
          end_date: string;
          exercice: number | null;
          forecasted_amount: number;
          id: string;
          ministry_id: string;
          mobilized_amount: number;
          montant_consomme: number | null;
          montant_demande: number | null;
          montant_mobilise: number | null;
          montant_prevu: number | null;
          notes: string | null;
          period: string;
          program_id: string;
          requested_by: string;
          start_date: string;
          status: string;
          updated_at: string | null;
        };
        Insert: {
          category: string;
          company_id: string;
          created_at?: string | null;
          date_soumission?: string | null;
          description?: string | null;
          end_date: string;
          exercice?: number | null;
          forecasted_amount: number;
          id?: string;
          ministry_id: string;
          mobilized_amount: number;
          montant_consomme?: number | null;
          montant_demande?: number | null;
          montant_mobilise?: number | null;
          montant_prevu?: number | null;
          notes?: string | null;
          period: string;
          program_id: string;
          requested_by: string;
          start_date: string;
          status: string;
          updated_at?: string | null;
        };
        Update: {
          category?: string;
          company_id?: string;
          created_at?: string | null;
          date_soumission?: string | null;
          description?: string | null;
          end_date?: string;
          exercice?: number | null;
          forecasted_amount?: number;
          id?: string;
          ministry_id?: string;
          mobilized_amount?: number;
          montant_consomme?: number | null;
          montant_demande?: number | null;
          montant_mobilise?: number | null;
          montant_prevu?: number | null;
          notes?: string | null;
          period?: string;
          program_id?: string;
          requested_by?: string;
          start_date?: string;
          status?: string;
          updated_at?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "cp_forecasts_company_id_fkey";
            columns: ["company_id"];
            isOneToOne: false;
            referencedRelation: "companies";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "cp_forecasts_ministry_id_fkey";
            columns: ["ministry_id"];
            isOneToOne: false;
            referencedRelation: "ministries";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "cp_forecasts_program_id_fkey";
            columns: ["program_id"];
            isOneToOne: false;
            referencedRelation: "programs";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "cp_forecasts_requested_by_fkey";
            columns: ["requested_by"];
            isOneToOne: false;
            referencedRelation: "users";
            referencedColumns: ["id"];
          }
        ];
      };
      engagement_reevaluations: {
        Row: {
          created_at: string;
          created_by: string;
          date_reevaluation: string;
          date_validation: string | null;
          document_justificatif: string | null;
          engagement_id: string;
          id: string;
          montant_initial: number;
          montant_reevalue: number;
          motif_reevaluation: string;
          statut_reevaluation: string;
          valide_par: string | null;
        };
        Insert: {
          created_at?: string;
          created_by: string;
          date_reevaluation?: string;
          date_validation?: string | null;
          document_justificatif?: string | null;
          engagement_id: string;
          id?: string;
          montant_initial: number;
          montant_reevalue: number;
          motif_reevaluation: string;
          statut_reevaluation: string;
          valide_par?: string | null;
        };
        Update: {
          created_at?: string;
          created_by?: string;
          date_reevaluation?: string;
          date_validation?: string | null;
          document_justificatif?: string | null;
          engagement_id?: string;
          id?: string;
          montant_initial?: number;
          montant_reevalue?: number;
          motif_reevaluation?: string;
          statut_reevaluation?: string;
          valide_par?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "engagement_reevaluations_engagement_id_fkey";
            columns: ["engagement_id"];
            isOneToOne: false;
            referencedRelation: "engagements";
            referencedColumns: ["id"];
          }
        ];
      };
      engagements: {
        Row: {
          beneficiary: string;
          created_at: string;
          description: string | null;
          id: string;
          operation_id: string;
          reference: string;
          requested_by: string;
        };
        Insert: {
          beneficiary?: string;
          created_at?: string;
          description?: string | null;
          id?: string;
          operation_id: string;
          reference: string;
          requested_by: string;
        };
        Update: {
          beneficiary?: string;
          created_at?: string;
          description?: string | null;
          id?: string;
          operation_id?: string;
          reference?: string;
          requested_by?: string;
        };
        Relationships: [
          {
            foreignKeyName: "engagements_operation_id_fkey";
            columns: ["operation_id"];
            isOneToOne: false;
            referencedRelation: "operations";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "engagements_requested_by_fkey";
            columns: ["requested_by"];
            isOneToOne: false;
            referencedRelation: "users";
            referencedColumns: ["id"];
          }
        ];
      };
      error_logs: {
        Row: {
          created_at: string;
          error_message: string;
          error_type: string;
          id: string;
          ip_address: string | null;
          stack_trace: string | null;
          user_agent: string | null;
          user_id: string | null;
        };
        Insert: {
          created_at?: string;
          error_message: string;
          error_type: string;
          id?: string;
          ip_address?: string | null;
          stack_trace?: string | null;
          user_agent?: string | null;
          user_id?: string | null;
        };
        Update: {
          created_at?: string;
          error_message?: string;
          error_type?: string;
          id?: string;
          ip_address?: string | null;
          stack_trace?: string | null;
          user_agent?: string | null;
          user_id?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "error_logs_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "users";
            referencedColumns: ["id"];
          }
        ];
      };
      ministries: {
        Row: {
          code: string;
          created_at: string;
          description: string | null;
          id: string;
          name: string;
          updated_at: string;
        };
        Insert: {
          code: string;
          created_at?: string;
          description?: string | null;
          id?: string;
          name: string;
          updated_at?: string;
        };
        Update: {
          code?: string;
          created_at?: string;
          description?: string | null;
          id?: string;
          name?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      operations: {
        Row: {
          action_id: string | null;
          code_operation: string | null;
          created_at: string;
          description: string | null;
          id: string;
          name: string;
          origine_financement: string | null;
          program_id: string;
          titre_budgetaire: number | null;
          wilaya: string | null;
        };
        Insert: {
          action_id?: string | null;
          code_operation?: string | null;
          created_at?: string;
          description?: string | null;
          id?: string;
          name: string;
          origine_financement?: string | null;
          program_id: string;
          titre_budgetaire?: number | null;
          wilaya?: string | null;
        };
        Update: {
          action_id?: string | null;
          code_operation?: string | null;
          created_at?: string;
          description?: string | null;
          id?: string;
          name?: string;
          origine_financement?: string | null;
          program_id?: string;
          titre_budgetaire?: number | null;
          wilaya?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "operations_action_id_fkey";
            columns: ["action_id"];
            isOneToOne: false;
            referencedRelation: "actions";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "operations_program_id_fkey";
            columns: ["program_id"];
            isOneToOne: false;
            referencedRelation: "programs";
            referencedColumns: ["id"];
          }
        ];
      };
      payment_requests: {
        Row: {
          amount: number;
          approved_date: string | null;
          beneficiary: string;
          created_at: string;
          description: string;
          engagement_id: string;
          frequency: string;
          id: string;
          operation_id: string;
          program_id: string;
          request_date: string;
          requested_by: string;
          start_date: string;
          status: string;
        };
        Insert: {
          amount: number;
          approved_date?: string | null;
          beneficiary: string;
          created_at?: string;
          description: string;
          engagement_id: string;
          frequency: string;
          id?: string;
          operation_id: string;
          program_id: string;
          request_date: string;
          requested_by: string;
          start_date: string;
          status: string;
        };
        Update: {
          amount?: number;
          approved_date?: string | null;
          beneficiary?: string;
          created_at?: string;
          description?: string;
          engagement_id?: string;
          frequency?: string;
          id?: string;
          operation_id?: string;
          program_id?: string;
          request_date?: string;
          requested_by?: string;
          start_date?: string;
          status?: string;
        };
        Relationships: [
          {
            foreignKeyName: "payment_requests_engagement_id_fkey";
            columns: ["engagement_id"];
            isOneToOne: false;
            referencedRelation: "engagements";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "payment_requests_operation_id_fkey";
            columns: ["operation_id"];
            isOneToOne: false;
            referencedRelation: "operations";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "payment_requests_program_id_fkey";
            columns: ["program_id"];
            isOneToOne: false;
            referencedRelation: "programs";
            referencedColumns: ["id"];
          }
        ];
      };
      payments: {
        Row: {
          amount: number;
          beneficiary: string;
          created_at: string;
          description: string;
          engagement_id: string;
          id: string;
          operation_id: string;
          payment_date: string | null;
          request_date: string;
          status: string;
        };
        Insert: {
          amount: number;
          beneficiary: string;
          created_at?: string;
          description: string;
          engagement_id: string;
          id?: string;
          operation_id: string;
          payment_date?: string | null;
          request_date: string;
          status: string;
        };
        Update: {
          amount?: number;
          beneficiary?: string;
          created_at?: string;
          description?: string;
          engagement_id?: string;
          id?: string;
          operation_id?: string;
          payment_date?: string | null;
          request_date?: string;
          status?: string;
        };
        Relationships: [
          {
            foreignKeyName: "payments_engagement_id_fkey";
            columns: ["engagement_id"];
            isOneToOne: false;
            referencedRelation: "engagements";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "payments_operation_id_fkey";
            columns: ["operation_id"];
            isOneToOne: false;
            referencedRelation: "operations";
            referencedColumns: ["id"];
          }
        ];
      };
      permissions: {
        Row: {
          created_at: string;
          description: string | null;
          id: string;
          module: string;
          name: string;
          updated_at: string;
        };
        Insert: {
          created_at?: string;
          description?: string | null;
          id?: string;
          module: string;
          name: string;
          updated_at?: string;
        };
        Update: {
          created_at?: string;
          description?: string | null;
          id?: string;
          module?: string;
          name?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      portfolios: {
        Row: {
          created_at: string;
          description: string | null;
          id: string;
          name: string;
        };
        Insert: {
          created_at?: string;
          description?: string | null;
          id?: string;
          name: string;
        };
        Update: {
          created_at?: string;
          description?: string | null;
          id?: string;
          name?: string;
        };
        Relationships: [];
      };
      programs: {
        Row: {
          allocated: number | null;
          budget: number | null;
          code_programme: string | null;
          created_at: string;
          description: string | null;
          fiscal_year: number | null;
          id: string;
          name: string;
          portfolio_id: string;
        };
        Insert: {
          allocated?: number | null;
          budget?: number | null;
          code_programme?: string | null;
          created_at?: string;
          description?: string | null;
          fiscal_year?: number | null;
          id?: string;
          name: string;
          portfolio_id: string;
        };
        Update: {
          allocated?: number | null;
          budget?: number | null;
          code_programme?: string | null;
          created_at?: string;
          description?: string | null;
          fiscal_year?: number | null;
          id?: string;
          name?: string;
          portfolio_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "programs_portfolio_id_fkey";
            columns: ["portfolio_id"];
            isOneToOne: false;
            referencedRelation: "portfolios";
            referencedColumns: ["id"];
          }
        ];
      };
      reports: {
        Row: {
          content: string;
          created_at: string;
          description: string | null;
          file_path: string | null;
          frequency: string | null;
          generated_date: string;
          id: string;
          operation_id: string;
          report_date: string;
          report_type: string | null;
          status: string;
          title: string;
          type: string;
        };
        Insert: {
          content: string;
          created_at?: string;
          description?: string | null;
          file_path?: string | null;
          frequency?: string | null;
          generated_date?: string;
          id?: string;
          operation_id: string;
          report_date: string;
          report_type?: string | null;
          status: string;
          title: string;
          type: string;
        };
        Update: {
          content?: string;
          created_at?: string;
          description?: string | null;
          file_path?: string | null;
          frequency?: string | null;
          generated_date?: string;
          id?: string;
          operation_id?: string;
          report_date?: string;
          report_type?: string | null;
          status?: string;
          title?: string;
          type?: string;
        };
        Relationships: [
          {
            foreignKeyName: "reports_operation_id_fkey";
            columns: ["operation_id"];
            isOneToOne: false;
            referencedRelation: "operations";
            referencedColumns: ["id"];
          }
        ];
      };
      role_permissions: {
        Row: {
          created_at: string;
          id: string;
          permission_id: string;
          role_id: string;
        };
        Insert: {
          created_at?: string;
          id?: string;
          permission_id: string;
          role_id: string;
        };
        Update: {
          created_at?: string;
          id?: string;
          permission_id?: string;
          role_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "role_permissions_permission_id_fkey";
            columns: ["permission_id"];
            isOneToOne: false;
            referencedRelation: "permissions";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "role_permissions_role_id_fkey";
            columns: ["role_id"];
            isOneToOne: false;
            referencedRelation: "roles";
            referencedColumns: ["id"];
          }
        ];
      };
      roles: {
        Row: {
          created_at: string;
          description: string | null;
          id: string;
          name: string;
          updated_at: string;
        };
        Insert: {
          created_at?: string;
          description?: string | null;
          id?: string;
          name: string;
          updated_at?: string;
        };
        Update: {
          created_at?: string;
          description?: string | null;
          id?: string;
          name?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      system_parameters: {
        Row: {
          created_at: string;
          description: string | null;
          id: string;
          module: string;
          parameter_key: string;
          parameter_value: string;
          updated_at: string;
        };
        Insert: {
          created_at?: string;
          description?: string | null;
          id?: string;
          module: string;
          parameter_key: string;
          parameter_value: string;
          updated_at?: string;
        };
        Update: {
          created_at?: string;
          description?: string | null;
          id?: string;
          module?: string;
          parameter_key?: string;
          parameter_value?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      users: {
        Row: {
          company_id: string | null;
          created_at: string;
          email: string;
          first_name: string | null;
          id: string;
          is_active: boolean | null;
          last_login: string | null;
          last_name: string | null;
          password_hash: string;
          role_id: string;
          updated_at: string;
          username: string;
        };
        Insert: {
          company_id?: string | null;
          created_at?: string;
          email: string;
          first_name?: string | null;
          id?: string;
          is_active?: boolean | null;
          last_login?: string | null;
          last_name?: string | null;
          password_hash: string;
          role_id: string;
          updated_at?: string;
          username: string;
        };
        Update: {
          company_id?: string | null;
          created_at?: string;
          email?: string;
          first_name?: string | null;
          id?: string;
          is_active?: boolean | null;
          last_login?: string | null;
          last_name?: string | null;
          password_hash?: string;
          role_id?: string;
          updated_at?: string;
          username?: string;
        };
        Relationships: [
          {
            foreignKeyName: "users_company_id_fkey";
            columns: ["company_id"];
            isOneToOne: false;
            referencedRelation: "companies";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "users_role_id_fkey";
            columns: ["role_id"];
            isOneToOne: false;
            referencedRelation: "roles";
            referencedColumns: ["id"];
          }
        ];
      };
      prevision_cp: {
        Row: {
          id: string;
          engagement_id: string;
          operation_id: string;
          exercice: number;
          periode: string;
          montant_prevu: number;
          montant_demande: number | null;
          montant_mobilise: number | null;
          montant_consomme: number | null;
          statut: string;
          date_soumission: string | null;
          notes: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          engagement_id: string;
          operation_id: string;
          exercice: number;
          periode: string;
          montant_prevu: number;
          montant_demande?: number | null;
          montant_mobilise?: number | null;
          montant_consomme?: number | null;
          statut?: string;
          date_soumission?: string | null;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          engagement_id?: string;
          operation_id?: string;
          exercice?: number;
          periode?: string;
          montant_prevu?: number;
          montant_demande?: number | null;
          montant_mobilise?: number | null;
          montant_consomme?: number | null;
          statut?: string;
          date_soumission?: string | null;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "prevision_cp_engagement_id_fkey";
            columns: ["engagement_id"];
            isOneToOne: false;
            referencedRelation: "engagements";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "prevision_cp_operation_id_fkey";
            columns: ["operation_id"];
            isOneToOne: false;
            referencedRelation: "operations";
            referencedColumns: ["id"];
          }
        ];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};

type DefaultSchema = Database[Extract<keyof Database, "public">];

export type Tables<
  DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] & DefaultSchema["Views"]) | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database;
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] & Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R;
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
  ? (DefaultSchema["Tables"] & DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
      Row: infer R;
    }
    ? R
    : never
  : never;

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"] | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database;
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I;
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
  ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
      Insert: infer I;
    }
    ? I
    : never
  : never;

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"] | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database;
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U;
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
  ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
      Update: infer U;
    }
    ? U
    : never
  : never;

export type Enums<
  DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"] | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database;
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
  ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
  : never;

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"] | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database;
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
  ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
  : never;

export const Constants = {
  public: {
    Enums: {},
  },
} as const;
