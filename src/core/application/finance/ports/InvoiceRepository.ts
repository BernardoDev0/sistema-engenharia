// src/core/application/finance/ports/InvoiceRepository.ts

import type { Invoice, InvoiceId } from "../../../domain/finance/Invoice";
import type { SupplierId } from "../../../domain/finance/Supplier";
import type { ContractId } from "../../../domain/finance/Contract";

export interface InvoiceRepository {
  create(invoice: Invoice): Promise<Invoice>;
  findById(id: InvoiceId): Promise<Invoice | null>;
  findBySupplierId(supplierId: SupplierId): Promise<Invoice[]>;
  findByContractId(contractId: ContractId): Promise<Invoice[]>;
  findRecentOpen(limit: number): Promise<Invoice[]>;
}


