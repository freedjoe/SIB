import { db } from "../db";

export interface AuditLog {
  id: number;
  action: string;
  table_name: string;
  record_id: number;
  user_id: string;
  details: Record<string, unknown>;
  created_at: Date;
}

export async function logAudit(params: Omit<AuditLog, "id" | "created_at">): Promise<void> {
  const { action, table_name, record_id, user_id, details } = params;

  await db.query(
    `INSERT INTO audit_logs (action, table_name, record_id, user_id, details)
     VALUES ($1, $2, $3, $4, $5)`,
    [action, table_name, record_id, user_id, JSON.stringify(details)]
  );
}
