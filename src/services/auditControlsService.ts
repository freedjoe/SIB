import { supabase } from "@/lib/supabase";
import { Tables } from "@/integrations/supabase/types";

export type AuditControl = Tables<"audit_controls">;

export async function getAllAuditControls(): Promise<AuditControl[]> {
  const { data, error } = await supabase.from("audit_controls").select("*").order("control_date", { ascending: false });

  if (error) {
    console.error("Error fetching audit controls:", error);
    throw error;
  }

  return data || [];
}

export async function getAuditControlsByEntityType(entityType: string): Promise<AuditControl[]> {
  const { data, error } = await supabase.from("audit_controls").select("*").eq("entity_type", entityType).order("control_date", { ascending: false });

  if (error) {
    console.error(`Error fetching audit controls for entity type ${entityType}:`, error);
    throw error;
  }

  return data || [];
}

export async function getAuditControlById(id: string): Promise<AuditControl | null> {
  const { data, error } = await supabase.from("audit_controls").select("*").eq("id", id).single();

  if (error) {
    console.error(`Error fetching audit control with id ${id}:`, error);
    throw error;
  }

  return data;
}
