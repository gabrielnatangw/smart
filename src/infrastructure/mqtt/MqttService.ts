import { IMqttService } from '../../application/interfaces/IMqttService';
import { MqttClient } from './MqttClient';
import {
  MessageCallback,
  MqttConfig,
  MqttStatus,
  PublishOptions,
  SubscribeOptions,
} from './MqttConfig';

export class MqttService implements IMqttService {
  private mqttClient: MqttClient;

  constructor(config: MqttConfig) {
    this.mqttClient = new MqttClient(config);
  }

  async connect(): Promise<void> {
    await this.mqttClient.connect();
  }

  async disconnect(): Promise<void> {
    await this.mqttClient.disconnect();
  }

  async publish(
    topic: string,
    message: any,
    options?: PublishOptions
  ): Promise<void> {
    await this.mqttClient.publish(topic, message, options);
  }

  async subscribe(
    topic: string,
    callback?: MessageCallback,
    options?: SubscribeOptions
  ): Promise<void> {
    await this.mqttClient.subscribe(topic, callback, options);
  }

  async unsubscribe(topic: string): Promise<void> {
    await this.mqttClient.unsubscribe(topic);
  }

  getStatus(): MqttStatus {
    return this.mqttClient.getStatus();
  }

  isConnected(): boolean {
    return this.mqttClient.getStatus().connected;
  }

  getClient(): MqttClient {
    return this.mqttClient;
  }
}
