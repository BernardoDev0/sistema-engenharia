// src/core/application/finance/ports/ExpenseRepository.ts

import type { Expense, ExpenseId } from "../../../domain/finance/Expense";
import type { SupplierId } from "../../../domain/finance/Supplier";
import type { ProjectId } from "../../../domain/finance/ProjectTypes";

export interface ExpenseRepository {
  create(expense: Expense): Promise<Expense>;
  findById(id: ExpenseId): Promise<Expense | null>;
  findBySupplierId(supplierId: SupplierId): Promise<Expense[]>;
  findByProjectId(projectId: ProjectId): Promise<Expense[]>;
  findByRecent(limit: number): Promise<Expense[]>;
}


