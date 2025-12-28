// src/core/application/analytics/use-cases/ExportESGReportUseCase.ts

import type { ESGMetric } from "../../../domain/analytics/ESGMetric";
import type { ESGAnalyticsRepository } from "../ports/ESGAnalyticsRepository";

export interface ExportESGReportRequest {
  from: Date;
  to: Date;
  granularity: "month" | "year";
  format: "csv" | "pdf";
}

export interface ExportESGReportResponse {
  /** For CSV this is text, for PDF this is a base64-encoded binary string. */
  content: string;
  mimeType: string;
  fileName: string;
}

export class ExportESGReportUseCase {
  constructor(private readonly analyticsRepository: ESGAnalyticsRepository) {}

  async execute(request: ExportESGReportRequest): Promise<ExportESGReportResponse> {
    const metrics = await this.analyticsRepository.generateMetrics(request);

    if (request.format === "csv") {
      const header = "type,period,unit,value";
      const rows = metrics.map((m) => `${m.type},${m.period},${m.unit},${m.value}`);
      const content = [header, ...rows].join("\n");
      return {
        content,
        mimeType: "text/csv",
        fileName: "esg-report.csv",
      };
    }

    // For PDF we return a simple text representation; the presentation
    // layer can render/print it to an actual PDF via the browser.
    const lines = metrics.map((m) => `${m.period} ${m.type}: ${m.value} ${m.unit}`);
    const content = lines.join("\n");

    return {
      content,
      mimeType: "text/plain",
      fileName: "esg-report.txt",
    };
  }
}
