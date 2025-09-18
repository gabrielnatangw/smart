import { PrismaClient } from '@prisma/client';
import { Router } from 'express';

import { SocketApplicationService } from '../../application/services/SocketApplicationService';
import { PrismaAuthenticationRepository } from '../../infrastructure/persistence/repositories/PrismaAuthenticationRepository';
import { AuthenticationMiddleware } from '../middleware/authenticationMiddleware';

const socketRouter = Router();
const prisma = new PrismaClient();

// Initialize authentication middleware
const authRepository = new PrismaAuthenticationRepository(prisma);
const authMiddleware = new AuthenticationMiddleware(authRepository);

// Apply authentication middleware to all Socket routes
socketRouter.use(authMiddleware.requireAuth);

socketRouter.get('/status', (req, res) => {
  try {
    const socketAppService = req.app.locals
      .socketAppService as SocketApplicationService;
    const status = socketAppService.getConnectionStatus();

    res.json({
      status: 'OK',
      socket: {
        connected: status.connected,
        totalConnections: status.totalConnections,
        namespaces: status.namespaces,
        rooms: status.rooms,
        uptime: status.uptime,
        lastStarted: status.lastStarted,
      },
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    res.status(500).json({
      status: 'Error',
      message: 'Failed to get Socket.IO status',
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString(),
    });
  }
});

socketRouter.get('/connections', (req, res) => {
  try {
    const socketAppService = req.app.locals
      .socketAppService as SocketApplicationService;
    const { namespace } = req.query;

    const connections = socketAppService.getConnectedClients(
      namespace as string
    );

    res.json({
      status: 'OK',
      connections,
      namespace: namespace || 'all',
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    res.status(500).json({
      status: 'Error',
      message: 'Failed to get connections count',
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString(),
    });
  }
});

socketRouter.get('/rooms/:room', (req, res) => {
  try {
    const socketAppService = req.app.locals
      .socketAppService as SocketApplicationService;
    const { room } = req.params;
    const { namespace } = req.query;

    const clients = socketAppService.getRoomClients(room, namespace as string);

    res.json({
      status: 'OK',
      room,
      namespace: namespace || 'default',
      clients,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    res.status(500).json({
      status: 'Error',
      message: 'Failed to get room information',
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString(),
    });
  }
});

socketRouter.post('/broadcast', async (req, res) => {
  try {
    const socketAppService = req.app.locals
      .socketAppService as SocketApplicationService;
    const { event, data, namespace, room } = req.body;

    if (!event || !data) {
      return res.status(400).json({
        status: 'Error',
        message: 'Event and data are required',
        timestamp: new Date().toISOString(),
      });
    }

    const options = { namespace, room };
    await socketAppService.broadcast(event, data, options);

    res.json({
      status: 'OK',
      message: 'Message broadcasted successfully',
      event,
      namespace: namespace || 'all',
      room: room || 'all',
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    res.status(500).json({
      status: 'Error',
      message: 'Failed to broadcast message',
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString(),
    });
  }
});

socketRouter.post('/broadcast/room/:room', async (req, res) => {
  try {
    const socketAppService = req.app.locals
      .socketAppService as SocketApplicationService;
    const { room } = req.params;
    const { event, data, namespace } = req.body;

    if (!event || !data) {
      return res.status(400).json({
        status: 'Error',
        message: 'Event and data are required',
        timestamp: new Date().toISOString(),
      });
    }

    await socketAppService.broadcastToRoom(room, event, data, namespace);

    res.json({
      status: 'OK',
      message: 'Message broadcasted to room successfully',
      event,
      room,
      namespace: namespace || 'default',
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    res.status(500).json({
      status: 'Error',
      message: 'Failed to broadcast message to room',
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString(),
    });
  }
});

socketRouter.post('/broadcast/namespace/:namespace', async (req, res) => {
  try {
    const socketAppService = req.app.locals
      .socketAppService as SocketApplicationService;
    const { namespace } = req.params;
    const { event, data } = req.body;

    if (!event || !data) {
      return res.status(400).json({
        status: 'Error',
        message: 'Event and data are required',
        timestamp: new Date().toISOString(),
      });
    }

    await socketAppService.broadcastToNamespace(`/${namespace}`, event, data);

    res.json({
      status: 'OK',
      message: 'Message broadcasted to namespace successfully',
      event,
      namespace,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    res.status(500).json({
      status: 'Error',
      message: 'Failed to broadcast message to namespace',
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString(),
    });
  }
});

socketRouter.post('/notification', async (req, res) => {
  try {
    const socketAppService = req.app.locals
      .socketAppService as SocketApplicationService;
    const { message, type = 'info' } = req.body;

    if (!message) {
      return res.status(400).json({
        status: 'Error',
        message: 'Message is required',
        timestamp: new Date().toISOString(),
      });
    }

    await socketAppService.broadcastSystemNotification(message, type);

    res.json({
      status: 'OK',
      message: 'System notification sent successfully',
      notificationMessage: message,
      type,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    res.status(500).json({
      status: 'Error',
      message: 'Failed to send system notification',
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString(),
    });
  }
});

socketRouter.post('/device/:deviceId/data', async (req, res) => {
  try {
    const socketAppService = req.app.locals
      .socketAppService as SocketApplicationService;
    const { deviceId } = req.params;
    const { data } = req.body;

    if (!data) {
      return res.status(400).json({
        status: 'Error',
        message: 'Data is required',
        timestamp: new Date().toISOString(),
      });
    }

    await socketAppService.broadcastDeviceData(deviceId, data);

    res.json({
      status: 'OK',
      message: 'Device data broadcasted successfully',
      deviceId,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    res.status(500).json({
      status: 'Error',
      message: 'Failed to broadcast device data',
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString(),
    });
  }
});

socketRouter.post('/heartbeat', async (req, res) => {
  try {
    const socketAppService = req.app.locals
      .socketAppService as SocketApplicationService;
    await socketAppService.sendHeartbeat();

    res.json({
      status: 'OK',
      message: 'Heartbeat sent successfully',
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    res.status(500).json({
      status: 'Error',
      message: 'Failed to send heartbeat',
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString(),
    });
  }
});

export { socketRouter };
