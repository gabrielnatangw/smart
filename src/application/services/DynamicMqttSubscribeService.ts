import { MqttMessage } from '../../infrastructure/mqtt/MqttConfig';
import { IMqttService } from '../interfaces/IMqttService';
import { ISocketService } from '../interfaces/ISocketService';
import { GetUniqueMqttTopicsUseCase } from '../use-cases/GetUniqueMqttTopicsUseCase';

export class DynamicMqttSubscribeService {
  private subscribedTopics: Set<string> = new Set();

  constructor(
    private mqttService: IMqttService,
    private getUniqueTopicsUseCase: GetUniqueMqttTopicsUseCase,
    private socketService?: ISocketService
  ) {}

  async initializeDynamicSubscriptions(): Promise<void> {
    try {
      console.log('🚀 Inicializando subscribe dinâmico MQTT...');

      const topics = await this.getUniqueTopicsUseCase.execute();

      if (topics.length === 0) {
        console.log('⚠️ Nenhum tópico para subscrever');
        return;
      }

      // console.log(`📡 Subscribing to ${topics.length} dynamic topics...`);

      for (const topic of topics) {
        await this.subscribeToTopic(topic);
      }

      console.log(
        `✅ Subscribe dinâmico inicializado com sucesso! ${this.subscribedTopics.size} tópicos ativos`
      );
    } catch (error) {
      console.error('❌ Erro ao inicializar subscribe dinâmico:', error);
      throw error;
    }
  }

  /**
   * Subscreve a um tópico específico baseado nos dados do módulo
   * Evita duplicatas verificando se já foi subscrito
   */
  async subscribeToModuleTopic(module: {
    customer: string;
    country: string;
    city: string;
  }): Promise<void> {
    try {
      // Construir tópico no mesmo padrão do GetUniqueMqttTopicsUseCase
      const customer = module.customer.toLowerCase();
      const country = module.country.toLowerCase();
      const city = module.city.toLowerCase();
      const topic = `${customer}/${country}_${city}/#`;

      // Verificar se já foi subscrito
      if (this.subscribedTopics.has(topic)) {
        console.log(`📡 Tópico já subscrito: ${topic}`);
        return;
      }

      console.log(`🆕 Novo módulo detectado, subscrevendo tópico: ${topic}`);
      await this.subscribeToTopic(topic);

      console.log(`✅ Tópico subscrito com sucesso: ${topic}`);
    } catch (error) {
      console.error('❌ Erro ao subscrever tópico do módulo:', error);
      throw error;
    }
  }

  private async subscribeToTopic(topic: string): Promise<void> {
    try {
      if (this.subscribedTopics.has(topic)) {
        console.log(`⚠️ Tópico já subscrito: ${topic}`);
        return;
      }

      await this.mqttService.subscribe(topic, message => {
        this.handleMqttMessage(message);
      });

      this.subscribedTopics.add(topic);
      // console.log(`✅ Subscribed to: ${topic}`);
    } catch (error) {
      console.error(`❌ Erro ao subscrever no tópico ${topic}:`, error);
    }
  }

  private handleMqttMessage(message: MqttMessage): void {
    try {
      // console.log(`📨 MQTT Message received on ${message.topic}`);

      // Roteamento baseado no tipo de mensagem
      this.routeMessage(message);

      // Relay para Socket.IO se disponível
      if (this.socketService) {
        this.relayToSocket(message);
      }
    } catch (error) {
      console.error('❌ Erro ao processar mensagem MQTT:', error);
    }
  }

  private routeMessage(message: MqttMessage): void {
    const topic = message.topic;
    const payload = message.payload.toString();

    try {
      // Tentar fazer parse do JSON
      const data = JSON.parse(payload);

      if (topic.includes('/sensorConfig')) {
        this.handleSensorConfig(topic, data);
      } else if (topic.includes('/pTrace/data')) {
        this.handleSensorData(topic, data);
      } else if (topic.includes('/jobRunData')) {
        this.handleJobRunData(topic, data);
      } else if (topic.includes('/autoStop')) {
        this.handleAutoStop(topic, data);
      } else if (topic.includes('/autoRun')) {
        this.handleAutoRun(topic, data);
      } else if (topic.includes('/newJob')) {
        this.handleNewJob(topic, data);
      } else {
        this.handleGenericMessage(topic, data);
      }
    } catch {
      // Se não for JSON, tratar como texto
      this.handleTextMessage(topic, payload);
    }
  }

  private handleSensorConfig(_topic: string, _data: any): void {
    // console.log(`🔧 Sensor Config received on ${topic}:`, data);
    // Aqui você pode adicionar lógica específica para configuração de sensores
  }

  private handleSensorData(_topic: string, _data: any): void {
    // console.log(`📊 Sensor Data received on ${topic}:`, data);
    // Aqui você pode adicionar lógica específica para dados de sensores
  }

  private handleJobRunData(_topic: string, _data: any): void {
    // console.log(`🏭 Job Run Data received on ${topic}:`, data);
    // Aqui você pode adicionar lógica específica para dados de execução de jobs
  }

  private handleAutoStop(_topic: string, _data: any): void {
    // console.log(`⏹️ Auto Stop received on ${topic}:`, data);
    // Aqui você pode adicionar lógica específica para parada automática
  }

  private handleAutoRun(_topic: string, _data: any): void {
    // console.log(`▶️ Auto Run received on ${topic}:`, data);
    // Aqui você pode adicionar lógica específica para execução automática
  }

  private handleNewJob(_topic: string, _data: any): void {
    // console.log(`🆕 New Job received on ${topic}:`, data);
    // Aqui você pode adicionar lógica específica para novos jobs
  }

  private handleGenericMessage(_topic: string, _data: any): void {
    // console.log(`📋 Generic message received on ${topic}:`, data);
    // Aqui você pode adicionar lógica genérica para outros tipos de mensagem
  }

  private handleTextMessage(_topic: string, _payload: string): void {
    // console.log(`📝 Text message received on ${topic}: ${payload}`);
    // Aqui você pode adicionar lógica para mensagens de texto
  }

  private relayToSocket(message: MqttMessage): void {
    try {
      const payload = {
        topic: message.topic,
        payload: message.payload.toString(),
        qos: message.qos,
        retain: message.retain,
        timestamp: message.timestamp,
        type: 'mqtt-relay',
      };

      // Se for dados de sensor, também broadcast para namespace de sensores
      if (
        message.topic.includes('/pTrace/data') ||
        message.topic.includes('sensor')
      ) {
        // console.log('aqui esta os dados que vao para o frontend: ', payload);
        this.socketService?.broadcastToNamespace(
          '/sensor',
          'sensor-data',
          payload
        );
      }

      // Broadcast to MQTT namespace
      this.socketService?.broadcastToNamespace(
        '/mqtt',
        'mqtt-message',
        payload
      );

      // Broadcast to topic-specific room
      const topicRoom = `topic:${message.topic}`;
      this.socketService?.broadcastToRoom(
        topicRoom,
        'topic-message',
        payload,
        '/mqtt'
      );
    } catch (error) {
      console.error('❌ Erro ao fazer relay para Socket.IO:', error);
    }
  }

  getSubscribedTopics(): string[] {
    return Array.from(this.subscribedTopics);
  }

  getSubscribedTopicsCount(): number {
    return this.subscribedTopics.size;
  }
}
