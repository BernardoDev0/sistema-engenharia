// src/core/domain/identity/Permission.ts

/**
 * Fine-grained permissions that can be assigned to roles.
 *
 * These represent capabilities, not UI elements. They should be
 * stable over time and descriptive about business intent.
 */
export enum Permission {
  /** Full read/write access to critical administrative features. */
  MANAGE_SYSTEM = "MANAGE_SYSTEM",

  /** Manage other users (activate, deactivate, assign roles, etc.). */
  MANAGE_USERS = "MANAGE_USERS",

  /** Read-only access to user-related data. */
  VIEW_USERS = "VIEW_USERS",

  /** General read access to business data. */
  VIEW_DATA = "VIEW_DATA",

  /** General write/update access to business data. */
  EDIT_DATA = "EDIT_DATA",

  /** Manage operations and field activities. */
  MANAGE_OPERATIONS = "MANAGE_OPERATIONS",

  /** Execute field operations and tasks. */
  EXECUTE_OPERATIONS = "EXECUTE_OPERATIONS",

  /** View assigned tasks and work orders. */
  VIEW_ASSIGNED_TASKS = "VIEW_ASSIGNED_TASKS",

  /** View compliance and ESG reports. */
  VIEW_REPORTS = "VIEW_REPORTS",

  /** Manage compliance and ESG data. */
  MANAGE_COMPLIANCE = "MANAGE_COMPLIANCE",
}

/**
 * Utility to express that a given permission implies another.
 *
 * Example domain rule (can be refined later):
 * - `MANAGE_SYSTEM` implies **all** other permissions.
 */
export function permissionImplies(a: Permission, b: Permission): boolean {
  if (a === Permission.MANAGE_SYSTEM) {
    return true;
  }

  return a === b;
}
