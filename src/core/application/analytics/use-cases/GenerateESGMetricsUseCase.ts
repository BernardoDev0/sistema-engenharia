// src/core/application/analytics/use-cases/GenerateESGMetricsUseCase.ts

import type { ESGMetric } from "../../../domain/analytics/ESGMetric";
import type { ESGAnalyticsRepository, GenerateESGMetricsParams } from "../ports/ESGAnalyticsRepository";

export interface GenerateESGMetricsRequest extends GenerateESGMetricsParams {}

export interface GenerateESGMetricsResponse {
  metrics: ESGMetric[];
}

export class GenerateESGMetricsUseCase {
  constructor(private readonly analyticsRepository: ESGAnalyticsRepository) {}

  async execute(request: GenerateESGMetricsRequest): Promise<GenerateESGMetricsResponse> {
    const metrics = await this.analyticsRepository.generateMetrics(request);
    return { metrics };
  }
}
