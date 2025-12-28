// src/core/infrastructure/identity/repositories/SupabaseUserRepository.ts

import { User } from "../../../domain/identity/User";
import type { UserId } from "../../../domain/identity/User";
import { Role } from "../../../domain/identity/Role";
import type { RoleName } from "../../../domain/identity/Role";
import { Permission } from "../../../domain/identity/Permission";
import type { UserRepository } from "../../../application/identity/ports/UserRepository";
import { supabase } from "../../supabase/client";
import type { Database } from "../../supabase/types";

type DbRole = Database["public"]["Enums"]["app_role"];
type DbProfile = Database["public"]["Tables"]["profiles"]["Row"];
type DbUserRole = Database["public"]["Tables"]["user_roles"]["Row"];

/**
 * Supabase implementation of the UserRepository port.
 *
 * - Uses Supabase Auth for user authentication and management.
 * - Stores additional user data in the profiles table.
 * - Manages role assignments in the user_roles table.
 * - Enforces role-based security through RLS policies.
 */
export class SupabaseUserRepository implements UserRepository {
  /**
   * Creates a new user in Supabase Auth and stores profile data.
   *
   * NOTE: This method requires admin privileges. Only ADMIN users
   * can create new users through the application use cases.
   */
  async create(user: User): Promise<User> {
    // Create auth user
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email: user.email,
      email_confirm: true,
      user_metadata: {
        display_name: user.displayName,
        kind: user.kind,
      },
    });

    if (authError || !authData.user) {
      throw new Error(`Failed to create auth user: ${authError?.message || "Unknown error"}`);
    }

    // Create profile record
    const { error: profileError } = await supabase.from("profiles").insert({
      id: authData.user.id,
      email: user.email,
      display_name: user.displayName,
      kind: user.kind,
      is_active: user.isActive,
    });

    if (profileError) {
      throw new Error(`Failed to create user profile: ${profileError.message}`);
    }

    // Return a new User instance with the generated ID
    return User.create({
      id: authData.user.id as UserId,
      email: user.email,
      displayName: user.displayName,
      kind: user.kind,
      isActive: user.isActive,
    });
  }

  async findById(id: UserId): Promise<User | null> {
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", id)
      .maybeSingle();

    if (error) {
      throw new Error(`Failed to find user by ID: ${error.message}`);
    }

    if (!data) {
      return null;
    }

    return this.mapProfileToUser(data);
  }

  async findByEmail(email: string): Promise<User | null> {
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("email", email)
      .maybeSingle();

    if (error) {
      throw new Error(`Failed to find user by email: ${error.message}`);
    }

    if (!data) {
      return null;
    }

    return this.mapProfileToUser(data);
  }

  async save(user: User): Promise<User> {
    const { error } = await supabase
      .from("profiles")
      .upsert({
        id: user.id,
        email: user.email,
        display_name: user.displayName,
        kind: user.kind,
        is_active: user.isActive,
      });

    if (error) {
      throw new Error(`Failed to save user: ${error.message}`);
    }

    return user;
  }

  async assignRole(userId: UserId, role: Role): Promise<void> {
    const dbRole = this.mapRoleNameToDbRole(role.name);

    const { error } = await supabase.from("user_roles").upsert(
      {
        user_id: userId,
        role: dbRole,
      },
      {
        onConflict: "user_id,role",
      }
    );

    if (error) {
      throw new Error(`Failed to assign role: ${error.message}`);
    }
  }

  async getRolesForUser(userId: UserId): Promise<Role[]> {
    const { data, error } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", userId);

    if (error) {
      throw new Error(`Failed to get roles for user: ${error.message}`);
    }

    if (!data || data.length === 0) {
      return [];
    }

    return data.map((row: DbUserRole) => this.mapDbRoleToRole(row.role));
  }

  /**
   * Maps a database profile row to a domain User entity.
   */
  private mapProfileToUser(profile: DbProfile): User {
    return User.create({
      id: profile.id as UserId,
      email: profile.email,
      displayName: profile.display_name,
      kind: profile.kind as "admin" | "employee" | "external",
      isActive: profile.is_active,
    });
  }

  /**
   * Maps a domain RoleName to a database app_role enum value.
   */
  private mapRoleNameToDbRole(roleName: RoleName): DbRole {
    return roleName as DbRole;
  }

  /**
   * Maps a database app_role enum value to a domain Role entity.
   */
  private mapDbRoleToRole(dbRole: DbRole): Role {
    const roleName = dbRole as RoleName;
    const permissions = this.getPermissionsForRole(roleName);

    return Role.create({
      name: roleName,
      permissions,
    });
  }

  /**
   * Returns the default set of permissions for a given role.
   *
   * This mapping enforces the domain's role-permission rules:
   * - ADMIN: Full system management
   * - OPERATIONS_MANAGER: Manage operations and field technicians
   * - FIELD_TECHNICIAN: Execute field operations
   * - COMPLIANCE_ESG: View and report on compliance
   */
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
