import { EventEmitter } from 'events';
import { Server as HttpServer } from 'http';
import { Server as SocketIOServer } from 'socket.io';

import { ISocketService } from '../../application/interfaces/ISocketService';
import {
  BroadcastOptions,
  JoinRoomPayload,
  SocketConfig,
  SocketMessage,
  SocketStatus,
  SubscribeTopicPayload,
} from './SocketConfig';
import { initializeSocketSensor } from './sensor.socket';

export class SocketServer extends EventEmitter implements ISocketService {
  private io?: SocketIOServer;
  private config: SocketConfig;
  private status: SocketStatus;
  private httpServer: HttpServer | undefined;
  private startTime: Date;
  private mqttService?: any;

  constructor(
    config: SocketConfig,
    httpServer?: HttpServer,
    mqttService?: any
  ) {
    super();
    this.config = config;
    this.httpServer = httpServer;
    this.mqttService = mqttService;
    this.startTime = new Date();
    this.status = {
      connected: false,
      totalConnections: 0,
      namespaces: [],
      rooms: {},
      uptime: 0,
    };
  }

  async initialize(): Promise<void> {
    const serverOptions = {
      cors: {
        origin: this.config.corsOrigin,
        methods: ['GET', 'POST'],
      },
      pingTimeout: this.config.pingTimeout,
      pingInterval: this.config.pingInterval,
      transports: this.config.transports as any,
      allowEIO3: this.config.allowEIO3,
    };

    if (this.httpServer) {
      this.io = new SocketIOServer(this.httpServer, serverOptions);
    } else {
      // Create a new HTTP server for Socket.IO when no httpServer is provided
      const http = await import('http');
      const httpServer = http.createServer();
      this.io = new SocketIOServer(httpServer, serverOptions);

      // Start the HTTP server on the configured port
      httpServer.listen(this.config.port, () => {
        console.log(`Socket.IO server listening on port ${this.config.port}`);
      });
    }

    this.setupNamespaces();
    this.setupEventHandlers();

    this.status.connected = true;
    this.status.lastStarted = new Date();
    this.updateStatus();

    console.log(
      `Socket.IO server initialized on port ${this.config.port || 'shared'}`
    );
    this.emit('initialized');
  }

  private setupNamespaces(): void {
    if (!this.io) return;

    const namespaces = [
      '/devices',
      '/notifications',
      '/system',
      '/mqtt',
      '/sensor',
    ];

    // Initialize sensor socket if MQTT service is available
    if (this.mqttService) {
      initializeSocketSensor(this.io, this.mqttService);
    }

    namespaces.forEach(namespace => {
      const nsp = this.io?.of(namespace);
      if (!nsp) return;
      this.status.namespaces.push(namespace);

      nsp.on('connection', socket => {
        this.status.totalConnections++;
        console.log(`Client connected to ${namespace}: ${socket.id}`);
        this.updateStatus();

        socket.on('join-room', (payload: JoinRoomPayload) => {
          socket.join(payload.room);
          this.updateRoomCount(payload.room);
          console.log(`Socket ${socket.id} joined room: ${payload.room}`);

          socket.emit('room-joined', {
            room: payload.room,
            timestamp: new Date(),
          });
        });

        socket.on('leave-room', (payload: JoinRoomPayload) => {
          socket.leave(payload.room);
          this.updateRoomCount(payload.room);
          console.log(`Socket ${socket.id} left room: ${payload.room}`);

          socket.emit('room-left', {
            room: payload.room,
            timestamp: new Date(),
          });
        });

        socket.on('subscribe-topic', (payload: SubscribeTopicPayload) => {
          const room = `topic:${payload.topic}`;
          socket.join(room);
          this.updateRoomCount(room);
          console.log(
            `Socket ${socket.id} subscribed to topic: ${payload.topic}`
          );

          this.emit('topic-subscription', {
            socketId: socket.id,
            topic: payload.topic,
            namespace: namespace,
          });
        });

        socket.on('disconnect', reason => {
          this.status.totalConnections--;
          console.log(
            `Client disconnected from ${namespace}: ${socket.id} (${reason})`
          );
          this.updateStatus();
        });

        socket.on('error', error => {
          console.error(`Socket error in ${namespace}:`, error);
          this.emit('socket-error', { namespace, socketId: socket.id, error });
        });
      });
    });
  }

  private setupEventHandlers(): void {
    if (!this.io) return;

    this.io.on('connection', socket => {
      console.log(`Client connected to main namespace: ${socket.id}`);
    });

    this.io.on('connect_error', error => {
      console.error('Socket.IO connection error:', error);
      this.emit('connection-error', error);
    });
  }

  broadcast(event: string, data: any, options?: BroadcastOptions): void {
    if (!this.io) {
      console.error('Socket.IO not initialized');
      return;
    }

    const message: SocketMessage = {
      event,
      data,
      namespace: options?.namespace,
      room: options?.room,
      timestamp: new Date(),
    };

    if (options?.namespace) {
      const nsp = this.io.of(options.namespace);
      if (options.room) {
        nsp.to(options.room).emit(event, data);
      } else {
        nsp.emit(event, data);
      }
    } else {
      if (options?.room) {
        this.io.to(options.room).emit(event, data);
      } else {
        this.io.emit(event, data);
      }
    }

    this.emit('message-broadcast', message);
  }

  broadcastToRoom(
    room: string,
    event: string,
    data: any,
    namespace?: string
  ): void {
    this.broadcast(event, data, { room, namespace: namespace || undefined });
  }

  broadcastToNamespace(namespace: string, event: string, data: any): void {
    this.broadcast(event, data, { namespace, room: undefined });
  }

  getConnectedClients(namespace?: string): number {
    if (!this.io) return 0;

    if (namespace) {
      return this.io.of(namespace).sockets.size;
    }

    return this.status.totalConnections;
  }

  getRoomClients(room: string, namespace?: string): number {
    if (!this.io) return 0;

    const nsp = namespace ? this.io.of(namespace) : this.io;
    const adapter = nsp.adapter as any;
    const roomData = adapter.rooms?.get(room);
    return roomData ? roomData.size : 0;
  }

  getStatus(): SocketStatus {
    this.updateStatus();
    return { ...this.status };
  }

  isConnected(): boolean {
    return this.status.connected && !!this.io;
  }

  async shutdown(): Promise<void> {
    return new Promise(resolve => {
      if (this.io) {
        this.io.close(() => {
          console.log('Socket.IO server shut down');
          this.status.connected = false;
          resolve();
        });
      } else {
        resolve();
      }
    });
  }

  private updateStatus(): void {
    this.status.uptime = Date.now() - this.startTime.getTime();

    if (this.io) {
      this.status.rooms = {};
      const adapter = this.io.sockets.adapter as any;
      if (adapter.rooms) {
        adapter.rooms.forEach((sockets: Set<string>, room: string) => {
          this.status.rooms[room] = sockets.size;
        });
      }
    }
  }

  private updateRoomCount(room: string): void {
    const count = this.getRoomClients(room);
    this.status.rooms[room] = count;

    if (count === 0) {
      delete this.status.rooms[room];
    }
  }
}
