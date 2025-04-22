
import { supabase } from "@/integrations/supabase/client";
import { Tables } from "@/integrations/supabase/types";

export type Payment = Tables<"payments">;

export interface PaymentWithRelations extends Payment {
  engagement?: {
    beneficiary: string;
    requested_by: string;
    montant_approuve?: number;
    montant_demande?: number;
    montant_initial?: number;
    statut?: string;
    operation_id: string;
    operation?: {
      name: string;
    }
  };
}

export async function getAllPayments(): Promise<PaymentWithRelations[]> {
  const { data, error } = await supabase
    .from('payments')
    .select(`
      *,
      engagement:engagement_id (
        beneficiary,
        requested_by,
        montant_approuve,
        montant_demande,
        montant_initial,
        statut,
        operation_id,
        operation:operation_id (name)
      )
    `)
    .order('payment_date', { ascending: false });
  
  if (error) {
    console.error("Error fetching payments:", error);
    throw error;
  }
  
  return data || [];
}

export async function getPaymentsByEngagementId(engagementId: string): Promise<PaymentWithRelations[]> {
  const { data, error } = await supabase
    .from('payments')
    .select(`
      *,
      engagement:engagement_id (
        beneficiary,
        requested_by,
        montant_approuve,
        montant_demande,
        montant_initial,
        statut,
        operation_id,
        operation:operation_id (name)
      )
    `)
    .eq('engagement_id', engagementId)
    .order('payment_date', { ascending: false });
  
  if (error) {
    console.error(`Error fetching payments for engagement ${engagementId}:`, error);
    throw error;
  }
  
  return data || [];
}

export async function getPaymentById(id: string): Promise<PaymentWithRelations | null> {
  const { data, error } = await supabase
    .from('payments')
    .select(`
      *,
      engagement:engagement_id (
        beneficiary,
        requested_by,
        montant_approuve,
        montant_demande,
        montant_initial,
        statut,
        operation_id,
        operation:operation_id (name)
      )
    `)
    .eq('id', id)
    .single();
  
  if (error) {
    console.error(`Error fetching payment with id ${id}:`, error);
    throw error;
  }
  
  return data;
}
