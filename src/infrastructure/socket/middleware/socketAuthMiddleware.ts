import { PrismaClient } from '@prisma/client';
import { Socket } from 'socket.io';

import { JwtTokenService } from '../../../domain/services/JwtTokenService';
import { PrismaAuthenticationRepository } from '../../persistence/repositories/PrismaAuthenticationRepository';

// Extend Socket interface to include tenant info
declare module 'socket.io' {
  interface Socket {
    tenantId?: string;
    userId?: string;
    userName?: string;
  }
}

export async function validateSocketToken(
  socket: Socket,
  next: (err?: Error) => void
) {
  try {
    const token =
      socket.handshake.auth?.token ||
      socket.handshake.headers?.authorization?.replace('Bearer ', '');

    if (!token) {
      console.log(`❌ Socket ${socket.id}: No token provided`);
      return next(new Error('AUTHENTICATION_REQUIRED'));
    }

    // Use existing JwtTokenService
    const jwtService = new JwtTokenService();
    const payload = jwtService.verifyAccessToken(token);

    // Get user with tenant info
    const prisma = new PrismaClient();
    const authRepo = new PrismaAuthenticationRepository(prisma);
    const user = await authRepo.findUserById(payload.userId);

    if (!user || !user.isActive || user.isDeleted) {
      console.log(`❌ Socket ${socket.id}: Invalid user`);
      return next(new Error('INVALID_USER'));
    }

    // Add tenant info to socket
    socket.tenantId = user.tenantId;
    socket.userId = user.id;
    socket.userName = user.name;

    console.log(
      `✅ Socket ${socket.id} authenticated - User: ${user.name}, Tenant: ${user.tenantId}`
    );
    next();
  } catch (error) {
    console.log(`❌ Socket ${socket.id}: Authentication failed - ${error}`);
    next(new Error('AUTHENTICATION_FAILED'));
  }
}
