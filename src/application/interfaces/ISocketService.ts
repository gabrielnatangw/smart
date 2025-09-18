import {
  BroadcastOptions,
  SocketStatus,
} from '../../infrastructure/socket/SocketConfig';

export interface ISocketService {
  initialize(): Promise<void>;
  broadcast(event: string, data: any, options?: BroadcastOptions): void;
  broadcastToRoom(
    room: string,
    event: string,
    data: any,
    namespace?: string
  ): void;
  broadcastToNamespace(namespace: string, event: string, data: any): void;
  getConnectedClients(namespace?: string): number;
  getRoomClients(room: string, namespace?: string): number;
  getStatus(): SocketStatus;
  isConnected(): boolean;
  shutdown(): Promise<void>;
}
