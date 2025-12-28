// src/core/application/analytics/ports/AuditLogRepository.ts

import type { AuditLog } from "../../../domain/analytics/AuditLog";
import type { UserId } from "../../../domain/identity/User";

export interface CreateAuditLogParams {
  action: string;
  entityType: string;
  entityId?: string | null;
  performedByUserId: UserId;
  metadata?: Record<string, unknown> | null;
}

export interface ListAuditLogsParams {
  limit?: number;
  offset?: number;
}

export interface AuditLogRepository {
  create(params: CreateAuditLogParams): Promise<AuditLog>;
  list(params: ListAuditLogsParams): Promise<AuditLog[]>;
}
