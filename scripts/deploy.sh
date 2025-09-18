#!/bin/bash

# Script para deploy local baseado na branch atual
# Uso: ./scripts/deploy.sh [ambiente]
# Ambientes: local, staging, production

set -e

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configurações
REGISTRY="ghcr.io/smart-dev-one"
IMAGE_NAME="backend-v2"
CONTAINER_NAME=""
PORT_MAPPING="3000-3001:3000-3001"

# Função para mostrar ajuda
show_help() {
    echo -e "${BLUE}🚀 Script de Deploy - Smart Trace Backend${NC}"
    echo "=============================================="
    echo ""
    echo "Uso: $0 [ambiente]"
    echo ""
    echo "Ambientes disponíveis:"
    echo "  local      - Deploy local (PostgreSQL local)"
    echo "  staging    - Deploy staging (GCP - develop)"
    echo "  production - Deploy produção (GCP - main)"
    echo ""
    echo "Exemplos:"
    echo "  $0 local"
    echo "  $0 staging"
    echo "  $0 production"
    echo ""
    echo "Se não especificar ambiente, será detectado pela branch atual:"
    echo "  develop  → staging"
    echo "  main     → production"
    echo "  outras   → local"
}

# Função para parar container existente
stop_existing_container() {
    local container_name=$1
    if docker ps -q -f name=$container_name | grep -q .; then
        echo -e "${YELLOW}🛑 Parando container existente: $container_name${NC}"
        docker stop $container_name
        docker rm $container_name
    fi
}

# Função para deploy local
deploy_local() {
    echo -e "${BLUE}🏠 Deployando LOCAL (PostgreSQL local)...${NC}"
    
    CONTAINER_NAME="smart-v2-backend-local"
    stop_existing_container $CONTAINER_NAME
    
    echo -e "${GREEN}📦 Executando deploy local...${NC}"
    docker run -d \
        --name $CONTAINER_NAME \
        -p $PORT_MAPPING \
        --restart unless-stopped \
        -e NODE_ENV=development \
        -e USE_CLOUD_SQL=false \
        -e DATABASE_URL=postgresql://postgres:postgres123@host.docker.internal:5432/backend_db \
        $REGISTRY/$IMAGE_NAME:latest || \
    docker run -d \
        --name $CONTAINER_NAME \
        -p $PORT_MAPPING \
        --restart unless-stopped \
        -e NODE_ENV=development \
        -e USE_CLOUD_SQL=false \
        -e DATABASE_URL=postgresql://postgres:postgres123@localhost:5432/backend_db \
        $REGISTRY/$IMAGE_NAME:latest
}

# Função para deploy staging
deploy_staging() {
    echo -e "${BLUE}🧪 Deployando STAGING (GCP - develop)...${NC}"
    
    CONTAINER_NAME="smart-v2-backend-staging"
    stop_existing_container $CONTAINER_NAME
    
    echo -e "${GREEN}📦 Executando deploy staging...${NC}"
    docker run -d \
        --name $CONTAINER_NAME \
        -p $PORT_MAPPING \
        --restart unless-stopped \
        -e NODE_ENV=staging \
        -e USE_CLOUD_SQL=true \
        -e INSTANCE_CONNECTION_NAME=smart-201703:us-central1:smart-platform \
        -e PROD_DB_DATABASE=smart-develop \
        -e PROD_DB_HOST=34.135.81.224 \
        -e PROD_DB_USERNAME=postgres \
        -e PROD_DB_PASSWORD=${STAGING_DB_PASSWORD:-""} \
        $REGISTRY/$IMAGE_NAME:develop
}

# Função para deploy produção
deploy_production() {
    echo -e "${BLUE}🚀 Deployando PRODUÇÃO (GCP - main)...${NC}"
    
    CONTAINER_NAME="smart-v2-backend-prod"
    stop_existing_container $CONTAINER_NAME
    
    echo -e "${GREEN}📦 Executando deploy produção...${NC}"
    docker run -d \
        --name $CONTAINER_NAME \
        -p $PORT_MAPPING \
        --restart unless-stopped \
        -e NODE_ENV=production \
        -e USE_CLOUD_SQL=true \
        -e INSTANCE_CONNECTION_NAME=smart-201703:us-central1:smart-platform \
        -e PROD_DB_DATABASE=smart-prod \
        -e PROD_DB_HOST=34.135.81.224 \
        -e PROD_DB_USERNAME=postgres \
        -e PROD_DB_PASSWORD=${PROD_DB_PASSWORD:-""} \
        $REGISTRY/$IMAGE_NAME:main
}

# Função para detectar ambiente pela branch
detect_environment() {
    local branch=$(git branch --show-current 2>/dev/null || echo "unknown")
    
    case $branch in
        "develop")
            echo "staging"
            ;;
        "main")
            echo "production"
            ;;
        *)
            echo "local"
            ;;
    esac
}

# Função principal
main() {
    local environment=$1
    
    # Se não especificou ambiente, detectar pela branch
    if [ -z "$environment" ]; then
        environment=$(detect_environment)
        echo -e "${YELLOW}🔍 Ambiente detectado: $environment${NC}"
    fi
    
    # Validar ambiente
    case $environment in
        "local")
            deploy_local
            ;;
        "staging")
            deploy_staging
            ;;
        "production")
            deploy_production
            ;;
        "help"|"-h"|"--help")
            show_help
            exit 0
            ;;
        *)
            echo -e "${RED}❌ Ambiente inválido: $environment${NC}"
            echo ""
            show_help
            exit 1
            ;;
    esac
    
    echo ""
    echo -e "${GREEN}✅ Deploy concluído com sucesso!${NC}"
    echo -e "${BLUE}📦 Container: $CONTAINER_NAME${NC}"
    echo -e "${BLUE}🌐 Portas: $PORT_MAPPING${NC}"
    echo -e "${BLUE}🌍 Ambiente: $environment${NC}"
    echo ""
    echo -e "${YELLOW}📋 Comandos úteis:${NC}"
    echo "  Ver logs: docker logs $CONTAINER_NAME"
    echo "  Parar:    docker stop $CONTAINER_NAME"
    echo "  Status:   docker ps -f name=$CONTAINER_NAME"
}

# Executar função principal
main "$@"
