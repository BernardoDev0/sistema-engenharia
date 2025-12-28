// src/core/application/loan/ports/LoanRepository.ts

import type { Loan, LoanId } from "../../../domain/loan/Loan";
import type { UserId } from "../../../domain/identity/User";
import type { EquipmentId } from "../../../domain/equipment/Equipment";

/**
 * Port for persisting and retrieving loans.
 */
export interface LoanRepository {
  create(loan: Loan): Promise<Loan>;

  findById(id: LoanId): Promise<Loan | null>;

  findByUserId(userId: UserId): Promise<Loan[]>;

  findActiveLoans(): Promise<Loan[]>;

  findActiveLoansByEquipmentId(equipmentId: EquipmentId): Promise<Loan[]>;

  save(loan: Loan): Promise<Loan>;
}
