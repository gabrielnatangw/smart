export class Shift {
  constructor(
    private readonly _shiftId: string,
    private _shiftName: string,
    private _shiftStart: string,
    private _shiftEnd: string,
    private readonly _tenantId: string,
    private readonly _createdAt: Date,
    private _updatedAt?: Date,
    private _deletedAt?: Date
  ) {
    this.validate();
  }

  // Getters
  get shiftId(): string {
    return this._shiftId;
  }

  get shiftName(): string {
    return this._shiftName;
  }

  get shiftStart(): string {
    return this._shiftStart;
  }

  get shiftEnd(): string {
    return this._shiftEnd;
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
  updateShiftName(newName: string): void {
    if (!newName || newName.trim().length === 0) {
      throw new Error('Nome do turno não pode estar vazio');
    }
    if (newName.trim().length > 100) {
      throw new Error('Nome do turno não pode ter mais de 100 caracteres');
    }
    this._shiftName = newName.trim();
    this._updatedAt = new Date();
  }

  updateShiftTimes(start: string, end: string): void {
    this.validateShiftTimes(start, end);
    this._shiftStart = start;
    this._shiftEnd = end;
    this._updatedAt = new Date();
  }

  softDelete(): void {
    if (this._deletedAt) {
      throw new Error('Turno já foi excluído');
    }
    this._deletedAt = new Date();
    this._updatedAt = new Date();
  }

  restore(): void {
    if (!this._deletedAt) {
      throw new Error('Turno não foi excluído');
    }
    this._deletedAt = undefined;
    this._updatedAt = new Date();
  }

  isDeleted(): boolean {
    return this._deletedAt !== undefined;
  }

  // Validation Methods
  private validate(): void {
    if (!this._shiftId || this._shiftId.trim().length === 0) {
      throw new Error('ID do turno é obrigatório');
    }

    if (!this._shiftName || this._shiftName.trim().length === 0) {
      throw new Error('Nome do turno é obrigatório');
    }

    if (this._shiftName.trim().length > 100) {
      throw new Error('Nome do turno não pode ter mais de 100 caracteres');
    }

    if (!this._shiftStart || this._shiftStart.trim().length === 0) {
      throw new Error('Horário de início do turno é obrigatório');
    }

    if (!this._shiftEnd || this._shiftEnd.trim().length === 0) {
      throw new Error('Horário de fim do turno é obrigatório');
    }

    this.validateShiftTimes(this._shiftStart, this._shiftEnd);

    if (!this._tenantId || this._tenantId.trim().length === 0) {
      throw new Error('ID do tenant é obrigatório');
    }

    if (!this._createdAt) {
      throw new Error('Data de criação é obrigatória');
    }
  }

  private validateShiftTimes(start: string, end: string): void {
    // Validar formato de hora (HH:MM)
    const timeRegex = /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/;

    if (!timeRegex.test(start)) {
      throw new Error('Formato de hora de início inválido. Use HH:MM');
    }

    if (!timeRegex.test(end)) {
      throw new Error('Formato de hora de fim inválido. Use HH:MM');
    }

    // Converter para minutos para comparação
    const startMinutes = this.timeToMinutes(start);
    const endMinutes = this.timeToMinutes(end);

    // Validar que o fim é depois do início (considerando turnos que passam da meia-noite)
    if (startMinutes === endMinutes) {
      throw new Error('Horário de início e fim não podem ser iguais');
    }

    // Para turnos que passam da meia-noite, o fim será menor que o início
    // Para turnos normais, o fim será maior que o início
    // Ambos os casos são válidos
  }

  private timeToMinutes(time: string): number {
    const parts = time.split(':').map(Number);
    const hours = parts[0] || 0;
    const minutes = parts[1] || 0;
    return hours * 60 + minutes;
  }

  // Static Factory Methods
  static create(
    shiftName: string,
    shiftStart: string,
    shiftEnd: string,
    tenantId: string
  ): Shift {
    return new Shift(
      crypto.randomUUID(),
      shiftName,
      shiftStart,
      shiftEnd,
      tenantId,
      new Date()
    );
  }

  static restore(
    shiftId: string,
    shiftName: string,
    shiftStart: string,
    shiftEnd: string,
    tenantId: string,
    createdAt: Date,
    updatedAt?: Date,
    deletedAt?: Date
  ): Shift {
    return new Shift(
      shiftId,
      shiftName,
      shiftStart,
      shiftEnd,
      tenantId,
      createdAt,
      updatedAt,
      deletedAt
    );
  }
}
