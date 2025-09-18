import {
  BroadcastOptions,
  MqttRelayMessage,
} from '../../infrastructure/socket/SocketConfig';
import { ISocketService } from '../interfaces/ISocketService';

export class SocketApplicationService {
  constructor(private socketService: ISocketService) {}

  async initialize(): Promise<void> {
    try {
      await this.socketService.initialize();
      console.log('Socket.IO Application Service initialized successfully');
    } catch (error) {
      console.error(
        'Failed to initialize Socket.IO Application Service:',
        error
      );
      throw error;
    }
  }

  // Device Communication
  async broadcastDeviceData(deviceId: string, data: any): Promise<void> {
    const payload = {
      deviceId,
      data,
      timestamp: new Date().toISOString(),
      type: 'device-data',
    };

    this.socketService.broadcastToNamespace('/devices', 'device-data', payload);
    this.socketService.broadcastToRoom(
      `device:${deviceId}`,
      'device-update',
      payload,
      '/devices'
    );
  }

  async broadcastDeviceStatus(deviceId: string, status: any): Promise<void> {
    const payload = {
      deviceId,
      status,
      timestamp: new Date().toISOString(),
      type: 'device-status',
    };

    this.socketService.broadcastToNamespace(
      '/devices',
      'device-status',
      payload
    );
    this.socketService.broadcastToRoom(
      `device:${deviceId}`,
      'status-update',
      payload,
      '/devices'
    );
  }

  async broadcastDeviceAlert(deviceId: string, alert: any): Promise<void> {
    const payload = {
      deviceId,
      alert,
      timestamp: new Date().toISOString(),
      type: 'device-alert',
      priority: alert.priority || 'medium',
    };

    this.socketService.broadcastToNamespace(
      '/devices',
      'device-alert',
      payload
    );
    this.socketService.broadcastToNamespace('/notifications', 'alert', payload);
  }

  // System Notifications
  async broadcastSystemNotification(
    message: string,
    type: 'info' | 'warning' | 'error' = 'info'
  ): Promise<void> {
    const payload = {
      message,
      type,
      timestamp: new Date().toISOString(),
      source: 'system',
    };

    this.socketService.broadcastToNamespace(
      '/notifications',
      'system-notification',
      payload
    );
    this.socketService.broadcastToNamespace('/system', 'notification', payload);
  }

  async broadcastSystemStatus(status: any): Promise<void> {
    const payload = {
      status,
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      type: 'system-status',
    };

    this.socketService.broadcastToNamespace(
      '/system',
      'system-status',
      payload
    );
  }

  // MQTT Integration
  async relayMqttMessage(mqttMessage: MqttRelayMessage): Promise<void> {
    const payload = {
      topic: mqttMessage.topic,
      payload: mqttMessage.payload,
      qos: mqttMessage.qos,
      retain: mqttMessage.retain,
      timestamp: mqttMessage.timestamp,
      type: 'mqtt-relay',
    };

    // Broadcast to MQTT namespace
    this.socketService.broadcastToNamespace('/mqtt', 'mqtt-message', payload);

    // Broadcast to topic-specific room
    const topicRoom = `topic:${mqttMessage.topic}`;
    this.socketService.broadcastToRoom(
      topicRoom,
      'topic-message',
      payload,
      '/mqtt'
    );

    // If it's device data, also broadcast to devices namespace
    if (
      mqttMessage.topic.includes('/devices/') ||
      mqttMessage.topic.includes('device')
    ) {
      this.socketService.broadcastToNamespace(
        '/devices',
        'mqtt-device-data',
        payload
      );
    }
  }

  // Real-time Analytics
  async broadcastMetrics(metrics: any): Promise<void> {
    const payload = {
      metrics,
      timestamp: new Date().toISOString(),
      type: 'metrics',
    };

    this.socketService.broadcastToRoom(
      'analytics',
      'metrics-update',
      payload,
      '/system'
    );
  }

  // Connection Management
  getConnectionStatus() {
    return this.socketService.getStatus();
  }

  getConnectedClients(namespace?: string): number {
    return this.socketService.getConnectedClients(namespace);
  }

  getRoomClients(room: string, namespace?: string): number {
    return this.socketService.getRoomClients(room, namespace);
  }

  isConnected(): boolean {
    return this.socketService.isConnected();
  }

  // Broadcasting Utilities
  async broadcastToRoom(
    room: string,
    event: string,
    data: any,
    namespace?: string
  ): Promise<void> {
    this.socketService.broadcastToRoom(
      room,
      event,
      {
        ...data,
        timestamp: new Date().toISOString(),
      },
      namespace
    );
  }

  async broadcastToNamespace(
    namespace: string,
    event: string,
    data: any
  ): Promise<void> {
    this.socketService.broadcastToNamespace(namespace, event, {
      ...data,
      timestamp: new Date().toISOString(),
    });
  }

  async broadcast(
    event: string,
    data: any,
    options?: BroadcastOptions
  ): Promise<void> {
    this.socketService.broadcast(
      event,
      {
        ...data,
        timestamp: new Date().toISOString(),
      },
      options
    );
  }

  // Heartbeat
  async sendHeartbeat(): Promise<void> {
    const payload = {
      status: 'alive',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      connections: this.getConnectedClients(),
      type: 'heartbeat',
    };

    this.socketService.broadcastToNamespace('/system', 'heartbeat', payload);
  }

  async shutdown(): Promise<void> {
    await this.socketService.shutdown();
    console.log('Socket.IO Application Service shut down');
  }
}
