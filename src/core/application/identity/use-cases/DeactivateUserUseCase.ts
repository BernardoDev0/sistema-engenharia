// src/core/application/identity/use-cases/DeactivateUserUseCase.ts

import { User } from "../../../domain/identity/User";
import type { UserId } from "../../../domain/identity/User";
import type { UserRepository } from "../ports/UserRepository";

export interface DeactivateUserCommand {
  userId: UserId;
}

export interface DeactivateUserResult {
  user: User;
}

/**
 * Application use case for deactivating a user.
 *
 * Business rules:
 * - Only ADMIN users can deactivate users (enforced by RLS policies).
 * - User must exist.
 * - Deactivated users cannot authenticate.
 */
export class DeactivateUserUseCase {
  constructor(private readonly userRepository: UserRepository) {}

  async execute(command: DeactivateUserCommand): Promise<DeactivateUserResult> {
    const user = await this.userRepository.findById(command.userId);
    if (!user) {
      throw new Error("User not found.");
    }

    if (!user.isActive) {
      return { user };
    }

    // Use domain method to deactivate
    const deactivatedUser = user.deactivate();

    await this.userRepository.save(deactivatedUser);

    return { user: deactivatedUser };
  }
}
