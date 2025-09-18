import { v4 as uuidv4 } from 'uuid';

import { Sensor } from '../../domain/entities/Sensor';
import { IMeasurementUnitRepository } from '../interfaces/IMeasurementUnitRepository';
import { IModuleRepository } from '../interfaces/IModuleRepository';
import { IMqttService } from '../interfaces/IMqttService';
import {
  CreateSensorData,
  ISensorRepository,
  SensorFilters,
  UpdateSensorData,
} from '../interfaces/ISensorRepository';

export class SensorApplicationService {
  private static mqttService: IMqttService | undefined;

  constructor(
    private sensorRepository: ISensorRepository,
    private moduleRepository: IModuleRepository,
    private measurementUnitRepository: IMeasurementUnitRepository
  ) {}

  static setMqttService(mqttService: IMqttService) {
    // console.log('🔧 Configuring MQTT service for SensorApplicationService');
    SensorApplicationService.mqttService = mqttService;
  }

  async createSensor(data: {
    name: string;
    minScale?: number | undefined;
    maxScale?: number | undefined;
    minAlarm?: number | undefined;
    maxAlarm?: number | undefined;
    gain?: number | undefined;
    inputMode?: string | undefined;
    ix?: number | undefined;
    gaugeColor?: string | undefined;
    offset?: number | undefined;
    alarmTimeout?: number | undefined;
    counterName?: string | undefined;
    frequencyCounterName?: string | undefined;
    speedSource?: boolean | undefined;
    interruptTransition?: string | undefined;
    timeUnit?: string | undefined;
    speedUnit?: string | undefined;
    samplingInterval?: number | undefined;
    minimumPeriod?: number | undefined;
    maximumPeriod?: number | undefined;
    frequencyResolution?: number | undefined;
    sensorType: number;
    measurementUnitId: string;
    moduleId: string;
    tenantId?: string;
  }): Promise<Sensor> {
    try {
      const sensorData: CreateSensorData = {
        ...data,
      };

      const _sensor = Sensor.create({
        id: uuidv4(),
        ...sensorData,
      });

      const createdSensor = await this.sensorRepository.create(sensorData);

      // Enviar configuração via MQTT se o serviço estiver disponível
      if (SensorApplicationService.mqttService && data.tenantId) {
        await this.sendSensorConfigToMqtt(createdSensor, data.tenantId);
      }

      return createdSensor;
    } catch (error: any) {
      throw error;
    }
  }

  async getSensorById(id: string): Promise<Sensor | null> {
    try {
      return await this.sensorRepository.findById(id);
    } catch (error: any) {
      throw error;
    }
  }

  private async sendSensorConfigToMqtt(
    sensor: Sensor,
    tenantId: string
  ): Promise<void> {
    if (!SensorApplicationService.mqttService) return;

    try {
      // Construir tópico dinâmico baseado no módulo
      const topic = await this.buildMqttTopic(tenantId, sensor.moduleId);

      // Criar objeto MQTT baseado no tipo de sensor
      const mqttConfig = await this.buildMqttConfig(sensor, tenantId);

      // Enviar via MQTT
      const fullTopic = `${topic}/sensorConfig`;
      const mqttPayload = JSON.stringify(mqttConfig);

      await SensorApplicationService.mqttService.publish(
        fullTopic,
        mqttPayload
      );

      // Console bem visível para debug
      console.log('\n' + '='.repeat(80));
      console.log('🚀🚀🚀 ENVIANDO CONFIGURAÇÃO DE SENSOR VIA MQTT 🚀🚀🚀');
      console.log('='.repeat(80));
      console.log(`📡 TÓPICO: ${fullTopic}`);
      console.log(`📋 PAYLOAD: ${JSON.stringify(mqttPayload, null, 2)}`);
      console.log('='.repeat(80));
      console.log('📊 DADOS DETALHADOS:');
      console.log(JSON.stringify(mqttConfig, null, 2));
      console.log('='.repeat(80) + '\n');
    } catch (error) {
      console.error('❌ Error sending sensor config via MQTT:', error);
      // Não falhar a criação do sensor se o MQTT falhar
    }
  }

  private async buildMqttTopic(
    tenantId: string,
    moduleId: string
  ): Promise<string> {
    try {
      // Buscar dados reais do Module
      const module = await this.moduleRepository.findById(moduleId, tenantId);

      if (!module) {
        console.error(
          `❌ Module not found: ${moduleId} for tenant: ${tenantId}`
        );
        // Fallback para valores padrão se não encontrar o módulo
        return `${tenantId}/br_saocarlos/embalagens/salalimpa/injetora_20`;
      }

      // Construir tópico com dados reais do Module
      const customer = module.customer;
      const country_city = `${module.country}_${module.city}`;
      const blueprint = module.blueprint;
      const sector = module.sector;
      const machine = module.machineName;

      return `${customer}/${country_city}/${blueprint}/${sector}/${machine}`;
    } catch (error) {
      console.error('❌ Error building MQTT topic:', error);
      // Fallback para valores padrão em caso de erro
      return `${tenantId}/br_saocarlos/embalagens/salalimpa/injetora_20`;
    }
  }

  private async buildMqttConfig(
    sensor: Sensor,
    tenantId: string
  ): Promise<any> {
    // Buscar unidade de medida
    let measurementUnit = null;
    try {
      measurementUnit = await this.measurementUnitRepository.findById(
        sensor.measurementUnitId
      );
    } catch (error) {
      console.warn(`⚠️ Erro ao buscar unidade de medida: ${error.message}`);
    }

    const baseConfig = {
      id: sensor.id,
      sensorType: sensor.sensorType,
      name: sensor.name,
      tenant_id: tenantId,
      unit: measurementUnit?.unitSymbol || 'N/A', // Adicionar unidade de medida
    };

    // Para sensores analógicos (sensorType === 0)
    if (sensor.sensorType === 0) {
      return {
        ...baseConfig,
        minScale: sensor.minScale,
        maxScale: sensor.maxScale,
        minAlarm: sensor.minAlarm,
        maxAlarm: sensor.maxAlarm,
        gain: sensor.gain,
        inputMode: sensor.inputMode,
        alarmTimeout: sensor.alarmTimeout,
        ix: sensor.ix,
        offset: sensor.offset,
        gaugeColor: sensor.gaugeColor,
      };
    }
    console.log('=====sensor======', sensor);
    // Para sensores digitais (sensorType === 1) - Formato exato do objeto de teste
    return {
      id: sensor.id,
      sensorType: sensor.sensorType,
      name: sensor.name,
      tenant_id: tenantId,
      unit: measurementUnit?.unitSymbol || 'N/A', // Adicionar unidade de medida
      cntName: sensor.counterName,
      freqName: sensor.frequencyCounterName,
      speedSource: sensor.speedSource,
      edge: sensor.interruptTransition,
      timeUnit: sensor.timeUnit,
      speedUnit: sensor.speedUnit,
      freqResol: sensor.frequencyResolution ?? 0,
      ix: sensor.ix ?? 0,
      minPeriod: sensor.minimumPeriod ?? 0,
      maxPeriod: sensor.maximumPeriod ?? 0,
      pollInterval: sensor.samplingInterval ?? 0,
    };
  }

  async getSensorByName(
    name: string,
    measurementUnitId: string
  ): Promise<Sensor | null> {
    try {
      return await this.sensorRepository.findByName(name, measurementUnitId);
    } catch (error: any) {
      throw error;
    }
  }

  async getAllSensors(filters: SensorFilters): Promise<Sensor[]> {
    try {
      return await this.sensorRepository.findAll(filters);
    } catch (error: any) {
      throw error;
    }
  }

  async getSensorsByModule(moduleId: string): Promise<Sensor[]> {
    try {
      return await this.sensorRepository.findByModule(moduleId);
    } catch (error: any) {
      throw error;
    }
  }

  async getSensorsByMeasurementUnit(
    measurementUnitId: string
  ): Promise<Sensor[]> {
    try {
      return await this.sensorRepository.findByMeasurementUnit(
        measurementUnitId
      );
    } catch (error: any) {
      throw error;
    }
  }

  async updateSensor(
    id: string,
    data: UpdateSensorData,
    tenantId: string
  ): Promise<Sensor> {
    try {
      const existingSensor = await this.sensorRepository.findById(id);

      if (!existingSensor) {
        throw new Error('Sensor not found');
      }

      if (existingSensor.isDeleted) {
        throw new Error('Cannot update deleted sensor');
      }

      existingSensor.update(data);

      const updatedSensor = await this.sensorRepository.update(id, data);

      // Enviar atualização via MQTT se o serviço estiver disponível
      if (SensorApplicationService.mqttService && tenantId) {
        await this.sendSensorConfigToMqtt(updatedSensor, tenantId);
      }

      return updatedSensor;
    } catch (error: any) {
      throw error;
    }
  }

  async deleteSensor(id: string): Promise<boolean> {
    try {
      const existingSensor = await this.sensorRepository.findById(id);

      if (!existingSensor) {
        throw new Error('Sensor not found');
      }

      if (existingSensor.isDeleted) {
        throw new Error('Sensor is already deleted');
      }

      return await this.sensorRepository.delete(id);
    } catch (error: any) {
      throw error;
    }
  }

  async restoreSensor(id: string): Promise<boolean> {
    try {
      const existingSensor = await this.sensorRepository.findById(id);

      if (!existingSensor) {
        throw new Error('Sensor not found');
      }

      if (!existingSensor.isDeleted) {
        throw new Error('Sensor is not deleted');
      }

      return await this.sensorRepository.restore(id);
    } catch (error: any) {
      throw error;
    }
  }

  async getSensorCount(filters: SensorFilters): Promise<number> {
    try {
      return await this.sensorRepository.count(filters);
    } catch (error: any) {
      throw error;
    }
  }

  async getSensorStats(
    filters: {
      measurementUnitId?: string | undefined;
      moduleId?: string | undefined;
    } = {}
  ): Promise<{
    total: number;
    active: number;
    deleted: number;
    byType: Array<{ sensorType: number; count: number }>;
    byMeasurementUnit: Array<{ measurementUnitId: string; count: number }>;
    byModule: Array<{ moduleId: string; count: number }>;
  }> {
    try {
      const baseFilters = { ...filters };

      const [total, active, deleted] = await Promise.all([
        this.sensorRepository.count(baseFilters),
        this.sensorRepository.count({ ...baseFilters, isDeleted: false }),
        this.sensorRepository.count({ ...baseFilters, isDeleted: true }),
      ]);

      const allSensors = await this.sensorRepository.findAll(baseFilters);

      const typeStats = allSensors.reduce(
        (acc, sensor) => {
          if (!sensor.isDeleted) {
            const existing = acc.find(
              item => item.sensorType === sensor.sensorType
            );
            if (existing) {
              existing.count++;
            } else {
              acc.push({ sensorType: sensor.sensorType, count: 1 });
            }
          }
          return acc;
        },
        [] as Array<{ sensorType: number; count: number }>
      );

      const measurementUnitStats = allSensors.reduce(
        (acc, sensor) => {
          if (!sensor.isDeleted) {
            const existing = acc.find(
              item => item.measurementUnitId === sensor.measurementUnitId
            );
            if (existing) {
              existing.count++;
            } else {
              acc.push({
                measurementUnitId: sensor.measurementUnitId,
                count: 1,
              });
            }
          }
          return acc;
        },
        [] as Array<{ measurementUnitId: string; count: number }>
      );

      const moduleStats = allSensors.reduce(
        (acc, sensor) => {
          if (!sensor.isDeleted) {
            const existing = acc.find(
              item => item.moduleId === sensor.moduleId
            );
            if (existing) {
              existing.count++;
            } else {
              acc.push({ moduleId: sensor.moduleId, count: 1 });
            }
          }
          return acc;
        },
        [] as Array<{ moduleId: string; count: number }>
      );

      return {
        total,
        active,
        deleted,
        byType: typeStats.sort((a, b) => b.count - a.count),
        byMeasurementUnit: measurementUnitStats.sort(
          (a, b) => b.count - a.count
        ),
        byModule: moduleStats.sort((a, b) => b.count - a.count),
      };
    } catch (error: any) {
      throw error;
    }
  }
}
