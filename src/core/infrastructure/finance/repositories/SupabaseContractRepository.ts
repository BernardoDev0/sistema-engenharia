// src/core/infrastructure/finance/repositories/SupabaseContractRepository.ts

import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";
import { Contract } from "@/core/domain/finance/Contract";
import type { ContractId } from "@/core/domain/finance/Contract";
import type { SupplierId } from "@/core/domain/finance/Supplier";
import type { ProjectId } from "@/core/domain/finance/ProjectTypes";
import type { ContractRepository } from "@/core/application/finance/ports/ContractRepository";

type DbContract = Database["public"]["Tables"]["contracts"]["Row"];

export class SupabaseContractRepository implements ContractRepository {
  async create(contract: Contract): Promise<Contract> {
    const { error } = await supabase.from("contracts").insert({
      id: contract.id,
      supplier_id: contract.supplierId,
      project_id: contract.projectId as ProjectId | null,
      title: contract.title,
      description: contract.description,
      start_date: contract.startDate.toISOString().slice(0, 10),
      end_date: contract.endDate.toISOString().slice(0, 10),
      value: contract.value,
      currency: contract.currency,
      status: contract.status,
    });

    if (error) {
      throw new Error(`Failed to create contract: ${error.message}`);
    }

    return contract;
  }

  async findById(id: ContractId): Promise<Contract | null> {
    const { data, error } = await supabase
      .from("contracts")
      .select("*")
      .eq("id", id)
      .maybeSingle();

    if (error) {
      throw new Error(`Failed to load contract: ${error.message}`);
    }

    if (!data) return null;

    return this.mapRowToEntity(data);
  }

  async findBySupplierId(supplierId: SupplierId): Promise<Contract[]> {
    const { data, error } = await supabase
      .from("contracts")
      .select("*")
      .eq("supplier_id", supplierId)
      .order("start_date", { ascending: false });

    if (error) {
      throw new Error(`Failed to list contracts: ${error.message}`);
    }

    return (data ?? []).map((row) => this.mapRowToEntity(row));
  }

  async findAll(): Promise<Contract[]> {
    const { data, error } = await supabase
      .from("contracts")
      .select("*")
      .order("start_date", { ascending: false });

    if (error) {
      throw new Error(`Failed to list contracts: ${error.message}`);
    }

    return (data ?? []).map((row) => this.mapRowToEntity(row));
  }

  private mapRowToEntity(row: DbContract): Contract {
    return Contract.create({
      id: row.id as ContractId,
      supplierId: row.supplier_id as SupplierId,
      projectId: (row.project_id as ProjectId | null) ?? null,
      title: row.title,
      description: row.description,
      startDate: new Date(row.start_date),
      endDate: new Date(row.end_date),
      value: Number(row.value ?? 0),
      currency: row.currency,
      status: row.status as any,
      createdAt: new Date(row.created_at),
      updatedAt: new Date(row.updated_at),
    });
  }
}
