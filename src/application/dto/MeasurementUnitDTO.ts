export interface CreateMeasurementUnitDTO {
  label: string;
  unitSymbol: string;
  tenantId: string;
}

export interface UpdateMeasurementUnitDTO {
  label?: string | undefined;
  unitSymbol?: string | undefined;
}

export interface MeasurementUnitResponseDTO {
  id: string;
  label: string;
  unitSymbol: string;
  tenantId: string;
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date | undefined;
  isDeleted: boolean;
}

export interface MeasurementUnitFiltersDTO {
  label?: string | undefined;
  unitSymbol?: string | undefined;
  tenantId?: string | undefined;
  isDeleted?: boolean | undefined;
}

export interface MeasurementUnitStatsDTO {
  total: number;
  active: number;
  deleted: number;
  byTenant: Array<{ tenantId: string; count: number }>;
}
