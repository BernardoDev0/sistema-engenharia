// src/presentation/identity/IdentityFacade.ts

import { User } from "../../core/domain/identity/User";
import type { UserId } from "../../core/domain/identity/User";
import { Role } from "../../core/domain/identity/Role";
import type { RoleName } from "../../core/domain/identity/Role";

/**
 * Minimal, framework-agnostic abstraction that the UI layer can depend on
 * when working with Identity use cases.
 *
 * This facade is a thin adapter over the Application layer. It does not
 * implement business rules itself; it simply coordinates calls to the
 * underlying use-case services.
 */
export interface UseCase<I, O> {
  execute(input: I): Promise<O>;
}

// DTOs exposed at the presentation boundary.
export interface CreateUserRequest {
  email: string;
  displayName: string;
  kind: "admin" | "employee" | "external";
}

export interface CreateUserResponse {
  user: User;
}

export interface AuthenticateUserRequest {
  /**
   * NOTE: Authentication details (password, OAuth tokens, etc.) are part of
   * the application use case input. The presentation layer only forwards
   * structured data and does not embed auth providers.
   */
  email: string;
  secret: string;
}

export interface AuthenticateUserResponse {
  user: User;
}

export interface AssignRoleRequest {
  userId: UserId;
  roleName: RoleName;
}

export interface AssignRoleResponse {
  user: User;
  roles: Role[];
}

export interface IdentityFacadeDependencies<
  CUIn = CreateUserRequest,
  CUOut = CreateUserResponse,
  AUIn = AuthenticateUserRequest,
  AUOut = AuthenticateUserResponse,
  ARIn = AssignRoleRequest,
  AROut = AssignRoleResponse
> {
  createUserUseCase: UseCase<CUIn, CUOut>;
  authenticateUserUseCase: UseCase<AUIn, AUOut>;
  assignRoleUseCase: UseCase<ARIn, AROut>;
}

export class IdentityFacade<
  CUIn = CreateUserRequest,
  CUOut = CreateUserResponse,
  AUIn = AuthenticateUserRequest,
  AUOut = AuthenticateUserResponse,
  ARIn = AssignRoleRequest,
  AROut = AssignRoleResponse
> {
  constructor(private readonly deps: IdentityFacadeDependencies<CUIn, CUOut, AUIn, AUOut, ARIn, AROut>) {}

  /**
   * Creates a new user by delegating to the CreateUser application use case.
   */
  async createUser(request: CUIn): Promise<CUOut> {
    return this.deps.createUserUseCase.execute(request);
  }

  /**
   * Authenticates a user by delegating to the AuthenticateUser application
   * use case. No authentication provider logic is implemented here.
   */
  async authenticate(request: AUIn): Promise<AUOut> {
    return this.deps.authenticateUserUseCase.execute(request);
  }

  /**
   * Assigns a role to a user by delegating to the AssignRole application
   * use case. Role storage is handled by the underlying infrastructure.
   */
  async assignRole(request: ARIn): Promise<AROut> {
    return this.deps.assignRoleUseCase.execute(request);
  }
}
