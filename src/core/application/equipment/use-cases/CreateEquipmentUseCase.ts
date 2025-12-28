// src/core/application/equipment/use-cases/CreateEquipmentUseCase.ts

import { Equipment } from "../../../domain/equipment/Equipment";
import type { EquipmentId, EquipmentStatus } from "../../../domain/equipment/Equipment";
import type { EquipmentRepository } from "../ports/EquipmentRepository";

export interface CreateEquipmentCommand {
  name: string;
  category: string;
  certification?: string | null;
  status: EquipmentStatus;
  totalQuantity: number;
}

export interface CreateEquipmentResult {
  equipment: Equipment;
}

/**
 * Application use case for creating new equipment.
 *
 * Business rules:
 * - Only ADMIN users can create equipment (enforced by RLS).
 * - Name and category are required.
 * - Total quantity must be positive.
 */
export class CreateEquipmentUseCase {
  constructor(private readonly equipmentRepository: EquipmentRepository) {}

  async execute(command: CreateEquipmentCommand): Promise<CreateEquipmentResult> {
    const equipment = Equipment.create({
      id: crypto.randomUUID() as EquipmentId,
      name: command.name,
      category: command.category,
      certification: command.certification ?? null,
      status: command.status,
      totalQuantity: command.totalQuantity,
      quantityInUse: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    const created = await this.equipmentRepository.create(equipment);

    return { equipment: created };
  }
}
