// src/app/composition/identity.ts

import { SupabaseUserRepository } from "../../core/infrastructure/identity/repositories/SupabaseUserRepository";
import type { UserRepository } from "../../core/application/identity/ports/UserRepository";
import { CreateUserUseCase } from "../../core/application/identity/use-cases/CreateUserUseCase";
import { AuthenticateUserUseCase } from "../../core/application/identity/use-cases/AuthenticateUserUseCase";
import { AssignRoleUseCase } from "../../core/application/identity/use-cases/AssignRoleUseCase";
import {
  IdentityFacade,
  type CreateUserRequest,
  type CreateUserResponse,
  type AuthenticateUserRequest,
  type AuthenticateUserResponse,
  type AssignRoleRequest,
  type AssignRoleResponse,
  type UseCase,
} from "../../presentation/identity/IdentityFacade";

// Composition root for the Identity context.
//
// This file wires together the concrete infrastructure adapters,
// application use cases, and the presentation facade using
// manual dependency injection. No UI, routing, or external
// services are introduced here.

// 1. Instantiate technical infrastructure adapters.
const userRepository: UserRepository = new SupabaseUserRepository();

// 2. Instantiate application-layer use cases.
const createUserUseCase = new CreateUserUseCase(userRepository);
const authenticateUserUseCase = new AuthenticateUserUseCase(userRepository);
const assignRoleUseCase = new AssignRoleUseCase(userRepository);

// 3. Create adapters that map between presentation DTOs and use case commands.
const createUserUseCaseAdapter: UseCase<CreateUserRequest, CreateUserResponse> = {
  async execute(input: CreateUserRequest): Promise<CreateUserResponse> {
    const result = await createUserUseCase.execute({
      email: input.email,
      displayName: input.displayName,
      kind: input.kind,
    });
    return { user: result.user };
  },
};

const authenticateUserUseCaseAdapter: UseCase<
  AuthenticateUserRequest,
  AuthenticateUserResponse
> = {
  async execute(_input: AuthenticateUserRequest): Promise<AuthenticateUserResponse> {
    // Authentication is handled directly through Supabase in the auth context
    // This adapter exists only to satisfy the facade interface
    throw new Error("Use auth context signIn method instead");
  },
};

const assignRoleUseCaseAdapter: UseCase<AssignRoleRequest, AssignRoleResponse> = {
  async execute(input: AssignRoleRequest): Promise<AssignRoleResponse> {
    const result = await assignRoleUseCase.execute({
      userId: input.userId,
      roleName: input.roleName,
    });
    return { user: result.user, roles: result.roles };
  },
};

// 4. Wire everything into a single facade that the UI can consume.
export const identityFacade = new IdentityFacade<
  CreateUserRequest,
  CreateUserResponse,
  AuthenticateUserRequest,
  AuthenticateUserResponse,
  AssignRoleRequest,
  AssignRoleResponse
>({
  createUserUseCase: createUserUseCaseAdapter,
  authenticateUserUseCase: authenticateUserUseCaseAdapter,
  assignRoleUseCase: assignRoleUseCaseAdapter,
});
