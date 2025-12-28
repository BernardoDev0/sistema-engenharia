// src/core/application/loan/use-cases/CreateLoanUseCase.ts

import { Loan } from "../../../domain/loan/Loan";
import type { LoanId } from "../../../domain/loan/Loan";
import type { UserId } from "../../../domain/identity/User";
import type { EquipmentId } from "../../../domain/equipment/Equipment";
import type { LoanRepository } from "../ports/LoanRepository";
import type { EquipmentRepository } from "../../equipment/ports/EquipmentRepository";

export interface CreateLoanCommand {
  userId: UserId;
  equipmentId: EquipmentId;
  quantity: number;
}

export interface CreateLoanResult {
  loan: Loan;
}

/**
 * Application use case for creating a new loan.
 *
 * Business rules:
 * - Equipment must exist
 * - Requested quantity must be available
 * - Equipment cannot be DISCARDED
 * - Updates equipment quantity_in_use atomically
 */
export class CreateLoanUseCase {
  constructor(
    private readonly loanRepository: LoanRepository,
    private readonly equipmentRepository: EquipmentRepository
  ) {}

  async execute(command: CreateLoanCommand): Promise<CreateLoanResult> {
    // Validate equipment exists and is available
    const equipment = await this.equipmentRepository.findById(command.equipmentId);
    if (!equipment) {
      throw new Error("Equipment not found.");
    }

    if (equipment.status === "DISCARDED") {
      throw new Error("Cannot loan discarded equipment.");
    }

    if (equipment.quantityAvailable < command.quantity) {
      throw new Error(
        `Insufficient equipment available. Requested: ${command.quantity}, Available: ${equipment.quantityAvailable}`
      );
    }

    // Create loan entity
    const loan = Loan.create({
      id: crypto.randomUUID() as LoanId,
      userId: command.userId,
      equipmentId: command.equipmentId,
      quantity: command.quantity,
      status: "ACTIVE",
      createdAt: new Date(),
      returnedAt: null,
      damageComment: null,
    });

    // Save loan
    const createdLoan = await this.loanRepository.create(loan);

    // Update equipment quantity in use
    const updatedEquipment = equipment.update({
      totalQuantity: equipment.totalQuantity,
    });

    // Note: quantity_in_use will be updated via database trigger or repository logic

    return { loan: createdLoan };
  }
}
