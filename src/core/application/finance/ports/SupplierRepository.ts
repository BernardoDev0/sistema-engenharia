// src/core/application/finance/ports/SupplierRepository.ts

import type { Supplier, SupplierId } from "../../../domain/finance/Supplier";

export interface SupplierRepository {
  create(supplier: Supplier): Promise<Supplier>;
  findById(id: SupplierId): Promise<Supplier | null>;
  findAll(): Promise<Supplier[]>;
}

