# Build stage
FROM node:18-alpine AS builder
WORKDIR /app

# Cache dependencies
COPY package*.json ./
RUN npm ci

# Build app
COPY . .
RUN npm run build

# Production stage
FROM nginx:alpine
WORKDIR /usr/share/nginx/html

# Copiar configuración nginx
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copiar archivos estáticos
COPY --from=builder /app/dist/front-alertas-medicas/browser .

# Script de entrada para sustitución de variables
COPY docker-entrypoint.sh /
RUN chmod +x /docker-entrypoint.sh

EXPOSE 80
ENTRYPOINT ["/docker-entrypoint.sh"]