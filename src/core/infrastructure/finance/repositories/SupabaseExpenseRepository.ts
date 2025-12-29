// src/core/infrastructure/finance/repositories/SupabaseExpenseRepository.ts

import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";
import { Expense } from "@/core/domain/finance/Expense";
import type { ExpenseId } from "@/core/domain/finance/Expense";
import type { SupplierId } from "@/core/domain/finance/Supplier";
import type { ProjectId } from "@/core/domain/finance/ProjectTypes";
import type { ExpenseRepository } from "@/core/application/finance/ports/ExpenseRepository";

type DbExpense = Database["public"]["Tables"]["expenses"]["Row"];

export class SupabaseExpenseRepository implements ExpenseRepository {
  async create(expense: Expense): Promise<Expense> {
    const { error } = await supabase.from("expenses").insert({
      id: expense.id,
      project_id: expense.projectId as ProjectId | null,
      supplier_id: expense.supplierId,
      category: expense.category,
      amount: expense.amount,
      currency: expense.currency,
      incurred_at: expense.incurredAt.toISOString().slice(0, 10),
      description: expense.description,
    });

    if (error) {
      throw new Error(`Failed to register expense: ${error.message}`);
    }

    return expense;
  }

  async findById(id: ExpenseId): Promise<Expense | null> {
    const { data, error } = await supabase
      .from("expenses")
      .select("*")
      .eq("id", id)
      .maybeSingle();

    if (error) {
      throw new Error(`Failed to load expense: ${error.message}`);
    }

    if (!data) return null;

    return this.mapRowToEntity(data);
  }

  async findBySupplierId(supplierId: SupplierId): Promise<Expense[]> {
    const { data, error } = await supabase
      .from("expenses")
      .select("*")
      .eq("supplier_id", supplierId)
      .order("incurred_at", { ascending: false });

    if (error) {
      throw new Error(`Failed to list expenses: ${error.message}`);
    }

    return (data ?? []).map((row) => this.mapRowToEntity(row));
  }

  async findByProjectId(projectId: ProjectId): Promise<Expense[]> {
    const { data, error } = await supabase
      .from("expenses")
      .select("*")
      .eq("project_id", projectId)
      .order("incurred_at", { ascending: false });

    if (error) {
      throw new Error(`Failed to list expenses: ${error.message}`);
    }

    return (data ?? []).map((row) => this.mapRowToEntity(row));
  }

  async findByRecent(limit: number): Promise<Expense[]> {
    const { data, error } = await supabase
      .from("expenses")
      .select("*")
      .order("incurred_at", { ascending: false })
      .limit(limit);

    if (error) {
      throw new Error(`Failed to list recent expenses: ${error.message}`);
    }

    return (data ?? []).map((row) => this.mapRowToEntity(row));
  }

  private mapRowToEntity(row: DbExpense): Expense {
    return Expense.create({
      id: row.id as ExpenseId,
      projectId: (row.project_id as ProjectId | null) ?? null,
      supplierId: row.supplier_id as SupplierId,
      category: row.category,
      amount: Number(row.amount ?? 0),
      currency: row.currency,
      incurredAt: new Date(row.incurred_at),
      description: row.description,
      createdAt: new Date(row.created_at),
    });
  }
}
