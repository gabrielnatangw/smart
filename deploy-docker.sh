#!/bin/bash

# ========================================
# 🐳 SCRIPT DE DEPLOY DOCKER
# ========================================
# Uso: ./deploy-docker.sh [ambiente] [tag]
# Exemplo: ./deploy-docker.sh production v1.0.0

set -e

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Parâmetros
ENVIRONMENT=${1:-production}
TAG=${2:-latest}
IMAGE_NAME="smart-trace-backend"
CONTAINER_NAME="smart-trace-backend-${ENVIRONMENT}"

echo -e "${BLUE}🐳 Iniciando deploy do Smart Trace Backend${NC}"
echo -e "${BLUE}📋 Ambiente: ${ENVIRONMENT}${NC}"
echo -e "${BLUE}🏷️  Tag: ${TAG}${NC}"

# Função para verificar se o container existe
container_exists() {
    docker ps -a --format "table {{.Names}}" | grep -q "^${CONTAINER_NAME}$"
}

# Função para parar e remover container existente
cleanup_container() {
    if container_exists; then
        echo -e "${YELLOW}🛑 Parando container existente...${NC}"
        docker stop ${CONTAINER_NAME} || true
        docker rm ${CONTAINER_NAME} || true
    fi
}

# Função para build da imagem
build_image() {
    echo -e "${BLUE}🔨 Fazendo build da imagem...${NC}"
    docker build -t ${IMAGE_NAME}:${TAG} .
    echo -e "${GREEN}✅ Imagem construída com sucesso!${NC}"
}

# Função para executar migrações
run_migrations() {
    echo -e "${BLUE}🗄️ Executando migrações do banco...${NC}"
    docker run --rm \
        --env-file .env.${ENVIRONMENT} \
        ${IMAGE_NAME}:${TAG} \
        npx prisma migrate deploy
    echo -e "${GREEN}✅ Migrações executadas!${NC}"
}

# Função para executar seed (opcional)
run_seed() {
    if [ "$ENVIRONMENT" = "development" ]; then
        echo -e "${BLUE}🌱 Executando seed de desenvolvimento...${NC}"
        docker run --rm \
            --env-file .env.${ENVIRONMENT} \
            ${IMAGE_NAME}:${TAG} \
            npx prisma db seed
        echo -e "${GREEN}✅ Seed executado!${NC}"
    fi
}

# Função para iniciar container
start_container() {
    echo -e "${BLUE}🚀 Iniciando container...${NC}"
    
    # Verificar se arquivo .env existe
    if [ ! -f ".env.${ENVIRONMENT}" ]; then
        echo -e "${RED}❌ Arquivo .env.${ENVIRONMENT} não encontrado!${NC}"
        echo -e "${YELLOW}💡 Crie o arquivo .env.${ENVIRONMENT} com as configurações do ambiente${NC}"
        exit 1
    fi
    
    docker run -d \
        --name ${CONTAINER_NAME} \
        --restart unless-stopped \
        -p 3000:3000 \
        -p 3001:3001 \
        --env-file .env.${ENVIRONMENT} \
        ${IMAGE_NAME}:${TAG}
    
    echo -e "${GREEN}✅ Container iniciado com sucesso!${NC}"
}

# Função para verificar saúde
check_health() {
    echo -e "${BLUE}🏥 Verificando saúde da aplicação...${NC}"
    sleep 10
    
    if curl -f http://localhost:3000/health > /dev/null 2>&1; then
        echo -e "${GREEN}✅ Aplicação está saudável!${NC}"
        echo -e "${GREEN}🌐 Acesse: http://localhost:3000${NC}"
    else
        echo -e "${RED}❌ Aplicação não está respondendo!${NC}"
        echo -e "${YELLOW}📋 Logs do container:${NC}"
        docker logs ${CONTAINER_NAME} --tail 20
        exit 1
    fi
}

# Função para mostrar status
show_status() {
    echo -e "${BLUE}📊 Status do Deploy:${NC}"
    echo -e "${BLUE}================================${NC}"
    docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}" | grep ${CONTAINER_NAME} || echo "Container não encontrado"
    echo -e "${BLUE}================================${NC}"
}

# Executar deploy
main() {
    cleanup_container
    build_image
    run_migrations
    run_seed
    start_container
    check_health
    show_status
    
    echo -e "${GREEN}🎉 Deploy concluído com sucesso!${NC}"
    echo -e "${BLUE}📋 Comandos úteis:${NC}"
    echo -e "${BLUE}   Ver logs: docker logs ${CONTAINER_NAME}${NC}"
    echo -e "${BLUE}   Parar: docker stop ${CONTAINER_NAME}${NC}"
    echo -e "${BLUE}   Reiniciar: docker restart ${CONTAINER_NAME}${NC}"
}

# Executar
main "$@"
