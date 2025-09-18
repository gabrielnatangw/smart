import { Shift } from '../../domain/entities/Shift';

// DTOs para requests
export interface CreateShiftRequest {
  shiftName: string;
  shiftStart: string;
  shiftEnd: string;
  tenantId: string;
}

export interface UpdateShiftRequest {
  shiftId: string;
  shiftName?: string;
  shiftStart?: string;
  shiftEnd?: string;
  tenantId: string;
}

export interface GetShiftByIdRequest {
  shiftId: string;
  tenantId: string;
}

export interface GetAllShiftsRequest {
  tenantId: string;
  page?: number;
  limit?: number;
  search?: string;
  includeDeleted?: boolean;
}

export interface DeleteShiftRequest {
  shiftId: string;
  tenantId: string;
}

export interface RestoreShiftRequest {
  shiftId: string;
  tenantId: string;
}

// DTOs para responses
export interface ShiftResponse {
  shiftId: string;
  shiftName: string;
  shiftStart: string;
  shiftEnd: string;
  tenantId: string;
  createdAt: Date;
  updatedAt?: Date;
  deletedAt?: Date;
}

export interface GetAllShiftsResponse {
  shifts: ShiftResponse[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// Interface principal do repositório
export interface IShiftRepository {
  // CRUD Operations
  create(data: CreateShiftRequest): Promise<Shift>;
  findById(data: GetShiftByIdRequest): Promise<Shift | null>;
  findAll(data: GetAllShiftsRequest): Promise<GetAllShiftsResponse>;
  update(data: UpdateShiftRequest): Promise<Shift>;
  delete(data: DeleteShiftRequest): Promise<void>;
  restore(data: RestoreShiftRequest): Promise<Shift>;

  // Business Operations
  findByNameAndTenant(
    shiftName: string,
    tenantId: string
  ): Promise<Shift | null>;
  findActiveShifts(tenantId: string): Promise<Shift[]>;
  findShiftsByTimeRange(
    startTime: string,
    endTime: string,
    tenantId: string
  ): Promise<Shift[]>;

  // Validation Operations
  existsByNameAndTenant(shiftName: string, tenantId: string): Promise<boolean>;
  existsByIdAndTenant(shiftId: string, tenantId: string): Promise<boolean>;
}
