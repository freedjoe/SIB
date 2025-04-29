export interface Role {
  id: string;
  name: string;
  description: string | null;
  created_at: string;
}

export type NewRole = Omit<Role, "id" | "created_at">;
export type UpdateRole = Partial<NewRole>;
