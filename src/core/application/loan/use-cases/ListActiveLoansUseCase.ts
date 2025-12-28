// src/core/application/loan/use-cases/ListActiveLoansUseCase.ts

import type { Loan } from "../../../domain/loan/Loan";
import type { LoanRepository } from "../ports/LoanRepository";

export interface ListActiveLoansResult {
  loans: Loan[];
}

/**
 * Application use case for listing all active loans in the system.
 */
export class ListActiveLoansUseCase {
  constructor(private readonly loanRepository: LoanRepository) {}

  async execute(): Promise<ListActiveLoansResult> {
    const loans = await this.loanRepository.findActiveLoans();
    return { loans };
  }
}
