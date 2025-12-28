// src/core/application/identity/use-cases/AssignRoleUseCase.ts

import { User } from "../../../domain/identity/User";
import { Role } from "../../../domain/identity/Role";
import type { UserId } from "../../../domain/identity/User";
import type { RoleName } from "../../../domain/identity/Role";
import type { UserRepository } from "../ports/UserRepository";
import { Permission } from "../../../domain/identity/Permission";

export interface AssignRoleCommand {
  userId: UserId;
  roleName: RoleName;
}

export interface AssignRoleResult {
  user: User;
  roles: Role[];
}

/**
 * Application use case for assigning a role to a user.
 *
 * Business rules:
 * - Only ADMIN users can assign roles (enforced by RLS policies).
 * - Role must be valid.
 * - User must exist.
 */
export class AssignRoleUseCase {
  constructor(private readonly userRepository: UserRepository) {}

  async execute(command: AssignRoleCommand): Promise<AssignRoleResult> {
    // Find user
    const user = await this.userRepository.findById(command.userId);
    if (!user) {
      throw new Error("User not found.");
    }

    // Create role entity
    const permissions = this.getPermissionsForRole(command.roleName);
    const role = Role.create({
      name: command.roleName,
      permissions,
    });

    // Assign role
    await this.userRepository.assignRole(command.userId, role);

    // Get updated roles
    const roles = await this.userRepository.getRolesForUser(command.userId);

    return { user, roles };
  }

  private getPermissionsForRole(roleName: RoleName): Permission[] {
    switch (roleName) {
      case "ADMIN":
        return [Permission.MANAGE_SYSTEM];
      case "OPERATIONS_MANAGER":
        return [Permission.MANAGE_OPERATIONS, Permission.VIEW_REPORTS];
      case "FIELD_TECHNICIAN":
        return [Permission.EXECUTE_OPERATIONS, Permission.VIEW_ASSIGNED_TASKS];
      case "COMPLIANCE_ESG":
        return [Permission.VIEW_REPORTS, Permission.MANAGE_COMPLIANCE];
      default:
        throw new Error(`Unknown role: ${roleName}`);
    }
  }
}
