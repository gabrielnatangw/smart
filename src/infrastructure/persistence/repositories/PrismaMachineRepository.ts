import { PrismaClient } from '@prisma/client';
// import { SpeedMeasureTech } from '../../../domain/value-objects/SpeedMeasureTech';
import { v4 as uuidv4 } from 'uuid';

import {
  CreateMachineData,
  IMachineRepository,
  MachineFilters,
  UpdateMachineData,
} from '../../../application/interfaces/IMachineRepository';
import { Machine } from '../../../domain/entities/Machine';

export class PrismaMachineRepository implements IMachineRepository {
  constructor(private prisma: PrismaClient) {}

  async create(data: CreateMachineData): Promise<Machine> {
    const existingMachine = await this.prisma.machine.findFirst({
      where: {
        serial_number: data.serialNumber,
        tenant_id: data.tenantId,
        deleted_at: null,
      },
    });

    if (existingMachine) {
      throw new Error('Serial number already registered for this tenant');
    }

    const machineData = await this.prisma.machine.create({
      data: {
        machine_id: uuidv4(),
        operational_sector: data.operationalSector,
        name: data.name,
        manufacturer: data.manufacturer,
        serial_number: data.serialNumber,
        year_of_manufacture: data.yearOfManufacture,
        year_of_installation: data.yearOfInstallation,
        max_performance: data.maxPerformance,
        speed_measure_tech: data.speedMeasureTech,
        tenant_id: data.tenantId,
        created_at: new Date(),
        updated_at: new Date(),
      },
    });

    return Machine.fromPersistence({
      id: machineData.machine_id,
      operationalSector: machineData.operational_sector,
      name: machineData.name,
      manufacturer: machineData.manufacturer,
      serialNumber: machineData.serial_number,
      yearOfManufacture: machineData.year_of_manufacture,
      yearOfInstallation: machineData.year_of_installation,
      maxPerformance: machineData.max_performance,
      speedMeasureTech: machineData.speed_measure_tech,
      tenantId: machineData.tenant_id,
      createdAt: machineData.created_at,
      updatedAt: machineData.updated_at || machineData.created_at,
      ...(machineData.deleted_at && { deletedAt: machineData.deleted_at }),
    });
  }

  async findById(id: string, tenantId: string): Promise<Machine | null> {
    const machineData = await this.prisma.machine.findFirst({
      where: {
        machine_id: id,
        tenant_id: tenantId,
      },
    });

    if (!machineData) {
      return null;
    }

    return Machine.fromPersistence({
      id: machineData.machine_id,
      operationalSector: machineData.operational_sector,
      name: machineData.name,
      manufacturer: machineData.manufacturer,
      serialNumber: machineData.serial_number,
      yearOfManufacture: machineData.year_of_manufacture,
      yearOfInstallation: machineData.year_of_installation,
      maxPerformance: machineData.max_performance,
      speedMeasureTech: machineData.speed_measure_tech,
      tenantId: machineData.tenant_id,
      createdAt: machineData.created_at,
      updatedAt: machineData.updated_at || machineData.created_at,
      ...(machineData.deleted_at && { deletedAt: machineData.deleted_at }),
    });
  }

  async findBySerialNumber(
    serialNumber: string,
    tenantId: string
  ): Promise<Machine | null> {
    const machineData = await this.prisma.machine.findFirst({
      where: {
        serial_number: serialNumber,
        tenant_id: tenantId,
        deleted_at: null,
      },
    });

    if (!machineData) {
      return null;
    }

    return Machine.fromPersistence({
      id: machineData.machine_id,
      operationalSector: machineData.operational_sector,
      name: machineData.name,
      manufacturer: machineData.manufacturer,
      serialNumber: machineData.serial_number,
      yearOfManufacture: machineData.year_of_manufacture,
      yearOfInstallation: machineData.year_of_installation,
      maxPerformance: machineData.max_performance,
      speedMeasureTech: machineData.speed_measure_tech,
      tenantId: machineData.tenant_id,
      createdAt: machineData.created_at,
      updatedAt: machineData.updated_at || machineData.created_at,
      ...(machineData.deleted_at && { deletedAt: machineData.deleted_at }),
    });
  }

  async findAll(filters: MachineFilters): Promise<Machine[]> {
    const where: any = {
      tenant_id: filters.tenantId,
    };

    if (filters.operationalSector) {
      where.operational_sector = {
        contains: filters.operationalSector,
        mode: 'insensitive',
      };
    }

    if (filters.name) {
      where.name = {
        contains: filters.name,
        mode: 'insensitive',
      };
    }

    if (filters.manufacturer) {
      where.manufacturer = {
        contains: filters.manufacturer,
        mode: 'insensitive',
      };
    }

    if (filters.isDeleted !== undefined) {
      where.deleted_at = filters.isDeleted ? { not: null } : null;
    }

    const machinesData = await this.prisma.machine.findMany({
      where,
      orderBy: {
        created_at: 'desc',
      },
    });

    return machinesData.map(machineData =>
      Machine.fromPersistence({
        id: machineData.machine_id,
        operationalSector: machineData.operational_sector,
        name: machineData.name,
        manufacturer: machineData.manufacturer,
        serialNumber: machineData.serial_number,
        yearOfManufacture: machineData.year_of_manufacture,
        yearOfInstallation: machineData.year_of_installation,
        maxPerformance: machineData.max_performance,
        speedMeasureTech: machineData.speed_measure_tech,
        tenantId: machineData.tenant_id,
        createdAt: machineData.created_at,
        updatedAt: machineData.updated_at || machineData.created_at,
        ...(machineData.deleted_at && { deletedAt: machineData.deleted_at }),
      })
    );
  }

  async update(
    id: string,
    data: UpdateMachineData,
    tenantId: string
  ): Promise<Machine> {
    const existingMachine = await this.prisma.machine.findFirst({
      where: {
        machine_id: id,
        tenant_id: tenantId,
      },
    });

    if (!existingMachine) {
      throw new Error('Machine not found');
    }

    if (existingMachine.deleted_at) {
      throw new Error('Cannot update deleted machine');
    }

    if (data.serialNumber) {
      const duplicateCheck = await this.prisma.machine.findFirst({
        where: {
          serial_number: data.serialNumber,
          tenant_id: tenantId,
          machine_id: { not: id },
          deleted_at: null,
        },
      });

      if (duplicateCheck) {
        throw new Error('Serial number already registered by another machine');
      }
    }

    const updateData: any = {
      updated_at: new Date(),
    };

    if (data.operationalSector !== undefined) {
      updateData.operational_sector = data.operationalSector;
    }
    if (data.name !== undefined) {
      updateData.name = data.name;
    }
    if (data.manufacturer !== undefined) {
      updateData.manufacturer = data.manufacturer;
    }
    if (data.serialNumber !== undefined) {
      updateData.serial_number = data.serialNumber;
    }
    if (data.yearOfManufacture !== undefined) {
      updateData.year_of_manufacture = data.yearOfManufacture;
    }
    if (data.yearOfInstallation !== undefined) {
      updateData.year_of_installation = data.yearOfInstallation;
    }
    if (data.maxPerformance !== undefined) {
      updateData.max_performance = data.maxPerformance;
    }
    if (data.speedMeasureTech !== undefined) {
      updateData.speed_measure_tech = data.speedMeasureTech;
    }

    const updatedMachine = await this.prisma.machine.update({
      where: {
        machine_id: id,
      },
      data: updateData,
    });

    return Machine.fromPersistence({
      id: updatedMachine.machine_id,
      operationalSector: updatedMachine.operational_sector,
      name: updatedMachine.name,
      manufacturer: updatedMachine.manufacturer,
      serialNumber: updatedMachine.serial_number,
      yearOfManufacture: updatedMachine.year_of_manufacture,
      yearOfInstallation: updatedMachine.year_of_installation,
      maxPerformance: updatedMachine.max_performance,
      speedMeasureTech: updatedMachine.speed_measure_tech,
      tenantId: updatedMachine.tenant_id,
      createdAt: updatedMachine.created_at,
      updatedAt: updatedMachine.updated_at || updatedMachine.created_at,
      ...(updatedMachine.deleted_at && {
        deletedAt: updatedMachine.deleted_at,
      }),
    });
  }

  async delete(id: string, tenantId: string): Promise<boolean> {
    const existingMachine = await this.prisma.machine.findFirst({
      where: {
        machine_id: id,
        tenant_id: tenantId,
      },
    });

    if (!existingMachine) {
      throw new Error('Machine not found');
    }

    await this.prisma.machine.update({
      where: {
        machine_id: id,
      },
      data: {
        deleted_at: new Date(),
        updated_at: new Date(),
      },
    });

    return true;
  }

  async restore(id: string, tenantId: string): Promise<boolean> {
    const existingMachine = await this.prisma.machine.findFirst({
      where: {
        machine_id: id,
        tenant_id: tenantId,
      },
    });

    if (!existingMachine) {
      throw new Error('Machine not found');
    }

    if (!existingMachine.deleted_at) {
      throw new Error('Machine is not deleted');
    }

    await this.prisma.machine.update({
      where: {
        machine_id: id,
      },
      data: {
        deleted_at: null,
        updated_at: new Date(),
      },
    });

    return true;
  }

  async count(filters: MachineFilters): Promise<number> {
    const where: any = {
      tenant_id: filters.tenantId,
    };

    if (filters.operationalSector) {
      where.operational_sector = {
        contains: filters.operationalSector,
        mode: 'insensitive',
      };
    }

    if (filters.name) {
      where.name = {
        contains: filters.name,
        mode: 'insensitive',
      };
    }

    if (filters.manufacturer) {
      where.manufacturer = {
        contains: filters.manufacturer,
        mode: 'insensitive',
      };
    }

    if (filters.isDeleted !== undefined) {
      where.deleted_at = filters.isDeleted ? { not: null } : null;
    }

    return this.prisma.machine.count({ where });
  }
}
