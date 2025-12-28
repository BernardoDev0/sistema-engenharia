// src/core/application/loan/use-cases/ReturnLoanUseCase.ts

import type { Loan, LoanId } from "../../../domain/loan/Loan";
import type { LoanRepository } from "../ports/LoanRepository";

export interface ReturnLoanCommand {
  loanId: LoanId;
}

export interface ReturnLoanResult {
  loan: Loan;
}

/**
 * Application use case for returning a loan.
 *
 * Business rules:
 * - Loan must exist and be ACTIVE
 * - Updates equipment quantity_in_use
 */
export class ReturnLoanUseCase {
  constructor(private readonly loanRepository: LoanRepository) {}

  async execute(command: ReturnLoanCommand): Promise<ReturnLoanResult> {
    const loan = await this.loanRepository.findById(command.loanId);
    if (!loan) {
      throw new Error("Loan not found.");
    }

    if (!loan.isActive()) {
      throw new Error("Loan is not active.");
    }

    const returnedLoan = loan.markAsReturned();
    await this.loanRepository.save(returnedLoan);

    return { loan: returnedLoan };
  }
}
