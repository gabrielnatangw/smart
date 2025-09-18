export interface SocketConfig {
  port?: number;
  corsOrigin: string | string[];
  pingTimeout: number;
  pingInterval: number;
  transports: string[];
  allowEIO3: boolean;
}

export interface SocketStatus {
  connected: boolean;
  totalConnections: number;
  namespaces: string[];
  rooms: Record<string, number>;
  uptime: number;
  lastStarted?: Date;
}

export interface SocketMessage {
  event: string;
  data: any;
  namespace: string | undefined;
  room: string | undefined;
  timestamp: Date;
}

export interface BroadcastOptions {
  namespace?: string | undefined;
  room?: string | undefined;
  excludeSocket?: string;
}

export interface JoinRoomPayload {
  room: string;
  userId?: string;
}

export interface SubscribeTopicPayload {
  topic: string;
  filters?: string[];
}

export interface MqttRelayMessage {
  topic: string;
  payload: any;
  qos: number;
  retain: boolean;
  timestamp: Date;
}
