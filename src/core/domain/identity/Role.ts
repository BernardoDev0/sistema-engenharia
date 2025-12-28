// src/core/domain/identity/Role.ts

import { Permission, permissionImplies } from "./Permission";

/**
 * Roles are named collections of permissions.
 *
 * IMPORTANT SECURITY NOTE:
 * - Roles in the **domain model** are independent of how they are stored.
 * - In the actual system, roles must be stored in a dedicated roles table
 *   and associated to users via a separate user-roles table.
 * - Do **not** store roles directly on user records to avoid privilege
 *   escalation and simplify Row-Level Security policies.
 */
export type RoleName = "ADMIN" | "OPERATIONS_MANAGER" | "FIELD_TECHNICIAN" | "COMPLIANCE_ESG";

export interface RoleProps {
  name: RoleName;
  /**
   * The set of permissions granted to this role.
   *
   * Domain rule examples:
   * - The `admin` role should effectively have all permissions.
   * - The `employee` role should generally not have system-level
   *   management permissions but may have wide business-data access.
   * - The `viewer` role should only have read permissions.
   */
  permissions: Permission[];
}

export class Role {
  private readonly props: RoleProps;

  private constructor(props: RoleProps) {
    this.props = Role.validate(props);
  }

  static create(props: RoleProps): Role {
    return new Role(props);
  }

  /**
   * Basic invariants for a valid role:
   * - Must have at least one permission.
   * - Permissions list must not contain duplicates.
   */
  private static validate(props: RoleProps): RoleProps {
    if (!props.permissions || props.permissions.length === 0) {
      throw new Error("Role must define at least one permission.");
    }

    const uniquePermissions = Array.from(new Set(props.permissions));

    return {
      ...props,
      permissions: uniquePermissions,
    };
  }

  get name(): RoleName {
    return this.props.name;
  }

  get permissions(): ReadonlyArray<Permission> {
    return this.props.permissions;
  }

  /**
   * Checks whether this role grants a given permission.
   *
   * Example rule:
   * - An `admin` role is expected to have `MANAGE_SYSTEM`, which in turn
   *   implies all other permissions.
   */
  hasPermission(permission: Permission): boolean {
    return this.props.permissions.some((p) => permissionImplies(p, permission));
  }
}
