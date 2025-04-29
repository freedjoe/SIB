export interface Enterprise {
  id: string;
  name: string;
  nif: string | null;
  rc: string | null;
  address: string | null;
  phone: string | null;
  email: string | null;
  created_at: string;
}

export type NewEnterprise = Omit<Enterprise, "id" | "created_at">;
export type UpdateEnterprise = Partial<NewEnterprise>;
