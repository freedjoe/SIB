import { supabase } from "@/integrations/supabase/client";
import { Tables } from "@/integrations/supabase/types";

export type AuditLog = Tables<"audit_logs">;

export type ChangeValue = string | number | boolean | null | undefined;

export interface Changes {
  before: Record<string, ChangeValue>;
  after: Record<string, ChangeValue>;
}

export interface AuditLogWithRelations extends Omit<AuditLog, "old_values" | "new_values"> {
  user?: {
    name: string;
    role: string;
  };
  changes: Changes;
}

export type EntityType = "engagement" | "payment" | "cp_forecast" | "payment_request" | "engagement_reevaluation";

export interface AuditLogEntry {
  entity_type: EntityType;
  entity_id: string;
  action: string;
  user_id: string;
  changes: Changes;
  metadata?: Record<string, unknown>;
}

export async function createAuditLog(entry: AuditLogEntry): Promise<AuditLog> {
  const { data, error } = await supabase
    .from("audit_logs")
    .insert({
      entity_type: entry.entity_type,
      entity_id: entry.entity_id,
      action: entry.action,
      user_id: entry.user_id,
      old_values: entry.changes.before,
      new_values: entry.changes.after,
      metadata: entry.metadata,
      created_at: new Date().toISOString(),
    })
    .select()
    .single();

  if (error) {
    console.error("Error creating audit log:", error);
    throw error;
  }

  return data;
}

function parseJsonValue(value: unknown): Record<string, ChangeValue> {
  if (typeof value === "object" && value !== null) {
    return Object.entries(value).reduce((acc, [key, val]) => {
      acc[key] = val as ChangeValue;
      return acc;
    }, {} as Record<string, ChangeValue>);
  }
  return {};
}

function isValidUser(user: unknown): user is { name: string; role: string } {
  return typeof user === "object" && user !== null && !("error" in user) && "name" in user && "role" in user;
}

export async function getAuditLogsByEntity(entityType: EntityType, entityId: string): Promise<AuditLogWithRelations[]> {
  const { data, error } = await supabase
    .from("audit_logs")
    .select(
      `
      *,
      user:user_id (
        name,
        role
      )
    `
    )
    .eq("entity_type", entityType)
    .eq("entity_id", entityId)
    .order("created_at", { ascending: false });

  if (error) {
    console.error(`Error fetching audit logs for ${entityType} ${entityId}:`, error);
    throw error;
  }

  return (data || []).map((log) => ({
    ...log,
    user: isValidUser(log.user)
      ? {
          name: String(log.user.name || ""),
          role: String(log.user.role || ""),
        }
      : undefined,
    changes: {
      before: parseJsonValue(log.old_values),
      after: parseJsonValue(log.new_values),
    },
  }));
}

export async function getAuditLogsByEntityType(entityType: EntityType, limit: number = 100): Promise<AuditLogWithRelations[]> {
  const { data, error } = await supabase
    .from("audit_logs")
    .select(
      `
      *,
      user:user_id (
        name,
        role
      )
    `
    )
    .eq("entity_type", entityType)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) {
    console.error(`Error fetching audit logs for ${entityType}:`, error);
    throw error;
  }

  return (data || []).map((log) => ({
    ...log,
    user: isValidUser(log.user)
      ? {
          name: String(log.user.name || ""),
          role: String(log.user.role || ""),
        }
      : undefined,
    changes: {
      before: parseJsonValue(log.old_values),
      after: parseJsonValue(log.new_values),
    },
  }));
}
