export interface Action {
  id: string;
  name: string;
  description?: string;
  program_id: string;
  code_action: string;
  created_at: string;
}
