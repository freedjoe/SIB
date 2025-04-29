export interface Portfolio {
  id: string;
  name: string;
  code: string;
  description?: string;
  ministry_id: string;
  allocated_ae: number;
  allocated_cp: number;
  status: "draft" | "active" | "archived";
  created_at: string;
}
