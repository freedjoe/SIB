export interface Action {
  id: string;
  name: string;
  description?: string;
  program_id: string;
  code: string;
  type: "Centralized" | "Decentralized" | "Unique" | "Programmed" | "Complementary";
  allocated_ae: number;
  allocated_cp: number;
  status: "draft" | "active" | "archived";
  created_at: string;
}
