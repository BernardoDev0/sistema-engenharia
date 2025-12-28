// src/core/domain/equipment/Equipment.ts

export type EquipmentId = string & { readonly __brand: "EquipmentId" };

export type EquipmentStatus = "AVAILABLE" | "IN_USE" | "MAINTENANCE" | "DISCARDED";

export interface EquipmentProps {
  id: EquipmentId;
  name: string;
  category: string;
  certification: string | null;
  status: EquipmentStatus;
  totalQuantity: number;
  quantityInUse: number;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Equipment entity representing physical equipment items in the system.
 *
 * Business rules:
 * - Quantity in use cannot exceed total quantity
 * - Discarded equipment cannot be loaned
 * - Name and category are required
 * - Total quantity must be positive
 */
export class Equipment {
  private readonly props: EquipmentProps;

  private constructor(props: EquipmentProps) {
    this.props = Equipment.validate(props);
  }

  static create(props: EquipmentProps): Equipment {
    return new Equipment(props);
  }

  private static validate(props: EquipmentProps): EquipmentProps {
    if (!props.name || props.name.trim().length === 0) {
      throw new Error("Equipment name is required.");
    }

    if (!props.category || props.category.trim().length === 0) {
      throw new Error("Equipment category is required.");
    }

    if (props.totalQuantity < 0) {
      throw new Error("Total quantity must be non-negative.");
    }

    if (props.quantityInUse < 0) {
      throw new Error("Quantity in use must be non-negative.");
    }

    if (props.quantityInUse > props.totalQuantity) {
      throw new Error("Quantity in use cannot exceed total quantity.");
    }

    return { ...props };
  }

  get id(): EquipmentId {
    return this.props.id;
  }

  get name(): string {
    return this.props.name;
  }

  get category(): string {
    return this.props.category;
  }

  get certification(): string | null {
    return this.props.certification;
  }

  get status(): EquipmentStatus {
    return this.props.status;
  }

  get totalQuantity(): number {
    return this.props.totalQuantity;
  }

  get quantityInUse(): number {
    return this.props.quantityInUse;
  }

  get quantityAvailable(): number {
    return this.props.totalQuantity - this.props.quantityInUse;
  }

  get createdAt(): Date {
    return this.props.createdAt;
  }

  get updatedAt(): Date {
    return this.props.updatedAt;
  }

  /**
   * Checks if this equipment can be loaned.
   * Discarded equipment cannot be loaned.
   */
  canBeLoanedOut(): boolean {
    return this.props.status !== "DISCARDED" && this.quantityAvailable > 0;
  }

  /**
   * Returns a new Equipment instance with updated properties.
   */
  update(changes: {
    name?: string;
    category?: string;
    certification?: string | null;
    status?: EquipmentStatus;
    totalQuantity?: number;
  }): Equipment {
    return new Equipment({
      ...this.props,
      ...changes,
      updatedAt: new Date(),
    });
  }
}
