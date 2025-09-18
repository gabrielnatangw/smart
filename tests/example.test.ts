// Exemplo de como usar:
// import request from 'supertest';
// import express from 'express';

// Exemplo de teste e2e com Vitest + Supertest + Prisma
//
// Para usar nos seus testes:
// 1. O prisma já estará disponível globalmente via globalThis.prisma
// 2. O banco SQLite em memória já estará configurado
// 3. Use describe/it/expect sem imports (globals: true)
//
// Exemplo de teste completo:
/*
describe('Users API E2E', () => {
  let app: express.Application;

  beforeEach(async () => {
    // Limpar dados do teste anterior
    await globalThis.prisma.user.deleteMany({});
    
    // Setup da aplicação
    app = express();
    app.use(express.json());
    // app.use('/api/users', usersRouter);
  });

  it('should create user and persist in database', async () => {
    const userData = {
      name: 'Test User',
      email: 'test@example.com',
      password: 'password123'
    };

    // Fazer requisição HTTP
    const response = await request(app)
      .post('/api/users')
      .send(userData)
      .expect(201);

    // Verificar resposta da API
    expect(response.body).toEqual({
      success: true,
      message: 'Usuário criado com sucesso',
      data: {
        id: expect.any(String),
        name: userData.name,
        email: userData.email,
        createdAt: expect.any(String),
        updatedAt: expect.any(String),
      }
    });

    // Verificar se foi salvo no banco
    const userInDb = await globalThis.prisma.user.findUnique({
      where: { email: userData.email }
    });

    expect(userInDb).toBeTruthy();
    expect(userInDb?.name).toBe(userData.name);
    expect(userInDb?.email).toBe(userData.email);
  });

  it('should list users from database', async () => {
    // Inserir dados de teste diretamente no banco
    await globalThis.prisma.user.create({
      data: {
        id: '1',
        name: 'User 1',
        email: 'user1@example.com',
        password: 'hashed_password',
        tenant_id: 'tenant-1'
      }
    });

    // Testar endpoint de listagem
    const response = await request(app)
      .get('/api/users')
      .expect(200);

    expect(response.body.data.users).toHaveLength(1);
    expect(response.body.data.users[0].email).toBe('user1@example.com');
  });
});
*/

// Teste básico para verificar se a configuração está funcionando
describe('Vitest Configuration', () => {
  it('should have globals available', () => {
    expect(describe).toBeDefined();
    expect(it).toBeDefined();
    expect(expect).toBeDefined();
  });

  it('should have prisma available globally', () => {
    expect(globalThis.prisma).toBeDefined();
    expect(typeof globalThis.prisma.$connect).toBe('function');
  });
});
