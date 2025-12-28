// src/core/application/analytics/ports/ESGAnalyticsRepository.ts

import type { ESGMetric } from "../../../domain/analytics/ESGMetric";

export interface GenerateESGMetricsParams {
  /** Inclusive range start */
  from: Date;
  /** Inclusive range end */
  to: Date;
  /** "month" or "year" bucketing */
  granularity: "month" | "year";
}

export interface ESGAnalyticsRepository {
  generateMetrics(params: GenerateESGMetricsParams): Promise<ESGMetric[]>;
}
