import { existsSync, readFileSync } from 'fs';

import { DualMqttService } from './DualMqttService';
import { DualMqttConfig, MqttConfig } from './MqttConfig';
import { MqttService } from './MqttService';

export function createMqttService(): MqttService {
  const mqttHost = process.env.MQTT_HOST || 'localhost';

  let cleanHost = mqttHost;
  if (mqttHost.includes('://')) {
    cleanHost = mqttHost.split('://')[1] || mqttHost;
  }

  const config: MqttConfig = {
    host: cleanHost,
    port: parseInt(process.env.MQTT_PORT || '1883'),
    protocol: (process.env.MQTT_PROTOCOL as any) || 'mqtt',
    username: process.env.MQTT_USERNAME || '',
    password: process.env.MQTT_PASSWORD || '',
    clientId: process.env.MQTT_CLIENT_ID || `backend_api_${Date.now()}`,

    // ✅ USAR VARIÁVEIS DE AMBIENTE:
    keepalive: parseInt(process.env.MQTT_KEEPALIVE || '300'),
    reconnectPeriod: parseInt(process.env.MQTT_RECONNECT_PERIOD || '30000'),
    connectTimeout: parseInt(process.env.MQTT_CONNECT_TIMEOUT || '10000'),

    rejectUnauthorized: false,
    clean: true,
  };

  console.log('�� Configurações MQTT:', {
    keepalive: config.keepalive,
    reconnectPeriod: config.reconnectPeriod,
    connectTimeout: config.connectTimeout,
  });

  return new MqttService(config);
}

export function createDualMqttService(): DualMqttService {
  const nodeEnv = process.env.NODE_ENV || 'local';

  // Configuração MQTT (usar host antigo)
  const mqttHost = process.env.MQTT_HOST || 'mqtt://groupwork-smart.com';
  let cleanMqttHost = mqttHost;
  if (mqttHost.includes('://')) {
    cleanMqttHost = mqttHost.split('://')[1] || mqttHost;
  }

  const mqttConfig: MqttConfig = {
    host: cleanMqttHost,
    port: parseInt(process.env.MQTT_PORT || '1883'),
    protocol: 'mqtt',
    username: process.env.MQTT_USERNAME || '',
    password: process.env.MQTT_PASSWORD || '',
    clientId:
      process.env.MQTT_CLIENT_ID || `backend_api_mqtt_${nodeEnv}_${Date.now()}`,
    keepalive: parseInt(process.env.MQTT_KEEPALIVE || '300'),
    reconnectPeriod: parseInt(process.env.MQTT_RECONNECT_PERIOD || '30000'),
    connectTimeout: parseInt(process.env.MQTT_CONNECT_TIMEOUT || '10000'),
    rejectUnauthorized: false,
    clean: true,
  };

  // Configuração MQTTS (usar host novo)
  const mqttsHost = process.env.MQTTS_HOST || '35.226.220.9';
  let cleanMqttsHost = mqttsHost;
  if (mqttsHost.includes('://')) {
    cleanMqttsHost = mqttsHost.split('://')[1] || mqttsHost;
  }

  // Configurar certificado CA se disponível
  const caCertPath = '/home/devgroupwork167/backend-v2/ca.crt';
  let caCert: string | undefined;
  try {
    if (existsSync(caCertPath)) {
      caCert = readFileSync(caCertPath, 'utf8');
      console.log(`🔒 Certificado CA carregado: ${caCertPath}`);
    } else {
      console.warn(`⚠️ Certificado CA não encontrado: ${caCertPath}`);
    }
  } catch (error) {
    console.warn(`⚠️ Erro ao carregar certificado CA: ${error.message}`);
  }

  const mqttsConfig: MqttConfig = {
    host: cleanMqttsHost,
    port: parseInt(process.env.MQTTS_PORT || '8883'),
    protocol: 'mqtts',
    username: process.env.MQTTS_USERNAME || 'gwsmarttls',
    password: process.env.MQTTS_PASSWORD || '5m@rt8r0k3r',
    clientId:
      process.env.MQTTS_CLIENT_ID ||
      `backend_api_mqtts_${nodeEnv}_${Date.now()}`,
    keepalive: parseInt(
      process.env.MQTTS_KEEPALIVE || process.env.MQTT_KEEPALIVE || '300'
    ),
    reconnectPeriod: parseInt(
      process.env.MQTTS_RECONNECT_PERIOD ||
        process.env.MQTT_RECONNECT_PERIOD ||
        '30000'
    ),
    connectTimeout: parseInt(
      process.env.MQTTS_CONNECT_TIMEOUT ||
        process.env.MQTT_CONNECT_TIMEOUT ||
        '10000'
    ),
    rejectUnauthorized: process.env.MQTTS_REJECT_UNAUTHORIZED === 'true',
    clean: true,
    ca: caCert, // Adicionar certificado CA
  };

  const dualConfig: DualMqttConfig = {
    mqtt: mqttConfig,
    mqtts: mqttsConfig,
  };

  console.log(`🔌 Configurações MQTT (${nodeEnv}):`, {
    host: mqttConfig.host,
    port: mqttConfig.port,
    protocol: mqttConfig.protocol,
    clientId: mqttConfig.clientId,
    keepalive: mqttConfig.keepalive,
    environment: nodeEnv,
  });

  console.log(`🔒 Configurações MQTTS (${nodeEnv}):`, {
    host: mqttsConfig.host,
    port: mqttsConfig.port,
    protocol: mqttsConfig.protocol,
    clientId: mqttsConfig.clientId,
    keepalive: mqttsConfig.keepalive,
    rejectUnauthorized: mqttsConfig.rejectUnauthorized,
    environment: nodeEnv,
  });

  return new DualMqttService(dualConfig);
}

export * from './MqttConfig';
export * from './MqttClient';
export * from './MqttService';
export * from './DualMqttService';
