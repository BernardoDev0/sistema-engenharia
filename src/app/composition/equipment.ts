// src/app/composition/equipment.ts

import { SupabaseEquipmentRepository } from "../../core/infrastructure/equipment/repositories/SupabaseEquipmentRepository";
import { CreateEquipmentUseCase } from "../../core/application/equipment/use-cases/CreateEquipmentUseCase";
import { UpdateEquipmentUseCase } from "../../core/application/equipment/use-cases/UpdateEquipmentUseCase";
import { ListEquipmentUseCase } from "../../core/application/equipment/use-cases/ListEquipmentUseCase";
import { GetEquipmentByIdUseCase } from "../../core/application/equipment/use-cases/GetEquipmentByIdUseCase";

// Composition root for the Equipment context.

// 1. Instantiate infrastructure adapters
const equipmentRepository = new SupabaseEquipmentRepository();

// 2. Instantiate use cases
export const createEquipmentUseCase = new CreateEquipmentUseCase(equipmentRepository);
export const updateEquipmentUseCase = new UpdateEquipmentUseCase(equipmentRepository);
export const listEquipmentUseCase = new ListEquipmentUseCase(equipmentRepository);
export const getEquipmentByIdUseCase = new GetEquipmentByIdUseCase(equipmentRepository);
