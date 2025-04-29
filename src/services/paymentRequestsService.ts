import { supabase } from "@/lib/supabase";
import { Tables } from "@/integrations/supabase/types";

export type PaymentRequest = Tables<"payment_requests">;

export interface PaymentRequestWithRelations extends PaymentRequest {
  engagement?: {
    beneficiary: string;
    requested_by: string;
    operation_id: string;
    operation?: {
      name: string;
      action_id: string | null;
      action?: {
        name: string;
        program_id: string;
        program?: {
          name: string;
        };
      };
    };
  };
}

export async function getAllPaymentRequests(): Promise<PaymentRequestWithRelations[]> {
  const { data, error } = await supabase
    .from("payment_requests")
    .select(
      `
      *,
      engagement:engagement_id (
        beneficiary,
        requested_by,
        operation_id,
        operation:operation_id (
          name,
          action_id,
          action:action_id (
            name,
            program_id,
            program:program_id (name)
          )
        )
      )
    `
    )
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching payment requests:", error);
    throw error;
  }

  return data || [];
}

export async function getPaymentRequestById(id: string): Promise<PaymentRequestWithRelations | null> {
  const { data, error } = await supabase
    .from("payment_requests")
    .select(
      `
      *,
      engagement:engagement_id (
        beneficiary,
        requested_by,
        montant_approuve,
        montant_demande,
        montant_initial,
        statut,
        operation_id,
        operation:operation_id (
          name,
          action_id,
          action:action_id (
            name,
            program_id,
            program:program_id (name)
          )
        )
      )
    `
    )
    .eq("id", id)
    .single();

  if (error) {
    console.error(`Error fetching payment request with id ${id}:`, error);
    throw error;
  }

  return data;
}

export async function getPaymentRequestsByStatus(status: string): Promise<PaymentRequestWithRelations[]> {
  const { data, error } = await supabase
    .from("payment_requests")
    .select(
      `
      *,
      engagement:engagement_id (
        beneficiary,
        requested_by,
        operation_id,
        operation:operation_id (
          name,
          action_id,
          action:action_id (
            name,
            program_id,
            program:program_id (name)
          )
        )
      )
    `
    )
    .eq("status", status)
    .order("created_at", { ascending: false });

  if (error) {
    console.error(`Error fetching payment requests with status ${status}:`, error);
    throw error;
  }

  return data || [];
}

export async function createPaymentRequest(paymentRequest: Omit<PaymentRequest, "id" | "created_at">): Promise<PaymentRequest> {
  const { data, error } = await supabase.from("payment_requests").insert(paymentRequest).select().single();

  if (error) {
    console.error("Error creating payment request:", error);
    throw error;
  }

  return data;
}

export async function updatePaymentRequestStatus(id: string, status: string, approved_date?: string): Promise<void> {
  const updateData: { status: string; approved_date?: string } = { status };

  if (status === "approved" && approved_date) {
    updateData.approved_date = approved_date;
  }

  const { error } = await supabase.from("payment_requests").update(updateData).eq("id", id);

  if (error) {
    console.error(`Error updating payment request status for id ${id}:`, error);
    throw error;
  }
}

export async function deletePaymentRequest(id: string): Promise<void> {
  const { error } = await supabase.from("payment_requests").delete().eq("id", id);

  if (error) {
    console.error(`Error deleting payment request with id ${id}:`, error);
    throw error;
  }
}

export async function getPaymentRequestStats(): Promise<{
  total: number;
  pending: number;
  approved: number;
  rejected: number;
  monthlyTotal: number;
  quarterlyTotal: number;
  annualTotal: number;
  count: number;
}> {
  try {
    const [allData, pendingOfficerData, pendingAccountantData, approvedData, rejectedData] = await Promise.all([
      supabase.from("payment_requests").select("id, amount, frequency"),
      supabase.from("payment_requests").select("amount").eq("status", "pending_officer"),
      supabase.from("payment_requests").select("amount").eq("status", "pending_accountant"),
      supabase.from("payment_requests").select("amount").eq("status", "approved"),
      supabase.from("payment_requests").select("amount").eq("status", "rejected"),
    ]);

    const data = allData.data || [];
    const monthlyData = data.filter((item) => item.frequency === "monthly");
    const quarterlyData = data.filter((item) => item.frequency === "quarterly");
    const annualData = data.filter((item) => item.frequency === "annual");

    const sumAmount = (items: any[]) => items.reduce((sum, item) => sum + Number(item.amount), 0);

    return {
      total: sumAmount(data),
      pending: sumAmount(pendingOfficerData.data || []) + sumAmount(pendingAccountantData.data || []),
      approved: sumAmount(approvedData.data || []),
      rejected: sumAmount(rejectedData.data || []),
      monthlyTotal: sumAmount(monthlyData),
      quarterlyTotal: sumAmount(quarterlyData),
      annualTotal: sumAmount(annualData),
      count: data.length,
    };
  } catch (error) {
    console.error("Error fetching payment request stats:", error);
    return {
      total: 0,
      pending: 0,
      approved: 0,
      rejected: 0,
      monthlyTotal: 0,
      quarterlyTotal: 0,
      annualTotal: 0,
      count: 0,
    };
  }
}
