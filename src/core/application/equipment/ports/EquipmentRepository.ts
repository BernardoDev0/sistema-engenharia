// src/core/application/equipment/ports/EquipmentRepository.ts

import type { Equipment, EquipmentId } from "../../../domain/equipment/Equipment";

/**
 * Port for persisting and retrieving equipment.
 */
export interface EquipmentRepository {
  create(equipment: Equipment): Promise<Equipment>;

  findById(id: EquipmentId): Promise<Equipment | null>;

  findAll(): Promise<Equipment[]>;

  save(equipment: Equipment): Promise<Equipment>;

  delete(id: EquipmentId): Promise<void>;
}
