#!/usr/bin/env node

// Script para iniciar a aplicação sem depender do banco de dados

console.log('🚀 Iniciando aplicação em modo de desenvolvimento...');
console.log(
  '⚠️  Modo sem banco de dados - algumas funcionalidades podem não estar disponíveis'
);

// Configurar variáveis de ambiente para modo sem banco
process.env.NODE_ENV = process.env.NODE_ENV || 'development';
process.env.PORT = process.env.PORT || '3000';
process.env.SOCKET_IO_PORT = process.env.SOCKET_IO_PORT || '3001';

// Iniciar o servidor Express básico
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const { createServer } = require('http');

const app = express();
const httpServer = createServer(app);
const PORT = process.env.PORT || 3000;

// Middleware básico
app.use(helmet());
app.use(cors());
app.use(express.json());

// Rota de health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    message: 'Aplicação rodando em modo de desenvolvimento',
    timestamp: new Date().toISOString(),
    mode: 'no-database',
  });
});

// Rota raiz
app.get('/', (req, res) => {
  res.json({
    message: 'Backend API funcionando!',
    status: 'running',
    mode: 'development-without-database',
  });
});

// Iniciar servidor
httpServer.listen(PORT, () => {
  console.log(`✅ Servidor rodando na porta ${PORT}`);
  console.log(`🌐 Health check: http://localhost:${PORT}/api/health`);
  console.log(
    `📡 Socket.IO rodando na porta ${process.env.SOCKET_IO_PORT || 3001}`
  );
});

// Tratar erros não capturados
process.on('uncaughtException', error => {
  console.error('❌ Erro não capturado:', error);
});

process.on('unhandledRejection', reason => {
  console.error('❌ Promise rejeitada:', reason);
});

// Manter o processo vivo
process.on('SIGTERM', () => {
  console.log('🛑 Recebido SIGTERM, encerrando graciosamente...');
  httpServer.close(() => {
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('🛑 Recebido SIGINT, encerrando graciosamente...');
  httpServer.close(() => {
    process.exit(0);
  });
});
