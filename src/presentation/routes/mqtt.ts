import { PrismaClient } from '@prisma/client';
import { Router } from 'express';

import { MqttApplicationService } from '../../application/services/MqttApplicationService';
import { PrismaAuthenticationRepository } from '../../infrastructure/persistence/repositories/PrismaAuthenticationRepository';
import { AuthenticationMiddleware } from '../middleware/authenticationMiddleware';

const mqttRouter = Router();
const prisma = new PrismaClient();

// Initialize authentication middleware
const authRepository = new PrismaAuthenticationRepository(prisma);
const authMiddleware = new AuthenticationMiddleware(authRepository);

// Apply authentication middleware to all MQTT routes
mqttRouter.use(authMiddleware.requireAuth);

mqttRouter.get('/status', (req, res) => {
  try {
    const mqttAppService = req.app.locals
      .mqttAppService as MqttApplicationService;
    const status = mqttAppService.getConnectionStatus();

    res.json({
      status: 'OK',
      mqtt: {
        connected: status.connected,
        reconnecting: status.reconnecting,
        lastConnected: status.lastConnected,
        lastDisconnected: status.lastDisconnected,
        reconnectAttempts: status.reconnectAttempts,
        subscriptions: status.subscriptions,
      },
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    res.status(500).json({
      status: 'Error',
      message: 'Failed to get MQTT status',
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString(),
    });
  }
});

mqttRouter.post('/publish', async (req, res) => {
  try {
    const mqttAppService = req.app.locals
      .mqttAppService as MqttApplicationService;
    const { topic, message, options } = req.body;

    if (!topic || !message) {
      return res.status(400).json({
        status: 'Error',
        message: 'Topic and message are required',
        timestamp: new Date().toISOString(),
      });
    }

    await mqttAppService.publishDeviceData('api', {
      topic,
      message,
      ...options,
    });

    res.json({
      status: 'OK',
      message: 'Message published successfully',
      topic,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    res.status(500).json({
      status: 'Error',
      message: 'Failed to publish message',
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString(),
    });
  }
});

mqttRouter.post('/heartbeat', async (req, res) => {
  try {
    const mqttAppService = req.app.locals
      .mqttAppService as MqttApplicationService;
    await mqttAppService.publishHeartbeat();

    res.json({
      status: 'OK',
      message: 'Heartbeat published successfully',
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    res.status(500).json({
      status: 'Error',
      message: 'Failed to publish heartbeat',
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString(),
    });
  }
});

export { mqttRouter };
