// src/core/infrastructure/analytics/repositories/SupabaseAnalyticsRepository.ts

import { ESGMetric, type ESGMetricType } from "../../../domain/analytics/ESGMetric";
import type {
  ESGAnalyticsRepository,
  GenerateESGMetricsParams,
} from "../../../application/analytics/ports/ESGAnalyticsRepository";
import { supabase } from "../../supabase/client";
import type { Database } from "../../supabase/types";

// Local alias for table types
type DbLoan = Database["public"]["Tables"]["loans"]["Row"];

type Bucket = "month" | "year";

function formatPeriod(date: Date, granularity: Bucket): string {
  if (granularity === "year") {
    return `${date.getUTCFullYear()}`;
  }
  const month = String(date.getUTCMonth() + 1).padStart(2, "0");
  return `${date.getUTCFullYear()}-${month}`;
}

export class SupabaseAnalyticsRepository implements ESGAnalyticsRepository {
  async generateMetrics(params: GenerateESGMetricsParams) {
    const { from, to, granularity } = params;

    const { data, error } = await supabase
      .from("loans")
      .select("created_at,status,quantity")
      .gte("created_at", from.toISOString())
      .lte("created_at", to.toISOString());

    if (error) {
      throw new Error(`Failed to load data for ESG metrics: ${error.message}`);
    }

    const loans: DbLoan[] = (data as DbLoan[]) ?? [];

    const buckets = new Map<
      string,
      {
        totalQuantity: number;
        damagedQuantity: number;
        returnedQuantity: number;
      }
    >();

    for (const loan of loans) {
      const createdAt = new Date(loan.created_at);
      const bucketKey = formatPeriod(createdAt, granularity);
      const bucket =
        buckets.get(bucketKey) ??
        {
          totalQuantity: 0,
          damagedQuantity: 0,
          returnedQuantity: 0,
        };

      bucket.totalQuantity += loan.quantity;
      if (loan.status === "DAMAGED") {
        bucket.damagedQuantity += loan.quantity;
      }
      if (loan.status === "RETURNED") {
        bucket.returnedQuantity += loan.quantity;
      }

      buckets.set(bucketKey, bucket);
    }

    const metrics: ESGMetric[] = [];

    for (const [period, bucket] of buckets.entries()) {
      const baseId = period;

      metrics.push(
        ESGMetric.create({
          id: `${baseId}-REUSE`,
          type: "REUSE",
          value: bucket.totalQuantity,
          period,
          unit: "COUNT",
        }),
      );

      const totalHandled = bucket.returnedQuantity + bucket.damagedQuantity;
      const wasteReductionValue =
        totalHandled > 0 ? ((bucket.returnedQuantity / totalHandled) * 100) : 0;

      metrics.push(
        ESGMetric.create({
          id: `${baseId}-WASTE_REDUCTION`,
          type: "WASTE_REDUCTION",
          value: Number(wasteReductionValue.toFixed(2)),
          period,
          unit: "PERCENTAGE",
        }),
      );

      const incidentRateValue =
        totalHandled > 0 ? ((bucket.damagedQuantity / totalHandled) * 100) : 0;

      metrics.push(
        ESGMetric.create({
          id: `${baseId}-INCIDENT_RATE`,
          type: "INCIDENT_RATE",
          value: Number(incidentRateValue.toFixed(2)),
          period,
          unit: "PERCENTAGE",
        }),
      );
    }

    return metrics;
  }
}
