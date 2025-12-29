// src/core/domain/finance/Supplier.ts

export type SupplierId = string & { readonly brand: unique symbol };

export type SupplierServiceType = "EQUIPMENT" | "MAINTENANCE" | "WASTE_DISPOSAL" | "CONSULTING";

export type SupplierStatus = "ACTIVE" | "INACTIVE";

export interface SupplierProps {
  id: SupplierId;
  name: string;
  serviceType: SupplierServiceType;
  contactInfo: string | null;
  certifications: string | null;
  status: SupplierStatus;
  createdAt: Date;
  updatedAt: Date;
}

export class Supplier {
  private constructor(private readonly props: SupplierProps) {}

  static create(props: SupplierProps): Supplier {
    if (!props.name || !props.name.trim()) {
      throw new Error("Supplier name is required.");
    }

    return new Supplier({
      ...props,
      name: props.name.trim(),
      contactInfo: props.contactInfo?.trim() ?? null,
      certifications: props.certifications?.trim() ?? null,
    });
  }

  get id(): SupplierId {
    return this.props.id;
  }

  get name(): string {
    return this.props.name;
  }

  get serviceType(): SupplierServiceType {
    return this.props.serviceType;
  }

  get contactInfo(): string | null {
    return this.props.contactInfo;
  }

  get certifications(): string | null {
    return this.props.certifications;
  }

  get status(): SupplierStatus {
    return this.props.status;
  }

  get createdAt(): Date {
    return this.props.createdAt;
  }

  get updatedAt(): Date {
    return this.props.updatedAt;
  }

  update(changes: Partial<Omit<SupplierProps, "id" | "createdAt" | "updatedAt">>): Supplier {
    return Supplier.create({
      ...this.props,
      ...changes,
      updatedAt: new Date(),
    });
  }
}
