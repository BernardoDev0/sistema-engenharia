// src/app/composition/loan.ts

import { SupabaseLoanRepository } from "../../core/infrastructure/loan/repositories/SupabaseLoanRepository";
import { SupabaseEquipmentRepository } from "../../core/infrastructure/equipment/repositories/SupabaseEquipmentRepository";
import { CreateLoanUseCase } from "../../core/application/loan/use-cases/CreateLoanUseCase";
import { ListLoansByUserUseCase } from "../../core/application/loan/use-cases/ListLoansByUserUseCase";
import { ListActiveLoansUseCase } from "../../core/application/loan/use-cases/ListActiveLoansUseCase";
import { ReturnLoanUseCase } from "../../core/application/loan/use-cases/ReturnLoanUseCase";
import { MarkLoanAsDamagedUseCase } from "../../core/application/loan/use-cases/MarkLoanAsDamagedUseCase";

// Composition root for the Loan context.

// 1. Instantiate infrastructure adapters
const loanRepository = new SupabaseLoanRepository();
const equipmentRepository = new SupabaseEquipmentRepository();

// 2. Instantiate use cases
export const createLoanUseCase = new CreateLoanUseCase(
  loanRepository,
  equipmentRepository
);
export const listLoansByUserUseCase = new ListLoansByUserUseCase(loanRepository);
export const listActiveLoansUseCase = new ListActiveLoansUseCase(loanRepository);
export const returnLoanUseCase = new ReturnLoanUseCase(loanRepository);
export const markLoanAsDamagedUseCase = new MarkLoanAsDamagedUseCase(loanRepository);
