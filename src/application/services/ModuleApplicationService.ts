import { v4 as uuidv4 } from 'uuid';

import { Module } from '../../domain/entities/Module';
import {
  CreateModuleData,
  IModuleRepository,
  ModuleFilters,
  UpdateModuleData,
} from '../interfaces/IModuleRepository';
import { IMqttService } from '../interfaces/IMqttService';

export class ModuleApplicationService {
  private static mqttService: IMqttService | undefined;

  constructor(private moduleRepository: IModuleRepository) {}

  static setMqttService(mqttService: IMqttService) {
    ModuleApplicationService.mqttService = mqttService;
  }

  async createModule(data: {
    customer: string;
    country: string;
    city: string;
    blueprint: string;
    sector: string;
    machineName: string;
    tenantId: string;
    machineId?: string | undefined;
  }): Promise<Module> {
    try {
      const moduleData: CreateModuleData = {
        ...data,
      };

      const _module = Module.create({
        id: uuidv4(),
        ...moduleData,
      });

      return await this.moduleRepository.create(moduleData);
    } catch (error: any) {
      throw error;
    }
  }

  async getModuleById(id: string, tenantId: string): Promise<Module | null> {
    try {
      return await this.moduleRepository.findById(id, tenantId);
    } catch (error: any) {
      throw error;
    }
  }

  async getModulesByMachineId(
    machineId: string,
    tenantId: string
  ): Promise<Module[]> {
    try {
      return await this.moduleRepository.findByMachineId(machineId, tenantId);
    } catch (error: any) {
      throw error;
    }
  }

  async getAllModules(filters: ModuleFilters): Promise<Module[]> {
    try {
      return await this.moduleRepository.findAll(filters);
    } catch (error: any) {
      throw error;
    }
  }

  async updateModule(
    id: string,
    data: UpdateModuleData,
    tenantId: string
  ): Promise<Module> {
    try {
      const existingModule = await this.moduleRepository.findById(id, tenantId);

      if (!existingModule) {
        throw new Error('Module not found');
      }

      if (existingModule.isDeleted) {
        throw new Error('Cannot update deleted module');
      }

      existingModule.update(data);

      const updatedModule = await this.moduleRepository.update(
        id,
        data,
        tenantId
      );

      // Enviar atualização via MQTT se o serviço estiver disponível
      if (ModuleApplicationService.mqttService && tenantId) {
        await this.sendModuleUpdateToMqtt(updatedModule, tenantId);
      }

      return updatedModule;
    } catch (error: any) {
      throw error;
    }
  }

  async deleteModule(id: string, tenantId: string): Promise<boolean> {
    try {
      const existingModule = await this.moduleRepository.findById(id, tenantId);

      if (!existingModule) {
        throw new Error('Module not found');
      }

      if (existingModule.isDeleted) {
        throw new Error('Module is already deleted');
      }

      return await this.moduleRepository.delete(id, tenantId);
    } catch (error: any) {
      throw error;
    }
  }

  async restoreModule(id: string, tenantId: string): Promise<boolean> {
    try {
      const existingModule = await this.moduleRepository.findById(id, tenantId);

      if (!existingModule) {
        throw new Error('Module not found');
      }

      if (!existingModule.isDeleted) {
        throw new Error('Module is not deleted');
      }

      return await this.moduleRepository.restore(id, tenantId);
    } catch (error: any) {
      throw error;
    }
  }

  async assignModuleToMachine(
    id: string,
    machineId: string,
    tenantId: string
  ): Promise<Module> {
    try {
      const existingModule = await this.moduleRepository.findById(id, tenantId);

      if (!existingModule) {
        throw new Error('Module not found');
      }

      if (existingModule.isDeleted) {
        throw new Error('Cannot assign deleted module to machine');
      }

      existingModule.assignToMachine(machineId);

      return await this.moduleRepository.assignToMachine(
        id,
        machineId,
        tenantId
      );
    } catch (error: any) {
      throw error;
    }
  }

  async unassignModuleFromMachine(
    id: string,
    tenantId: string
  ): Promise<Module> {
    try {
      const existingModule = await this.moduleRepository.findById(id, tenantId);

      if (!existingModule) {
        throw new Error('Module not found');
      }

      if (existingModule.isDeleted) {
        throw new Error('Cannot unassign deleted module from machine');
      }

      existingModule.unassignFromMachine();

      return await this.moduleRepository.unassignFromMachine(id, tenantId);
    } catch (error: any) {
      throw error;
    }
  }

  async getModuleCount(filters: ModuleFilters): Promise<number> {
    try {
      return await this.moduleRepository.count(filters);
    } catch (error: any) {
      throw error;
    }
  }

  async getModuleStats(tenantId: string): Promise<{
    total: number;
    active: number;
    deleted: number;
    assigned: number;
    unassigned: number;
    byCountry: Array<{ country: string; count: number }>;
    bySector: Array<{ sector: string; count: number }>;
    byCustomer: Array<{ customer: string; count: number }>;
  }> {
    try {
      const [total, active, deleted, _assigned, _unassigned] =
        await Promise.all([
          this.moduleRepository.count({ tenantId }),
          this.moduleRepository.count({ tenantId, isDeleted: false }),
          this.moduleRepository.count({ tenantId, isDeleted: true }),
          this.moduleRepository.count({
            tenantId,
            isDeleted: false,
            machineId: 'not-null', // This is a placeholder - we'll need to handle this differently
          }),
          this.moduleRepository.count({
            tenantId,
            isDeleted: false,
            machineId: undefined,
          }),
        ]);

      const allModules = await this.moduleRepository.findAll({ tenantId });

      const countryStats = allModules
        .filter(module => !module.isDeleted)
        .reduce(
          (acc, module) => {
            const existing = acc.find(item => item.country === module.country);
            if (existing) {
              existing.count++;
            } else {
              acc.push({ country: module.country, count: 1 });
            }
            return acc;
          },
          [] as Array<{ country: string; count: number }>
        );

      const sectorStats = allModules
        .filter(module => !module.isDeleted)
        .reduce(
          (acc, module) => {
            const existing = acc.find(item => item.sector === module.sector);
            if (existing) {
              existing.count++;
            } else {
              acc.push({ sector: module.sector, count: 1 });
            }
            return acc;
          },
          [] as Array<{ sector: string; count: number }>
        );

      const customerStats = allModules
        .filter(module => !module.isDeleted)
        .reduce(
          (acc, module) => {
            const existing = acc.find(
              item => item.customer === module.customer
            );
            if (existing) {
              existing.count++;
            } else {
              acc.push({ customer: module.customer, count: 1 });
            }
            return acc;
          },
          [] as Array<{ customer: string; count: number }>
        );

      // Calculate assigned/unassigned properly
      const actualAssigned = allModules.filter(
        module => !module.isDeleted && module.machineId
      ).length;
      const actualUnassigned = allModules.filter(
        module => !module.isDeleted && !module.machineId
      ).length;

      return {
        total,
        active,
        deleted,
        assigned: actualAssigned,
        unassigned: actualUnassigned,
        byCountry: countryStats.sort((a, b) => b.count - a.count),
        bySector: sectorStats.sort((a, b) => b.count - a.count),
        byCustomer: customerStats.sort((a, b) => b.count - a.count),
      };
    } catch (error: any) {
      throw error;
    }
  }

  private async sendModuleUpdateToMqtt(
    module: Module,
    tenantId: string
  ): Promise<void> {
    if (!ModuleApplicationService.mqttService) return;

    try {
      // Construir tópico dinâmico baseado no módulo
      const topic = this.buildMqttTopic(module);

      // Criar objeto MQTT com dados do módulo
      const mqttConfig = this.buildMqttModuleConfig(module, tenantId);

      // Enviar via MQTT
      const fullTopic = `${topic}/moduleUpdate`;
      const mqttPayload = JSON.stringify(mqttConfig);

      await ModuleApplicationService.mqttService.publish(
        fullTopic,
        mqttPayload
      );

      // Console bem visível para debug
      console.log('\n' + '='.repeat(80));
      console.log('🚀🚀🚀 ENVIANDO ATUALIZAÇÃO DE MÓDULO VIA MQTT 🚀🚀🚀');
      console.log('='.repeat(80));
      console.log(`📡 TÓPICO: ${fullTopic}`);
      console.log(`📋 PAYLOAD: ${JSON.stringify(mqttPayload, null, 2)}`);
      console.log('='.repeat(80));
      console.log('📊 DADOS DETALHADOS:');
      console.log(JSON.stringify(mqttConfig, null, 2));
      console.log('='.repeat(80) + '\n');
    } catch (error) {
      console.error('❌ Error sending module update via MQTT:', error);
      // Não falhar a atualização do módulo se o MQTT falhar
    }
  }

  private buildMqttTopic(module: Module): string {
    const customer = module.customer.toLowerCase();
    const country = module.country.toLowerCase();
    const city = module.city.toLowerCase();
    const blueprint = module.blueprint.toLowerCase();
    const sector = module.sector.toLowerCase();
    const machine = module.machineName.toLowerCase().replace(/\s+/g, '_');

    return `${customer}/${country}_${city}/${blueprint}/${sector}/${machine}`;
  }

  private buildMqttModuleConfig(module: Module, tenantId: string): any {
    return {
      id: module.id,
      customer: module.customer,
      country: module.country,
      city: module.city,
      blueprint: module.blueprint,
      sector: module.sector,
      machineName: module.machineName,
      machineId: module.machineId,
      tenant_id: tenantId,
      updatedAt: module.updatedAt,
      type: 'module_update',
    };
  }
}
