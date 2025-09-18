import {
  MessageCallback,
  MqttStatus,
  PublishOptions,
  SubscribeOptions,
} from '../../infrastructure/mqtt/MqttConfig';

export interface IMqttService {
  connect(): Promise<void>;
  disconnect(): Promise<void>;
  publish(topic: string, message: any, options?: PublishOptions): Promise<void>;
  subscribe(
    topic: string,
    callback?: MessageCallback,
    options?: SubscribeOptions
  ): Promise<void>;
  unsubscribe(topic: string): Promise<void>;
  getStatus(): MqttStatus;
  isConnected(): boolean;
}
