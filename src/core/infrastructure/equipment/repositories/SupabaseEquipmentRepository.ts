// src/core/infrastructure/equipment/repositories/SupabaseEquipmentRepository.ts

import { Equipment } from "../../../domain/equipment/Equipment";
import type { EquipmentId, EquipmentStatus } from "../../../domain/equipment/Equipment";
import type { EquipmentRepository } from "../../../application/equipment/ports/EquipmentRepository";
import { supabase } from "../../supabase/client";
import type { Database } from "../../supabase/types";

type DbEquipment = Database["public"]["Tables"]["equipment"]["Row"];

/**
 * Supabase implementation of the EquipmentRepository port.
 */
export class SupabaseEquipmentRepository implements EquipmentRepository {
  async create(equipment: Equipment): Promise<Equipment> {
    const { error } = await supabase.from("equipment").insert({
      id: equipment.id,
      name: equipment.name,
      category: equipment.category,
      certification: equipment.certification,
      status: equipment.status,
      total_quantity: equipment.totalQuantity,
      quantity_in_use: equipment.quantityInUse,
    });

    if (error) {
      throw new Error(`Failed to create equipment: ${error.message}`);
    }

    return equipment;
  }

  async findById(id: EquipmentId): Promise<Equipment | null> {
    const { data, error } = await supabase
      .from("equipment")
      .select("*")
      .eq("id", id)
      .maybeSingle();

    if (error) {
      throw new Error(`Failed to find equipment: ${error.message}`);
    }

    if (!data) {
      return null;
    }

    return this.mapDbToEquipment(data);
  }

  async findAll(): Promise<Equipment[]> {
    const { data, error } = await supabase
      .from("equipment")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      throw new Error(`Failed to find all equipment: ${error.message}`);
    }

    if (!data || data.length === 0) {
      return [];
    }

    return data.map((row) => this.mapDbToEquipment(row));
  }

  async save(equipment: Equipment): Promise<Equipment> {
    const { error } = await supabase
      .from("equipment")
      .update({
        name: equipment.name,
        category: equipment.category,
        certification: equipment.certification,
        status: equipment.status,
        total_quantity: equipment.totalQuantity,
        quantity_in_use: equipment.quantityInUse,
        updated_at: equipment.updatedAt.toISOString(),
      })
      .eq("id", equipment.id);

    if (error) {
      throw new Error(`Failed to save equipment: ${error.message}`);
    }

    return equipment;
  }

  async delete(id: EquipmentId): Promise<void> {
    const { error } = await supabase.from("equipment").delete().eq("id", id);

    if (error) {
      throw new Error(`Failed to delete equipment: ${error.message}`);
    }
  }

  private mapDbToEquipment(row: DbEquipment): Equipment {
    return Equipment.create({
      id: row.id as EquipmentId,
      name: row.name,
      category: row.category,
      certification: row.certification,
      status: row.status as EquipmentStatus,
      totalQuantity: row.total_quantity,
      quantityInUse: row.quantity_in_use,
      createdAt: new Date(row.created_at),
      updatedAt: new Date(row.updated_at),
    });
  }
}
