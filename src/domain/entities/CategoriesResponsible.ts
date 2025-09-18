export class CategoriesResponsible {
  constructor(
    private readonly _categoryResponsibleId: string,
    private _categoryResponsible: string,
    private readonly _tenantId: string,
    private readonly _createdAt: Date,
    private _updatedAt?: Date,
    private _deletedAt?: Date
  ) {
    this.validate();
  }

  // Getters
  get categoryResponsibleId(): string {
    return this._categoryResponsibleId;
  }

  get categoryResponsible(): string {
    return this._categoryResponsible;
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

  // Business Methods
  updateCategoryResponsible(newCategoryResponsible: string): void {
    if (!newCategoryResponsible || newCategoryResponsible.trim().length === 0) {
      throw new Error('Categoria de responsável não pode estar vazia');
    }
    if (newCategoryResponsible.trim().length > 255) {
      throw new Error(
        'Categoria de responsável não pode ter mais de 255 caracteres'
      );
    }
    this._categoryResponsible = newCategoryResponsible.trim();
    this._updatedAt = new Date();
  }

  softDelete(): void {
    if (this._deletedAt) {
      throw new Error('Categoria de responsável já foi excluída');
    }
    this._deletedAt = new Date();
    this._updatedAt = new Date();
  }

  restore(): void {
    if (!this._deletedAt) {
      throw new Error('Categoria de responsável não foi excluída');
    }
    this._deletedAt = undefined;
    this._updatedAt = new Date();
  }

  isDeleted(): boolean {
    return this._deletedAt !== undefined;
  }

  // Validation Methods
  private validate(): void {
    if (
      !this._categoryResponsibleId ||
      this._categoryResponsibleId.trim().length === 0
    ) {
      throw new Error('ID da categoria de responsável é obrigatório');
    }

    if (
      !this._categoryResponsible ||
      this._categoryResponsible.trim().length === 0
    ) {
      throw new Error('Categoria de responsável é obrigatória');
    }

    if (this._categoryResponsible.trim().length > 255) {
      throw new Error(
        'Categoria de responsável não pode ter mais de 255 caracteres'
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
    categoryResponsible: string,
    tenantId: string
  ): CategoriesResponsible {
    return new CategoriesResponsible(
      crypto.randomUUID(),
      categoryResponsible,
      tenantId,
      new Date()
    );
  }

  static restore(
    categoryResponsibleId: string,
    categoryResponsible: string,
    tenantId: string,
    createdAt: Date,
    updatedAt?: Date,
    deletedAt?: Date
  ): CategoriesResponsible {
    return new CategoriesResponsible(
      categoryResponsibleId,
      categoryResponsible,
      tenantId,
      createdAt,
      updatedAt,
      deletedAt
    );
  }
}
