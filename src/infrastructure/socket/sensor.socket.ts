import { Socket, Server as SocketIOServer } from 'socket.io';

import { IMqttService } from '../../application/interfaces/IMqttService';
import { validateSocketToken } from './middleware/socketAuthMiddleware';

// Tenant → Sockets mapping for multi-tenant isolation
const tenantSocketsMap = new Map<string, Set<Socket>>();

export function initializeSocketSensor(
  io: SocketIOServer,
  _mqttService: IMqttService
) {
  const nsp = io.of('/sensor');
  const testNsp = io.of('/sensor-test'); // Namespace de teste sem autenticação

  console.log('🔌 Sensor Socket namespace initialized on /sensor');
  console.log('🧪 Test Socket namespace initialized on /sensor-test');

  // Apply authentication middleware only to main sensor namespace
  nsp.use(validateSocketToken);

  // Test namespace without authentication
  testNsp.on('connection', socket => {
    console.log(`🧪 Test client connected: ${socket.id}`);

    // Simulate sensor data for testing
    const testData = {
      value: Math.floor(Math.random() * 100),
      unit: 'test',
      timestamp: new Date().toISOString(),
      test: true,
    };

    // Send test data immediately
    socket.emit('sensor-data', testData);

    // Send test data every 2 seconds
    const interval = setInterval(() => {
      const newData = {
        value: Math.floor(Math.random() * 100),
        unit: 'test',
        timestamp: new Date().toISOString(),
        test: true,
      };
      socket.emit('sensor-data', newData);
    }, 2000);

    socket.on('disconnect', () => {
      clearInterval(interval);
      console.log(`🧪 Test client disconnected: ${socket.id}`);
    });
  });

  // MQTT subscriptions are now handled by DynamicMqttSubscribeService
  // This function will be called by the dynamic service to handle sensor-specific messages
  console.log(
    '📡 Sensor socket initialized - MQTT subscriptions handled dynamically'
  );

  // Handle client connections
  nsp.on('connection', socket => {
    const tenantId = socket.tenantId || '';
    console.log(
      `🔌 Sensor client connected: ${socket.id} (tenant: ${tenantId})`
    );

    // Add socket to tenant mapping
    if (!tenantSocketsMap.has(tenantId)) {
      tenantSocketsMap.set(tenantId, new Set());
      // console.log(`🆕 Created new tenant socket set for: ${tenantId}`);
    }
    const tenantSockets = tenantSocketsMap.get(tenantId);
    if (tenantSockets) {
      tenantSockets.add(socket);
    }
    // console.log(`👥 Socket ${socket.id} added to tenant ${tenantId}. Total sockets for tenant: ${tenantSocketsMap.get(tenantId)?.size}`);

    // Send initial connection confirmation
    socket.emit('connection-status', {
      status: 'connected',
      namespace: '/sensor',
      clientId: socket.id,
      tenantId: tenantId,
      timestamp: new Date().toISOString(),
    });

    socket.on('disconnect', () => {
      console.log(
        `🔌 Sensor client disconnected: ${socket.id} (tenant: ${tenantId})`
      );

      // Remove socket from tenant mapping
      const tenantSockets = tenantSocketsMap.get(tenantId);
      if (tenantSockets) {
        tenantSockets.delete(socket);

        // Clean up empty tenant sets
        if (tenantSockets.size === 0) {
          tenantSocketsMap.delete(tenantId);
        }
      }
    });

    // Handle client requesting sensor status
    socket.on('get-sensor-status', () => {
      socket.emit('sensor-status', {
        namespace: '/sensor',
        active: true,
        listening_topics: ['*/inputDev1/pTrace/data'],
        timestamp: new Date().toISOString(),
      });
    });
  });
}
