# Etapa 1: build
FROM node:20 AS build
WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

# Aceitar build arg para pular verificação de tipos e ambiente
ARG SKIP_TYPE_CHECK=false
ARG NODE_ENV=production
ENV NODE_ENV=$NODE_ENV

RUN if [ "$SKIP_TYPE_CHECK" = "true" ] ; then npm run build:skip-types ; else npm run build ; fi

# Etapa 2: produção
FROM node:20-slim AS production
WORKDIR /app

# Instalar OpenSSL para resolver os avisos do Prisma
RUN apt-get update -y && apt-get install -y openssl

# Adicionar labels para identificação
LABEL org.opencontainers.image.title="Smart Trace Backend API"
LABEL org.opencontainers.image.description="Backend API para sistema Smart Trace com suporte a 3 ambientes"
LABEL org.opencontainers.image.vendor="Smart Dev One"
LABEL org.opencontainers.image.source="https://github.com/smart-dev-one/backend"
LABEL org.opencontainers.image.documentation="https://github.com/smart-dev-one/backend/blob/main/README.md"
LABEL org.opencontainers.image.licenses="MIT"
LABEL org.opencontainers.image.version="2.0.0"
LABEL org.opencontainers.image.created="$(date -u +'%Y-%m-%dT%H:%M:%SZ')"
LABEL org.opencontainers.image.url="https://github.com/smart-dev-one/backend"

COPY --from=build /app/package*.json ./

# Instalar apenas dependências de produção
RUN npm install --omit=dev --ignore-scripts

# Copiar a pasta prisma ANTES de executar db:generate
COPY --from=build /app/prisma ./prisma
RUN npm run db:generate

# Copiar o código compilado
COPY --from=build /app/dist ./dist

# Copiar certificado CA
COPY --from=build /app/src/config/ca.crt ./src/config/ca.crt

# Criar usuário não-root para segurança
RUN groupadd -r appuser && useradd -r -g appuser appuser
RUN chown -R appuser:appuser /app
USER appuser

# Expor portas
EXPOSE 3000 3001

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3000/health', (res) => { process.exit(res.statusCode === 200 ? 0 : 1) })" || exit 1

CMD ["node", "dist/src/app.js"]
