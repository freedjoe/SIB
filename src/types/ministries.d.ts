export interface Ministry {
  id: string;
  code: string;
  name_ar: string | null;
  name_en: string | null;
  name_fr: string; // NOT NULL in database
  address: string | null;
  email: string | null;
  phone: string | null;
  phone2: string | null;
  fax: string | null;
  fax2: string | null;
  is_active: boolean;
  parent_id: string | null; // UUID reference to parent ministry
  description: string | null;
  created_at: string;
}

// Utility type for creating a new ministry
export type NewMinistry = Omit<Ministry, "id" | "created_at">;

// Utility type for updating a ministry
export type UpdateMinistry = Partial<NewMinistry>;

// Interface for ministry with nested relations
export interface MinistryWithRelations extends Ministry {
  parent?: Ministry;
  children?: Ministry[];
}
