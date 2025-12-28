// src/core/application/loan/use-cases/ListLoansByUserUseCase.ts

import type { Loan } from "../../../domain/loan/Loan";
import type { UserId } from "../../../domain/identity/User";
import type { LoanRepository } from "../ports/LoanRepository";

export interface ListLoansByUserCommand {
  userId: UserId;
}

export interface ListLoansByUserResult {
  loans: Loan[];
}

/**
 * Application use case for listing all loans for a specific user.
 */
export class ListLoansByUserUseCase {
  constructor(private readonly loanRepository: LoanRepository) {}

  async execute(command: ListLoansByUserCommand): Promise<ListLoansByUserResult> {
    const loans = await this.loanRepository.findByUserId(command.userId);
    return { loans };
  }
}
