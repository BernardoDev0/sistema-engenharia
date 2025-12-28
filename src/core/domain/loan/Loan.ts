// src/core/domain/loan/Loan.ts

import type { UserId } from "../identity/User";
import type { EquipmentId } from "../equipment/Equipment";

export type LoanId = string & { readonly __brand: "LoanId" };

export type LoanStatus = "ACTIVE" | "RETURNED" | "DAMAGED";

export interface LoanProps {
  id: LoanId;
  userId: UserId;
  equipmentId: EquipmentId;
  quantity: number;
  status: LoanStatus;
  createdAt: Date;
  returnedAt: Date | null;
  damageComment: string | null;
}

/**
 * Loan entity representing equipment borrowed by a user.
 *
 * Business rules:
 * - Quantity must be positive
 * - If status is DAMAGED, damageComment is mandatory
 * - RETURNED and DAMAGED loans must have returnedAt timestamp
 * - ACTIVE loans cannot have returnedAt timestamp
 */
export class Loan {
  private readonly props: LoanProps;

  private constructor(props: LoanProps) {
    this.props = Loan.validate(props);
  }

  static create(props: LoanProps): Loan {
    return new Loan(props);
  }

  private static validate(props: LoanProps): LoanProps {
    if (props.quantity <= 0) {
      throw new Error("Loan quantity must be positive.");
    }

    if (props.status === "DAMAGED" && !props.damageComment) {
      throw new Error("Damage comment is required when status is DAMAGED.");
    }

    if ((props.status === "RETURNED" || props.status === "DAMAGED") && !props.returnedAt) {
      throw new Error("Returned loans must have a returnedAt timestamp.");
    }

    if (props.status === "ACTIVE" && props.returnedAt) {
      throw new Error("Active loans cannot have a returnedAt timestamp.");
    }

    return { ...props };
  }

  get id(): LoanId {
    return this.props.id;
  }

  get userId(): UserId {
    return this.props.userId;
  }

  get equipmentId(): EquipmentId {
    return this.props.equipmentId;
  }

  get quantity(): number {
    return this.props.quantity;
  }

  get status(): LoanStatus {
    return this.props.status;
  }

  get createdAt(): Date {
    return this.props.createdAt;
  }

  get returnedAt(): Date | null {
    return this.props.returnedAt;
  }

  get damageComment(): string | null {
    return this.props.damageComment;
  }

  /**
   * Checks if this loan is currently active.
   */
  isActive(): boolean {
    return this.props.status === "ACTIVE";
  }

  /**
   * Returns a new Loan instance marked as returned.
   */
  markAsReturned(): Loan {
    return new Loan({
      ...this.props,
      status: "RETURNED",
      returnedAt: new Date(),
    });
  }

  /**
   * Returns a new Loan instance marked as damaged with a comment.
   */
  markAsDamaged(damageComment: string): Loan {
    if (!damageComment || damageComment.trim().length === 0) {
      throw new Error("Damage comment is required.");
    }

    return new Loan({
      ...this.props,
      status: "DAMAGED",
      returnedAt: new Date(),
      damageComment: damageComment.trim(),
    });
  }
}
