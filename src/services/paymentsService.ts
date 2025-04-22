
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
  
  // Ensure all required properties exist on each engagement object
  return (data || []).map(payment => {
    if (payment.engagement) {
      return {
        ...payment,
        engagement: {
          ...payment.engagement,
          montant_approuve: payment.engagement.montant_approuve || null,
          montant_demande: payment.engagement.montant_demande || 0,
          montant_initial: payment.engagement.montant_initial || 0,
          statut: payment.engagement.statut || 'En attente'
        }
      };
    }
    return payment;
  });
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
  
  // Ensure all required properties exist on each engagement object
  return (data || []).map(payment => {
    if (payment.engagement) {
      return {
        ...payment,
        engagement: {
          ...payment.engagement,
          montant_approuve: payment.engagement.montant_approuve || null,
          montant_demande: payment.engagement.montant_demande || 0,
          montant_initial: payment.engagement.montant_initial || 0,
          statut: payment.engagement.statut || 'En attente'
        }
      };
    }
    return payment;
  });
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
  
  if (data && data.engagement) {
    return {
      ...data,
      engagement: {
        ...data.engagement,
        montant_approuve: data.engagement.montant_approuve || null,
        montant_demande: data.engagement.montant_demande || 0,
        montant_initial: data.engagement.montant_initial || 0,
        statut: data.engagement.statut || 'En attente'
      }
    };
  }
  
  return data;
}
