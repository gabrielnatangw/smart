export interface ViewCardProps {
  id: string;
  viewId: string;
  sensorId: string;
  moduleId: string;
  machineId?: string;
  positionX: number;
  positionY: number;
  width: number;
  height: number;
  chartType: string;
  title?: string;
  sortOrder: number;
  createdAt: Date;
  updatedAt?: Date;
  deletedAt?: Date;
  tenantId: string;
  createdBy: string;
  updatedBy: string;
}

export class ViewCard {
  private constructor(private props: ViewCardProps) {}

  static create(data: {
    id: string;
    viewId: string;
    sensorId: string;
    moduleId: string;
    machineId?: string;
    positionX?: number;
    positionY?: number;
    width?: number;
    height?: number;
    chartType: string;
    title?: string;
    sortOrder?: number;
    tenantId: string;
    createdBy: string;
    updatedBy: string;
  }): ViewCard {
    const now = new Date();

    if (!data.viewId || data.viewId.trim().length === 0) {
      throw new Error('View ID is required');
    }

    if (!data.sensorId || data.sensorId.trim().length === 0) {
      throw new Error('Sensor ID is required');
    }

    if (!data.moduleId || data.moduleId.trim().length === 0) {
      throw new Error('Module ID is required');
    }

    if (!data.chartType || data.chartType.trim().length === 0) {
      throw new Error('Chart type is required');
    }

    const validChartTypes = ['GAUGE', 'LINE', 'BAR', 'ONOFF', 'STEP', 'PIE'];
    if (!validChartTypes.includes(data.chartType)) {
      throw new Error('Invalid chart type');
    }

    if ((data.positionX ?? 0) < 0 || (data.positionY ?? 0) < 0) {
      throw new Error('Position cannot be negative');
    }

    if ((data.width ?? 1) < 1 || (data.height ?? 1) < 1) {
      throw new Error('Width and height must be at least 1');
    }

    if (data.title && data.title.length > 255) {
      throw new Error('Title cannot exceed 255 characters');
    }

    return new ViewCard({
      id: data.id,
      viewId: data.viewId,
      sensorId: data.sensorId,
      moduleId: data.moduleId,
      machineId: data.machineId,
      positionX: data.positionX ?? 0,
      positionY: data.positionY ?? 0,
      width: data.width ?? 1,
      height: data.height ?? 1,
      chartType: data.chartType,
      title: data.title?.trim(),
      sortOrder: data.sortOrder ?? 0,
      createdAt: now,
      updatedAt: now,
      tenantId: data.tenantId,
      createdBy: data.createdBy,
      updatedBy: data.updatedBy,
    });
  }

  static fromPersistence(data: ViewCardProps): ViewCard {
    return new ViewCard(data);
  }

  update(data: {
    positionX?: number;
    positionY?: number;
    width?: number;
    height?: number;
    chartType?: string;
    title?: string;
    sortOrder?: number;
    updatedBy: string;
  }): void {
    if (data.positionX !== undefined) {
      if (data.positionX < 0) {
        throw new Error('Position X cannot be negative');
      }
      this.props.positionX = data.positionX;
    }

    if (data.positionY !== undefined) {
      if (data.positionY < 0) {
        throw new Error('Position Y cannot be negative');
      }
      this.props.positionY = data.positionY;
    }

    if (data.width !== undefined) {
      if (data.width < 1) {
        throw new Error('Width must be at least 1');
      }
      this.props.width = data.width;
    }

    if (data.height !== undefined) {
      if (data.height < 1) {
        throw new Error('Height must be at least 1');
      }
      this.props.height = data.height;
    }

    if (data.chartType !== undefined) {
      const validChartTypes = ['GAUGE', 'LINE', 'BAR', 'ONOFF', 'STEP', 'PIE'];
      if (!validChartTypes.includes(data.chartType)) {
        throw new Error('Invalid chart type');
      }
      this.props.chartType = data.chartType;
    }

    if (data.title !== undefined) {
      if (data.title && data.title.length > 255) {
        throw new Error('Title cannot exceed 255 characters');
      }
      this.props.title = data.title?.trim();
    }

    if (data.sortOrder !== undefined) {
      this.props.sortOrder = data.sortOrder;
    }

    this.props.updatedBy = data.updatedBy;
    this.props.updatedAt = new Date();
  }

  delete(): void {
    this.props.deletedAt = new Date();
  }

  restore(): void {
    this.props.deletedAt = undefined;
  }

  // Getters
  get id(): string {
    return this.props.id;
  }
  get viewId(): string {
    return this.props.viewId;
  }
  get sensorId(): string {
    return this.props.sensorId;
  }
  get moduleId(): string {
    return this.props.moduleId;
  }
  get machineId(): string | undefined {
    return this.props.machineId;
  }
  get positionX(): number {
    return this.props.positionX;
  }
  get positionY(): number {
    return this.props.positionY;
  }
  get width(): number {
    return this.props.width;
  }
  get height(): number {
    return this.props.height;
  }
  get chartType(): string {
    return this.props.chartType;
  }
  get title(): string | undefined {
    return this.props.title;
  }
  get sortOrder(): number {
    return this.props.sortOrder;
  }
  get createdAt(): Date {
    return this.props.createdAt;
  }
  get updatedAt(): Date | undefined {
    return this.props.updatedAt;
  }
  get deletedAt(): Date | undefined {
    return this.props.deletedAt;
  }
  get tenantId(): string {
    return this.props.tenantId;
  }
  get createdBy(): string {
    return this.props.createdBy;
  }
  get updatedBy(): string {
    return this.props.updatedBy;
  }

  get isDeleted(): boolean {
    return this.props.deletedAt !== undefined;
  }
}
