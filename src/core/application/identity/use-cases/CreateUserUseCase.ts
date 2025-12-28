// src/core/application/identity/use-cases/CreateUserUseCase.ts

import { User } from "../../../domain/identity/User";
import type { UserId } from "../../../domain/identity/User";
import type { UserRepository } from "../ports/UserRepository";

export interface CreateUserCommand {
  email: string;
  displayName: string;
  kind: "admin" | "employee" | "external";
}

export interface CreateUserResult {
  user: User;
}

/**
 * Application use case for creating a new user.
 *
 * Business rules:
 * - Only ADMIN users can create new users (enforced by RLS policies).
 * - Email must be unique.
 * - User is created in Supabase Auth and profiles table.
 */
export class CreateUserUseCase {
  constructor(private readonly userRepository: UserRepository) {}

  async execute(command: CreateUserCommand): Promise<CreateUserResult> {
    // Check if user already exists
    const existing = await this.userRepository.findByEmail(command.email);
    if (existing) {
      throw new Error("A user with this email already exists.");
    }

    // Create new user entity
    const user = User.create({
      id: crypto.randomUUID() as UserId,
      email: command.email,
      displayName: command.displayName,
      kind: command.kind,
      isActive: true,
    });

    // Persist user
    const createdUser = await this.userRepository.create(user);

    return { user: createdUser };
  }
}
