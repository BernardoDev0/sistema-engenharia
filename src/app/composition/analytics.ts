// src/app/composition/analytics.ts

import { SupabaseAnalyticsRepository } from "@/core/infrastructure/analytics/repositories/SupabaseAnalyticsRepository";
import { SupabaseAuditLogRepository } from "@/core/infrastructure/analytics/repositories/SupabaseAuditLogRepository";
import { GenerateESGMetricsUseCase } from "@/core/application/analytics/use-cases/GenerateESGMetricsUseCase";
import { ListESGMetricsUseCase } from "@/core/application/analytics/use-cases/ListESGMetricsUseCase";
import { ExportESGReportUseCase } from "@/core/application/analytics/use-cases/ExportESGReportUseCase";
import { ListAuditLogsUseCase } from "@/core/application/analytics/use-cases/ListAuditLogsUseCase";

const analyticsRepository = new SupabaseAnalyticsRepository();
const auditLogRepository = new SupabaseAuditLogRepository();

export const generateESGMetricsUseCase = new GenerateESGMetricsUseCase(analyticsRepository);
export const listESGMetricsUseCase = new ListESGMetricsUseCase(analyticsRepository);
export const exportESGReportUseCase = new ExportESGReportUseCase(analyticsRepository);
export const listAuditLogsUseCase = new ListAuditLogsUseCase(auditLogRepository);

export { auditLogRepository };
