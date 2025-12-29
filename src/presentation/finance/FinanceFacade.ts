// src/presentation/finance/FinanceFacade.ts

import { Supplier } from "@/core/domain/finance/Supplier";
import type { SupplierId } from "@/core/domain/finance/Supplier";
import { Contract } from "@/core/domain/finance/Contract";
import type { ContractId } from "@/core/domain/finance/Contract";
import { Expense } from "@/core/domain/finance/Expense";
import { Invoice } from "@/core/domain/finance/Invoice";
import type { SupplierRepository } from "@/core/application/finance/ports/SupplierRepository";
import type { ContractRepository } from "@/core/application/finance/ports/ContractRepository";
import type { ExpenseRepository } from "@/core/application/finance/ports/ExpenseRepository";
import type { InvoiceRepository } from "@/core/application/finance/ports/InvoiceRepository";
import { SupabaseSupplierRepository } from "@/core/infrastructure/finance/repositories/SupabaseSupplierRepository";
import { SupabaseContractRepository } from "@/core/infrastructure/finance/repositories/SupabaseContractRepository";
import { SupabaseExpenseRepository } from "@/core/infrastructure/finance/repositories/SupabaseExpenseRepository";
import { SupabaseInvoiceRepository } from "@/core/infrastructure/finance/repositories/SupabaseInvoiceRepository";

export interface FinancialOverview {
  contractsTotalByCurrency: Record<string, number>;
  expensesTotalByCurrency: Record<string, number>;
  openInvoicesTotalByCurrency: Record<string, number>;
}

export class FinanceFacade {
  private readonly suppliers: SupplierRepository;
  private readonly contracts: ContractRepository;
  private readonly expenses: ExpenseRepository;
  private readonly invoices: InvoiceRepository;

  constructor(deps?: {
    suppliers?: SupplierRepository;
    contracts?: ContractRepository;
    expenses?: ExpenseRepository;
    invoices?: InvoiceRepository;
  }) {
    this.suppliers = deps?.suppliers ?? new SupabaseSupplierRepository();
    this.contracts = deps?.contracts ?? new SupabaseContractRepository();
    this.expenses = deps?.expenses ?? new SupabaseExpenseRepository();
    this.invoices = deps?.invoices ?? new SupabaseInvoiceRepository();
  }

  async listSuppliers(): Promise<Supplier[]> {
    return this.suppliers.findAll();
  }

  async createSupplier(input: {
    name?: string;
    serviceType?: Supplier["serviceType"];
    contactInfo?: string;
    certifications?: string;
  }): Promise<Supplier> {
    const supplier = Supplier.create({
      id: crypto.randomUUID() as SupplierId,
      name: input.name ?? "",
      serviceType: (input.serviceType ?? "EQUIPMENT") as Supplier["serviceType"],
      contactInfo: input.contactInfo ?? null,
      certifications: input.certifications ?? null,
      status: "ACTIVE",
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    return this.suppliers.create(supplier);
  }

  async listContracts(supplierId?: SupplierId): Promise<Contract[]> {
    if (supplierId) {
      return this.contracts.findBySupplierId(supplierId);
    }
    return this.contracts.findAll();
  }

  async getFinancialOverview(): Promise<FinancialOverview> {
    const [contracts, latestExpenses, latestInvoices] = await Promise.all([
      this.contracts.findAll(),
      this.expenses.findByRecent(10),
      this.invoices.findRecentOpen(10),
    ]);

    const contractsTotalByCurrency: Record<string, number> = {};
    const expensesTotalByCurrency: Record<string, number> = {};
    const openInvoicesTotalByCurrency: Record<string, number> = {};

    for (const c of contracts) {
      contractsTotalByCurrency[c.currency] =
        (contractsTotalByCurrency[c.currency] ?? 0) + c.value;
    }

    for (const e of latestExpenses) {
      expensesTotalByCurrency[e.currency] =
        (expensesTotalByCurrency[e.currency] ?? 0) + e.amount;
    }

    for (const inv of latestInvoices) {
      if (inv.status === "PAID") continue;
      openInvoicesTotalByCurrency[inv.currency] =
        (openInvoicesTotalByCurrency[inv.currency] ?? 0) + inv.amount;
    }

    return {
      contractsTotalByCurrency,
      expensesTotalByCurrency,
      openInvoicesTotalByCurrency,
    };
  }
}
