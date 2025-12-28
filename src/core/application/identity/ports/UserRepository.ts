// src/core/application/identity/ports/UserRepository.ts

import { User } from "../../../domain/identity/User";
import type { UserId } from "../../../domain/identity/User";
import { Role } from "../../../domain/identity/Role";

/**
 * Port for persisting and retrieving users and their roles.
 *
 * This interface is implemented by technical adapters in the
 * infrastructure layer (e.g., in-memory, database-backed).
 */
export interface UserRepository {
  create(user: User): Promise<User>;

  findById(id: UserId): Promise<User | null>;

  findByEmail(email: string): Promise<User | null>;

  findAll(): Promise<User[]>;

  /**
   * Generic upsert-style save.
   *
   * Application services can decide whether to call this for
   * creation vs. updates; the repository focuses only on state
   * persistence semantics.
   */
  save(user: User): Promise<User>;

  assignRole(userId: UserId, role: Role): Promise<void>;

  getRolesForUser(userId: UserId): Promise<Role[]>;
}
