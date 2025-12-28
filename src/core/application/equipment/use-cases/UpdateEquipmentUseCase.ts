// src/core/application/equipment/use-cases/UpdateEquipmentUseCase.ts

import { Equipment } from "../../../domain/equipment/Equipment";
import type { EquipmentId, EquipmentStatus } from "../../../domain/equipment/Equipment";
import type { EquipmentRepository } from "../ports/EquipmentRepository";

export interface UpdateEquipmentCommand {
  id: EquipmentId;
  name?: string;
  category?: string;
  certification?: string | null;
  status?: EquipmentStatus;
  totalQuantity?: number;
}

export interface UpdateEquipmentResult {
  equipment: Equipment;
}

/**
 * Application use case for updating existing equipment.
 *
 * Business rules:
 * - Only ADMIN users can update equipment (enforced by RLS).
 * - Equipment must exist.
 */
export class UpdateEquipmentUseCase {
  constructor(private readonly equipmentRepository: EquipmentRepository) {}

  async execute(command: UpdateEquipmentCommand): Promise<UpdateEquipmentResult> {
    const equipment = await this.equipmentRepository.findById(command.id);
    if (!equipment) {
      throw new Error("Equipment not found.");
    }

    const updated = equipment.update({
      name: command.name,
      category: command.category,
      certification: command.certification,
      status: command.status,
      totalQuantity: command.totalQuantity,
    });

    await this.equipmentRepository.save(updated);

    return { equipment: updated };
  }
}
