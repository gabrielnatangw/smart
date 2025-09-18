import { afterAll, beforeAll } from 'vitest';

// Sobrescrever a DATABASE_URL para usar SQLite em memória para os testes
process.env.DATABASE_URL = 'file:memorydb?mode=memory&cache=shared';

// Mock simples do Prisma para testes
const mockPrisma = {
  $connect: async () => Promise.resolve(),
  $disconnect: async () => Promise.resolve(),
  user: {
    create: async (data: any) => ({
      id: '1',
      ...data.data,
      createdAt: new Date(),
      updatedAt: new Date(),
    }),
    findMany: async () => [],
    findUnique: async () => null,
    update: async (data: any) => ({
      id: '1',
      ...data.data,
      updatedAt: new Date(),
    }),
    delete: async () => ({ id: '1' }),
    deleteMany: async () => ({ count: 0 }),
  },
  tenant: {
    create: async (data: any) => ({
      id: '1',
      ...data.data,
      createdAt: new Date(),
      updatedAt: new Date(),
    }),
    findMany: async () => [],
    findUnique: async () => null,
    update: async (data: any) => ({
      id: '1',
      ...data.data,
      updatedAt: new Date(),
    }),
    delete: async () => ({ id: '1' }),
    deleteMany: async () => ({ count: 0 }),
  },
  sensor: {
    create: async (data: any) => ({
      id: '1',
      ...data.data,
      createdAt: new Date(),
      updatedAt: new Date(),
    }),
    findMany: async () => [],
    findUnique: async () => null,
    update: async (data: any) => ({
      id: '1',
      ...data.data,
      updatedAt: new Date(),
    }),
    delete: async () => ({ id: '1' }),
    deleteMany: async () => ({ count: 0 }),
    count: async () => 0,
  },
  // Adicione outros modelos conforme necessário
};

beforeAll(async () => {
  console.log('✅ Mock Prisma client setup for tests');

  // Tornar disponível globalmente para os testes
  globalThis.prisma = mockPrisma as any;

  await mockPrisma.$connect();
  console.log('✅ Mock Prisma client connected');
});

afterAll(async () => {
  if (globalThis.prisma) {
    await globalThis.prisma.$disconnect();
    console.log('✅ Mock Prisma client disconnected');
  }
});

// Exportar para usar nos testes se necessário
export const prisma = mockPrisma;

// Declaração global para TypeScript
declare global {
  var prisma: typeof mockPrisma;
}

// Nota: Para usar o Prisma real com SQLite em testes, você precisa:
// 1. Criar um schema separado para SQLite
// 2. Gerar um cliente separado para testes
// 3. Ou usar uma biblioteca como @databases/sqlite para testes
//
// Este mock permite que você teste a lógica de negócio sem banco de dados real
