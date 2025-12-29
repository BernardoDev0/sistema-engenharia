// src/core/infrastructure/finance/repositories/SupabaseInvoiceRepository.ts

import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";
import { Invoice } from "@/core/domain/finance/Invoice";
import type { InvoiceId } from "@/core/domain/finance/Invoice";
import type { SupplierId } from "@/core/domain/finance/Supplier";
import type { ContractId } from "@/core/domain/finance/Contract";
import type { InvoiceRepository } from "@/core/application/finance/ports/InvoiceRepository";

type DbInvoice = Database["public"]["Tables"]["invoices"]["Row"];

export class SupabaseInvoiceRepository implements InvoiceRepository {
  async create(invoice: Invoice): Promise<Invoice> {
    const { error } = await supabase.from("invoices").insert({
      id: invoice.id,
      supplier_id: invoice.supplierId,
      contract_id: invoice.contractId,
      amount: invoice.amount,
      currency: invoice.currency,
      due_date: invoice.dueDate.toISOString().slice(0, 10),
      status: invoice.status,
      document_url: invoice.documentUrl,
    });

    if (error) {
      throw new Error(`Failed to register invoice: ${error.message}`);
    }

    return invoice;
  }

  async findById(id: InvoiceId): Promise<Invoice | null> {
    const { data, error } = await supabase
      .from("invoices")
      .select("*")
      .eq("id", id)
      .maybeSingle();

    if (error) {
      throw new Error(`Failed to load invoice: ${error.message}`);
    }

    if (!data) return null;

    return this.mapRowToEntity(data);
  }

  async findBySupplierId(supplierId: SupplierId): Promise<Invoice[]> {
    const { data, error } = await supabase
      .from("invoices")
      .select("*")
      .eq("supplier_id", supplierId)
      .order("due_date", { ascending: false });

    if (error) {
      throw new Error(`Failed to list invoices: ${error.message}`);
    }

    return (data ?? []).map((row) => this.mapRowToEntity(row));
  }

  async findByContractId(contractId: ContractId): Promise<Invoice[]> {
    const { data, error } = await supabase
      .from("invoices")
      .select("*")
      .eq("contract_id", contractId)
      .order("due_date", { ascending: false });

    if (error) {
      throw new Error(`Failed to list invoices: ${error.message}`);
    }

    return (data ?? []).map((row) => this.mapRowToEntity(row));
  }

  async findRecentOpen(limit: number): Promise<Invoice[]> {
    const { data, error } = await supabase
      .from("invoices")
      .select("*")
      .in("status", ["PENDING", "OVERDUE"])
      .order("due_date", { ascending: false })
      .limit(limit);

    if (error) {
      throw new Error(`Failed to list recent invoices: ${error.message}`);
    }

    return (data ?? []).map((row) => this.mapRowToEntity(row));
  }

  private mapRowToEntity(row: DbInvoice): Invoice {
    return Invoice.create({
      id: row.id as InvoiceId,
      supplierId: row.supplier_id as SupplierId,
      contractId: row.contract_id as ContractId,
      amount: Number(row.amount ?? 0),
      currency: row.currency,
      dueDate: new Date(row.due_date),
      status: row.status as any,
      documentUrl: row.document_url,
      createdAt: new Date(row.created_at),
    });
  }
}
