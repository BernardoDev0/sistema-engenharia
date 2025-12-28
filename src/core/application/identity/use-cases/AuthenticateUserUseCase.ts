// src/core/application/identity/use-cases/AuthenticateUserUseCase.ts

import { User } from "../../../domain/identity/User";
import type { UserRepository } from "../ports/UserRepository";

export interface AuthenticateUserCommand {
  email: string;
  password: string;
}

export interface AuthenticateUserResult {
  user: User;
  accessToken: string;
  refreshToken: string;
}

/**
 * Application use case for authenticating a user.
 *
 * Business rules:
 * - User must have valid credentials.
 * - User must be active.
 * - Returns user data and auth tokens for session management.
 */
export class AuthenticateUserUseCase {
  constructor(private readonly userRepository: UserRepository) {}

  async execute(command: AuthenticateUserCommand): Promise<AuthenticateUserResult> {
    // This is a placeholder that will be called from the auth context
    // The actual Supabase auth is handled in the infrastructure layer
    throw new Error("Use Supabase auth directly from the auth context.");
  }
}
