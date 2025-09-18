import {
  MessageCallback,
  PublishOptions,
} from '../../infrastructure/mqtt/MqttConfig';
import { IMqttService } from '../interfaces/IMqttService';

export class MqttApplicationService {
  constructor(private mqttService: IMqttService) {}

  async initialize(): Promise<void> {
    try {
      await this.mqttService.connect();
      console.log('MQTT Application Service initialized successfully');
    } catch (error) {
      console.error('Failed to initialize MQTT Application Service:', error);
      // Não propagar o erro para não crashar a aplicação
      console.warn(
        '⚠️ MQTT Application Service falhou, mas a aplicação continuará funcionando'
      );
    }
  }

  async publishDeviceData(deviceId: string, data: any): Promise<void> {
    const topic = `/api/devices/${deviceId}/data`;
    await this.mqttService.publish(topic, data);
  }

  async publishDeviceStatus(deviceId: string, status: any): Promise<void> {
    const topic = `/api/devices/${deviceId}/status`;
    const options: PublishOptions = { retain: true, qos: 1 };
    await this.mqttService.publish(topic, status, options);
  }

  async sendDeviceCommand(deviceId: string, command: any): Promise<void> {
    const topic = `/api/devices/${deviceId}/commands`;
    const options: PublishOptions = { qos: 1 };
    await this.mqttService.publish(topic, command, options);
  }

  async broadcastSystemNotification(message: string): Promise<void> {
    const topic = '/api/system/notifications';
    const payload = {
      message,
      timestamp: new Date().toISOString(),
      source: 'backend-api',
    };
    await this.mqttService.publish(topic, payload);
  }

  async publishHeartbeat(): Promise<void> {
    const topic = '/api/system/heartbeat';
    const payload = {
      status: 'alive',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
    };
    const options: PublishOptions = { retain: true };
    await this.mqttService.publish(topic, payload, options);
  }

  async subscribeToDeviceEvents(
    deviceId: string,
    callback?: MessageCallback
  ): Promise<void> {
    const topic = `/api/devices/${deviceId}/+`;
    await this.mqttService.subscribe(topic, callback);
  }

  async subscribeToAllDevices(callback?: MessageCallback): Promise<void> {
    const topic = '/api/devices/+/+';
    await this.mqttService.subscribe(topic, callback);
  }

  async subscribeToSystemEvents(callback?: MessageCallback): Promise<void> {
    const topic = '/api/system/+';
    await this.mqttService.subscribe(topic, callback);
  }

  getConnectionStatus() {
    return this.mqttService.getStatus();
  }

  isConnected(): boolean {
    return this.mqttService.isConnected();
  }

  async publishToTopic(
    topic: string,
    message: any,
    options?: PublishOptions
  ): Promise<void> {
    await this.mqttService.publish(topic, message, options);
  }

  async shutdown(): Promise<void> {
    await this.mqttService.disconnect();
    console.log('MQTT Application Service shut down');
  }
}
