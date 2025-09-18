export interface ProductOrderProps {
  id: string;
  productionOrder: string;
  name: string;
  jobRun: number;
  startProduction: Date;
  expectedRunTime: Date;
  tenantId: string;
  createdAt: Date;
  updatedAt?: Date;
  deletedAt?: Date;
}

export class ProductOrder {
  private props: ProductOrderProps;

  private constructor(props: ProductOrderProps) {
    this.props = props;
  }

  // Factory method para criação
  static create(data: {
    productionOrder: string;
    name: string;
    jobRun: number;
    startProduction: Date;
    expectedRunTime: Date;
    tenantId: string;
  }): ProductOrder {
    // Validações de negócio
    if (!data.productionOrder || data.productionOrder.trim().length === 0) {
      throw new Error('Ordem de produção é obrigatória');
    }

    if (data.productionOrder.trim().length > 100) {
      throw new Error('Ordem de produção deve ter no máximo 100 caracteres');
    }

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

    if (data.expectedRunTime <= data.startProduction) {
      throw new Error(
        'Tempo esperado de execução deve ser posterior ao início da produção'
      );
    }

    const now = new Date();
    const props: ProductOrderProps = {
      id: crypto.randomUUID(),
      productionOrder: data.productionOrder.trim(),
      name: data.name.trim(),
      jobRun: data.jobRun,
      startProduction: data.startProduction,
      expectedRunTime: data.expectedRunTime,
      tenantId: data.tenantId,
      createdAt: now,
      updatedAt: now,
    };

    return new ProductOrder(props);
  }

  // Factory method para reconstituição a partir do banco
  static fromPersistence(data: ProductOrderProps): ProductOrder {
    return new ProductOrder(data);
  }

  // Getters
  get id(): string {
    return this.props.id;
  }

  get productionOrder(): string {
    return this.props.productionOrder;
  }

  get name(): string {
    return this.props.name;
  }

  get jobRun(): number {
    return this.props.jobRun;
  }

  get startProduction(): Date {
    return this.props.startProduction;
  }

  get expectedRunTime(): Date {
    return this.props.expectedRunTime;
  }

  get tenantId(): string {
    return this.props.tenantId;
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
    productionOrder?: string;
    name?: string;
    jobRun?: number;
    startProduction?: Date;
    expectedRunTime?: Date;
  }): void {
    if (this.isDeleted) {
      throw new Error('Não é possível atualizar uma ordem de produto excluída');
    }

    if (data.productionOrder !== undefined) {
      if (!data.productionOrder || data.productionOrder.trim().length === 0) {
        throw new Error('Ordem de produção é obrigatória');
      }
      if (data.productionOrder.trim().length > 100) {
        throw new Error('Ordem de produção deve ter no máximo 100 caracteres');
      }
      this.props.productionOrder = data.productionOrder.trim();
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

    if (data.startProduction !== undefined) {
      this.props.startProduction = data.startProduction;
    }

    if (data.expectedRunTime !== undefined) {
      this.props.expectedRunTime = data.expectedRunTime;
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
      throw new Error('Ordem de produto já está excluída');
    }
    this.props.deletedAt = new Date();
    this.props.updatedAt = new Date();
  }

  restore(): void {
    if (!this.isDeleted) {
      throw new Error('Ordem de produto não está excluída');
    }
    this.props.deletedAt = undefined as any;
    this.props.updatedAt = new Date();
  }

  // Serialização para persistência
  toPlainObject(): ProductOrderProps {
    const result: ProductOrderProps = {
      id: this.props.id,
      productionOrder: this.props.productionOrder,
      name: this.props.name,
      jobRun: this.props.jobRun,
      startProduction: this.props.startProduction,
      expectedRunTime: this.props.expectedRunTime,
      tenantId: this.props.tenantId,
      createdAt: this.props.createdAt,
    };

    if (this.props.updatedAt !== undefined) {
      result.updatedAt = this.props.updatedAt;
    }

    if (this.props.deletedAt !== undefined) {
      result.deletedAt = this.props.deletedAt;
    }

    return result;
  }
}
