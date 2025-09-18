export interface MeasurementUnitProps {
  id: string;
  label: string;
  unitSymbol: string;
  tenantId: string;
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date | undefined;
}

export interface MeasurementUnitCreateProps {
  label: string;
  unitSymbol: string;
  tenantId: string;
}

export interface MeasurementUnitUpdateProps {
  label?: string | undefined;
  unitSymbol?: string | undefined;
}

export class MeasurementUnit {
  public readonly id: string;
  public readonly label: string;
  public readonly unitSymbol: string;
  public readonly tenantId: string;
  public readonly createdAt: Date;
  public readonly updatedAt: Date;
  public readonly deletedAt?: Date | undefined;

  constructor(props: MeasurementUnitProps) {
    this.id = props.id;
    this.label = props.label;
    this.unitSymbol = props.unitSymbol;
    this.tenantId = props.tenantId;
    this.createdAt = props.createdAt;
    this.updatedAt = props.updatedAt;
    this.deletedAt = props.deletedAt;
  }

  get isDeleted(): boolean {
    return this.deletedAt !== undefined && this.deletedAt !== null;
  }

  public static create(
    props: MeasurementUnitCreateProps & { id: string }
  ): MeasurementUnit {
    const now = new Date();
    return new MeasurementUnit({
      ...props,
      createdAt: now,
      updatedAt: now,
    });
  }

  public static fromPersistence(props: MeasurementUnitProps): MeasurementUnit {
    return new MeasurementUnit(props);
  }

  public update(updateData: MeasurementUnitUpdateProps): void {
    const updatedProps = { ...updateData };

    Object.keys(updatedProps).forEach(key => {
      const value = updatedProps[key as keyof MeasurementUnitUpdateProps];
      if (value !== undefined) {
        (this as any)[key] = value;
      }
    });

    (this as any).updatedAt = new Date();
  }
}
