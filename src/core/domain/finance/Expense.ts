// src/core/domain/finance/Expense.ts

import type { SupplierId } from "./Supplier";
import type { ProjectId } from "./ProjectTypes";

export type ExpenseId = string & { readonly brand: unique symbol };

export interface ExpenseProps {
  id: ExpenseId;
  projectId: ProjectId | null;
  supplierId: SupplierId;
  category: string;
  amount: number;
  currency: string;
  incurredAt: Date;
  description: string | null;
  createdAt: Date;
}

export class Expense {
  private constructor(private readonly props: ExpenseProps) {}

  static create(props: ExpenseProps): Expense {
    if (props.amount < 0) {
      throw new Error("Expense amount cannot be negative.");
    }
    if (!props.category || !props.category.trim()) {
      throw new Error("Expense category is required.");
    }
    if (!props.currency || !props.currency.trim()) {
      throw new Error("Expense currency is required.");
    }

    const normalized: ExpenseProps = {
      ...props,
      category: props.category.trim(),
      description: props.description?.trim() ?? null,
      currency: props.currency.trim().toUpperCase(),
    };

    return new Expense(normalized);
  }

  get id(): ExpenseId {
    return this.props.id;
  }

  get projectId(): ProjectId | null {
    return this.props.projectId;
  }

  get supplierId(): SupplierId {
    return this.props.supplierId;
  }

  get category(): string {
    return this.props.category;
  }

  get amount(): number {
    return this.props.amount;
  }

  get currency(): string {
    return this.props.currency;
  }

  get incurredAt(): Date {
    return this.props.incurredAt;
  }

  get description(): string | null {
    return this.props.description;
  }

  get createdAt(): Date {
    return this.props.createdAt;
  }
}
