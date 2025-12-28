// src/core/domain/analytics/ESGMetric.ts

export type ESGMetricType = "REUSE" | "WASTE_REDUCTION" | "INCIDENT_RATE";

export interface ESGMetricProps {
  id: string;
  type: ESGMetricType;
  value: number;
  period: string; // e.g. "2025-12" for month, "2025" for year
  unit: string; // e.g. "COUNT", "PERCENTAGE"
}

/**
 * ESGMetric is a derived, read-only projection from operational data
 * like loans, returns, incidents and maintenance.
 *
 * IMPORTANT: Metrics are never manually edited or persisted – they are
 * always computed from real data so they can be trusted for reporting.
 */
export class ESGMetric {
  private readonly props: ESGMetricProps;

  private constructor(props: ESGMetricProps) {
    this.props = ESGMetric.validate(props);
  }

  static create(props: ESGMetricProps): ESGMetric {
    return new ESGMetric(props);
  }

  private static validate(props: ESGMetricProps): ESGMetricProps {
    if (!props.id) throw new Error("ESGMetric id is required");
    if (!props.type) throw new Error("ESGMetric type is required");
    if (Number.isNaN(props.value)) throw new Error("ESGMetric value must be a number");
    if (!props.period) throw new Error("ESGMetric period is required");
    if (!props.unit) throw new Error("ESGMetric unit is required");
    return { ...props };
  }

  get id(): string {
    return this.props.id;
  }

  get type(): ESGMetricType {
    return this.props.type;
  }

  get value(): number {
    return this.props.value;
  }

  get period(): string {
    return this.props.period;
  }

  get unit(): string {
    return this.props.unit;
  }
}
