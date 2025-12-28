// src/core/domain/identity/User.ts

/**
 * Unique identifier for a user within the domain.
 *
 * This is intentionally a simple string alias so the domain stays
 * framework- and persistence-agnostic.
 */
export type UserId = string;

/**
 * High-level categories of users in the system.
 *
 * - "admin" users have the highest level of privileges.
 * - "employee" users represent staff members with constrained access.
 * - "external" users represent customers/guests with minimal access.
 */
export type UserKind = "admin" | "employee" | "external";

export interface UserProps {
  id: UserId;
  email: string;
  displayName: string;
  /**
   * Kind is an easy way to reason about coarse-grained capabilities
   * (e.g., admin vs employee). Fine-grained access is expressed via roles
   * and permissions, not encoded directly on the user.
   */
  kind: UserKind;
  /**
   * Whether the user is currently active. Inactive users must not be able
   * to perform actions even if they previously had elevated access.
   */
  isActive: boolean;
}

/**
 * Domain entity representing a user.
 *
 * This entity intentionally does **not** know about passwords, tokens,
 * sessions, or persistence concerns. It only captures stable identity
 * attributes and simple invariants.
 */
export class User {
  private readonly props: UserProps;

  private constructor(props: UserProps) {
    this.props = User.validate(props);
  }

  static create(props: UserProps): User {
    return new User(props);
  }

  /**
   * Basic invariants for a valid user entity.
   *
   * - Email must be non-empty and contain an "@" character.
   * - Display name must be non-empty.
   */
  private static validate(props: UserProps): UserProps {
    if (!props.email || !props.email.includes("@")) {
      throw new Error("User email must be a non-empty, valid email address.");
    }

    if (!props.displayName || props.displayName.trim().length === 0) {
      throw new Error("User displayName must be a non-empty string.");
    }

    return { ...props };
  }

  get id(): UserId {
    return this.props.id;
  }

  get email(): string {
    return this.props.email;
  }

  get displayName(): string {
    return this.props.displayName;
  }

  get kind(): UserKind {
    return this.props.kind;
  }

  get isActive(): boolean {
    return this.props.isActive;
  }

  /**
   * Convenience for domain logic that needs to branch on admin behavior.
   *
   * NOTE: This alone must **never** be used to decide UI-only privileges.
   * Fine-grained access should always be done via roles and permissions.
   */
  isAdmin(): boolean {
    return this.props.kind === "admin";
  }

  /**
   * Returns a new User instance marked as inactive.
   *
   * Deactivating a user at the domain level means they must not be able
   * to perform actions regardless of previously assigned roles.
   */
  deactivate(): User {
    return new User({ ...this.props, isActive: false });
  }
}
