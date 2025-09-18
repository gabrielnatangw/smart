import { IMqttService } from '../../application/interfaces/IMqttService';
import {
  DualMqttConfig,
  DualMqttStatus,
  MessageCallback,
  MqttStatus,
  PublishOptions,
  SubscribeOptions,
} from './MqttConfig';
import { MqttService } from './MqttService';

export class DualMqttService implements IMqttService {
  private mqttService: MqttService;
  private mqttsService: MqttService;
  private messageCallbacks: Map<string, MessageCallback[]> = new Map();

  constructor(config: DualMqttConfig) {
    this.mqttService = new MqttService(config.mqtt);
    this.mqttsService = new MqttService(config.mqtts);

    // Configurar relay de mensagens entre os serviços
    this.setupMessageRelay();
  }

  async connect(): Promise<void> {
    console.log('🔌 Conectando aos serviços MQTT...');

    // Conectar MQTT e MQTTS
    const connectionPromises = [
      this.mqttService
        .connect()
        .then(() => 'MQTT')
        .catch(() => null),
      this.mqttsService
        .connect()
        .then(() => 'MQTTS')
        .catch(() => null),
    ];

    const results = await Promise.allSettled(connectionPromises);
    const connectionResults = results
      .map(result => (result.status === 'fulfilled' ? result.value : null))
      .filter(result => result !== null) as string[];

    // Verificar se pelo menos um protocolo conectou
    if (connectionResults.length === 0) {
      console.error('❌ Falha ao conectar no protocolo MQTT');
      throw new Error('❌ Falha ao conectar no protocolo MQTT');
    }

    console.log(`✅ Conectado com sucesso: ${connectionResults.join(' + ')}`);

    // Log informativo sobre conexões ativas
    console.log('ℹ️ MQTT e MQTTS ativos - conexões estabelecidas');
  }

  async disconnect(): Promise<void> {
    console.log('🔌 Desconectando dos serviços MQTT e MQTTS...');

    const disconnectResults = [];

    // Tentar desconectar MQTT
    try {
      if (this.mqttService.isConnected()) {
        await this.mqttService.disconnect();
        console.log('✅ MQTT desconectado com sucesso');
        disconnectResults.push('MQTT');
      }
    } catch (error) {
      console.warn('⚠️ Erro ao desconectar MQTT:', error.message);
    }

    // Tentar desconectar MQTTS
    try {
      if (this.mqttsService.isConnected()) {
        await this.mqttsService.disconnect();
        console.log('✅ MQTTS desconectado com sucesso');
        disconnectResults.push('MQTTS');
      }
    } catch (error) {
      console.warn('⚠️ Erro ao desconectar MQTTS:', error.message);
    }

    console.log(`✅ Desconectado: ${disconnectResults.join(' + ')}`);
  }

  async publish(
    topic: string,
    message: any,
    options?: PublishOptions
  ): Promise<void> {
    console.log(`📤 Publicando mensagem no tópico: ${topic}`);

    const publishResults = [];
    const publishPromises: Promise<void>[] = [];

    // Publicar no MQTT se estiver conectado
    if (this.mqttService.isConnected()) {
      publishPromises.push(
        this.mqttService
          .publish(topic, message, options)
          .then(() => {
            console.log('✅ Mensagem publicada no MQTT');
            publishResults.push('MQTT');
          })
          .catch(error => {
            console.warn('⚠️ Erro ao publicar no MQTT:', error.message);
          })
      );
    }

    // Publicar no MQTTS se estiver conectado
    if (this.mqttsService.isConnected()) {
      publishPromises.push(
        this.mqttsService
          .publish(topic, message, options)
          .then(() => {
            console.log('✅ Mensagem publicada no MQTTS');
            publishResults.push('MQTTS');
          })
          .catch(error => {
            console.warn('⚠️ Erro ao publicar no MQTTS:', error.message);
          })
      );
    }

    if (publishPromises.length === 0) {
      throw new Error('Nenhum serviço MQTT conectado para publicar');
    }

    // Aguardar todas as tentativas
    await Promise.allSettled(publishPromises);

    if (publishResults.length === 0) {
      throw new Error('Falha ao publicar em todos os protocolos MQTT');
    }

    console.log(`📤 Publicado com sucesso em: ${publishResults.join(' + ')}`);
  }

  async subscribe(
    topic: string,
    callback?: MessageCallback,
    options?: SubscribeOptions
  ): Promise<void> {
    console.log(`📡 Subscribindo ao tópico: ${topic}`);

    // Armazenar callback para relay
    if (callback) {
      if (!this.messageCallbacks.has(topic)) {
        this.messageCallbacks.set(topic, []);
      }
      const callbacks = this.messageCallbacks.get(topic);
      if (callbacks) {
        callbacks.push(callback);
      }
    }

    const subscribeResults = [];
    const subscribePromises: Promise<void>[] = [];

    // Subscribe no MQTT se estiver conectado
    if (this.mqttService.isConnected()) {
      subscribePromises.push(
        this.mqttService
          .subscribe(topic, callback, options)
          .then(() => {
            console.log('✅ Subscrito no MQTT');
            subscribeResults.push('MQTT');
          })
          .catch(error => {
            console.warn('⚠️ Erro ao subscrever no MQTT:', error.message);
          })
      );
    }

    // Subscribe no MQTTS se estiver conectado
    if (this.mqttsService.isConnected()) {
      subscribePromises.push(
        this.mqttsService
          .subscribe(topic, callback, options)
          .then(() => {
            console.log('✅ Subscrito no MQTTS');
            subscribeResults.push('MQTTS');
          })
          .catch(error => {
            console.warn('⚠️ Erro ao subscrever no MQTTS:', error.message);
          })
      );
    }

    if (subscribePromises.length === 0) {
      throw new Error('Nenhum serviço MQTT conectado para subscrever');
    }

    // Aguardar todas as tentativas
    await Promise.allSettled(subscribePromises);

    if (subscribeResults.length === 0) {
      throw new Error('Falha ao subscrever em todos os protocolos MQTT');
    }

    console.log(`📡 Subscrito com sucesso em: ${subscribeResults.join(' + ')}`);
  }

  async unsubscribe(topic: string): Promise<void> {
    console.log(`📡 Unsubscribing do tópico: ${topic}`);

    // Remover callbacks
    this.messageCallbacks.delete(topic);

    const unsubscribeResults = [];
    const unsubscribePromises: Promise<void>[] = [];

    // Unsubscribe do MQTT se estiver conectado
    if (this.mqttService.isConnected()) {
      unsubscribePromises.push(
        this.mqttService
          .unsubscribe(topic)
          .then(() => {
            console.log('✅ Unsubscribed do MQTT');
            unsubscribeResults.push('MQTT');
          })
          .catch(error => {
            console.warn('⚠️ Erro ao unsubscribir do MQTT:', error.message);
          })
      );
    }

    // Unsubscribe do MQTTS se estiver conectado
    if (this.mqttsService.isConnected()) {
      unsubscribePromises.push(
        this.mqttsService
          .unsubscribe(topic)
          .then(() => {
            console.log('✅ Unsubscribed do MQTTS');
            unsubscribeResults.push('MQTTS');
          })
          .catch(error => {
            console.warn('⚠️ Erro ao unsubscribir do MQTTS:', error.message);
          })
      );
    }

    if (unsubscribePromises.length === 0) {
      throw new Error('Nenhum serviço MQTT conectado para unsubscribir');
    }

    // Aguardar todas as tentativas
    await Promise.allSettled(unsubscribePromises);

    if (unsubscribeResults.length === 0) {
      throw new Error('Falha ao unsubscribir de todos os protocolos MQTT');
    }

    console.log(
      `📡 Unsubscribed com sucesso de: ${unsubscribeResults.join(' + ')}`
    );
  }

  getStatus(): MqttStatus {
    // Retornar status do MQTT como principal (para compatibilidade)
    return this.mqttService.getStatus();
  }

  getDualStatus(): DualMqttStatus {
    const mqttStatus = this.mqttService.getStatus();
    const mqttsStatus = this.mqttsService.getStatus();

    return {
      mqtt: mqttStatus,
      mqtts: mqttsStatus,
      anyConnected: mqttStatus.connected || mqttsStatus.connected,
      bothConnected: mqttStatus.connected && mqttsStatus.connected,
    };
  }

  isConnected(): boolean {
    return this.mqttService.isConnected() || this.mqttsService.isConnected();
  }

  isMqttConnected(): boolean {
    return this.mqttService.isConnected();
  }

  isMqttsConnected(): boolean {
    return this.mqttsService.isConnected();
  }

  getMqttService(): MqttService {
    return this.mqttService;
  }

  getMqttsService(): MqttService {
    return this.mqttsService;
  }

  private setupMessageRelay(): void {
    // Configurar relay de mensagens do MQTT para MQTTS
    this.mqttService.getClient().on('message', message => {
      this.relayMessage('MQTT', message);
    });

    // Configurar relay de mensagens do MQTTS para MQTT
    this.mqttsService.getClient().on('message', message => {
      this.relayMessage('MQTTS', message);
    });
  }

  private relayMessage(source: string, message: any): void {
    console.log(
      `📨 Mensagem recebida via ${source} no tópico: ${message.topic}`
    );

    // Executar callbacks registrados
    const callbacks = this.messageCallbacks.get(message.topic);
    if (callbacks) {
      callbacks.forEach(callback => {
        try {
          callback(message);
        } catch (error) {
          console.error('❌ Erro ao executar callback:', error);
        }
      });
    }
  }
}
