// src/core/application/finance/ports/ContractRepository.ts

import type { Contract, ContractId } from "../../../domain/finance/Contract";
import type { SupplierId } from "../../../domain/finance/Supplier";

export interface ContractRepository {
  create(contract: Contract): Promise<Contract>;
  findById(id: ContractId): Promise<Contract | null>;
  findBySupplierId(supplierId: SupplierId): Promise<Contract[]>;
  findAll(): Promise<Contract[]>;
}

