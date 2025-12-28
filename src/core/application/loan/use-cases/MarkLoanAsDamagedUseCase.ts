// src/core/application/loan/use-cases/MarkLoanAsDamagedUseCase.ts

import type { Loan, LoanId } from "../../../domain/loan/Loan";
import type { LoanRepository } from "../ports/LoanRepository";

export interface MarkLoanAsDamagedCommand {
  loanId: LoanId;
  damageComment: string;
}

export interface MarkLoanAsDamagedResult {
  loan: Loan;
}

/**
 * Application use case for marking a loan as damaged.
 *
 * Business rules:
 * - Loan must exist and be ACTIVE
 * - Damage comment is mandatory
 * - Updates equipment quantity_in_use
 */
export class MarkLoanAsDamagedUseCase {
  constructor(private readonly loanRepository: LoanRepository) {}

  async execute(command: MarkLoanAsDamagedCommand): Promise<MarkLoanAsDamagedResult> {
    const loan = await this.loanRepository.findById(command.loanId);
    if (!loan) {
      throw new Error("Loan not found.");
    }

    if (!loan.isActive()) {
      throw new Error("Loan is not active.");
    }

    const damagedLoan = loan.markAsDamaged(command.damageComment);
    await this.loanRepository.save(damagedLoan);

    return { loan: damagedLoan };
  }
}
