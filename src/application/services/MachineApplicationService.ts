import { v4 as uuidv4 } from 'uuid';

import { Machine } from '../../domain/entities/Machine';
import {
  CreateMachineData,
  IMachineRepository,
  MachineFilters,
  UpdateMachineData,
} from '../interfaces/IMachineRepository';

export class MachineApplicationService {
  constructor(private machineRepository: IMachineRepository) {}

  async createMachine(data: {
    operationalSector: string;
    name: string;
    manufacturer: string;
    serialNumber: string;
    yearOfManufacture: string;
    yearOfInstallation: string;
    maxPerformance: number;
    speedMeasureTech: number;
    tenantId: string;
  }): Promise<Machine> {
    const machineData: CreateMachineData = {
      ...data,
    };

    const _machine = Machine.create({
      id: uuidv4(),
      ...machineData,
    });

    return await this.machineRepository.create(machineData);
  }

  async getMachineById(id: string, tenantId: string): Promise<Machine | null> {
    return await this.machineRepository.findById(id, tenantId);
  }

  async getMachineBySerialNumber(
    serialNumber: string,
    tenantId: string
  ): Promise<Machine | null> {
    return await this.machineRepository.findBySerialNumber(
      serialNumber,
      tenantId
    );
  }

  async getAllMachines(filters: MachineFilters): Promise<Machine[]> {
    return await this.machineRepository.findAll(filters);
  }

  async updateMachine(
    id: string,
    data: UpdateMachineData,
    tenantId: string
  ): Promise<Machine> {
    const existingMachine = await this.machineRepository.findById(id, tenantId);

    if (!existingMachine) {
      throw new Error('Machine not found');
    }

    if (existingMachine.isDeleted) {
      throw new Error('Cannot update deleted machine');
    }

    existingMachine.update(data);

    return await this.machineRepository.update(id, data, tenantId);
  }

  async deleteMachine(id: string, tenantId: string): Promise<boolean> {
    const existingMachine = await this.machineRepository.findById(id, tenantId);

    if (!existingMachine) {
      throw new Error('Machine not found');
    }

    if (existingMachine.isDeleted) {
      throw new Error('Machine is already deleted');
    }

    return await this.machineRepository.delete(id, tenantId);
  }

  async restoreMachine(id: string, tenantId: string): Promise<boolean> {
    const existingMachine = await this.machineRepository.findById(id, tenantId);

    if (!existingMachine) {
      throw new Error('Machine not found');
    }

    if (!existingMachine.isDeleted) {
      throw new Error('Machine is not deleted');
    }

    return await this.machineRepository.restore(id, tenantId);
  }

  async getMachineCount(filters: MachineFilters): Promise<number> {
    return await this.machineRepository.count(filters);
  }

  async getMachineStats(tenantId: string): Promise<{
    total: number;
    active: number;
    deleted: number;
    byManufacturer: Array<{ manufacturer: string; count: number }>;
    byOperationalSector: Array<{ operationalSector: string; count: number }>;
  }> {
    const [total, active, deleted] = await Promise.all([
      this.machineRepository.count({ tenantId }),
      this.machineRepository.count({ tenantId, isDeleted: false }),
      this.machineRepository.count({ tenantId, isDeleted: true }),
    ]);

    const allMachines = await this.machineRepository.findAll({ tenantId });

    const manufacturerStats = allMachines.reduce(
      (acc, machine) => {
        if (!machine.isDeleted) {
          const existing = acc.find(
            item => item.manufacturer === machine.manufacturer
          );
          if (existing) {
            existing.count++;
          } else {
            acc.push({ manufacturer: machine.manufacturer, count: 1 });
          }
        }
        return acc;
      },
      [] as Array<{ manufacturer: string; count: number }>
    );

    const sectorStats = allMachines.reduce(
      (acc, machine) => {
        if (!machine.isDeleted) {
          const existing = acc.find(
            item => item.operationalSector === machine.operationalSector
          );
          if (existing) {
            existing.count++;
          } else {
            acc.push({
              operationalSector: machine.operationalSector,
              count: 1,
            });
          }
        }
        return acc;
      },
      [] as Array<{ operationalSector: string; count: number }>
    );

    return {
      total,
      active,
      deleted,
      byManufacturer: manufacturerStats.sort((a, b) => b.count - a.count),
      byOperationalSector: sectorStats.sort((a, b) => b.count - a.count),
    };
  }
}
