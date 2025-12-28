// src/core/application/identity/use-cases/ListUsersUseCase.ts

import { User } from "../../../domain/identity/User";
import type { UserRepository } from "../ports/UserRepository";

export interface ListUsersResult {
  users: User[];
}

/**
 * Application use case for listing all users.
 *
 * Business rules:
 * - Only ADMIN users can list all users (enforced by RLS policies).
 * - Returns all users in the system.
 */
export class ListUsersUseCase {
  constructor(private readonly userRepository: UserRepository) {}

  async execute(): Promise<ListUsersResult> {
    const users = await this.userRepository.findAll();
    return { users };
  }
}
