#!/bin/bash

# Script de deploy com correção de dados NaN
# Este script deve ser executado no servidor de produção

echo "🚀 Iniciando deploy com correção de dados NaN..."

# 1. Fazer backup do banco de dados
echo "📦 Fazendo backup do banco de dados..."
pg_dump $DATABASE_URL > backup_$(date +%Y%m%d_%H%M%S).sql

# 2. Parar o serviço atual
echo "⏹️  Parando serviço atual..."
sudo systemctl stop smart-trace-api || docker-compose down

# 3. Atualizar código
echo "📥 Atualizando código..."
git pull origin main

# 4. Instalar dependências
echo "📦 Instalando dependências..."
npm install --production

# 5. Compilar TypeScript
echo "🔨 Compilando TypeScript..."
npm run build:prod

# 6. Executar migrações do Prisma
echo "🗄️  Executando migrações..."
npx prisma migrate deploy

# 7. Corrigir dados NaN
echo "🔧 Corrigindo dados NaN..."
npm run db:fix-nan

# 8. Reiniciar serviço
echo "🔄 Reiniciando serviço..."
sudo systemctl start smart-trace-api || docker-compose up -d

# 9. Verificar saúde da API
echo "🏥 Verificando saúde da API..."
sleep 10
curl -f http://localhost:3000/health || curl -f http://localhost:3000/api/health

echo "✅ Deploy concluído com sucesso!"


