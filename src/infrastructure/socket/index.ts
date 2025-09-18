import { Server as HttpServer } from 'http';

import { SocketConfig } from './SocketConfig';
import { SocketServer } from './SocketServer';

export function createSocketService(
  httpServer?: HttpServer,
  mqttService?: any
): SocketServer {
  const config: SocketConfig = {
    port: parseInt(process.env.SOCKET_IO_PORT || '3001'),
    corsOrigin: process.env.SOCKET_IO_CORS_ORIGIN || '*',
    pingTimeout: parseInt(process.env.SOCKET_IO_PING_TIMEOUT || '60000'),
    pingInterval: parseInt(process.env.SOCKET_IO_PING_INTERVAL || '25000'),
    transports: ['websocket', 'polling'],
    allowEIO3: true,
  };

  return new SocketServer(config, httpServer, mqttService);
}

export * from './SocketServer';
export * from './SocketConfig';
