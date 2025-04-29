import { supabase } from "@/lib/supabase";
import { Tables } from "@/integrations/supabase/types";

export type Portfolio = Tables<"portfolios">;

export async function getAllPortfolios(): Promise<Portfolio[]> {
  const { data, error } = await supabase.from("portfolios").select("*").order("name");

  if (error) {
    console.error("Error fetching portfolios:", error);
    throw error;
  }

  return data || [];
}

export async function getPortfolioById(id: string): Promise<Portfolio | null> {
  const { data, error } = await supabase.from("portfolios").select("*").eq("id", id).single();

  if (error) {
    console.error(`Error fetching portfolio with id ${id}:`, error);
    throw error;
  }

  return data;
}
