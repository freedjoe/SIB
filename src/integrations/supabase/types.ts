export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type Database = {
  public: {
    Tables: {
      actions: {
        Row: {
          action_type: string;
          allocated_amount: number;
          created_at: string | null;
          description: string | null;
          id: string;
          name: string;
          program_id: string;
          updated_at: string | null;
        };
        Insert: {
          action_type: string;
          allocated_amount?: number;
          created_at?: string | null;
          description?: string | null;
          id?: string;
          name: string;
          program_id: string;
          updated_at?: string | null;
        };
        Update: {
          action_type?: string;
          allocated_amount?: number;
          created_at?: string | null;
          description?: string | null;
          id?: string;
          name?: string;
          program_id?: string;
          updated_at?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "actions_program_id_fkey";
            columns: ["program_id"];
            isOneToOne: false;
            referencedRelation: "programs";
            referencedColumns: ["id"];
          }
        ];
      };
      audit_controls: {
        Row: {
          comments: string | null;
          control_date: string | null;
          control_type: string;
          controller: string;
          created_at: string | null;
          entity_id: string;
          entity_type: string;
          id: string;
          result: string;
          updated_at: string | null;
        };
        Insert: {
          comments?: string | null;
          control_date?: string | null;
          control_type: string;
          controller: string;
          created_at?: string | null;
          entity_id: string;
          entity_type: string;
          id?: string;
          result: string;
          updated_at?: string | null;
        };
        Update: {
          comments?: string | null;
          control_date?: string | null;
          control_type?: string;
          controller?: string;
          created_at?: string | null;
          entity_id?: string;
          entity_type?: string;
          id?: string;
          result?: string;
          updated_at?: string | null;
        };
        Relationships: [];
      };
      engagements: {
        Row: {
          approval_date: string | null;
          approved_amount: number | null;
          beneficiary: string;
          created_at: string | null;
          id: string;
          operation_id: string;
          priority: string;
          request_date: string | null;
          requested_amount: number;
          requested_by: string;
          status: string;
          updated_at: string | null;
        };
        Insert: {
          approval_date?: string | null;
          approved_amount?: number | null;
          beneficiary: string;
          created_at?: string | null;
          id?: string;
          operation_id: string;
          priority?: string;
          request_date?: string | null;
          requested_amount: number;
          requested_by: string;
          status?: string;
          updated_at?: string | null;
        };
        Update: {
          approval_date?: string | null;
          approved_amount?: number | null;
          beneficiary?: string;
          created_at?: string | null;
          id?: string;
          operation_id?: string;
          priority?: string;
          request_date?: string | null;
          requested_amount?: number;
          requested_by?: string;
          status?: string;
          updated_at?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "engagements_operation_id_fkey";
            columns: ["operation_id"];
            isOneToOne: false;
            referencedRelation: "operations";
            referencedColumns: ["id"];
          }
        ];
      };
      cp_forecasts: {
        Row: {
          category: string;
          created_at: string;
          description: string | null;
          end_date: string;
          forecasted_amount: number;
          id: string;
          ministry_id: string | null;
          mobilized_amount: number;
          period: string;
          program_id: string;
          start_date: string;
          updated_at: string;
        };
        Insert: {
          category: string;
          created_at?: string;
          description?: string | null;
          end_date: string;
          forecasted_amount?: number;
          id?: string;
          ministry_id?: string | null;
          mobilized_amount?: number;
          period: string;
          program_id: string;
          start_date: string;
          updated_at?: string;
        };
        Update: {
          category?: string;
          created_at?: string;
          description?: string | null;
          end_date?: string;
          forecasted_amount?: number;
          id?: string;
          ministry_id?: string | null;
          mobilized_amount?: number;
          period?: string;
          program_id?: string;
          start_date?: string;
          updated_at?: string;
        };
        Relationships: [
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
          }
        ];
      };
      ministries: {
        Row: {
          code: string;
          created_at: string | null;
          id: string;
          name: string;
          updated_at: string | null;
        };
        Insert: {
          code: string;
          created_at?: string | null;
          id?: string;
          name: string;
          updated_at?: string | null;
        };
        Update: {
          code?: string;
          created_at?: string | null;
          id?: string;
          name?: string;
          updated_at?: string | null;
        };
        Relationships: [];
      };
      operations: {
        Row: {
          action_id: string;
          amount: number;
          created_at: string | null;
          description: string | null;
          id: string;
          name: string;
          status: string;
          updated_at: string | null;
        };
        Insert: {
          action_id: string;
          amount?: number;
          created_at?: string | null;
          description?: string | null;
          id?: string;
          name: string;
          status?: string;
          updated_at?: string | null;
        };
        Update: {
          action_id?: string;
          amount?: number;
          created_at?: string | null;
          description?: string | null;
          id?: string;
          name?: string;
          status?: string;
          updated_at?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "operations_action_id_fkey";
            columns: ["action_id"];
            isOneToOne: false;
            referencedRelation: "actions";
            referencedColumns: ["id"];
          }
        ];
      };
      payment_requests: {
        Row: {
          amount: number;
          approved_at: string | null;
          created_at: string;
          description: string | null;
          engagement_id: string;
          frequency: string;
          id: string;
          requested_by: string;
          start_date: string;
          status: string;
        };
        Insert: {
          amount: number;
          approved_at?: string | null;
          created_at?: string;
          description?: string | null;
          engagement_id: string;
          frequency: string;
          id?: string;
          requested_by: string;
          start_date: string;
          status?: string;
        };
        Update: {
          amount?: number;
          approved_at?: string | null;
          created_at?: string;
          description?: string | null;
          engagement_id?: string;
          frequency?: string;
          id?: string;
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
          }
        ];
      };
      payments: {
        Row: {
          amount: number;
          created_at: string | null;
          engagement_id: string;
          id: string;
          payment_date: string | null;
          payment_method: string | null;
          payment_reference: string | null;
          status: string;
          updated_at: string | null;
        };
        Insert: {
          amount: number;
          created_at?: string | null;
          engagement_id: string;
          id?: string;
          payment_date?: string | null;
          payment_method?: string | null;
          payment_reference?: string | null;
          status?: string;
          updated_at?: string | null;
        };
        Update: {
          amount?: number;
          created_at?: string | null;
          engagement_id?: string;
          id?: string;
          payment_date?: string | null;
          payment_method?: string | null;
          payment_reference?: string | null;
          status?: string;
          updated_at?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "payments_engagement_id_fkey";
            columns: ["engagement_id"];
            isOneToOne: false;
            referencedRelation: "engagements";
            referencedColumns: ["id"];
          }
        ];
      };
      portfolios: {
        Row: {
          created_at: string | null;
          description: string | null;
          id: string;
          name: string;
          updated_at: string | null;
        };
        Insert: {
          created_at?: string | null;
          description?: string | null;
          id?: string;
          name: string;
          updated_at?: string | null;
        };
        Update: {
          created_at?: string | null;
          description?: string | null;
          id?: string;
          name?: string;
          updated_at?: string | null;
        };
        Relationships: [];
      };
      programs: {
        Row: {
          allocated: number;
          budget: number;
          created_at: string | null;
          description: string | null;
          fiscal_year: number;
          id: string;
          ministry_id: string | null;
          name: string;
          portfolio_id: string | null;
          status: string;
          updated_at: string | null;
        };
        Insert: {
          allocated?: number;
          budget?: number;
          created_at?: string | null;
          description?: string | null;
          fiscal_year: number;
          id?: string;
          ministry_id?: string | null;
          name: string;
          portfolio_id?: string | null;
          status?: string;
          updated_at?: string | null;
        };
        Update: {
          allocated?: number;
          budget?: number;
          created_at?: string | null;
          description?: string | null;
          fiscal_year?: number;
          id?: string;
          ministry_id?: string | null;
          name?: string;
          portfolio_id?: string | null;
          status?: string;
          updated_at?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "programs_ministry_id_fkey";
            columns: ["ministry_id"];
            isOneToOne: false;
            referencedRelation: "ministries";
            referencedColumns: ["id"];
          },
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
          created_at: string | null;
          description: string | null;
          file_path: string | null;
          frequency: string;
          generated_date: string | null;
          id: string;
          report_type: string;
          status: string;
          title: string;
          updated_at: string | null;
        };
        Insert: {
          created_at?: string | null;
          description?: string | null;
          file_path?: string | null;
          frequency: string;
          generated_date?: string | null;
          id?: string;
          report_type: string;
          status?: string;
          title: string;
          updated_at?: string | null;
        };
        Update: {
          created_at?: string | null;
          description?: string | null;
          file_path?: string | null;
          frequency?: string;
          generated_date?: string | null;
          id?: string;
          report_type?: string;
          status?: string;
          title?: string;
          updated_at?: string | null;
        };
        Relationships: [];
      };
      users: {
        Row: {
          created_at: string | null;
          first_name: string | null;
          id: string;
          last_name: string | null;
          ministry_id: string | null;
          role: string;
          updated_at: string | null;
        };
        Insert: {
          created_at?: string | null;
          first_name?: string | null;
          id: string;
          last_name?: string | null;
          ministry_id?: string | null;
          role?: string;
          updated_at?: string | null;
        };
        Update: {
          created_at?: string | null;
          first_name?: string | null;
          id?: string;
          last_name?: string | null;
          ministry_id?: string | null;
          role?: string;
          updated_at?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "users_ministry_id_fkey";
            columns: ["ministry_id"];
            isOneToOne: false;
            referencedRelation: "ministries";
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

type PublicSchema = Database[Extract<keyof Database, "public">];

export type Tables<
  PublicTableNameOrOptions extends keyof (PublicSchema["Tables"] & PublicSchema["Views"]) | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] & Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] & Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R;
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (PublicSchema["Tables"] & PublicSchema["Views"])
  ? (PublicSchema["Tables"] & PublicSchema["Views"])[PublicTableNameOrOptions] extends {
      Row: infer R;
    }
    ? R
    : never
  : never;

export type TablesInsert<
  PublicTableNameOrOptions extends keyof PublicSchema["Tables"] | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I;
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
  ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
      Insert: infer I;
    }
    ? I
    : never
  : never;

export type TablesUpdate<
  PublicTableNameOrOptions extends keyof PublicSchema["Tables"] | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U;
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
  ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
      Update: infer U;
    }
    ? U
    : never
  : never;

export type Enums<
  PublicEnumNameOrOptions extends keyof PublicSchema["Enums"] | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof PublicSchema["Enums"]
  ? PublicSchema["Enums"][PublicEnumNameOrOptions]
  : never;

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends keyof PublicSchema["CompositeTypes"] | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database;
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof PublicSchema["CompositeTypes"]
  ? PublicSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
  : never;
