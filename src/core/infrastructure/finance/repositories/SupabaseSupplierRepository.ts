// src/core/infrastructure/finance/repositories/SupabaseSupplierRepository.ts

import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";
import { Supplier } from "@/core/domain/finance/Supplier";
import type { SupplierId, SupplierStatus, SupplierServiceType } from "@/core/domain/finance/Supplier";
import type { SupplierRepository } from "@/core/application/finance/ports/SupplierRepository";

type DbSupplier = Database["public"]["Tables"]["suppliers"]["Row"];

export class SupabaseSupplierRepository implements SupplierRepository {
  async create(supplier: Supplier): Promise<Supplier> {
    const { error } = await supabase.from("suppliers").insert({
      id: supplier.id,
      name: supplier.name,
      service_type: supplier.serviceType,
      contact_info: supplier.contactInfo,
      certifications: supplier.certifications,
      status: supplier.status,
    });

    if (error) {
      throw new Error(`Failed to create supplier: ${error.message}`);
    }

    return supplier;
  }

  async findById(id: SupplierId): Promise<Supplier | null> {
    const { data, error } = await supabase
      .from("suppliers")
      .select("*")
      .eq("id", id)
      .maybeSingle();

    if (error) {
      throw new Error(`Failed to load supplier: ${error.message}`);
    }

    if (!data) return null;

    return this.mapRowToEntity(data);
  }

  async findAll(): Promise<Supplier[]> {
    const { data, error } = await supabase
      .from("suppliers")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      throw new Error(`Failed to list suppliers: ${error.message}`);
    }

    return (data ?? []).map((row) => this.mapRowToEntity(row));
  }

  private mapRowToEntity(row: DbSupplier): Supplier {
    return Supplier.create({
      id: row.id as SupplierId,
      name: row.name,
      serviceType: row.service_type as SupplierServiceType,
      contactInfo: row.contact_info,
      certifications: row.certifications,
      status: row.status as SupplierStatus,
      createdAt: new Date(row.created_at),
      updatedAt: new Date(row.updated_at),
    });
  }
}
