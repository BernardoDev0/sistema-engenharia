// src/core/application/analytics/use-cases/ListAuditLogsUseCase.ts

import type { AuditLog } from "../../../domain/analytics/AuditLog";
import type { AuditLogRepository, ListAuditLogsParams } from "../ports/AuditLogRepository";

export interface ListAuditLogsRequest extends ListAuditLogsParams {}

export interface ListAuditLogsResponse {
  logs: AuditLog[];
}

export class ListAuditLogsUseCase {
  constructor(private readonly auditLogRepository: AuditLogRepository) {}

  async execute(request: ListAuditLogsRequest): Promise<ListAuditLogsResponse> {
    const logs = await this.auditLogRepository.list(request);
    return { logs };
  }
}
