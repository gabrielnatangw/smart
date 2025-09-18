export interface ViewResponseDTO {
  id: string;
  name: string;
  isDefault: boolean;
  isPublic: boolean;
  isActive: boolean;
  createdAt: Date;
  updatedAt?: Date;
  deletedAt?: Date;
  tenantId: string;
  userId: string;
  createdBy: string;
  updatedBy: string;
  cards?: ViewCardResponseDTO[];
}

export interface ViewCardResponseDTO {
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
  sensor?: {
    id: string;
    name: string;
    sensorType: number;
    unit?: string;
    currentValue?: SensorCurrentValueResponseDTO;
  };
  module?: {
    id: string;
    customer: string;
    country: string;
    city: string;
    blueprint: string;
    sector: string;
    machineName: string;
  };
  machine?: {
    id: string;
    name: string;
    manufacturer: string;
    operationalSector: string;
  };
}

export interface SensorCurrentValueResponseDTO {
  id: string;
  sensorId: string;
  value: number;
  rawValue?: number;
  unit?: string;
  quality: string;
  lastUpdated: Date;
  metadata: any;
  isStale: boolean;
}

export interface SensorDataResponseDTO {
  id: string;
  sensorId: string;
  value: number;
  rawValue?: number;
  unit?: string;
  quality: string;
  timestamp: Date;
  metadata: any;
}

export interface CreateViewRequestDTO {
  name: string;
  isDefault?: boolean;
  isPublic?: boolean;
  isActive?: boolean;
}

export interface UpdateViewRequestDTO {
  name?: string;
  isDefault?: boolean;
  isPublic?: boolean;
  isActive?: boolean;
}

export interface CreateViewCardRequestDTO {
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
}

export interface UpdateViewCardRequestDTO {
  positionX?: number;
  positionY?: number;
  width?: number;
  height?: number;
  chartType?: string;
  title?: string;
  sortOrder?: number;
}

export interface UpdateCardPositionsRequestDTO {
  cards: Array<{
    id: string;
    positionX: number;
    positionY: number;
    width: number;
    height: number;
  }>;
}

export interface ViewFiltersDTO {
  userId?: string;
  isPublic?: boolean;
  isActive?: boolean;
  name?: string;
  page?: number;
  limit?: number;
}

export interface SensorDataFiltersDTO {
  sensorId?: string;
  startDate?: string;
  endDate?: string;
  quality?: string;
  limit?: number;
}
