// src/core/domain/finance/Contract.ts

import type { SupplierId } from "./Supplier";
import type { ProjectId } from "./ProjectTypes";

export type ContractId = string & { readonly brand: unique symbol };

export type ContractStatus = "ACTIVE" | "EXPIRED" | "TERMINATED";

export interface ContractProps {
  id: ContractId;
  supplierId: SupplierId;
  projectId: ProjectId | null;
  title: string;
  description: string | null;
  startDate: Date;
  endDate: Date;
  value: number;
  currency: string;
  status: ContractStatus;
  createdAt: Date;
  updatedAt: Date;
}

export class Contract {
  private constructor(private readonly props: ContractProps) {}

  static create(props: ContractProps): Contract {
    if (!props.title || !props.title.trim()) {
      throw new Error("Contract title is required.");
    }
    if (props.endDate < props.startDate) {
      throw new Error("Contract end date cannot be before start date.");
    }
    if (props.value < 0) {
      throw new Error("Contract value cannot be negative.");
    }
    if (!props.currency || !props.currency.trim()) {
      throw new Error("Contract currency is required.");
    }

    const normalized: ContractProps = {
      ...props,
      title: props.title.trim(),
      description: props.description?.trim() ?? null,
      currency: props.currency.trim().toUpperCase(),
      status: Contract.normalizeStatus(props.status, props.endDate),
    };

    return new Contract(normalized);
  }

  private static normalizeStatus(status: ContractStatus, endDate: Date): ContractStatus {
    const today = new Date();
    const end = new Date(endDate);
    end.setHours(23, 59, 59, 999);

    if (status === "TERMINATED") return "TERMINATED";
    if (end < today) return "EXPIRED";
    return "ACTIVE";
  }

  get id(): ContractId {
    return this.props.id;
  }

  get supplierId(): SupplierId {
    return this.props.supplierId;
  }

  get projectId(): ProjectId | null {
    return this.props.projectId;
  }

  get title(): string {
    return this.props.title;
  }

  get description(): string | null {
    return this.props.description;
  }

  get startDate(): Date {
    return this.props.startDate;
  }

  get endDate(): Date {
    return this.props.endDate;
  }

  get value(): number {
    return this.props.value;
  }

  get currency(): string {
    return this.props.currency;
  }

  get status(): ContractStatus {
    return Contract.normalizeStatus(this.props.status, this.props.endDate);
  }

  get createdAt(): Date {
    return this.props.createdAt;
  }

  get updatedAt(): Date {
    return this.props.updatedAt;
  }
}
