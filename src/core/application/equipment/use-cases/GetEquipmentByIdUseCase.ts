// src/core/application/equipment/use-cases/GetEquipmentByIdUseCase.ts

import type { Equipment, EquipmentId } from "../../../domain/equipment/Equipment";
import type { EquipmentRepository } from "../ports/EquipmentRepository";

export interface GetEquipmentByIdCommand {
  id: EquipmentId;
}

export interface GetEquipmentByIdResult {
  equipment: Equipment;
}

/**
 * Application use case for retrieving a single equipment by ID.
 */
export class GetEquipmentByIdUseCase {
  constructor(private readonly equipmentRepository: EquipmentRepository) {}

  async execute(command: GetEquipmentByIdCommand): Promise<GetEquipmentByIdResult> {
    const equipment = await this.equipmentRepository.findById(command.id);
    if (!equipment) {
      throw new Error("Equipment not found.");
    }

    return { equipment };
  }
}
