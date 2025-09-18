export interface ProcessOrderProps {
  id: string;
  name: string;
  jobRun: number;
  plannedSpeed: number;
  startProduction: Date;
  expectedRunTime: Date;
  programmedMultiplier?: number;
  realMultiplier?: number;
  zeroSpeedThreshold?: number;
  productionSpeedThreshold?: number;
  zeroSpeedTimeout?: number;
  productionSpeedTimeout?: number;
  cycleToRun?: number;
  cycleTime?: number;
  machineId?: string;
  userId?: string;
  productOrderId: string;
  createdAt: Date;
  updatedAt?: Date;
  deletedAt?: Date;
}

export class ProcessOrder {
  private props: ProcessOrderProps;

  private constructor(props: ProcessOrderProps) {
    this.props = props;
  }

  // Factory method para criação
  static create(data: {
    name: string;
    jobRun: number;
    plannedSpeed: number;
    startProduction: Date;
    expectedRunTime: Date;
    programmedMultiplier?: number;
    realMultiplier?: number;
    zeroSpeedThreshold?: number;
    productionSpeedThreshold?: number;
    zeroSpeedTimeout?: number;
    productionSpeedTimeout?: number;
    cycleToRun?: number;
    cycleTime?: number;
    machineId?: string;
    userId?: string;
    productOrderId: string;
  }): ProcessOrder {
    // Validações de negócio
    if (!data.name || data.name.trim().length === 0) {
      throw new Error('Nome é obrigatório');
    }

    if (data.name.trim().length > 100) {
      throw new Error('Nome deve ter no máximo 100 caracteres');
    }

    if (data.jobRun <= 0) {
      throw new Error('Job run deve ser maior que zero');
    }

    if (data.jobRun > 999999) {
      throw new Error('Job run deve ser menor que 999999');
    }

    if (data.plannedSpeed < 0) {
      throw new Error('Velocidade planejada deve ser maior ou igual a zero');
    }

    if (data.plannedSpeed > 999999) {
      throw new Error('Velocidade planejada deve ser menor que 999999');
    }

    if (data.expectedRunTime <= data.startProduction) {
      throw new Error(
        'Tempo esperado de execução deve ser posterior ao início da produção'
      );
    }

    // Validações opcionais
    if (
      data.programmedMultiplier !== undefined &&
      data.programmedMultiplier < 0
    ) {
      throw new Error(
        'Multiplicador programado deve ser maior ou igual a zero'
      );
    }

    if (data.realMultiplier !== undefined && data.realMultiplier < 0) {
      throw new Error('Multiplicador real deve ser maior ou igual a zero');
    }

    if (data.zeroSpeedThreshold !== undefined && data.zeroSpeedThreshold < 0) {
      throw new Error(
        'Limite de velocidade zero deve ser maior ou igual a zero'
      );
    }

    if (
      data.productionSpeedThreshold !== undefined &&
      data.productionSpeedThreshold < 0
    ) {
      throw new Error(
        'Limite de velocidade de produção deve ser maior ou igual a zero'
      );
    }

    if (data.zeroSpeedTimeout !== undefined && data.zeroSpeedTimeout < 0) {
      throw new Error(
        'Timeout de velocidade zero deve ser maior ou igual a zero'
      );
    }

    if (
      data.productionSpeedTimeout !== undefined &&
      data.productionSpeedTimeout < 0
    ) {
      throw new Error(
        'Timeout de velocidade de produção deve ser maior ou igual a zero'
      );
    }

    if (data.cycleToRun !== undefined && data.cycleToRun < 0) {
      throw new Error('Ciclos para executar deve ser maior ou igual a zero');
    }

    if (data.cycleTime !== undefined && data.cycleTime < 0) {
      throw new Error('Tempo de ciclo deve ser maior ou igual a zero');
    }

    const now = new Date();
    const props: ProcessOrderProps = {
      id: crypto.randomUUID(),
      name: data.name.trim(),
      jobRun: data.jobRun,
      plannedSpeed: data.plannedSpeed,
      startProduction: data.startProduction,
      expectedRunTime: data.expectedRunTime,
      ...(data.programmedMultiplier !== undefined && {
        programmedMultiplier: data.programmedMultiplier,
      }),
      ...(data.realMultiplier !== undefined && {
        realMultiplier: data.realMultiplier,
      }),
      ...(data.zeroSpeedThreshold !== undefined && {
        zeroSpeedThreshold: data.zeroSpeedThreshold,
      }),
      ...(data.productionSpeedThreshold !== undefined && {
        productionSpeedThreshold: data.productionSpeedThreshold,
      }),
      ...(data.zeroSpeedTimeout !== undefined && {
        zeroSpeedTimeout: data.zeroSpeedTimeout,
      }),
      ...(data.productionSpeedTimeout !== undefined && {
        productionSpeedTimeout: data.productionSpeedTimeout,
      }),
      ...(data.cycleToRun !== undefined && { cycleToRun: data.cycleToRun }),
      ...(data.cycleTime !== undefined && { cycleTime: data.cycleTime }),
      ...(data.machineId !== undefined && { machineId: data.machineId }),
      ...(data.userId !== undefined && { userId: data.userId }),
      productOrderId: data.productOrderId,
      createdAt: now,
      updatedAt: now,
    };

    return new ProcessOrder(props);
  }

  // Factory method para reconstituição a partir do banco
  static fromPersistence(data: ProcessOrderProps): ProcessOrder {
    return new ProcessOrder(data);
  }

  // Getters
  get id(): string {
    return this.props.id;
  }

  get name(): string {
    return this.props.name;
  }

  get jobRun(): number {
    return this.props.jobRun;
  }

  get plannedSpeed(): number {
    return this.props.plannedSpeed;
  }

  get startProduction(): Date {
    return this.props.startProduction;
  }

  get expectedRunTime(): Date {
    return this.props.expectedRunTime;
  }

  get programmedMultiplier(): number | undefined {
    return this.props.programmedMultiplier;
  }

  get realMultiplier(): number | undefined {
    return this.props.realMultiplier;
  }

  get zeroSpeedThreshold(): number | undefined {
    return this.props.zeroSpeedThreshold;
  }

  get productionSpeedThreshold(): number | undefined {
    return this.props.productionSpeedThreshold;
  }

  get zeroSpeedTimeout(): number | undefined {
    return this.props.zeroSpeedTimeout;
  }

  get productionSpeedTimeout(): number | undefined {
    return this.props.productionSpeedTimeout;
  }

  get cycleToRun(): number | undefined {
    return this.props.cycleToRun;
  }

  get cycleTime(): number | undefined {
    return this.props.cycleTime;
  }

  get machineId(): string | undefined {
    return this.props.machineId;
  }

  get userId(): string | undefined {
    return this.props.userId;
  }

  get productOrderId(): string {
    return this.props.productOrderId;
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

  get isDeleted(): boolean {
    return this.props.deletedAt !== undefined;
  }

  // Métodos de negócio
  update(data: {
    name?: string;
    jobRun?: number;
    plannedSpeed?: number;
    startProduction?: Date;
    expectedRunTime?: Date;
    programmedMultiplier?: number;
    realMultiplier?: number;
    zeroSpeedThreshold?: number;
    productionSpeedThreshold?: number;
    zeroSpeedTimeout?: number;
    productionSpeedTimeout?: number;
    cycleToRun?: number;
    cycleTime?: number;
    machineId?: string;
    userId?: string;
  }): void {
    if (this.isDeleted) {
      throw new Error(
        'Não é possível atualizar uma ordem de processo excluída'
      );
    }

    if (data.name !== undefined) {
      if (!data.name || data.name.trim().length === 0) {
        throw new Error('Nome é obrigatório');
      }
      if (data.name.trim().length > 100) {
        throw new Error('Nome deve ter no máximo 100 caracteres');
      }
      this.props.name = data.name.trim();
    }

    if (data.jobRun !== undefined) {
      if (data.jobRun <= 0) {
        throw new Error('Job run deve ser maior que zero');
      }
      if (data.jobRun > 999999) {
        throw new Error('Job run deve ser menor que 999999');
      }
      this.props.jobRun = data.jobRun;
    }

    if (data.plannedSpeed !== undefined) {
      if (data.plannedSpeed < 0) {
        throw new Error('Velocidade planejada deve ser maior ou igual a zero');
      }
      if (data.plannedSpeed > 999999) {
        throw new Error('Velocidade planejada deve ser menor que 999999');
      }
      this.props.plannedSpeed = data.plannedSpeed;
    }

    if (data.startProduction !== undefined) {
      this.props.startProduction = data.startProduction;
    }

    if (data.expectedRunTime !== undefined) {
      this.props.expectedRunTime = data.expectedRunTime;
    }

    if (data.programmedMultiplier !== undefined) {
      if (data.programmedMultiplier < 0) {
        throw new Error(
          'Multiplicador programado deve ser maior ou igual a zero'
        );
      }
      this.props.programmedMultiplier = data.programmedMultiplier;
    }

    if (data.realMultiplier !== undefined) {
      if (data.realMultiplier < 0) {
        throw new Error('Multiplicador real deve ser maior ou igual a zero');
      }
      this.props.realMultiplier = data.realMultiplier;
    }

    if (data.zeroSpeedThreshold !== undefined) {
      if (data.zeroSpeedThreshold < 0) {
        throw new Error(
          'Limite de velocidade zero deve ser maior ou igual a zero'
        );
      }
      this.props.zeroSpeedThreshold = data.zeroSpeedThreshold;
    }

    if (data.productionSpeedThreshold !== undefined) {
      if (data.productionSpeedThreshold < 0) {
        throw new Error(
          'Limite de velocidade de produção deve ser maior ou igual a zero'
        );
      }
      this.props.productionSpeedThreshold = data.productionSpeedThreshold;
    }

    if (data.zeroSpeedTimeout !== undefined) {
      if (data.zeroSpeedTimeout < 0) {
        throw new Error(
          'Timeout de velocidade zero deve ser maior ou igual a zero'
        );
      }
      this.props.zeroSpeedTimeout = data.zeroSpeedTimeout;
    }

    if (data.productionSpeedTimeout !== undefined) {
      if (data.productionSpeedTimeout < 0) {
        throw new Error(
          'Timeout de velocidade de produção deve ser maior ou igual a zero'
        );
      }
      this.props.productionSpeedTimeout = data.productionSpeedTimeout;
    }

    if (data.cycleToRun !== undefined) {
      if (data.cycleToRun < 0) {
        throw new Error('Ciclos para executar deve ser maior ou igual a zero');
      }
      this.props.cycleToRun = data.cycleToRun;
    }

    if (data.cycleTime !== undefined) {
      if (data.cycleTime < 0) {
        throw new Error('Tempo de ciclo deve ser maior ou igual a zero');
      }
      this.props.cycleTime = data.cycleTime;
    }

    if (data.machineId !== undefined) {
      this.props.machineId = data.machineId;
    }

    if (data.userId !== undefined) {
      this.props.userId = data.userId;
    }

    // Validação de datas após atualização
    if (this.props.expectedRunTime <= this.props.startProduction) {
      throw new Error(
        'Tempo esperado de execução deve ser posterior ao início da produção'
      );
    }

    this.props.updatedAt = new Date();
  }

  delete(): void {
    if (this.isDeleted) {
      throw new Error('Ordem de processo já está excluída');
    }
    this.props.deletedAt = new Date();
    this.props.updatedAt = new Date();
  }

  restore(): void {
    if (!this.isDeleted) {
      throw new Error('Ordem de processo não está excluída');
    }
    this.props.deletedAt = undefined as any;
    this.props.updatedAt = new Date();
  }

  // Serialização para persistência
  toPlainObject(): ProcessOrderProps {
    return {
      id: this.props.id,
      name: this.props.name,
      jobRun: this.props.jobRun,
      plannedSpeed: this.props.plannedSpeed,
      startProduction: this.props.startProduction,
      expectedRunTime: this.props.expectedRunTime,
      ...(this.props.programmedMultiplier !== undefined && {
        programmedMultiplier: this.props.programmedMultiplier,
      }),
      ...(this.props.realMultiplier !== undefined && {
        realMultiplier: this.props.realMultiplier,
      }),
      ...(this.props.zeroSpeedThreshold !== undefined && {
        zeroSpeedThreshold: this.props.zeroSpeedThreshold,
      }),
      ...(this.props.productionSpeedThreshold !== undefined && {
        productionSpeedThreshold: this.props.productionSpeedThreshold,
      }),
      ...(this.props.zeroSpeedTimeout !== undefined && {
        zeroSpeedTimeout: this.props.zeroSpeedTimeout,
      }),
      ...(this.props.productionSpeedTimeout !== undefined && {
        productionSpeedTimeout: this.props.productionSpeedTimeout,
      }),
      ...(this.props.cycleToRun !== undefined && {
        cycleToRun: this.props.cycleToRun,
      }),
      ...(this.props.cycleTime !== undefined && {
        cycleTime: this.props.cycleTime,
      }),
      ...(this.props.machineId !== undefined && {
        machineId: this.props.machineId,
      }),
      ...(this.props.userId !== undefined && { userId: this.props.userId }),
      productOrderId: this.props.productOrderId,
      createdAt: this.props.createdAt,
      ...(this.props.updatedAt !== undefined && {
        updatedAt: this.props.updatedAt,
      }),
      ...(this.props.deletedAt !== undefined && {
        deletedAt: this.props.deletedAt,
      }),
    };
  }
}
