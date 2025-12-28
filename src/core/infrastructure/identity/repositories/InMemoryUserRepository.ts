// src/core/infrastructure/identity/repositories/InMemoryUserRepository.ts

import { User } from "../../../domain/identity/User";
import type { UserId } from "../../../domain/identity/User";
import { Role } from "../../../domain/identity/Role";
import type { RoleName } from "../../../domain/identity/Role";
import type { UserRepository } from "../../../application/identity/ports/UserRepository";

/**
 * In-memory implementation of the UserRepository port.
 *
 * - Uses simple Maps for storage.
 * - Starts with an empty state.
 * - Implements only technical persistence concerns; no business rules.
 */
export class InMemoryUserRepository implements UserRepository {
  private readonly usersById = new Map<UserId, User>();
  private readonly usersByEmail = new Map<string, User>();
  private readonly userRoles = new Map<UserId, Role[]>();

  async create(user: User): Promise<User> {
    this.usersById.set(user.id, user);
    this.usersByEmail.set(user.email, user);
    return user;
  }

  async findById(id: UserId): Promise<User | null> {
    return this.usersById.get(id) ?? null;
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.usersByEmail.get(email) ?? null;
  }

  async findAll(): Promise<User[]> {
    return Array.from(this.usersById.values());
  }

  async save(user: User): Promise<User> {
    if (!this.usersById.has(user.id)) {
      // For a pure technical adapter, treat save as an upsert.
      this.usersById.set(user.id, user);
    } else {
      this.usersById.set(user.id, user);
    }

    // Keep secondary index in sync.
    this.usersByEmail.set(user.email, user);

    return user;
  }

  async assignRole(userId: UserId, role: Role): Promise<void> {
    const existing = this.userRoles.get(userId) ?? [];

    // Ensure we do not store duplicate roles by name.
    const next = [...existing.filter((r) => r.name !== role.name), role];
    this.userRoles.set(userId, next);
  }

  async getRolesForUser(userId: UserId): Promise<Role[]> {
    return this.userRoles.get(userId) ?? [];
  }
}
