// src/core/infrastructure/analytics/repositories/SupabaseAuditLogRepository.ts

import { AuditLog } from "../../../domain/analytics/AuditLog";
import type {
  AuditLogRepository,
  CreateAuditLogParams,
  ListAuditLogsParams,
} from "../../../application/analytics/ports/AuditLogRepository";
import type { UserId } from "../../../domain/identity/User";
import { supabase } from "../../supabase/client";

// NOTE: The generated Supabase types may not yet include the audit_logs table.
// To avoid coupling to a potentially stale type definition, we keep the row
// typing lightweight here.

type DbAuditLog = any;

export class SupabaseAuditLogRepository implements AuditLogRepository {
  async create(params: CreateAuditLogParams) {
    const { action, entityType, entityId = null, performedByUserId, metadata = null } = params;

    const { data, error } = (supabase.from("audit_logs") as any)
      .insert({
        action,
        entity_type: entityType,
        entity_id: entityId,
        performed_by_user_id: performedByUserId,
        metadata,
      })
      .select("*")
      .maybeSingle();

    if (error) {
      throw new Error(`Failed to create audit log: ${error.message}`);
    }

    if (!data) {
      throw new Error("Audit log insert did not return data");
    }

    return mapRowToAuditLog(data as DbAuditLog);
  }

  async list(params: ListAuditLogsParams) {
    const limit = params.limit ?? 100;
    const offset = params.offset ?? 0;

    const { data, error } = (supabase.from("audit_logs") as any)
      .select("*")
      .order("created_at", { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) {
      throw new Error(`Failed to list audit logs: ${error.message}`);
    }

    return (data as DbAuditLog[]).map(mapRowToAuditLog);
  }
}

function mapRowToAuditLog(row: DbAuditLog): AuditLog {
  return AuditLog.create({
    id: row.id,
    action: row.action,
    entityType: row.entity_type,
    entityId: row.entity_id ?? null,
    performedByUserId: row.performed_by_user_id as UserId,
    createdAt: new Date(row.created_at),
    metadata: (row as any).metadata ?? null,
  });
}
