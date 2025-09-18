import { MeasurementUnit } from '../../domain/entities/MeasurementUnit';
import {
  IMeasurementUnitRepository,
  MeasurementUnitFilters,
} from '../interfaces/IMeasurementUnitRepository';

export class MeasurementUnitApplicationService {
  constructor(private measurementUnitRepository: IMeasurementUnitRepository) {}

  async createMeasurementUnit(data: {
    label: string;
    unitSymbol: string;
    tenantId: string;
  }): Promise<MeasurementUnit> {
    const measurementUnitData = {
      label: data.label.trim(),
      unitSymbol: data.unitSymbol.trim(),
      tenantId: data.tenantId,
    };

    return await this.measurementUnitRepository.create(measurementUnitData);
  }

  async getMeasurementUnitById(id: string): Promise<MeasurementUnit> {
    const measurementUnit = await this.measurementUnitRepository.findById(id);

    if (!measurementUnit) {
      throw new Error('Measurement unit not found');
    }

    return measurementUnit;
  }

  async getMeasurementUnitByLabel(
    label: string,
    tenantId: string
  ): Promise<MeasurementUnit | null> {
    return await this.measurementUnitRepository.findByLabel(label, tenantId);
  }

  async getAllMeasurementUnits(
    filters: MeasurementUnitFilters
  ): Promise<MeasurementUnit[]> {
    return await this.measurementUnitRepository.findAll(filters);
  }

  async getMeasurementUnitsByTenant(
    tenantId: string
  ): Promise<MeasurementUnit[]> {
    return await this.measurementUnitRepository.findByTenant(tenantId);
  }

  async updateMeasurementUnit(
    id: string,
    data: {
      label?: string | undefined;
      unitSymbol?: string | undefined;
    }
  ): Promise<MeasurementUnit> {
    const updateData = { ...data };

    if (updateData.label) {
      updateData.label = updateData.label.trim();
    }

    if (updateData.unitSymbol) {
      updateData.unitSymbol = updateData.unitSymbol.trim();
    }

    return await this.measurementUnitRepository.update(id, updateData);
  }

  async deleteMeasurementUnit(id: string): Promise<boolean> {
    return await this.measurementUnitRepository.delete(id);
  }

  async restoreMeasurementUnit(id: string): Promise<boolean> {
    try {
      return await this.measurementUnitRepository.restore(id);
    } catch (error: any) {
      throw error;
    }
  }

  async getMeasurementUnitCount(
    filters: MeasurementUnitFilters
  ): Promise<number> {
    try {
      return await this.measurementUnitRepository.count(filters);
    } catch (error: any) {
      throw error;
    }
  }

  async getMeasurementUnitStats(
    filters: { tenantId?: string | undefined } = {}
  ): Promise<{
    total: number;
    active: number;
    deleted: number;
    byTenant: Array<{ tenantId: string; count: number }>;
  }> {
    try {
      const baseFilters = { ...filters };

      const [total, active, deleted] = await Promise.all([
        this.measurementUnitRepository.count(baseFilters),
        this.measurementUnitRepository.count({
          ...baseFilters,
          isDeleted: false,
        }),
        this.measurementUnitRepository.count({
          ...baseFilters,
          isDeleted: true,
        }),
      ]);

      const byTenant: Array<{ tenantId: string; count: number }> = [];

      if (!filters.tenantId) {
        const allMeasurementUnits =
          await this.measurementUnitRepository.findAll({
            isDeleted: false,
          });
        const tenantCounts = allMeasurementUnits.reduce(
          (acc, measurementUnit) => {
            acc[measurementUnit.tenantId] =
              (acc[measurementUnit.tenantId] || 0) + 1;
            return acc;
          },
          {} as Record<string, number>
        );

        byTenant.push(
          ...Object.entries(tenantCounts).map(([tenantId, count]) => ({
            tenantId,
            count,
          }))
        );
      }

      return {
        total,
        active,
        deleted,
        byTenant,
      };
    } catch (error: any) {
      throw error;
    }
  }
}
