// src/core/application/equipment/use-cases/ListEquipmentUseCase.ts

import type { Equipment } from "../../../domain/equipment/Equipment";
import type { EquipmentRepository } from "../ports/EquipmentRepository";

export interface ListEquipmentResult {
  equipment: Equipment[];
}

/**
 * Application use case for listing all equipment.
 */
export class ListEquipmentUseCase {
  constructor(private readonly equipmentRepository: EquipmentRepository) {}

  async execute(): Promise<ListEquipmentResult> {
    const equipment = await this.equipmentRepository.findAll();
    return { equipment };
  }
}
