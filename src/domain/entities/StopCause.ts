export class StopCause {
  constructor(
    private readonly _stopCauseId: string,
    private _description: string,
    private readonly _tenantId: string,
    private readonly _createdAt: Date,
    private _updatedAt?: Date,
    private _deletedAt?: Date,
    private _parentId?: string,
    private _parent?: StopCause,
    private _children?: StopCause[]
  ) {
    this.validate();
  }

  // Getters
  get stopCauseId(): string {
    return this._stopCauseId;
  }

  get description(): string {
    return this._description;
  }

  get tenantId(): string {
    return this._tenantId;
  }

  get createdAt(): Date {
    return this._createdAt;
  }

  get updatedAt(): Date | undefined {
    return this._updatedAt;
  }

  get deletedAt(): Date | undefined {
    return this._deletedAt;
  }

  get parentId(): string | undefined {
    return this._parentId;
  }

  get parent(): StopCause | undefined {
    return this._parent;
  }

  get children(): StopCause[] | undefined {
    return this._children;
  }

  // Business Methods
  updateDescription(newDescription: string): void {
    if (!newDescription || newDescription.trim().length === 0) {
      throw new Error('Descrição da causa de parada não pode estar vazia');
    }
    if (newDescription.trim().length > 255) {
      throw new Error(
        'Descrição da causa de parada não pode ter mais de 255 caracteres'
      );
    }
    this._description = newDescription.trim();
    this._updatedAt = new Date();
  }

  setParent(parentId: string | undefined): void {
    // Validar que não está tentando se tornar pai de si mesmo
    if (parentId === this._stopCauseId) {
      throw new Error('Uma causa de parada não pode ser pai de si mesma');
    }

    // Validar que não está criando um ciclo (pai não pode ser filho de um de seus filhos)
    if (parentId && this._children) {
      const isChild = this._children.some(
        child => child.stopCauseId === parentId || child.hasDescendant(parentId)
      );
      if (isChild) {
        throw new Error('Não é possível criar um ciclo hierárquico');
      }
    }

    this._parentId = parentId;
    this._updatedAt = new Date();
  }

  addChild(child: StopCause): void {
    if (!this._children) {
      this._children = [];
    }

    // Validar que não está adicionando a si mesmo como filho
    if (child.stopCauseId === this._stopCauseId) {
      throw new Error('Uma causa de parada não pode ser filha de si mesma');
    }

    // Validar que não está criando um ciclo
    if (child.hasDescendant(this._stopCauseId)) {
      throw new Error('Não é possível criar um ciclo hierárquico');
    }

    this._children.push(child);
    this._updatedAt = new Date();
  }

  removeChild(childId: string): void {
    if (!this._children) {
      return;
    }

    this._children = this._children.filter(
      child => child.stopCauseId !== childId
    );
    this._updatedAt = new Date();
  }

  softDelete(): void {
    if (this._deletedAt) {
      throw new Error('Causa de parada já foi excluída');
    }
    this._deletedAt = new Date();
    this._updatedAt = new Date();
  }

  restore(): void {
    if (!this._deletedAt) {
      throw new Error('Causa de parada não foi excluída');
    }
    this._deletedAt = undefined;
    this._updatedAt = new Date();
  }

  isDeleted(): boolean {
    return this._deletedAt !== undefined;
  }

  isRoot(): boolean {
    return !this._parentId;
  }

  isLeaf(): boolean {
    return !this._children || this._children.length === 0;
  }

  getLevel(): number {
    if (this.isRoot()) {
      return 0;
    }
    return this._parent ? this._parent.getLevel() + 1 : 1;
  }

  hasDescendant(descendantId: string): boolean {
    if (!this._children) {
      return false;
    }

    return this._children.some(
      child =>
        child.stopCauseId === descendantId || child.hasDescendant(descendantId)
    );
  }

  getAllDescendants(): StopCause[] {
    if (!this._children) {
      return [];
    }

    const descendants: StopCause[] = [];
    for (const child of this._children) {
      descendants.push(child);
      descendants.push(...child.getAllDescendants());
    }

    return descendants;
  }

  getAncestors(): StopCause[] {
    if (!this._parent) {
      return [];
    }

    return [this._parent, ...this._parent.getAncestors()];
  }

  // Validation Methods
  private validate(): void {
    if (!this._stopCauseId || this._stopCauseId.trim().length === 0) {
      throw new Error('ID da causa de parada é obrigatório');
    }

    if (!this._description || this._description.trim().length === 0) {
      throw new Error('Descrição da causa de parada é obrigatória');
    }

    if (this._description.trim().length > 255) {
      throw new Error(
        'Descrição da causa de parada não pode ter mais de 255 caracteres'
      );
    }

    if (!this._tenantId || this._tenantId.trim().length === 0) {
      throw new Error('ID do tenant é obrigatório');
    }

    if (!this._createdAt) {
      throw new Error('Data de criação é obrigatória');
    }
  }

  // Static Factory Methods
  static create(
    description: string,
    tenantId: string,
    parentId?: string
  ): StopCause {
    return new StopCause(
      crypto.randomUUID(),
      description,
      tenantId,
      new Date(),
      undefined,
      undefined,
      parentId
    );
  }

  static restore(
    stopCauseId: string,
    description: string,
    tenantId: string,
    createdAt: Date,
    updatedAt?: Date,
    deletedAt?: Date,
    parentId?: string,
    parent?: StopCause,
    children?: StopCause[]
  ): StopCause {
    return new StopCause(
      stopCauseId,
      description,
      tenantId,
      createdAt,
      updatedAt,
      deletedAt,
      parentId,
      parent,
      children
    );
  }
}
