import { PrismaClient } from '@prisma/client';
import { v4 as uuidv4 } from 'uuid';

import {
  CreateMeasurementUnitData,
  IMeasurementUnitRepository,
  MeasurementUnitFilters,
  UpdateMeasurementUnitData,
} from '../../../application/interfaces/IMeasurementUnitRepository';
import { MeasurementUnit } from '../../../domain/entities/MeasurementUnit';

export class PrismaMeasurementUnitRepository
  implements IMeasurementUnitRepository
{
  constructor(private prisma: PrismaClient) {}

  private mapDatabaseToMeasurementUnit(
    measurementUnitData: any
  ): MeasurementUnit {
    return MeasurementUnit.fromPersistence({
      id: measurementUnitData.measurement_unit_id,
      label: measurementUnitData.label,
      unitSymbol: measurementUnitData.unit_symbol,
      tenantId: measurementUnitData.tenant_id,
      createdAt: measurementUnitData.created_at,
      updatedAt:
        measurementUnitData.updated_at || measurementUnitData.created_at,
      deletedAt: measurementUnitData.deleted_at ?? undefined,
    });
  }

  async create(data: CreateMeasurementUnitData): Promise<MeasurementUnit> {
    const existingMeasurementUnit = await this.prisma.measurementUnit.findFirst(
      {
        where: {
          label: data.label,
          tenant_id: data.tenantId,
          deleted_at: null,
        },
      }
    );

    if (existingMeasurementUnit) {
      throw new Error('Measurement unit label already exists in this tenant');
    }

    const measurementUnitData = await this.prisma.measurementUnit.create({
      data: {
        measurement_unit_id: uuidv4(),
        label: data.label,
        unit_symbol: data.unitSymbol,
        tenant_id: data.tenantId,
        created_at: new Date(),
        updated_at: new Date(),
      },
    });

    return this.mapDatabaseToMeasurementUnit(measurementUnitData);
  }

  async findById(id: string): Promise<MeasurementUnit | null> {
    const measurementUnitData = await this.prisma.measurementUnit.findUnique({
      where: {
        measurement_unit_id: id,
      },
    });

    if (!measurementUnitData) {
      return null;
    }

    return this.mapDatabaseToMeasurementUnit(measurementUnitData);
  }

  async findByLabel(
    label: string,
    tenantId: string
  ): Promise<MeasurementUnit | null> {
    const measurementUnitData = await this.prisma.measurementUnit.findFirst({
      where: {
        label: label,
        tenant_id: tenantId,
        deleted_at: null,
      },
    });

    if (!measurementUnitData) {
      return null;
    }

    return this.mapDatabaseToMeasurementUnit(measurementUnitData);
  }

  async findAll(filters: MeasurementUnitFilters): Promise<MeasurementUnit[]> {
    const where: any = {};

    if (filters.label) {
      where.label = {
        contains: filters.label,
        mode: 'insensitive',
      };
    }

    if (filters.unitSymbol) {
      where.unit_symbol = {
        contains: filters.unitSymbol,
        mode: 'insensitive',
      };
    }

    if (filters.tenantId) {
      where.tenant_id = filters.tenantId;
    }

    if (filters.isDeleted !== undefined) {
      where.deleted_at = filters.isDeleted ? { not: null } : null;
    }

    const measurementUnitsData = await this.prisma.measurementUnit.findMany({
      where,
      orderBy: {
        created_at: 'desc',
      },
    });

    return measurementUnitsData.map(measurementUnitData =>
      this.mapDatabaseToMeasurementUnit(measurementUnitData)
    );
  }

  async findByTenant(tenantId: string): Promise<MeasurementUnit[]> {
    return this.findAll({ tenantId, isDeleted: false });
  }

  async update(
    id: string,
    data: UpdateMeasurementUnitData
  ): Promise<MeasurementUnit> {
    const existingMeasurementUnit =
      await this.prisma.measurementUnit.findUnique({
        where: {
          measurement_unit_id: id,
        },
      });

    if (!existingMeasurementUnit) {
      throw new Error('Measurement unit not found');
    }

    if (existingMeasurementUnit.deleted_at) {
      throw new Error('Cannot update deleted measurement unit');
    }

    if (data.label) {
      const duplicateCheck = await this.prisma.measurementUnit.findFirst({
        where: {
          label: data.label,
          tenant_id: existingMeasurementUnit.tenant_id,
          measurement_unit_id: { not: id },
          deleted_at: null,
        },
      });

      if (duplicateCheck) {
        throw new Error('Measurement unit label already exists in this tenant');
      }
    }

    const updateData: any = {
      updated_at: new Date(),
    };

    if (data.label !== undefined) updateData.label = data.label;
    if (data.unitSymbol !== undefined) updateData.unit_symbol = data.unitSymbol;

    const updatedMeasurementUnit = await this.prisma.measurementUnit.update({
      where: {
        measurement_unit_id: id,
      },
      data: updateData,
    });

    return this.mapDatabaseToMeasurementUnit(updatedMeasurementUnit);
  }

  async delete(id: string): Promise<boolean> {
    const existingMeasurementUnit =
      await this.prisma.measurementUnit.findUnique({
        where: {
          measurement_unit_id: id,
        },
      });

    if (!existingMeasurementUnit) {
      throw new Error('Measurement unit not found');
    }

    await this.prisma.measurementUnit.update({
      where: {
        measurement_unit_id: id,
      },
      data: {
        deleted_at: new Date(),
        updated_at: new Date(),
      },
    });

    return true;
  }

  async restore(id: string): Promise<boolean> {
    const existingMeasurementUnit =
      await this.prisma.measurementUnit.findUnique({
        where: {
          measurement_unit_id: id,
        },
      });

    if (!existingMeasurementUnit) {
      throw new Error('Measurement unit not found');
    }

    if (!existingMeasurementUnit.deleted_at) {
      throw new Error('Measurement unit is not deleted');
    }

    await this.prisma.measurementUnit.update({
      where: {
        measurement_unit_id: id,
      },
      data: {
        deleted_at: null,
        updated_at: new Date(),
      },
    });

    return true;
  }

  async count(filters: MeasurementUnitFilters): Promise<number> {
    const where: any = {};

    if (filters.label) {
      where.label = {
        contains: filters.label,
        mode: 'insensitive',
      };
    }

    if (filters.unitSymbol) {
      where.unit_symbol = {
        contains: filters.unitSymbol,
        mode: 'insensitive',
      };
    }

    if (filters.tenantId) {
      where.tenant_id = filters.tenantId;
    }

    if (filters.isDeleted !== undefined) {
      where.deleted_at = filters.isDeleted ? { not: null } : null;
    }

    return this.prisma.measurementUnit.count({ where });
  }
}
