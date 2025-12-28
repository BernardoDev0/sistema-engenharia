// src/core/domain/analytics/AuditLog.ts

import type { UserId } from "../identity/User";

export interface AuditLogProps {
  id: string;
  action: string;
  entityType: string;
  entityId: string | null;
  performedByUserId: UserId;
  createdAt: Date;
  metadata?: Record<string, unknown> | null;
}

/**
 * AuditLog represents an immutable record of a critical action.
 *
 * All writes happen through the application layer, and the underlying
 * storage enforces immutability (no updates or deletes).
 */
export class AuditLog {
  private readonly props: AuditLogProps;

  private constructor(props: AuditLogProps) {
    this.props = AuditLog.validate(props);
  }

  static create(props: AuditLogProps): AuditLog {
    return new AuditLog(props);
  }

  private static validate(props: AuditLogProps): AuditLogProps {
    if (!props.id) throw new Error("AuditLog id is required");
    if (!props.action) throw new Error("AuditLog action is required");
    if (!props.entityType) throw new Error("AuditLog entityType is required");
    if (!props.performedByUserId) throw new Error("AuditLog performedByUserId is required");
    if (!(props.createdAt instanceof Date)) throw new Error("AuditLog createdAt must be a Date");

    return { ...props, metadata: props.metadata ?? null };
  }

  get id(): string {
    return this.props.id;
  }

  get action(): string {
    return this.props.action;
  }

  get entityType(): string {
    return this.props.entityType;
  }

  get entityId(): string | null {
    return this.props.entityId;
  }

  get performedByUserId(): UserId {
    return this.props.performedByUserId;
  }

  get createdAt(): Date {
    return this.props.createdAt;
  }

  get metadata(): Record<string, unknown> | null | undefined {
    return this.props.metadata;
  }
}
