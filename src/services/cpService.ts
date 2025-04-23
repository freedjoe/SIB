import { supabase } from "@/integrations/supabase/client";
import { Tables } from "@/integrations/supabase/types";
import { createAuditLog, type AuditLogEntry } from "./auditLogService";

// Types
export type CPForecast = Tables<"cp_forecasts">;

// Core service functions
export async function createForecast(forecast: Omit<CPForecast, "id" | "created_at">): Promise<CPForecast> {
  const { data, error } = await supabase
    .from("cp_forecasts")
    .insert([
      {
        operation_id: forecast.operation_id,
        engagement_id: forecast.engagement_id,
        program_id: forecast.program_id,
        year: forecast.year,
        quarter: forecast.quarter,
        amount: forecast.amount,
        status: "draft",
        requested_by: forecast.requested_by,
        description: forecast.description,
      },
    ])
    .select()
    .single();

  if (error) {
    console.error("Error creating CP forecast:", error);
    throw error;
  }

  // Log the action
  await createAuditLog({
    action: "CREATE_FORECAST",
    user_id: forecast.requested_by,
    entity_type: "cp_forecast",
    entity_id: data.id,
    changes: {
      before: {},
      after: {
        forecast_id: data.id,
        operation_id: forecast.operation_id,
        engagement_id: forecast.engagement_id,
        program_id: forecast.program_id,
        year: forecast.year,
        quarter: forecast.quarter,
        amount: forecast.amount,
      },
    },
  });

  return data;
}

export async function updateForecast(id: string, updates: Partial<CPForecast>, userId: string): Promise<CPForecast> {
  const { data, error } = await supabase.from("cp_forecasts").update(updates).eq("id", id).select().single();

  if (error) {
    console.error("Error updating CP forecast:", error);
    throw error;
  }

  // Log the action
  await createAuditLog({
    action: "UPDATE_FORECAST",
    user_id: userId,
    entity_type: "cp_forecast",
    entity_id: id,
    changes: {
      before: {},
      after: {
        forecast_id: id,
        ...updates,
      },
    },
  });

  return data;
}

export async function submitForecast(forecastId: string, userId: string): Promise<CPForecast> {
  // Get the current forecast
  const { data: forecast, error: fetchError } = await supabase.from("cp_forecasts").select().eq("id", forecastId).single();

  if (fetchError) {
    console.error("Error fetching CP forecast:", fetchError);
    throw fetchError;
  }

  // Update the forecast status to "submitted"
  const { data, error } = await supabase
    .from("cp_forecasts")
    .update({
      status: "submitted",
      requested_by: userId,
    })
    .eq("id", forecastId)
    .select()
    .single();

  if (error) {
    console.error("Error submitting forecast:", error);
    throw error;
  }

  // Log the action
  await createAuditLog({
    action: "SUBMIT_FORECAST",
    user_id: userId,
    entity_type: "cp_forecast",
    entity_id: forecastId,
    changes: {
      before: {},
      after: {
        forecast_id: forecastId,
        amount: forecast.amount,
        status: "submitted",
      },
    },
  });

  return data;
}

export async function approveForecast(forecastId: string, userId: string): Promise<CPForecast> {
  // Get the forecast
  const { data: forecast, error: fetchError } = await supabase.from("cp_forecasts").select().eq("id", forecastId).single();

  if (fetchError) {
    console.error("Error fetching forecast:", fetchError);
    throw fetchError;
  }

  // Update the forecast status
  const { data, error } = await supabase
    .from("cp_forecasts")
    .update({
      status: "approved",
    })
    .eq("id", forecastId)
    .select()
    .single();

  if (error) {
    console.error("Error approving forecast:", error);
    throw error;
  }

  // Log the action
  await createAuditLog({
    action: "APPROVE_FORECAST",
    user_id: userId,
    entity_type: "cp_forecast",
    entity_id: forecastId,
    changes: {
      before: {},
      after: {
        forecast_id: forecastId,
        amount: forecast.amount,
        status: "approved",
      },
    },
  });

  return data;
}

export async function rejectForecast(forecastId: string, reason: string, userId: string): Promise<CPForecast> {
  // Get the forecast
  const { data: forecast, error: fetchError } = await supabase.from("cp_forecasts").select().eq("id", forecastId).single();

  if (fetchError) {
    console.error("Error fetching forecast:", fetchError);
    throw fetchError;
  }

  // Update the forecast status
  const { data, error } = await supabase
    .from("cp_forecasts")
    .update({
      status: "rejected",
      description: reason,
    })
    .eq("id", forecastId)
    .select()
    .single();

  if (error) {
    console.error("Error rejecting forecast:", error);
    throw error;
  }

  // Log the action
  await createAuditLog({
    action: "REJECT_FORECAST",
    user_id: userId,
    entity_type: "cp_forecast",
    entity_id: forecastId,
    changes: {
      before: {},
      after: {
        forecast_id: forecastId,
        reason,
        amount: forecast.amount,
        status: "rejected",
      },
    },
  });

  return data;
}

export async function getForecastsByProgram(programId: string): Promise<CPForecast[]> {
  const { data, error } = await supabase.from("cp_forecasts").select().eq("program_id", programId).order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching forecasts by program:", error);
    throw error;
  }

  return data || [];
}

export async function getForecastsByYear(year: number): Promise<CPForecast[]> {
  const { data, error } = await supabase.from("cp_forecasts").select().eq("year", year).order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching forecasts by year:", error);
    throw error;
  }

  return data || [];
}

interface CPDashboardData {
  totalForecasts: number;
  totalApproved: number;
  totalRejected: number;
  forecastsByStatus: Record<string, number>;
  forecastsByQuarter: Record<string, number>;
  totalAmount: number;
}

export async function getCPDashboard(year: number): Promise<CPDashboardData> {
  // Get forecasts by year
  const { data: forecasts, error: forecastsError } = await supabase.from("cp_forecasts").select().eq("year", year);

  if (forecastsError) {
    console.error("Error fetching forecasts:", forecastsError);
    throw forecastsError;
  }

  // Calculate totals and groupings
  const forecastsByStatus = forecasts.reduce((acc, forecast) => {
    acc[forecast.status] = (acc[forecast.status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const forecastsByQuarter = forecasts.reduce((acc, forecast) => {
    acc[forecast.quarter] = (acc[forecast.quarter] || 0) + forecast.amount;
    return acc;
  }, {} as Record<string, number>);

  const totalAmount = forecasts.reduce((sum, forecast) => sum + forecast.amount, 0);

  return {
    totalForecasts: forecasts.length,
    totalApproved: forecastsByStatus["approved"] || 0,
    totalRejected: forecastsByStatus["rejected"] || 0,
    forecastsByStatus,
    forecastsByQuarter,
    totalAmount,
  };
}
