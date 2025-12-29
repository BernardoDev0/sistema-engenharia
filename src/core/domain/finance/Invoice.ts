// src/core/domain/finance/Invoice.ts

import type { SupplierId } from "./Supplier";
import type { ContractId } from "./Contract";

export type InvoiceId = string & { readonly brand: unique symbol };

export type InvoiceStatus = "PENDING" | "PAID" | "OVERDUE";

export interface InvoiceProps {
  id: InvoiceId;
  supplierId: SupplierId;
  contractId: ContractId;
  amount: number;
  currency: string;
  dueDate: Date;
  status: InvoiceStatus;
  documentUrl: string;
  createdAt: Date;
}

export class Invoice {
  private constructor(private readonly props: InvoiceProps) {}

  static create(props: InvoiceProps): Invoice {
    if (props.amount < 0) {
      throw new Error("Invoice amount cannot be negative.");
    }
    if (!props.currency || !props.currency.trim()) {
      throw new Error("Invoice currency is required.");
    }
    if (!props.documentUrl || !props.documentUrl.trim()) {
      throw new Error("Invoice document URL is required.");
    }

    const normalized: InvoiceProps = {
      ...props,
      currency: props.currency.trim().toUpperCase(),
      documentUrl: props.documentUrl.trim(),
      status: Invoice.normalizeStatus(props.status, props.dueDate),
    };

    return new Invoice(normalized);
  }

  private static normalizeStatus(status: InvoiceStatus, dueDate: Date): InvoiceStatus {
    if (status === "PAID") return "PAID";

    const today = new Date();
    const due = new Date(dueDate);
    due.setHours(23, 59, 59, 999);

    if (due < today) return "OVERDUE";
    return "PENDING";
  }

  get id(): InvoiceId {
    return this.props.id;
  }

  get supplierId(): SupplierId {
    return this.props.supplierId;
  }

  get contractId(): ContractId {
    return this.props.contractId;
  }

  get amount(): number {
    return this.props.amount;
  }

  get currency(): string {
    return this.props.currency;
  }

  get dueDate(): Date {
    return this.props.dueDate;
  }

  get status(): InvoiceStatus {
    return Invoice.normalizeStatus(this.props.status, this.props.dueDate);
  }

  get documentUrl(): string {
    return this.props.documentUrl;
  }

  get createdAt(): Date {
    return this.props.createdAt;
  }
}
