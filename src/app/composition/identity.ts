// src/app/composition/identity.ts

import { SupabaseUserRepository } from "../../core/infrastructure/identity/repositories/SupabaseUserRepository";
import type { UserRepository } from "../../core/application/identity/ports/UserRepository";
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
//
// NOTE: The concrete application-layer implementations are defined
// in the core application layer. Here we only provide thin
// placeholder adapters that satisfy the required interface so the
// composition is in place. They can later be replaced with the
// real use-case classes without changing the wiring.

const createUserUseCase: UseCase<CreateUserRequest, CreateUserResponse> = {
  async execute(_input: CreateUserRequest): Promise<CreateUserResponse> {
    throw new Error("CreateUserUseCase is not yet implemented.");
  },
};

const authenticateUserUseCase: UseCase<AuthenticateUserRequest, AuthenticateUserResponse> = {
  async execute(_input: AuthenticateUserRequest): Promise<AuthenticateUserResponse> {
    throw new Error("AuthenticateUserUseCase is not yet implemented.");
  },
};

const assignRoleUseCase: UseCase<AssignRoleRequest, AssignRoleResponse> = {
  async execute(_input: AssignRoleRequest): Promise<AssignRoleResponse> {
    throw new Error("AssignRoleUseCase is not yet implemented.");
  },
};

// 3. Wire everything into a single facade that the UI can consume.
export const identityFacade = new IdentityFacade<
  CreateUserRequest,
  CreateUserResponse,
  AuthenticateUserRequest,
  AuthenticateUserResponse,
  AssignRoleRequest,
  AssignRoleResponse
>({
  createUserUseCase,
  authenticateUserUseCase,
  assignRoleUseCase,
});
