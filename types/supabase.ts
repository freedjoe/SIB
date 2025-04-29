export interface Database {
  public: {
    Tables: {
      programs: {
        Row: {
          id: string;
          name: string;
          code: string | null;
          description: string | null;
          budget: number | null;
          allocated: number | null;
          fiscal_year: number | null;
          portfolio_id: string | null;
          created_at: string;
        };
        Insert: Omit<Tables["programs"]["Row"], "id" | "created_at">;
        Update: Partial<Tables["programs"]["Insert"]>;
      };
    };
  };
}
