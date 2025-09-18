/**
 * Exemplo de uso da integração com Google Cloud SQL
 *
 * Este arquivo demonstra como usar a nova funcionalidade de conexão
 * com Google Cloud SQL na aplicação.
 */
import { DatabaseInitializer } from '../src/infrastructure/persistence/DatabaseInitializer';

async function exemploUsoCloudSql() {
  console.log('🚀 Exemplo de uso do Google Cloud SQL\n');

  // 1. Obter instância do inicializador
  const databaseInitializer = DatabaseInitializer.getInstance();

  try {
    // 2. Inicializar conexão (Cloud SQL ou Local)
    console.log('📡 Inicializando conexão...');
    const prisma = await databaseInitializer.initialize();

    // 3. Verificar se está conectado
    const isConnected = databaseInitializer.isConnected();
    console.log(`✅ Conectado: ${isConnected}`);

    // 4. Usar o Prisma normalmente
    console.log('🔍 Testando conexão...');
    const result = await prisma.$queryRaw`SELECT 1 as test`;
    console.log('✅ Teste de conexão bem-sucedido:', result);

    // 5. Exemplo de query real
    console.log('📊 Contando usuários...');
    const userCount = await prisma.user.count();
    console.log(`👥 Total de usuários: ${userCount}`);

    // 6. Fechar conexão
    console.log('🔌 Fechando conexão...');
    await databaseInitializer.close();
    console.log('✅ Conexão fechada com sucesso');
  } catch (error) {
    console.error('❌ Erro:', error);
  }
}

// Executar exemplo
if (require.main === module) {
  exemploUsoCloudSql();
}

export { exemploUsoCloudSql };
