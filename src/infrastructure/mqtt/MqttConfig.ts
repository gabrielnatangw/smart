export interface MqttConfig {
  host: string;
  port: number;
  protocol: 'mqtt' | 'mqtts' | 'ws' | 'wss';
  username?: string;
  password?: string;
  clientId: string;
  keepalive: number;
  reconnectPeriod: number;
  connectTimeout: number;
  rejectUnauthorized: boolean;
  clean: boolean;
  ca?: string; // Certificado CA para MQTTS
}

export interface PublishOptions {
  qos?: 0 | 1 | 2;
  retain?: boolean;
  dup?: boolean;
}

export interface SubscribeOptions {
  qos?: 0 | 1 | 2;
}

export interface MqttStatus {
  connected: boolean;
  reconnecting: boolean;
  lastConnected?: Date;
  lastDisconnected?: Date;
  reconnectAttempts: number;
  subscriptions: string[];
}

export interface MqttMessage {
  topic: string;
  payload: Buffer | string;
  qos: 0 | 1 | 2;
  retain: boolean;
  dup: boolean;
  timestamp: Date;
}

export type MessageCallback = (message: MqttMessage) => void;

// Interfaces para o serviço duplo MQTT + MQTTS
export interface DualMqttStatus {
  mqtt: MqttStatus;
  mqtts: MqttStatus;
  anyConnected: boolean;
  bothConnected: boolean;
}

export interface DualMqttConfig {
  mqtt: MqttConfig;
  mqtts: MqttConfig;
}
