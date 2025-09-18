import { EventEmitter } from 'events';
import mqtt from 'mqtt';

import {
  MessageCallback,
  MqttConfig,
  MqttMessage,
  MqttStatus,
  PublishOptions,
  SubscribeOptions,
} from './MqttConfig';

export class MqttClient extends EventEmitter {
  private client?: mqtt.MqttClient;
  private config: MqttConfig;
  private status: MqttStatus;
  private subscriptions: Map<string, MessageCallback> = new Map();
  private messageQueue: Array<{
    topic: string;
    message: any;
    options?: PublishOptions;
  }> = [];

  constructor(config: MqttConfig) {
    super();
    this.config = config;
    this.status = {
      connected: false,
      reconnecting: false,
      reconnectAttempts: 0,
      subscriptions: [],
    };
  }

  async connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      const brokerUrl = `${this.config.protocol}://${this.config.host}:${this.config.port}`;

      const options: mqtt.IClientOptions = {
        username: this.config.username || '',
        password: this.config.password || '',
        clientId: this.config.clientId,
        keepalive: this.config.keepalive,
        reconnectPeriod: this.config.reconnectPeriod,
        connectTimeout: this.config.connectTimeout,
        rejectUnauthorized: this.config.rejectUnauthorized,
        clean: this.config.clean,
        ...(this.config.ca && { ca: this.config.ca }), // Adicionar certificado CA se disponível
      };

      this.client = mqtt.connect(brokerUrl, options);

      this.client.on('connect', () => {
        const protocol = this.config.protocol.toUpperCase();
        console.log(`${protocol} connected to ${brokerUrl}`);
        this.status.connected = true;
        this.status.reconnecting = false;
        this.status.lastConnected = new Date();
        this.status.reconnectAttempts = 0;

        this.emit('connect');
        this.processMessageQueue();
        resolve();
      });

      this.client.on('disconnect', () => {
        const protocol = this.config.protocol.toUpperCase();
        console.log(`${protocol} disconnected`);
        this.status.connected = false;
        this.status.lastDisconnected = new Date();
        this.emit('disconnect');
      });

      this.client.on('reconnect', () => {
        const protocol = this.config.protocol.toUpperCase();
        console.log(`${protocol} attempting to reconnect...`);
        this.status.reconnecting = true;
        this.status.reconnectAttempts++;
        this.emit('reconnect');
      });

      this.client.on('error', error => {
        const protocol = this.config.protocol.toUpperCase();
        console.error(`${protocol} error:`, error);
        this.emit('error', error);
        reject(error);
      });

      this.client.on('message', (topic, payload, packet) => {
        const message: MqttMessage = {
          topic,
          payload,
          qos: packet.qos,
          retain: packet.retain,
          dup: packet.dup,
          timestamp: new Date(),
        };

        // Find callback for this topic (supports wildcards)
        let callback: MessageCallback | undefined;
        for (const [subscriptionTopic, cb] of this.subscriptions) {
          if (this.topicMatches(topic, subscriptionTopic)) {
            callback = cb;
            break;
          }
        }

        if (callback) {
          callback(message);
        }

        this.emit('message', message);
      });

      setTimeout(() => {
        if (!this.status.connected) {
          reject(new Error('MQTT connection timeout'));
        }
      }, this.config.connectTimeout);
    });
  }

  async disconnect(): Promise<void> {
    return new Promise(resolve => {
      if (this.client) {
        this.client.end(true, {}, () => {
          console.log('MQTT disconnected gracefully');
          resolve();
        });
      } else {
        resolve();
      }
    });
  }

  async publish(
    topic: string,
    message: any,
    options?: PublishOptions
  ): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!this.client || !this.status.connected) {
        this.messageQueue.push({ topic, message, options: options || {} });
        console.log(`Message queued for topic: ${topic}`);
        resolve();
        return;
      }

      const payload =
        typeof message === 'string' ? message : JSON.stringify(message);

      this.client.publish(topic, payload, options || {}, error => {
        if (error) {
          console.error(`Failed to publish to ${topic}:`, error);
          reject(error);
        } else {
          console.log(`Message published to ${topic}`);
          resolve();
        }
      });
    });
  }

  async subscribe(
    topic: string,
    callback?: MessageCallback,
    options?: SubscribeOptions
  ): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!this.client) {
        reject(new Error('MQTT client not initialized'));
        return;
      }

      this.client.subscribe(
        topic,
        { qos: options?.qos || 0 },
        (error, _granted) => {
          if (error) {
            console.error(`Failed to subscribe to ${topic}:`, error);
            reject(error);
          } else {
            console.log(`Subscribed to ${topic}`);
            this.status.subscriptions.push(topic);

            if (callback) {
              this.subscriptions.set(topic, callback);
            }

            resolve();
          }
        }
      );
    });
  }

  async unsubscribe(topic: string): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!this.client) {
        reject(new Error('MQTT client not initialized'));
        return;
      }

      this.client.unsubscribe(topic, error => {
        if (error) {
          console.error(`Failed to unsubscribe from ${topic}:`, error);
          reject(error);
        } else {
          console.log(`Unsubscribed from ${topic}`);
          this.status.subscriptions = this.status.subscriptions.filter(
            s => s !== topic
          );
          this.subscriptions.delete(topic);
          resolve();
        }
      });
    });
  }

  getStatus(): MqttStatus {
    return { ...this.status };
  }

  private processMessageQueue(): void {
    while (this.messageQueue.length > 0) {
      const messageData = this.messageQueue.shift();
      if (!messageData) return;
      const { topic, message, options } = messageData;
      this.publish(topic, message, options).catch(console.error);
    }
  }

  private topicMatches(
    actualTopic: string,
    subscriptionPattern: string
  ): boolean {
    // Convert MQTT wildcard pattern to regex
    // + matches single level, # matches multiple levels
    if (subscriptionPattern === actualTopic) return true;

    const pattern = subscriptionPattern
      .replace(/\+/g, '[^/]+') // + matches any single level
      .replace(/#/g, '.*'); // # matches any number of levels

    const regex = new RegExp(`^${pattern}$`);
    return regex.test(actualTopic);
  }
}
