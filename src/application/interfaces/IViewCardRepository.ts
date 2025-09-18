import { ViewCard } from '../../domain/entities/ViewCard';

export interface CreateViewCardData {
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
  sortOrder?: number;
  tenantId: string;
  createdBy: string;
  updatedBy: string;
}

export interface UpdateViewCardData {
  positionX?: number;
  positionY?: number;
  width?: number;
  height?: number;
  chartType?: string;
  title?: string;
  sortOrder?: number;
  updatedBy: string;
}

export interface ViewCardFilters {
  viewId?: string;
  sensorId?: string;
  moduleId?: string;
  machineId?: string;
  tenantId: string;
}

export interface IViewCardRepository {
  create(data: CreateViewCardData): Promise<ViewCard>;
  findById(id: string): Promise<ViewCard | null>;
  findByIdIncludingDeleted(id: string): Promise<ViewCard | null>;
  findByView(viewId: string, tenantId: string): Promise<ViewCard[]>;
  findBySensor(sensorId: string, tenantId: string): Promise<ViewCard[]>;
  findByViewAndSensor(
    viewId: string,
    sensorId: string
  ): Promise<ViewCard | null>;
  findByViewSensorAndChartType(
    viewId: string,
    sensorId: string,
    chartType: string
  ): Promise<ViewCard | null>;
  update(id: string, data: UpdateViewCardData): Promise<ViewCard>;
  delete(id: string): Promise<boolean>;
  restore(id: string): Promise<boolean>;
  count(filters: ViewCardFilters): Promise<number>;
  updatePositions(
    cards: Array<{
      id: string;
      positionX: number;
      positionY: number;
      width: number;
      height: number;
    }>,
    updatedBy: string
  ): Promise<void>;
}
