import { supabase } from "@/lib/supabase";
import { Tables } from "@/integrations/supabase/types";

export type Entreprise = Tables<"entreprises">;

export interface EntrepriseWithUsers extends Entreprise {
  users?: {
    id: string;
    username: string;
    email: string;
    first_name: string;
    last_name: string;
    role: {
      name: string;
    };
  }[];
}

export async function getAllEntreprises(): Promise<EntrepriseWithUsers[]> {
  const { data, error } = await supabase
    .from("entreprises")
    .select(
      `
      *,
      users (
        id,
        username,
        email,
        first_name,
        last_name,
        role:role_id (name)
      )
    `
    )
    .order("name", { ascending: true });

  if (error) {
    console.error("Error fetching entreprises:", error);
    throw error;
  }

  return data || [];
}

export async function getEntrepriseById(id: string): Promise<EntrepriseWithUsers | null> {
  const { data, error } = await supabase
    .from("entreprises")
    .select(
      `
      *,
      users (
        id,
        username,
        email,
        first_name,
        last_name,
        role:role_id (name)
      )
    `
    )
    .eq("id", id)
    .single();

  if (error) {
    console.error(`Error fetching entreprise with id ${id}:`, error);
    throw error;
  }

  return data;
}

export async function createEntreprise(entreprise: Omit<Entreprise, "id" | "created_at" | "updated_at">): Promise<Entreprise> {
  const { data, error } = await supabase.from("entreprises").insert(entreprise).select().single();

  if (error) {
    console.error("Error creating entreprise:", error);
    throw error;
  }

  return data;
}

export async function updateEntreprise(id: string, entreprise: Partial<Omit<Entreprise, "id" | "created_at" | "updated_at">>): Promise<Entreprise> {
  const { data, error } = await supabase.from("entreprises").update(entreprise).eq("id", id).select().single();

  if (error) {
    console.error(`Error updating entreprise with id ${id}:`, error);
    throw error;
  }

  return data;
}

export async function deleteEntreprise(id: string): Promise<void> {
  const { error } = await supabase.from("entreprises").delete().eq("id", id);

  if (error) {
    console.error(`Error deleting entreprise with id ${id}:`, error);
    throw error;
  }
}

export async function getEntrepriseByCode(code: string): Promise<Entreprise | null> {
  const { data, error } = await supabase.from("entreprises").select("*").eq("code", code).single();

  if (error) {
    console.error(`Error fetching entreprise with code ${code}:`, error);
    throw error;
  }

  return data;
}
