// src/core/application/analytics/use-cases/ListESGMetricsUseCase.ts

import type { ESGMetric } from "../../../domain/analytics/ESGMetric";
import type { ESGAnalyticsRepository } from "../ports/ESGAnalyticsRepository";

export interface ListESGMetricsRequest {
  from: Date;
  to: Date;
  granularity: "month" | "year";
}

export interface ListESGMetricsResponse {
  metrics: ESGMetric[];
}

export class ListESGMetricsUseCase {
  constructor(private readonly analyticsRepository: ESGAnalyticsRepository) {}

  async execute(request: ListESGMetricsRequest): Promise<ListESGMetricsResponse> {
    const metrics = await this.analyticsRepository.generateMetrics(request);
    return { metrics };
  }
}
