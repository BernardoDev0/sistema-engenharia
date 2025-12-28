// src/core/infrastructure/loan/repositories/SupabaseLoanRepository.ts

import { Loan } from "../../../domain/loan/Loan";
import type { LoanId, LoanStatus } from "../../../domain/loan/Loan";
import type { UserId } from "../../../domain/identity/User";
import type { EquipmentId } from "../../../domain/equipment/Equipment";
import type { LoanRepository } from "../../../application/loan/ports/LoanRepository";
import { supabase } from "../../supabase/client";
import type { Database } from "../../supabase/types";

type DbLoan = Database["public"]["Tables"]["loans"]["Row"];

/**
 * Supabase implementation of the LoanRepository port.
 */
export class SupabaseLoanRepository implements LoanRepository {
  async create(loan: Loan): Promise<Loan> {
    const { error } = await supabase.from("loans").insert({
      id: loan.id,
      user_id: loan.userId,
      equipment_id: loan.equipmentId,
      quantity: loan.quantity,
      status: loan.status,
      returned_at: loan.returnedAt?.toISOString() ?? null,
      damage_comment: loan.damageComment,
    });

    if (error) {
      throw new Error(`Failed to create loan: ${error.message}`);
    }

    return loan;
  }

  async findById(id: LoanId): Promise<Loan | null> {
    const { data, error } = await supabase
      .from("loans")
      .select("*")
      .eq("id", id)
      .maybeSingle();

    if (error) {
      throw new Error(`Failed to find loan: ${error.message}`);
    }

    if (!data) {
      return null;
    }

    return this.mapDbToLoan(data);
  }

  async findByUserId(userId: UserId): Promise<Loan[]> {
    const { data, error } = await supabase
      .from("loans")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (error) {
      throw new Error(`Failed to find loans by user: ${error.message}`);
    }

    if (!data || data.length === 0) {
      return [];
    }

    return data.map((row) => this.mapDbToLoan(row));
  }

  async findActiveLoans(): Promise<Loan[]> {
    const { data, error } = await supabase
      .from("loans")
      .select("*")
      .eq("status", "ACTIVE")
      .order("created_at", { ascending: false });

    if (error) {
      throw new Error(`Failed to find active loans: ${error.message}`);
    }

    if (!data || data.length === 0) {
      return [];
    }

    return data.map((row) => this.mapDbToLoan(row));
  }

  async findActiveLoansByEquipmentId(equipmentId: EquipmentId): Promise<Loan[]> {
    const { data, error } = await supabase
      .from("loans")
      .select("*")
      .eq("equipment_id", equipmentId)
      .eq("status", "ACTIVE")
      .order("created_at", { ascending: false });

    if (error) {
      throw new Error(`Failed to find active loans by equipment: ${error.message}`);
    }

    if (!data || data.length === 0) {
      return [];
    }

    return data.map((row) => this.mapDbToLoan(row));
  }

  async save(loan: Loan): Promise<Loan> {
    const { error } = await supabase
      .from("loans")
      .update({
        status: loan.status,
        returned_at: loan.returnedAt?.toISOString() ?? null,
        damage_comment: loan.damageComment,
      })
      .eq("id", loan.id);

    if (error) {
      throw new Error(`Failed to save loan: ${error.message}`);
    }

    return loan;
  }

  private mapDbToLoan(row: DbLoan): Loan {
    return Loan.create({
      id: row.id as LoanId,
      userId: row.user_id as UserId,
      equipmentId: row.equipment_id as EquipmentId,
      quantity: row.quantity,
      status: row.status as LoanStatus,
      createdAt: new Date(row.created_at),
      returnedAt: row.returned_at ? new Date(row.returned_at) : null,
      damageComment: row.damage_comment,
    });
  }
}
