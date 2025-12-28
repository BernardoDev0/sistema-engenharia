// src/core/application/identity/use-cases/ActivateUserUseCase.ts

import { User } from "../../../domain/identity/User";
import type { UserId } from "../../../domain/identity/User";
import type { UserRepository } from "../ports/UserRepository";

export interface ActivateUserCommand {
  userId: UserId;
}

export interface ActivateUserResult {
  user: User;
}

/**
 * Application use case for activating a user.
 *
 * Business rules:
 * - Only ADMIN users can activate users (enforced by RLS policies).
 * - User must exist.
 */
export class ActivateUserUseCase {
  constructor(private readonly userRepository: UserRepository) {}

  async execute(command: ActivateUserCommand): Promise<ActivateUserResult> {
    const user = await this.userRepository.findById(command.userId);
    if (!user) {
      throw new Error("User not found.");
    }

    if (user.isActive) {
      return { user };
    }

    // Create a new user instance with isActive = true
    const activatedUser = User.create({
      id: user.id,
      email: user.email,
      displayName: user.displayName,
      kind: user.kind,
      isActive: true,
    });

    await this.userRepository.save(activatedUser);

    return { user: activatedUser };
  }
}
